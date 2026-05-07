"""
routers/monitoring.py
Attendance pattern detection, at-risk flagging, notifications, and student promotions.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
import database
import auth

router = APIRouter(tags=["Monitoring & Promotions"])

# ── Thresholds ─────────────────────────────────────────────────────────────────
CONSECUTIVE_ABSENT_THRESHOLD = 3   # flag after 3 consecutive absent days
LOW_ATTENDANCE_PCT = 75.0          # flag if monthly attendance drops below 75%
AT_RISK_PCT = 60.0                 # flag as AT_RISK if below 60%
SUDDEN_DROP_PCT = 20.0             # flag if drops 20% week-over-week
LOOK_BACK_DAYS = 30                # analysis window

# ── Helper: create a notification ──────────────────────────────────────────────
def _create_notification(conn, school_id: str, notif_type: str, title: str,
                          message: str, student_id: str = None, student_name: str = None):
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO notifications (school_id, type, title, message, student_id, student_name)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (school_id, notif_type, title, message, student_id, student_name))
    except Exception as e:
        print(f"[Notify] Error: {e}")

# ── Helper: send WhatsApp alert (non-blocking) ─────────────────────────────────
def _whatsapp_alert(phone: str, message: str):
    try:
        from tasks import send_whatsapp_message
        send_whatsapp_message.delay(phone, message)
    except Exception as e:
        print(f"[WhatsApp] Could not queue: {e}")

# ── Attendance analysis for one student ────────────────────────────────────────
def _analyse_student(cursor, student: dict, school_id: str) -> list:
    """Returns list of flag dicts for this student."""
    flags = []
    sid = student["id"]
    since = (date.today() - timedelta(days=LOOK_BACK_DAYS)).strftime("%Y-%m-%d")

    # Total school days in window (days with any attendance record for school)
    cursor.execute("""
        SELECT COUNT(DISTINCT date) as school_days
        FROM attendance WHERE school_id = %s AND date >= %s
    """, (school_id, since))
    row = cursor.fetchone()
    school_days = int(row["school_days"] or 0)
    if school_days == 0:
        return flags

    # Student present days
    cursor.execute("""
        SELECT COUNT(*) as present_days FROM attendance
        WHERE student_id = %s AND school_id = %s AND date >= %s AND status = 'Present'
    """, (sid, school_id, since))
    p = cursor.fetchone()
    present_days = int(p["present_days"] or 0)
    pct = round((present_days / school_days) * 100, 2) if school_days > 0 else 100.0

    # 1. Low attendance / At-Risk
    if pct < AT_RISK_PCT:
        flags.append({"type": "AT_RISK", "pct": pct, "consec": 0,
                      "reason": f"Attendance critically low at {pct}% over last {LOOK_BACK_DAYS} days."})
    elif pct < LOW_ATTENDANCE_PCT:
        flags.append({"type": "LOW_ATTENDANCE", "pct": pct, "consec": 0,
                      "reason": f"Attendance below 75% — currently {pct}% over last {LOOK_BACK_DAYS} days."})

    # 2. Consecutive absences
    cursor.execute("""
        SELECT date FROM attendance
        WHERE student_id = %s AND school_id = %s AND date >= %s
        ORDER BY date DESC
    """, (sid, school_id, since))
    records = {r["date"]: True for r in cursor.fetchall()}

    # Walk school days in reverse to count consecutive absences
    consec = 0
    check_date = date.today()
    for _ in range(LOOK_BACK_DAYS):
        if check_date.weekday() < 5:  # Mon-Fri
            if check_date not in records:
                consec += 1
            else:
                break
        check_date -= timedelta(days=1)

    if consec >= CONSECUTIVE_ABSENT_THRESHOLD:
        # Don't double-flag if already AT_RISK
        existing_types = {f["type"] for f in flags}
        if "AT_RISK" not in existing_types:
            flags.append({"type": "CONSECUTIVE_ABSENT", "pct": pct, "consec": consec,
                          "reason": f"Absent for {consec} consecutive school days."})

    # 3. Sudden drop: compare last 7 days vs prior 7 days
    week1_start = (date.today() - timedelta(days=7)).strftime("%Y-%m-%d")
    week2_start = (date.today() - timedelta(days=14)).strftime("%Y-%m-%d")

    cursor.execute("""
        SELECT
          SUM(CASE WHEN date >= %s THEN 1 ELSE 0 END) as w1_present,
          SUM(CASE WHEN date >= %s AND date < %s THEN 1 ELSE 0 END) as w2_present
        FROM attendance
        WHERE student_id = %s AND school_id = %s AND status = 'Present'
    """, (week1_start, week2_start, week1_start, sid, school_id))
    wr = cursor.fetchone()
    w1 = int(wr["w1_present"] or 0)
    w2 = int(wr["w2_present"] or 0)
    if w2 > 0 and w1 < w2:
        drop = round(((w2 - w1) / w2) * 100, 1)
        if drop >= SUDDEN_DROP_PCT:
            existing_types = {f["type"] for f in flags}
            if "AT_RISK" not in existing_types and "LOW_ATTENDANCE" not in existing_types:
                flags.append({"type": "SUDDEN_DROP", "pct": pct, "consec": 0,
                              "reason": f"Attendance dropped {drop}% compared to the previous week."})

    return flags


# ══ ENDPOINTS ══════════════════════════════════════════════════════════════════

# ── GET /monitoring/at-risk ────────────────────────────────────────────────────
@router.get("/monitoring/at-risk")
def get_at_risk_students(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT sf.*, s.name as student_name, s.class_name, s.section,
                   s.parent_phone, s.phone
            FROM student_flags sf
            JOIN students s ON sf.student_id = s.id
            WHERE sf.school_id = %s AND sf.is_resolved = FALSE
            ORDER BY sf.flagged_at DESC
        """, (school_id,))
        rows = cursor.fetchall()
        for r in rows:
            if r.get("flagged_at") and hasattr(r["flagged_at"], "strftime"):
                r["flagged_at"] = r["flagged_at"].strftime("%Y-%m-%d %H:%M:%S")
        return rows
    finally:
        cursor.close(); conn.close()


