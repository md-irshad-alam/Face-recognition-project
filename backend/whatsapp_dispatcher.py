"""
whatsapp_dispatcher.py
─────────────────────────────────────────────────────────────────────────────
Standalone WhatsApp direct-message dispatcher for automation scripts
"""

import re
import os
import logging
import requests
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3001")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "visio_waha_secure_key_123")
SYSTEM_FOOTER = "\n\n-- यह एक सिस्टम-जनरेटेड मैसेज है, कृपया इस नंबर पर रिप्लाई न करें।"

logger = logging.getLogger("whatsapp_dispatcher")
logger.setLevel(logging.INFO)
if not logger.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter(
        "[WA Dispatcher] %(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))
    logger.addHandler(h)

def _sanitize_phone(raw: str) -> str:
    if not raw: raise ValueError("Phone number is empty or None")
    digits = re.sub(r"\D", "", str(raw))
    if not digits: raise ValueError(f"No digits found in phone string: '{raw!r}'")
    if len(digits) == 10: digits = "91" + digits
    if len(digits) < 10 or len(digits) > 15:
        raise ValueError(f"Phone number out of valid range: '{digits}'")
    return digits

def _build_individual_jid(phone_digits: str) -> str:
    return f"{phone_digits}@c.us"

def _assert_jid_is_individual(jid: str):
    if not jid.endswith("@c.us"):
        raise PermissionError(f"🚫 ROUTING BLOCK: JID '{jid}' is not @c.us format.")

def _build_message_body(recipient_name: str, body: str, school_name: str = "") -> str:
    greeting = f"नमस्ते {recipient_name}," if recipient_name else "नमस्ते,"
    school_prefix = f"यह {school_name} की ओर से एक स्वचालित संदेश है।\n" if school_name else ""
    return f"{greeting}\n{school_prefix}{body.strip()}{SYSTEM_FOOTER}"

def _log_delivery(conn: mysql.connector.MySQLConnection, reference_id: str, phone: str, status: str, error_msg: str = "", school_id: str = ""):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO whatsapp_delivery_logs
                (reference_id, phone, status, error_message, school_id, sent_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status), error_message = VALUES(error_message), sent_at = VALUES(sent_at)
        """, (reference_id, phone, status, error_msg, school_id, datetime.now()))
        conn.commit()
        cursor.close()
    except Exception as e:
        logger.warning(f"Could not write delivery log for ref={reference_id}: {e}")

def dispatch_dm(
    phone: str, body: str, recipient_name: str = "", school_name: str = "",
    school_id: str = "default", log_db_conn=None, log_reference_id: str = "",
) -> tuple[bool, str]:
    if not WAHA_BASE_URL: return False, "WAHA_BASE_URL not set"

    try:
        clean_phone = _sanitize_phone(phone)
    except ValueError as e:
        if log_db_conn and log_reference_id: _log_delivery(log_db_conn, log_reference_id, str(phone), "FAILED", str(e), school_id)
        return False, str(e)

    target_jid = _build_individual_jid(clean_phone)
    
    try:
        _assert_jid_is_individual(target_jid)
    except PermissionError as e:
        if log_db_conn and log_reference_id: _log_delivery(log_db_conn, log_reference_id, clean_phone, "BLOCKED", str(e), school_id)
        return False, str(e)

    final_message = _build_message_body(recipient_name, body, school_name)

    payload = {
        "session": "default",
        "chatId": target_jid,
        "text": final_message
    }

    url = f"{WAHA_BASE_URL}/api/sendText"
    logger.info(f"📤 DISPATCH | target_jid={target_jid} | ref={log_reference_id}")

    try:
        response = requests.post(url, headers={
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY
    }, json=payload, timeout=30)
        if response.status_code in (200, 201):
            if log_db_conn and log_reference_id: _log_delivery(log_db_conn, log_reference_id, clean_phone, "SUCCESS", "", school_id)
            return True, "Message sent successfully"
        
        reason = f"HTTP {response.status_code}: {response.text}"
        if log_db_conn and log_reference_id: _log_delivery(log_db_conn, log_reference_id, clean_phone, "FAILED", reason, school_id)
        return False, reason
    except Exception as e:
        if log_db_conn and log_reference_id: _log_delivery(log_db_conn, log_reference_id, clean_phone, "FAILED", str(e), school_id)
        return False, str(e)

def dispatch_substitution_alert(
    teacher_phone: str, teacher_name: str, period_number: int, start_time: str,
    end_time: str, class_section: str, subject: str, school_id: str = "default",
    school_name: str = "", log_db_conn=None, log_reference_id: str = "",
) -> tuple[bool, str]:
    body = (
        f"आपको आज Period {period_number} ({start_time} - {end_time}) के लिए "
        f"Class {class_section} में {subject} की क्लास लेने के लिए "
        f"नियुक्त किया गया है क्योंकि मुख्य शिक्षक अनुपस्थित हैं। "
        f"कृपया समय पर पहुँचें। 🙏"
    )
    return dispatch_dm(phone=teacher_phone, body=body, recipient_name=teacher_name, school_name=school_name, school_id=school_id, log_db_conn=log_db_conn, log_reference_id=log_reference_id)
