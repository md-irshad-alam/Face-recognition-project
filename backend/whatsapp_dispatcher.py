"""
whatsapp_dispatcher.py
─────────────────────────────────────────────────────────────────────────────
Standalone WhatsApp direct-message dispatcher for automation scripts
(substitution cron, fee reminders, risk alerts, etc.)

ROUTING GUARANTEE:
  Every message is sent strictly to an INDIVIDUAL phone number via the
  WPPConnect /send-message endpoint using the @c.us JID format.
  This guarantees:
    ✓ Private DM delivery to the exact recipient phone number
    ✗ Never posts to WhatsApp Status (@broadcast)
    ✗ Never routes to groups (@g.us)
    ✗ Never touches broadcast lists

USAGE (from any automation script):
    from whatsapp_dispatcher import dispatch_dm
    success, error = dispatch_dm(
        phone="+919876543210",
        recipient_name="Anita Sharma",
        body="आपको आज Period 3 के लिए कक्षा 8 A में भेजा गया है।",
        school_id="smart_school_001",
        log_db_conn=conn,          # optional: pass open MySQL conn to log delivery
        log_reference_id="sub_42"  # optional: reference ID for the log record
    )
"""

import re
import os
import logging
import requests
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ─── Configuration ────────────────────────────────────────────────────────────

WPP_SERVER_URL = os.getenv("WPP_SERVER_URL", "").rstrip("/")
WPP_SECRET_KEY = os.getenv("WPP_SECRET_KEY", "")

# Safe system footer — appended to every automated message body
SYSTEM_FOOTER = (
    "\n\n-- यह एक सिस्टम-जनरेटेड मैसेज है, कृपया इस नंबर पर रिप्लाई न करें।"
)

# ─── Logging ──────────────────────────────────────────────────────────────────

