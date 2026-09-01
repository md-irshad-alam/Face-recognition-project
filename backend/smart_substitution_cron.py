"""
smart_substitution_cron.py
─────────────────────────────────────────────────────────────────────────────
Runs every morning at 08:15 AM via system cron:
    15 8 * * 1-6 /path/to/venv/bin/python /path/to/backend/smart_substitution_cron.py

WhatsApp messages are sent via whatsapp_dispatcher.dispatch_substitution_alert()
which guarantees:
  ✓ Strict private DM routing (@c.us JID only)
  ✗ Never touches WhatsApp Status / broadcast / groups
  ✓ Phone number sanitized, country code enforced
  ✓ Delivery status logged to whatsapp_delivery_logs table
"""

import sys
import datetime
import logging
import os
import mysql.connector
from dotenv import load_dotenv

# Import the safe, hardened dispatcher (replaces the old inline send_whatsapp_notification)
from whatsapp_dispatcher import dispatch_substitution_alert

load_dotenv()

# ─── Configuration (all from .env) ───────────────────────────────────────────

DB_HOST     = os.getenv("DB_HOST",     "localhost")
DB_USER     = os.getenv("DB_USER",     "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Irshad12")
DB_NAME     = os.getenv("DB_NAME",     "smart_school")
SCHOOL_ID   = os.getenv("SCHOOL_ID",  "smart_school_001")
SCHOOL_NAME = os.getenv("SCHOOL_NAME", "")

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="[SubstitutionCron] %(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("substitution_cron")


# ─── DB Helper ────────────────────────────────────────────────────────────────

def get_db_connection() -> mysql.connector.MySQLConnection:
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )


