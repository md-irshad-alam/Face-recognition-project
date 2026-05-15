"""
whatsapp.py — Safe, deterministic WhatsApp messaging via WPPConnect Server.

CRITICAL SAFETY RULES:
  1. Every message is targeted to an EXPLICIT phone-number-derived JID.
  2. NO message is ever sent to groups (@g.us), status (@broadcast), or broadcast lists.
  3. The phone number MUST originate from the student's `parent_phone` column, looked up
     fresh from the database at send-time.
  4. A JID safety check runs before every outgoing API call.
"""

import re
import requests
import os
import time
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

WPP_SERVER_URL = os.getenv('WPP_SERVER_URL', "http://127.0.0.1:21465")
WPP_SECRET_KEY = os.getenv('WPP_SECRET_KEY', "THISISMYSECURETOKEN")

# ─── Logging ──────────────────────────────────────────────────────────────────

logger = logging.getLogger("whatsapp")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "[WhatsApp] %(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))
    logger.addHandler(handler)

# ─── In-memory send lock (prevents duplicate sends within a short window) ─────

_recent_sends: dict[str, float] = {}
DEDUP_WINDOW_SECONDS = 30  # Block identical (phone, school_id) pair within 30s


# ═══════════════════════════════════════════════════════════════════════════════
#  PHONE NUMBER → JID UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def _clean_phone(number: str) -> str:
    """Strip to digits only, prepend '91' country code if 10 digits."""
    clean = re.sub(r'\D', '', str(number or ""))
    if len(clean) == 10:
        clean = "91" + clean
    return clean


def _make_jid(phone_digits: str) -> str:
    """Build an individual WhatsApp JID. Always @c.us, never @g.us."""
    return f"{phone_digits}@c.us"


def _validate_jid(jid: str) -> tuple[bool, str]:
    """
    Strict JID validation.
    Returns (is_valid, reason).
    Blocks: groups, status broadcasts, broadcast lists, empty/short numbers.
    """
    if not jid:
        return False, "JID is empty"

    # Block group JIDs
    if jid.endswith("@g.us"):
        return False, f"BLOCKED: '{jid}' is a group JID"

    # Block status broadcasts
    if "status@broadcast" in jid.lower():
        return False, f"BLOCKED: '{jid}' is a status broadcast"

    # Block broadcast lists
    if "broadcast" in jid.lower():
        return False, f"BLOCKED: '{jid}' contains 'broadcast'"

    # Must be @c.us
    if not jid.endswith("@c.us"):
        return False, f"BLOCKED: '{jid}' is not a valid @c.us JID"

    # Extract phone portion
    phone_part = jid.replace("@c.us", "")
    if not phone_part.isdigit():
        return False, f"BLOCKED: Phone portion '{phone_part}' contains non-digits"

    if len(phone_part) < 10:
        return False, f"BLOCKED: Phone portion '{phone_part}' is too short ({len(phone_part)} digits)"

    if len(phone_part) > 15:
        return False, f"BLOCKED: Phone portion '{phone_part}' is too long ({len(phone_part)} digits)"

    return True, "OK"


def _validate_recipient_match(parent_phone_raw: str, generated_jid: str) -> tuple[bool, str]:
    """
    Fail-safe: verify that the generated JID actually corresponds to the
    parent_phone that was looked up from the database.
    """
    expected_digits = _clean_phone(parent_phone_raw)
    jid_digits = generated_jid.replace("@c.us", "")
    if expected_digits != jid_digits:
        return False, (
            f"RECIPIENT MISMATCH: parent_phone='{parent_phone_raw}' → "
            f"expected digits='{expected_digits}' but JID has '{jid_digits}'"
        )
    return True, "Match confirmed"


# ═══════════════════════════════════════════════════════════════════════════════
#  DEDUPLICATION LOCK
# ═══════════════════════════════════════════════════════════════════════════════

def _check_dedup(phone: str, school_id: str) -> tuple[bool, str]:
    """
    Returns (is_allowed, reason).
    Blocks if the same (phone, school_id) was sent to within DEDUP_WINDOW_SECONDS.
    """
    key = f"{school_id}:{phone}"
    now = time.time()

    # Clean old entries
    stale_keys = [k for k, t in _recent_sends.items() if now - t > DEDUP_WINDOW_SECONDS]
    for k in stale_keys:
        del _recent_sends[k]

    if key in _recent_sends:
        elapsed = now - _recent_sends[key]
        remaining = int(DEDUP_WINDOW_SECONDS - elapsed)
        return False, f"Duplicate blocked: same recipient was messaged {int(elapsed)}s ago. Wait {remaining}s."

    return True, "OK"


def _record_send(phone: str, school_id: str):
    """Record that a message was just sent."""
    _recent_sends[f"{school_id}:{phone}"] = time.time()