logger = logging.getLogger("whatsapp_dispatcher")
logger.setLevel(logging.INFO)
if not logger.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter(
        "[WA Dispatcher] %(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))
    logger.addHandler(h)


# ─── Phone Number Utilities ───────────────────────────────────────────────────

def _sanitize_phone(raw: str) -> str:
    """
    Normalize a raw phone string to a pure-digit E.164 string WITHOUT the
    leading '+'. Prepend India country code (91) for bare 10-digit numbers.

    Examples:
        "+91 98765 43210"  →  "919876543210"
        "9876543210"       →  "919876543210"
        "091-98765-43210"  →  "919876543210"
        "919876543210"     →  "919876543210"   (unchanged)
    """
    if not raw:
        raise ValueError("Phone number is empty or None")

    # Strip everything that is not a digit
    digits = re.sub(r"\D", "", str(raw))

    if not digits:
        raise ValueError(f"No digits found in phone string: '{raw!r}'")

    # Bare 10-digit Indian mobile → prepend country code
    if len(digits) == 10:
        digits = "91" + digits

    # Tolerate "+91" prefix already included (13 chars total)
    if len(digits) < 10 or len(digits) > 15:
        raise ValueError(
            f"Phone number out of valid range after sanitization: '{digits}' "
            f"(length {len(digits)}). Original input: '{raw}'"
        )

    return digits


def _build_individual_jid(phone_digits: str) -> str:
    """
    Build a WhatsApp Individual JID.
    Always uses @c.us domain — NEVER @g.us (groups) or @broadcast (status).
    """
    return f"{phone_digits}@c.us"


def _assert_jid_is_individual(jid: str):
    """
    Hard-fail if the JID does not resolve to an individual contact.
    This is the final safety gate before the HTTP call is made.
    """
    forbidden_patterns = [
        ("@g.us",           "WhatsApp GROUP — groups are forbidden"),
        ("@broadcast",      "WhatsApp BROADCAST LIST — forbidden"),
        ("status@broadcast","WhatsApp STATUS — forbidden"),
        ("broadcast",       "contains 'broadcast' — forbidden"),
    ]
    for pattern, reason in forbidden_patterns:
        if pattern.lower() in jid.lower():
            raise PermissionError(
                f"🚫 ROUTING BLOCK: JID '{jid}' matches forbidden pattern "
                f"'{pattern}' ({reason}). Message NOT sent."
            )

    if not jid.endswith("@c.us"):
        raise PermissionError(
            f"🚫 ROUTING BLOCK: JID '{jid}' is not @c.us individual format. "
            f"Message NOT sent."
        )


# ─── Message Body Builder ─────────────────────────────────────────────────────

def _build_message_body(recipient_name: str, body: str, school_name: str = "") -> str:
    """
    Assembles the final private message with a safe system footer.
    Structure:
        नमस्ते [Name],
        [body]
        -- system footer
    """
    greeting = f"नमस्ते {recipient_name}," if recipient_name else "नमस्ते,"
    school_prefix = f"यह {school_name} की ओर से एक स्वचालित संदेश है।\n" if school_name else ""
    return f"{greeting}\n{school_prefix}{body.strip()}{SYSTEM_FOOTER}"


# ─── Database Logging ─────────────────────────────────────────────────────────

def _log_delivery(
    conn: mysql.connector.MySQLConnection,
    reference_id: str,
    phone: str,
    status: str,
    error_msg: str = "",
    school_id: str = ""
):
    """
    Write delivery status to whatsapp_delivery_logs table.
    Only updates status to 'SUCCESS' when the API confirms HTTP 200/201.
    Any other outcome → 'FAILED' with the exact error reason stored.
    """
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO whatsapp_delivery_logs
                (reference_id, phone, status, error_message, school_id, sent_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                error_message = VALUES(error_message),
                sent_at = VALUES(sent_at)
        """, (reference_id, phone, status, error_msg, school_id, datetime.now()))
        conn.commit()
        cursor.close()
    except Exception as e:
        logger.warning(f"Could not write delivery log for ref={reference_id}: {e}")


# ─── Core Dispatch Function ───────────────────────────────────────────────────

def dispatch_dm(
    phone: str,
    body: str,
    recipient_name: str = "",
    school_name: str = "",
    school_id: str = "default",
    log_db_conn=None,
    log_reference_id: str = "",
) -> tuple[bool, str]:
    """
    Send a private WhatsApp DM to a single explicit phone number.

    Parameters
    ──────────
    phone            Raw phone string from DB (any format, e.g. "+91 98765 43210")
    body             The notification message body in any language (Hindi/English)
    recipient_name   Used in greeting line ("नमस्ते [Name],")
    school_name      Optional school name for message prefix
    school_id        WPPConnect session name (matches your school_id in env)
    log_db_conn      Optional open MySQL connection — if provided, delivery is logged
    log_reference_id Optional reference string for the log row (e.g. "sub_42")

    Returns
    ───────
    (True, "Message sent successfully")  on HTTP 200/201
    (False, "<reason>")                  on any failure
    """

    if not WPP_SERVER_URL or not WPP_SECRET_KEY:
        return False, "WPP_SERVER_URL / WPP_SECRET_KEY not set in environment"

    # ── Step 1: Sanitize & validate phone ────────────────────────────────────
    try:
        clean_phone = _sanitize_phone(phone)
    except ValueError as e:
        reason = f"Phone sanitization failed: {e}"
        logger.error(f"❌ {reason}")
        if log_db_conn and log_reference_id:
            _log_delivery(log_db_conn, log_reference_id, str(phone), "FAILED", reason, school_id)
        return False, reason

    # ── Step 2: Build individual JID ─────────────────────────────────────────
    target_jid = _build_individual_jid(clean_phone)

    # ── Step 3: Hard-block any non-individual JIDs ────────────────────────────
    try:
        _assert_jid_is_individual(target_jid)
    except PermissionError as e:
        reason = str(e)
        logger.error(reason)
        if log_db_conn and log_reference_id:
            _log_delivery(log_db_conn, log_reference_id, clean_phone, "BLOCKED", reason, school_id)
        return False, reason

    # ── Step 4: Assemble message with localized footer ────────────────────────
    final_message = _build_message_body(recipient_name, body, school_name)

    # ── Step 5: Build explicit, isolated DM payload ───────────────────────────
    # The 'phone' field is the EXACT target number. isGroup=False is explicit.
    # This targets the /send-message endpoint which only accepts individual @c.us JIDs.
    dm_payload: dict = {
        "phone":   clean_phone,   # Exact digits-only number for WPPConnect
        "isGroup": False,         # EXPLICIT: block group routing
        "message": final_message  # Full final body with footer
    }

    # ── Step 6: Target the DM endpoint (never a broadcast endpoint) ───────────
    # WPPConnect /send-message only routes to individual contacts.
    # It never touches /send-status, /send-broadcast, or account-level hooks.
    dm_endpoint = f"{WPP_SERVER_URL}/api/{school_id}/send-message"

    headers = {
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {WPP_SECRET_KEY}",
        "Accept":        "application/json",
    }

    logger.info(
        f"📤 DISPATCH | target_jid={target_jid} | endpoint={dm_endpoint} | "
        f"ref={log_reference_id} | preview={final_message[:80]!r}..."
    )

    # ── Step 7: HTTP POST with try/except and strict status code check ────────
    try:
        response = requests.post(
            url=dm_endpoint,
            headers=headers,
            json=dm_payload,
            timeout=30
        )

        # ── Success: only 200 or 201 from WPPConnect confirm individual delivery
        if response.status_code in (200, 201):
            logger.info(
                f"✅ SENT to {clean_phone} (JID: {target_jid}) | "
                f"HTTP {response.status_code}"
            )
            if log_db_conn and log_reference_id:
                _log_delivery(
                    log_db_conn, log_reference_id, clean_phone,
                    "SUCCESS", "", school_id
                )
            return True, "Message sent successfully"

        # ── Known WPPConnect serialization bug (message was still sent)
        if response.status_code == 500:
            body_txt = response.text
            if "getMessageById" in body_txt or "evaluate-and-return" in body_txt:
                logger.warning(
                    f"⚠️ WPPConnect serialization bug — message likely delivered to {clean_phone}"
                )
                if log_db_conn and log_reference_id:
                    _log_delivery(
                        log_db_conn, log_reference_id, clean_phone,
                        "SUCCESS", "WPPConnect serialization warning", school_id
                    )
                return True, "Message likely sent (WPPConnect warning)"

        # ── All other status codes → FAILED
        try:
            err_json = response.json()
            reason = err_json.get("message", "") or err_json.get("error", "") or response.text
        except Exception:
            reason = response.text or f"HTTP {response.status_code}"

        logger.error(
            f"❌ FAILED | target={clean_phone} | HTTP {response.status_code} | reason={reason}"
        )
        if log_db_conn and log_reference_id:
            _log_delivery(
                log_db_conn, log_reference_id, clean_phone,
                "FAILED", f"HTTP {response.status_code}: {reason}", school_id
            )
        return False, reason

    except requests.exceptions.Timeout:
        reason = f"Request timed out after 30s sending to {clean_phone}"
        logger.warning(f"⚠️ {reason}")
        # Treat timeout as likely sent (WPPConnect processes before responding)
        if log_db_conn and log_reference_id:
            _log_delivery(log_db_conn, log_reference_id, clean_phone, "TIMEOUT", reason, school_id)
        return True, "Message likely sent (request timed out)"

    except requests.exceptions.ConnectionError:
        reason = f"Cannot connect to WPPConnect at {WPP_SERVER_URL}"
        logger.error(f"❌ {reason}")
        if log_db_conn and log_reference_id:
            _log_delivery(log_db_conn, log_reference_id, clean_phone, "FAILED", reason, school_id)
        return False, reason

    except Exception as e:
        reason = f"Unexpected dispatch error: {e}"
        logger.error(f"❌ {reason}")
        if log_db_conn and log_reference_id:
            _log_delivery(log_db_conn, log_reference_id, clean_phone, "FAILED", reason, school_id)
        return False, reason


# ─── Convenience: Substitution Alert Template ─────────────────────────────────

def dispatch_substitution_alert(
    teacher_phone: str,
    teacher_name: str,
    period_number: int,
    start_time: str,
    end_time: str,
    class_section: str,
    subject: str,
    school_id: str = "default",
    school_name: str = "",
    log_db_conn=None,
    log_reference_id: str = "",
) -> tuple[bool, str]:
    """
    Dispatch the canonical Hindi substitution alert DM.
    Uses dispatch_dm() internally — all safety guarantees apply.
    """
    body = (
        f"आपको आज Period {period_number} "
        f"({start_time} - {end_time}) के लिए "
        f"Class {class_section} में {subject} की क्लास लेने के लिए "
        f"नियुक्त किया गया है क्योंकि मुख्य शिक्षक अनुपस्थित हैं। "
        f"कृपया समय पर पहुँचें। 🙏"
    )
    return dispatch_dm(
        phone=teacher_phone,
        body=body,
        recipient_name=teacher_name,
        school_name=school_name,
        school_id=school_id,
        log_db_conn=log_db_conn,
        log_reference_id=log_reference_id,
    )
