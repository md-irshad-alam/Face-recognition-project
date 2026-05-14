import requests
import os
import time
from dotenv import load_dotenv

load_dotenv()

WPP_SERVER_URL = os.getenv('WPP_SERVER_URL', "http://127.0.0.1:21465")
WPP_SECRET_KEY = os.getenv('WPP_SECRET_KEY', "THISISMYSECURETOKEN")
WPP_SESSION_NAME = os.getenv('WPP_SESSION_NAME', 'smart_school')


def _get_headers():
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {WPP_SECRET_KEY}'
    }


def _clean_phone(number):
    """Clean phone number: digits only, add 91 country code if 10 digits."""
    clean = "".join(filter(str.isdigit, str(number)))
    if len(clean) == 10:
        clean = "91" + clean
    return clean


def check_session_status(school_id="default"):
    """Check if the WhatsApp session is connected."""
    try:
        url = f"{WPP_SERVER_URL}/api/{school_id}/status-session"
        response = requests.get(url, headers=_get_headers(), timeout=5)
        if response.status_code == 200:
            data = response.json()
            status = data.get("status", "")
            # WPPConnect may nest status inside 'response'
            if isinstance(data.get("response"), dict):
                status = data["response"].get("status", status)
            return status
        return "ERROR"
    except Exception as e:
        print(f"[WhatsApp] Session check failed: {e}")
        return "OFFLINE"


def check_number_exists(phone, school_id="default"):
    """Check if a phone number exists on WhatsApp before sending."""
    clean = _clean_phone(phone)
    try:
        url = f"{WPP_SERVER_URL}/api/{school_id}/check-number-status/{clean}"
        response = requests.get(url, headers=_get_headers(), timeout=10)
        if response.status_code == 200:
            data = response.json()
            resp = data.get("response", {})
            if isinstance(resp, dict):
                return resp.get("numberExists", False)
        return False
    except Exception as e:
        print(f"[WhatsApp] Number check failed for {clean}: {e}")
        # On error, assume it exists and try to send anyway
        return True


def send_whatsapp_notification(number, message, school_id="default"):
    """
    Send a WhatsApp message via WPPConnect Server.
    
    Handles:
    - Session status pre-check
    - Number existence validation
    - Known WPPConnect WAPI.getMessageById serialization bug
    - Retry on transient failures
    - Portuguese error message translation
    """
    if not WPP_SERVER_URL or not WPP_SECRET_KEY:
        print("[WhatsApp] ❌ WPP_SERVER_URL or WPP_SECRET_KEY not configured")
        return False, "WhatsApp server not configured"

    # 1. Check if session is connected
    status = check_session_status(school_id)
    if status not in ("CONNECTED", "isLogged", "inChat"):
        msg = f"WhatsApp session '{school_id}' is not connected (status: {status}). Please scan the QR code in WhatsApp Settings."
        print(f"[WhatsApp] ❌ {msg}")
        return False, msg

    # 2. Clean phone number
    clean_number = _clean_phone(number)
    print(f"[WhatsApp] 📤 Attempting to send to {clean_number} via session '{school_id}'")

    # 3. Validate number exists on WhatsApp
    if not check_number_exists(clean_number, school_id):
        msg = f"The number {clean_number} is not registered on WhatsApp."
        print(f"[WhatsApp] ❌ {msg}")
        return False, msg

    # 4. Send with retry (max 2 attempts)
    url = f"{WPP_SERVER_URL}/api/{school_id}/send-message"
    payload = {
        "phone": clean_number,
        "isGroup": False,
        "message": message
    }

    last_error = "Unknown error"
    for attempt in range(1, 3):
        try:
            response = requests.post(url, headers=_get_headers(), json=payload, timeout=30)

            # Success
            if response.status_code in (200, 201):
                print(f"[WhatsApp] ✅ Message sent to {clean_number} (attempt {attempt})")
                return True, "Message sent successfully"

            # Parse error body
            body = response.text
            
            # Known WPPConnect bug: 500 from WAPI.getMessageById but message was sent
            if response.status_code == 500:
                if "getMessageById" in body or "evaluate-and-return" in body:
                    print(f"[WhatsApp] ⚠️ WPPConnect serialization bug — message likely sent to {clean_number}")
                    return True, "Message sent (with WPPConnect warning)"

            # Parse WPPConnect error JSON
            try:
                err_data = response.json()
                err_msg = err_data.get("message", "")
                
                # Translate common Portuguese errors
                if "não existe" in err_msg:
                    last_error = f"Number {clean_number} not found on WhatsApp"
                    print(f"[WhatsApp] ❌ {last_error}")
                    return False, last_error
                elif "não está ativa" in err_msg:
                    last_error = "WhatsApp session is not active. Please reconnect."
                    print(f"[WhatsApp] ❌ {last_error}")
                    return False, last_error
                elif "Erro ao enviar" in err_msg:
                    last_error = "WhatsApp failed to deliver the message"
                    print(f"[WhatsApp] ⚠️ Send error on attempt {attempt}, retrying...")
                    # This is often transient — retry after a short delay
                    time.sleep(2)
                    continue
                else:
                    last_error = err_msg or f"WPPConnect error (HTTP {response.status_code})"
            except:
                last_error = f"WPPConnect error (HTTP {response.status_code})"

            print(f"[WhatsApp] ❌ Attempt {attempt} failed: {last_error}")

        except requests.exceptions.Timeout:
            # WPPConnect sometimes hangs but the message is sent
            print(f"[WhatsApp] ⚠️ Timeout on attempt {attempt} — message may have been sent")
            return True, "Message likely sent (timeout)"
        except requests.exceptions.ConnectionError:
            last_error = f"Cannot connect to WPPConnect server at {WPP_SERVER_URL}"
            print(f"[WhatsApp] ❌ {last_error}")
            return False, last_error
        except Exception as e:
            last_error = str(e)
            print(f"[WhatsApp] ❌ Unexpected error on attempt {attempt}: {e}")

    print(f"[WhatsApp] ❌ All attempts failed for {clean_number}: {last_error}")
    return False, last_error