def _fmt_time(t) -> str:
    """Convert MySQL timedelta or time to HH:MM string."""
    if t is None:
        return "??"
    if hasattr(t, "total_seconds"):
        total = int(t.total_seconds())
        h, m = divmod(total // 60, 60)
        return f"{h:02}:{m:02}"
    return str(t)[:5]


# ─── Engine ───────────────────────────────────────────────────────────────────

def run_substitution_engine():
    logger.info("═" * 60)
    logger.info("Smart Substitution Engine starting...")
    logger.info("═" * 60)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    today    = datetime.date.today()
    day_name = today.strftime("%A")   # 'Monday', 'Tuesday', …

    # ── 0. Check Week Offs & Holidays ─────────────────────────────────────────
    # Check if today is a week off
    cursor.execute("SELECT week_off_days FROM school_settings WHERE school_id = %s", (SCHOOL_ID,))
    settings_row = cursor.fetchone()
    week_offs = ["Sunday"]
    if settings_row and settings_row.get("week_off_days"):
        try:
            week_offs = json.loads(settings_row["week_off_days"])
        except json.JSONDecodeError:
            pass
        if day_name in week_offs:
            logger.info(f"✅ Today ({day_name}) is a Week Off. Skipping substitution engine.")
            cursor.close()
            conn.close()
            return

    # Check if today is a holiday
    cursor.execute("""
        SELECT title FROM school_holidays 
        WHERE school_id = %s AND %s >= start_date AND %s <= end_date
    """, (SCHOOL_ID, today, today))
    holiday = cursor.fetchone()
    if holiday:
        logger.info(f"🌴 Today is a holiday: '{holiday['title']}'. Skipping substitution engine.")
        cursor.close()
        conn.close()
        return

    # ── 1. Absence Identification ─────────────────────────────────────────────
    cursor.execute(
        "SELECT id, first_name, last_name, phone, subjects_qualified "
        "FROM teachers WHERE status = 'active' AND school_id = %s",
        (SCHOOL_ID,)
    )
    all_teachers = cursor.fetchall()

    cursor.execute(
        "SELECT teacher_id FROM staff_attendance_logs "
        "WHERE date = %s AND status = 'present' AND school_id = %s",
        (today, SCHOOL_ID)
    )
    present_ids = {row["teacher_id"] for row in cursor.fetchall()}

    absent_teachers  = [t for t in all_teachers if t["id"] not in present_ids]
    present_teachers = [t for t in all_teachers if t["id"] in present_ids]

    logger.info(
        f"Attendance snapshot: {len(present_ids)} present, "
        f"{len(absent_teachers)} absent out of {len(all_teachers)} total"
    )

    # Mark absent teachers who have no log entry yet
    for teacher in absent_teachers:
        cursor.execute(
            "SELECT id FROM staff_attendance_logs "
            "WHERE teacher_id = %s AND date = %s AND school_id = %s",
            (teacher["id"], today, SCHOOL_ID)
        )
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO staff_attendance_logs (teacher_id, date, status, school_id) "
                "VALUES (%s, %s, 'absent', %s)",
                (teacher["id"], today, SCHOOL_ID)
            )
    conn.commit()

    if not absent_teachers:
        logger.info("✅ All teachers present today — no substitutions needed.")
        cursor.close()
        conn.close()
        return

    # ── Helper: weekly substitution load ──────────────────────────────────────
    def get_weekly_sub_count(teacher_id: str) -> int:
        cursor.execute(
            "SELECT COUNT(*) AS cnt FROM substitution_logs "
            "WHERE substitute_teacher_id = %s AND school_id = %s "
            "AND date >= DATE_SUB(%s, INTERVAL 7 DAY)",
            (teacher_id, SCHOOL_ID, today)
        )
        row = cursor.fetchone()
        return row["cnt"] if row else 0

    # ── Helper: teacher free during period ────────────────────────────────────
    def is_teacher_free(teacher_id: str, period_number: int) -> bool:
        cursor.execute(
            "SELECT id FROM master_timetable "
            "WHERE teacher_id = %s AND day_of_week = %s "
            "AND period_number = %s AND school_id = %s",
            (teacher_id, day_name, period_number, SCHOOL_ID)
        )
        return cursor.fetchone() is None

    # ── Helper: already assigned a sub for this period today ─────────────────
    def is_already_substituting(teacher_id: str, period_number: int) -> bool:
        cursor.execute(
            "SELECT id FROM substitution_logs "
            "WHERE substitute_teacher_id = %s AND date = %s "
            "AND period_number = %s AND school_id = %s",
            (teacher_id, today, period_number, SCHOOL_ID)
        )
        return cursor.fetchone() is not None

    # ── 2. Conflict Resolution Matrix ─────────────────────────────────────────
    for absent in absent_teachers:
        absent_full_name = f"{absent['first_name']} {absent['last_name']}"
        logger.info(f"Processing absent teacher: {absent_full_name} (ID: {absent['id']})")

        cursor.execute(
            "SELECT * FROM master_timetable "
            "WHERE teacher_id = %s AND day_of_week = %s AND school_id = %s "
            "ORDER BY period_number ASC",
            (absent["id"], day_name, SCHOOL_ID)
        )
        absent_classes = cursor.fetchall()

        if not absent_classes:
            logger.info(f"  {absent_full_name} has no scheduled periods today — skipping.")
            continue

        for period_row in absent_classes:
            period  = period_row["period_number"]
            subject = period_row["subject"]

            # Parse classes JSON field for display
            import json as _json
            classes_raw = period_row.get("classes")
            class_list = []
            if classes_raw:
                try:
                    class_list = _json.loads(classes_raw)
                except (json.JSONDecodeError, TypeError):
                    class_list = [classes_raw]
            elif isinstance(classes_raw, list):
                class_list = classes_raw
            else:
                class_list = ["N/A"]
            class_section = ", ".join(class_list)

            logger.info(
                f"  Period {period} | {subject} | {class_section} — finding substitute..."
            )

            # Candidates: present today AND free this period AND not already subbing
            candidates = [
                t for t in present_teachers
                if is_teacher_free(t["id"], period)
                and not is_already_substituting(t["id"], period)
            ]

            if not candidates:
                logger.warning(
                    f"  ⚠️  CRITICAL: No free substitute for Period {period} "
                    f"({subject}) — {class_section}"
                )
                continue

            # Prefer subject-qualified candidates
            qualified = [
                c for c in candidates
                if c.get("subjects_qualified")
                and subject.lower() in c["subjects_qualified"].lower()
            ]
            pool = qualified if qualified else candidates

            # Load-balance: pick lowest weekly substitution count
            pool_with_load = sorted(pool, key=lambda t: get_weekly_sub_count(t["id"]))
            chosen = pool_with_load[0]
            chosen_name = f"{chosen['first_name']} {chosen['last_name']}"
            match_type  = "subject-qualified" if qualified else "free-teacher (monitor)"

            # Record substitution
            cursor.execute(
                """INSERT INTO substitution_logs
                       (date, period_number, absent_teacher_id, substitute_teacher_id,
                        class_name, section, subject, school_id)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    today, period,
                    absent["id"], chosen["id"],
                    class_section, "",           # section merged into class_section
                    subject, SCHOOL_ID
                )
            )
            conn.commit()
            log_ref = f"sub_{today}_{period}_{chosen['id']}"

            logger.info(
                f"  ✅ Assigned → {chosen_name} ({match_type}) | ref={log_ref}"
            )

            # ── 3. WhatsApp DM via hardened dispatcher ────────────────────────
            # Retrieves teacher phone fresh from the chosen dict (from DB)
            teacher_phone = chosen.get("phone") or chosen.get("phone_whatsapp", "")

            if not teacher_phone:
                logger.warning(
                    f"  ⚠️  No phone number for {chosen_name} — skipping WhatsApp dispatch"
                )
                continue

            start_str = _fmt_time(period_row.get("start_time"))
            end_str   = _fmt_time(period_row.get("end_time"))

            success, reason = dispatch_substitution_alert(
                teacher_phone=teacher_phone,       # Raw from DB — dispatcher sanitizes it
                teacher_name=chosen_name,
                period_number=period,
                start_time=start_str,
                end_time=end_str,
                class_section=class_section,
                subject=subject,
                school_id=SCHOOL_ID,
                school_name=SCHOOL_NAME,
                log_db_conn=conn,                  # Dispatcher writes delivery log
                log_reference_id=log_ref,
            )

            if success:
                logger.info(f"  📱 WhatsApp DM sent to {chosen_name} ({teacher_phone})")
            else:
                logger.error(
                    f"  ❌ WhatsApp dispatch failed for {chosen_name}: {reason}"
                )

    cursor.close()
    conn.close()
    logger.info("═" * 60)
    logger.info("Smart Substitution Engine finished.")
    logger.info("═" * 60)


if __name__ == "__main__":
    run_substitution_engine()