# ── POST /monitoring/run-check ─────────────────────────────────────────────────
@router.post("/monitoring/run-check")
def run_attendance_check(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(auth.require_admin)
):
    school_id = current_user.get("school_id", "")
    background_tasks.add_task(_do_attendance_check, school_id)
    return {"message": "Attendance analysis started in background."}


def _do_attendance_check(school_id: str):
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM students WHERE school_id = %s", (school_id,))
        students = cursor.fetchall()
        flagged = 0

        for student in students:
            sid = student["id"]
            flags = _analyse_student(cursor, student, school_id)

            for flag in flags:
                # Check if identical flag already open
                cursor.execute("""
                    SELECT id FROM student_flags
                    WHERE student_id = %s AND school_id = %s AND flag_type = %s AND is_resolved = FALSE
                """, (sid, school_id, flag["type"]))
                existing = cursor.fetchone()
                if existing:
                    # Update stats
                    cursor.execute("""
                        UPDATE student_flags SET attendance_pct=%s, consecutive_days=%s, reason=%s
                        WHERE id=%s
                    """, (flag["pct"], flag["consec"], flag["reason"], existing["id"]))
                    continue

                # Insert new flag
                cursor.execute("""
                    INSERT INTO student_flags
                      (student_id, school_id, flag_type, reason, attendance_pct, consecutive_days)
                    VALUES (%s,%s,%s,%s,%s,%s)
                """, (sid, school_id, flag["type"], flag["reason"], flag["pct"], flag["consec"]))

                # Create in-app notification
                _create_notification(
                    conn, school_id, "AT_RISK",
                    f"⚠️ {flag['type'].replace('_', ' ').title()}: {student['name']}",
                    flag["reason"],
                    student_id=sid, student_name=student["name"]
                )

                # WhatsApp alert to parent
                phone = student.get("parent_phone") or student.get("phone")
                if phone:
                    msg = (
                        f"📚 *Visio School: Attendance Alert*\n\n"
                        f"Dear Parent,\nWe are concerned about *{student['name']}'s* attendance.\n\n"
                        f"⚠️ {flag['reason']}\n\n"
                        f"Please contact the school administration for assistance.\nThank you."
                    )
                    _whatsapp_alert(phone, msg)

                    cursor.execute("UPDATE student_flags SET notified=TRUE WHERE student_id=%s AND school_id=%s AND flag_type=%s AND is_resolved=FALSE",
                                   (sid, school_id, flag["type"]))

                flagged += 1

        conn.commit()
        print(f"[Monitor] Checked {len(students)} students, flagged {flagged} issues.")
    except Exception as e:
        print(f"[Monitor] Error: {e}")
        import traceback; traceback.print_exc()
    finally:
        cursor.close(); conn.close()


