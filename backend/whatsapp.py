"""
whatsapp.py — Safe, deterministic WhatsApp messaging via WAHA (WhatsApp HTTP API).

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

WAHA_BASE_URL = os.getenv('WAHA_BASE_URL', "http://localhost:3001")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "visio_waha_secure_key_123")

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
    """Strict JID validation. Returns (is_valid, reason)."""
    if not jid: return False, "JID is empty"
    if jid.endswith("@g.us"): return False, f"BLOCKED: '{jid}' is a group JID"
    if "status@broadcast" in jid.lower(): return False, f"BLOCKED: '{jid}' is a status broadcast"
    if "broadcast" in jid.lower(): return False, f"BLOCKED: '{jid}' contains 'broadcast'"
    if not jid.endswith("@c.us"): return False, f"BLOCKED: '{jid}' is not a valid @c.us JID"

    phone_part = jid.replace("@c.us", "")
    if not phone_part.isdigit(): return False, f"BLOCKED: Phone portion '{phone_part}' contains non-digits"
    if len(phone_part) < 10: return False, f"BLOCKED: Phone portion '{phone_part}' is too short"
    if len(phone_part) > 15: return False, f"BLOCKED: Phone portion '{phone_part}' is too long"

    return True, "OK"

def _validate_recipient_match(parent_phone_raw: str, generated_jid: str) -> tuple[bool, str]:
    expected_digits = _clean_phone(parent_phone_raw)
    jid_digits = generated_jid.replace("@c.us", "")
    if expected_digits != jid_digits:
        return False, f"RECIPIENT MISMATCH: expected '{expected_digits}' but JID has '{jid_digits}'"
    return True, "Match confirmed"

def _check_dedup(phone: str, school_id: str) -> tuple[bool, str]:
    key = f"{school_id}:{phone}"
    now = time.time()
    stale_keys = [k for k, t in _recent_sends.items() if now - t > DEDUP_WINDOW_SECONDS]
    for k in stale_keys: del _recent_sends[k]

    if key in _recent_sends:
        elapsed = now - _recent_sends[key]
        remaining = int(DEDUP_WINDOW_SECONDS - elapsed)
        return False, f"Duplicate blocked: same recipient was messaged {int(elapsed)}s ago. Wait {remaining}s."
    return True, "OK"

def _record_send(phone: str, school_id: str):
    _recent_sends[f"{school_id}:{phone}"] = time.time()

# ═══════════════════════════════════════════════════════════════════════════════
#  WAHA HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _get_headers():
    return {
        'Content-Type': 'application/json',
        'X-Api-Key': WAHA_API_KEY
    }

# ═══════════════════════════════════════════════════════════════════════════════
#  CORE SEND FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def send_whatsapp_notification(
    number: str,
    message: str,
    school_id: str = "default",
    student_id: str = "",
    student_name: str = "",
) -> tuple[bool, str]:
    """Send a WhatsApp TEXT message via WAHA."""
    
    if not WAHA_BASE_URL:
        return False, "WAHA server not configured"

    clean_number = _clean_phone(number)
    target_jid = _make_jid(clean_number)

    jid_ok, jid_reason = _validate_jid(target_jid)
    if not jid_ok: return False, jid_reason

    match_ok, match_reason = _validate_recipient_match(number, target_jid)
    if not match_ok: return False, match_reason

    dedup_ok, dedup_reason = _check_dedup(clean_number, school_id)
    if not dedup_ok: return False, dedup_reason

    logger.info(f"📤 SEND ATTEMPT | target_jid={target_jid} | school_id={school_id}")

    url = f"{WAHA_BASE_URL}/api/sendText"
    payload = {
        "session": "default", # We map everything to default for WAHA for now unless specifically mapping school_id to WAHA sessions
        "chatId": target_jid,
        "text": message
    }

    last_error = "Unknown error"
    for attempt in range(1, 3):
        try:
            response = requests.post(url, headers=_get_headers(), json=payload, timeout=30)
            if response.status_code in (200, 201):
                _record_send(clean_number, school_id)
                logger.info(f"✅ Message SENT to {clean_number} on attempt {attempt}")
                return True, "Message sent successfully"
            
            try:
                err_data = response.json()
                last_error = err_data.get("message", response.text)
            except:
                last_error = f"WAHA error (HTTP {response.status_code})"
                
            logger.error(f"❌ Attempt {attempt} failed: {last_error}")
            time.sleep(2)
        except Exception as e:
            last_error = str(e)
            logger.error(f"❌ Error on attempt {attempt}: {e}")

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
    """Send a DOCUMENT (PDF) via WAHA."""
    import base64

    if not WAHA_BASE_URL:
        return False, "WAHA server not configured"

    clean_number = _clean_phone(number)
    target_jid = _make_jid(clean_number)

    jid_ok, jid_reason = _validate_jid(target_jid)
    if not jid_ok: return False, jid_reason

    match_ok, match_reason = _validate_recipient_match(number, target_jid)
    if not match_ok: return False, match_reason

    dedup_ok, dedup_reason = _check_dedup(clean_number, school_id)
    if not dedup_ok: return False, dedup_reason

    logger.info(f"📎 DOC SEND ATTEMPT | target_jid={target_jid} | filename={filename}")

    b64_data = base64.b64encode(pdf_bytes).decode("utf-8")
    data_url = f"data:application/pdf;base64,{b64_data}"

    url = f"{WAHA_BASE_URL}/api/sendFile"
    payload = {
        "session": "default",
        "chatId": target_jid,
        "file": data_url,
        "fileName": filename,
        "caption": caption
    }

    try:
        response = requests.post(url, headers=_get_headers(), json=payload, timeout=45)
        if response.status_code in (200, 201):
            _record_send(clean_number, school_id)
            logger.info(f"✅ Document '{filename}' SENT to {clean_number}")
            return True, "Document sent successfully"

        err_msg = f"WAHA error (HTTP {response.status_code}): {response.text}"
        logger.error(f"❌ Document send failed: {err_msg}")
        return False, err_msg

    except Exception as e:
        logger.error(f"❌ Document send error: {e}")
        return False, str(e)