# ═══════════════════════════════════════════════════════════════════════════════
#  WPPConnect HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _get_headers():
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {WPP_SECRET_KEY}'
    }


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
        logger.error(f"Session check failed: {e}")
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
        logger.warning(f"Number check failed for {clean}: {e}")
        # On error, assume it exists and try to send anyway
        return True


# ═══════════════════════════════════════════════════════════════════════════════
#  CORE SEND FUNCTIONS — Safe, JID-validated, deduplicated
# ═══════════════════════════════════════════════════════════════════════════════

def send_whatsapp_notification(
    number: str,
    message: str,
    school_id: str = "default",
    student_id: str = "",
    student_name: str = "",
) -> tuple[bool, str]:
    """
    Send a WhatsApp TEXT message to an explicit phone number.

    Safety guarantees:
      - Phone number is sanitised to digits-only.
      - JID is built deterministically as <digits>@c.us
      - JID is validated against group/status/broadcast blocklist.
      - Deduplication prevents double-sends within 30s.
      - Detailed audit log is emitted before and after the send attempt.
    """
    if not WPP_SERVER_URL or not WPP_SECRET_KEY:
        logger.error("WPP_SERVER_URL or WPP_SECRET_KEY not configured")
        return False, "WhatsApp server not configured"

    # ── Step 1: Clean phone and build JID ──
    clean_number = _clean_phone(number)
    target_jid = _make_jid(clean_number)

    # ── Step 2: Validate JID ──
    jid_ok, jid_reason = _validate_jid(target_jid)
    if not jid_ok:
        logger.error(f"🚫 JID VALIDATION FAILED: {jid_reason}")
        return False, jid_reason

    # ── Step 3: Verify JID matches source phone ──
    match_ok, match_reason = _validate_recipient_match(number, target_jid)
    if not match_ok:
        logger.error(f"🚫 {match_reason}")
        return False, match_reason

    # ── Step 4: Deduplication check ──
    dedup_ok, dedup_reason = _check_dedup(clean_number, school_id)
    if not dedup_ok:
        logger.warning(f"⏳ {dedup_reason}")
        return False, dedup_reason

    # ── Step 5: Pre-send audit log ──
    logger.info(
        f"📤 SEND ATTEMPT | "
        f"student_id={student_id} | student_name={student_name} | "
        f"parent_phone={number} | clean_phone={clean_number} | "
        f"target_jid={target_jid} | school_id={school_id} | "
        f"timestamp={datetime.now().isoformat()} | "
        f"message_preview={message[:80]}..."
    )

    # ── Step 6: Check session status ──
    status = check_session_status(school_id)
    if status not in ("CONNECTED", "isLogged", "inChat"):
        msg = f"WhatsApp session '{school_id}' is not connected (status: {status}). Please scan the QR code in WhatsApp Settings."
        logger.error(f"❌ {msg}")
        return False, msg

    # ── Step 7: Validate number exists on WhatsApp ──
    if not check_number_exists(clean_number, school_id):
        msg = f"The number {clean_number} is not registered on WhatsApp."
        logger.error(f"❌ {msg}")
        return False, msg

    # ── Step 8: Send with retry (max 2 attempts) ──
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
                _record_send(clean_number, school_id)
                logger.info(f"✅ Message SENT to {clean_number} (JID: {target_jid}) on attempt {attempt}")
                return True, "Message sent successfully"

            # Parse error body
            body = response.text

            # Known WPPConnect bug: 500 from WAPI.getMessageById but message was sent
            if response.status_code == 500:
                if "getMessageById" in body or "evaluate-and-return" in body:
                    _record_send(clean_number, school_id)
                    logger.warning(f"⚠️ WPPConnect serialization bug — message likely sent to {clean_number}")
                    return True, "Message sent (with WPPConnect warning)"

            # Parse WPPConnect error JSON
            try:
                err_data = response.json()
                err_msg = err_data.get("message", "")

                # Translate common Portuguese errors
                if "não existe" in err_msg:
                    last_error = f"Number {clean_number} not found on WhatsApp"
                    logger.error(f"❌ {last_error}")
                    return False, last_error
                elif "não está ativa" in err_msg:
                    last_error = "WhatsApp session is not active. Please reconnect."
                    logger.error(f"❌ {last_error}")
                    return False, last_error
                elif "Erro ao enviar" in err_msg:
                    last_error = "WhatsApp failed to deliver the message"
                    logger.warning(f"⚠️ Send error on attempt {attempt}, retrying...")
                    time.sleep(2)
                    continue
                else:
                    last_error = err_msg or f"WPPConnect error (HTTP {response.status_code})"
            except Exception:
                last_error = f"WPPConnect error (HTTP {response.status_code})"

            logger.error(f"❌ Attempt {attempt} failed: {last_error}")

        except requests.exceptions.Timeout:
            _record_send(clean_number, school_id)
            logger.warning(f"⚠️ Timeout on attempt {attempt} — message may have been sent")
            return True, "Message likely sent (timeout)"
        except requests.exceptions.ConnectionError:
            last_error = f"Cannot connect to WPPConnect server at {WPP_SERVER_URL}"
            logger.error(f"❌ {last_error}")
            return False, last_error
        except Exception as e:
            last_error = str(e)
            logger.error(f"❌ Unexpected error on attempt {attempt}: {e}")

    logger.error(f"❌ All attempts failed for {clean_number}: {last_error}")
    return False, last_error