# ── PATCH /monitoring/flag/{flag_id}/resolve ──────────────────────────────────
@router.patch("/monitoring/flag/{flag_id}/resolve")
def resolve_flag(flag_id: int, current_user: dict = Depends(auth.require_admin)):
    conn = database.create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE student_flags SET is_resolved=TRUE, resolved_at=NOW()
            WHERE id=%s AND school_id=%s
        """, (flag_id, current_user.get("school_id", "")))
        conn.commit()
        return {"message": "Flag resolved."}
    finally:
        cursor.close(); conn.close()


# ── GET /notifications ─────────────────────────────────────────────────────────
@router.get("/notifications")
def get_notifications(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT * FROM notifications WHERE school_id = %s
            ORDER BY created_at DESC LIMIT 50
        """, (school_id,))
        rows = cursor.fetchall()
        for r in rows:
            if r.get("created_at") and hasattr(r["created_at"], "strftime"):
                r["created_at"] = r["created_at"].strftime("%Y-%m-%d %H:%M:%S")
        return rows
    finally:
        cursor.close(); conn.close()


@router.get("/notifications/unread-count")
def get_unread_count(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) as cnt FROM notifications WHERE school_id=%s AND is_read=FALSE", (school_id,))
        return {"count": cursor.fetchone()["cnt"]}
    finally:
        cursor.close(); conn.close()