def send_whatsapp_document(number, pdf_bytes, filename, caption="", school_id="default"):
    """
    Send a document (PDF) via WhatsApp using WPPConnect's send-file-base64 endpoint.
    
    Args:
        number: Phone number to send to.
        pdf_bytes: Raw bytes of the PDF file.
        filename: Filename shown in WhatsApp (e.g. "Invoice_INV-001.pdf").
        caption: Text message sent along with the document.
        school_id: WPPConnect session name.
    
    Returns:
        (success: bool, message: str)
    """
    import base64

    if not WPP_SERVER_URL or not WPP_SECRET_KEY:
        return False, "WhatsApp server not configured"

    # 1. Check session
    status = check_session_status(school_id)
    if status not in ("CONNECTED", "isLogged", "inChat"):
        msg = f"WhatsApp session '{school_id}' is not connected (status: {status})."
        print(f"[WhatsApp] ❌ {msg}")
        return False, msg

    # 2. Clean phone
    clean_number = _clean_phone(number)

    # 3. Validate number
    if not check_number_exists(clean_number, school_id):
        msg = f"The number {clean_number} is not registered on WhatsApp."
        print(f"[WhatsApp] ❌ {msg}")
        return False, msg

    # 4. Encode PDF to base64 data URL
    b64_data = base64.b64encode(pdf_bytes).decode("utf-8")
    data_url = f"data:application/pdf;base64,{b64_data}"

    url = f"{WPP_SERVER_URL}/api/{school_id}/send-file-base64"
    payload = {
        "phone": clean_number,
        "base64": data_url,
        "filename": filename,
        "caption": caption,
        "isGroup": False,
    }

    print(f"[WhatsApp] 📎 Sending document '{filename}' to {clean_number}")

    try:
        response = requests.post(url, headers=_get_headers(), json=payload, timeout=45)

        if response.status_code in (200, 201):
            print(f"[WhatsApp] ✅ Document '{filename}' sent to {clean_number}")
            return True, "Document sent successfully"

        # Handle WPPConnect serialization bug
        if response.status_code == 500:
            body = response.text
            if "getMessageById" in body or "evaluate-and-return" in body:
                print(f"[WhatsApp] ⚠️ WPPConnect bug — document likely sent to {clean_number}")
                return True, "Document sent (with WPPConnect warning)"

        # Parse error
        try:
            err_data = response.json()
            err_msg = err_data.get("message", f"HTTP {response.status_code}")
            if "não existe" in err_msg:
                err_msg = f"Number {clean_number} not found on WhatsApp"
        except:
            err_msg = f"WPPConnect error (HTTP {response.status_code})"

        print(f"[WhatsApp] ❌ Document send failed: {err_msg}")
        return False, err_msg

    except requests.exceptions.Timeout:
        print(f"[WhatsApp] ⚠️ Timeout sending document — may have been sent")
        return True, "Document likely sent (timeout)"
    except requests.exceptions.ConnectionError:
        msg = f"Cannot connect to WPPConnect server at {WPP_SERVER_URL}"
        print(f"[WhatsApp] ❌ {msg}")
        return False, msg
    except Exception as e:
        print(f"[WhatsApp] ❌ Document send error: {e}")
        return False, str(e)