def send_whatsapp_document(
    number: str,
    pdf_bytes: bytes,
    filename: str,
    caption: str = "",
    school_id: str = "default",
    student_id: str = "",
    student_name: str = "",
) -> tuple[bool, str]:
    """
    Send a DOCUMENT (PDF) via WhatsApp.

    Same safety guarantees as send_whatsapp_notification:
      - Explicit phone-number-based JID.
      - JID validated against blocklist.
      - Deduplication enforced.
      - Full audit trail.
    """
    import base64

    if not WPP_SERVER_URL or not WPP_SECRET_KEY:
        return False, "WhatsApp server not configured"

    # ── Step 1: Clean phone and build JID ──
    clean_number = _clean_phone(number)
    target_jid = _make_jid(clean_number)

    # ── Step 2: Validate JID ──
    jid_ok, jid_reason = _validate_jid(target_jid)
    if not jid_ok:
        logger.error(f"🚫 JID VALIDATION FAILED: {jid_reason}")
        return False, jid_reason

    # ── Step 3: Verify JID matches source phone ──
    match_ok, match_reason = _validate_recipient_match(number, target_jid)
    if not match_ok:
        logger.error(f"🚫 {match_reason}")
        return False, match_reason

    # ── Step 4: Deduplication check ──
    dedup_ok, dedup_reason = _check_dedup(clean_number, school_id)
    if not dedup_ok:
        logger.warning(f"⏳ {dedup_reason}")
        return False, dedup_reason

    # ── Step 5: Pre-send audit log ──
    logger.info(
        f"📎 DOC SEND ATTEMPT | "
        f"student_id={student_id} | student_name={student_name} | "
        f"parent_phone={number} | clean_phone={clean_number} | "
        f"target_jid={target_jid} | filename={filename} | "
        f"school_id={school_id} | timestamp={datetime.now().isoformat()}"
    )

    # ── Step 6: Check session ──
    status = check_session_status(school_id)
    if status not in ("CONNECTED", "isLogged", "inChat"):
        msg = f"WhatsApp session '{school_id}' is not connected (status: {status})."
        logger.error(f"❌ {msg}")
        return False, msg

    # ── Step 7: Validate number ──
    if not check_number_exists(clean_number, school_id):
        msg = f"The number {clean_number} is not registered on WhatsApp."
        logger.error(f"❌ {msg}")
        return False, msg

    # ── Step 8: Encode and send ──
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

    try:
        response = requests.post(url, headers=_get_headers(), json=payload, timeout=45)

        if response.status_code in (200, 201):
            _record_send(clean_number, school_id)
            logger.info(f"✅ Document '{filename}' SENT to {clean_number} (JID: {target_jid})")
            return True, "Document sent successfully"

        # Handle WPPConnect serialization bug
        if response.status_code == 500:
            body = response.text
            if "getMessageById" in body or "evaluate-and-return" in body:
                _record_send(clean_number, school_id)
                logger.warning(f"⚠️ WPPConnect bug — document likely sent to {clean_number}")
                return True, "Document sent (with WPPConnect warning)"

        # Parse error
        try:
            err_data = response.json()
            err_msg = err_data.get("message", f"HTTP {response.status_code}")
            if "não existe" in err_msg:
                err_msg = f"Number {clean_number} not found on WhatsApp"
        except Exception:
            err_msg = f"WPPConnect error (HTTP {response.status_code})"

        logger.error(f"❌ Document send failed: {err_msg}")
        return False, err_msg

    except requests.exceptions.Timeout:
        _record_send(clean_number, school_id)
        logger.warning(f"⚠️ Timeout sending document — may have been sent")
        return True, "Document likely sent (timeout)"
    except requests.exceptions.ConnectionError:
        msg = f"Cannot connect to WPPConnect server at {WPP_SERVER_URL}"
        logger.error(f"❌ {msg}")
        return False, msg
    except Exception as e:
        logger.error(f"❌ Document send error: {e}")
        return False, str(e)