@router.post("/notifications/mark-read")
def mark_all_read(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE notifications SET is_read=TRUE WHERE school_id=%s", (school_id,))
        conn.commit()
        return {"message": "All notifications marked as read."}
    finally:
        cursor.close(); conn.close()


# ══ PROMOTIONS ═════════════════════════════════════════════════════════════════

CLASS_SEQUENCE = ["Nursery","KG1","KG2","Class 1","Class 2","Class 3","Class 4",
                  "Class 5","Class 6","Class 7","Class 8","Class 9","Class 10",
                  "Class 11","Class 12"]

def _next_class(current: str) -> Optional[str]:
    try:
        idx = CLASS_SEQUENCE.index(current)
        if idx < len(CLASS_SEQUENCE) - 1:
            return CLASS_SEQUENCE[idx + 1]
    except ValueError:
        pass
    return None


@router.get("/promotions/pending")
def get_pending_promotions(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT pr.*, s.name as student_name, s.class_name, s.section
            FROM promotion_records pr
            JOIN students s ON pr.student_id = s.id
            WHERE pr.school_id = %s AND pr.status = 'PENDING'
            ORDER BY pr.created_at DESC
        """, (school_id,))
        rows = cursor.fetchall()
        for r in rows:
            for f in ["created_at", "reviewed_at"]:
                if r.get(f) and hasattr(r[f], "strftime"):
                    r[f] = r[f].strftime("%Y-%m-%d %H:%M:%S")
        return rows
    finally:
        cursor.close(); conn.close()


@router.post("/promotions/generate")
def generate_promotions(current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get("school_id", "")
    academic_year = f"{datetime.now().year}-{datetime.now().year + 1}"
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM students WHERE school_id = %s AND is_on_hold = FALSE", (school_id,))
        students = cursor.fetchall()
        created = 0
        skipped = 0

        for s in students:
            next_cls = _next_class(s["class_name"])
            if not next_cls:
                skipped += 1
                continue

            # Check if promotion already generated this year
            cursor.execute("""
                SELECT id FROM promotion_records
                WHERE student_id=%s AND school_id=%s AND academic_year=%s
            """, (s["id"], school_id, academic_year))
            if cursor.fetchone():
                skipped += 1
                continue

            cursor.execute("""
                INSERT INTO promotion_records
                  (student_id, school_id, from_class, from_section, to_class, to_section, academic_year)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (s["id"], school_id, s["class_name"], s.get("section"),
                  next_cls, s.get("section"), academic_year))

            _create_notification(
                conn, school_id, "PROMOTION",
                f"Promotion ready: {s['name']}",
                f"{s['name']} ({s['class_name']}) → {next_cls}. Awaiting admin review.",
                student_id=s["id"], student_name=s["name"]
            )
            created += 1

        conn.commit()
        return {"message": f"Generated {created} promotions ({skipped} skipped).",
                "created": created, "skipped": skipped, "academic_year": academic_year}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


class PromotionAction(BaseModel):
    promotion_id: int
    action: str  # 'approve' or 'reject'
    notes: Optional[str] = None


@router.post("/promotions/review")
def review_promotion(req: PromotionAction, current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get("school_id", "")
    reviewed_by = current_user.get("full_name", "Admin")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM promotion_records WHERE id=%s AND school_id=%s",
                       (req.promotion_id, school_id))
        promo = cursor.fetchone()
        if not promo:
            raise HTTPException(status_code=404, detail="Promotion not found")

        if req.action == "approve":
            new_status = "APPROVED"
            # Actually promote the student
            cursor.execute("""
                UPDATE students SET class_name=%s, section=%s WHERE id=%s AND school_id=%s
            """, (promo["to_class"], promo["to_section"], promo["student_id"], school_id))
            cursor.execute("UPDATE promotion_records SET status='COMPLETED', reviewed_by=%s, reviewed_at=NOW(), notes=%s WHERE id=%s",
                           (reviewed_by, req.notes, req.promotion_id))
        else:
            cursor.execute("UPDATE promotion_records SET status='REJECTED', reviewed_by=%s, reviewed_at=NOW(), notes=%s WHERE id=%s",
                           (reviewed_by, req.notes, req.promotion_id))

        conn.commit()
        return {"message": f"Promotion {req.action}d successfully."}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


@router.post("/promotions/bulk-approve")
def bulk_approve_promotions(current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get("school_id", "")
    reviewed_by = current_user.get("full_name", "Admin")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM promotion_records WHERE school_id=%s AND status='PENDING'", (school_id,))
        promotions = cursor.fetchall()
        approved = 0
        for p in promotions:
            cursor.execute("UPDATE students SET class_name=%s, section=%s WHERE id=%s AND school_id=%s",
                           (p["to_class"], p["to_section"], p["student_id"], school_id))
            cursor.execute("UPDATE promotion_records SET status='COMPLETED', reviewed_by=%s, reviewed_at=NOW() WHERE id=%s",
                           (reviewed_by, p["id"]))
            approved += 1
        conn.commit()
        return {"message": f"Bulk approved {approved} promotions.", "approved": approved}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


@router.get("/promotions/history")
def get_promotion_history(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT pr.*, s.name as student_name
            FROM promotion_records pr
            JOIN students s ON pr.student_id = s.id
            WHERE pr.school_id = %s AND pr.status IN ('COMPLETED','REJECTED')
            ORDER BY pr.reviewed_at DESC LIMIT 100
        """, (school_id,))
        rows = cursor.fetchall()
        for r in rows:
            for f in ["created_at", "reviewed_at"]:
                if r.get(f) and hasattr(r[f], "strftime"):
                    r[f] = r[f].strftime("%Y-%m-%d %H:%M:%S")
        return rows
    finally:
        cursor.close(); conn.close()
