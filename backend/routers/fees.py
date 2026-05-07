from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import database
import auth

router = APIRouter(prefix="/fees", tags=["Fees"])

LATE_FINE_PER_MONTH = 50  # ₹50 per overdue month

# ── Pydantic Models ────────────────────────────────────────────────────────────

class ReminderRequest(BaseModel):
    student_id: str
    amount: str
    fee_type: str

class RecordPaymentRequest(BaseModel):
    invoice_id: int
    amount: float
    payment_method: str = "CASH"
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    payment_date: Optional[str] = None  # YYYY-MM-DD

# ── Helper: Generate invoice number ───────────────────────────────────────────

def make_invoice_number(student_id: str, year: int, month: int) -> str:
    return f"INV-{student_id}-{year}{month:02d}"

# ── Helper: Ensure invoice exists for student/month ───────────────────────────

def get_or_create_invoice(cursor, student_id: str, school_id: str, year: int, month: int):
    inv_no = make_invoice_number(student_id, year, month)
    cursor.execute("SELECT * FROM fee_invoices WHERE invoice_number = %s", (inv_no,))
    inv = cursor.fetchone()
    if inv:
        return inv

    # Fetch student fees
    cursor.execute(
        "SELECT total_monthly_fee FROM students WHERE id = %s", (student_id,)
    )
    s = cursor.fetchone()
    monthly = float(s["total_monthly_fee"] or 0) if s else 0

    # Get previous unpaid balance from last invoice
    cursor.execute("""
        SELECT balance_due FROM fee_invoices
        WHERE student_id = %s AND (year < %s OR (year = %s AND month < %s))
        ORDER BY year DESC, month DESC LIMIT 1
    """, (student_id, year, year, month))
    prev = cursor.fetchone()
    previous_due = float(prev["balance_due"] or 0) if prev else 0

    # Late fine: ₹50 for each overdue month (invoices with balance > 0 before this month)
    cursor.execute("""
        SELECT COUNT(*) as cnt FROM fee_invoices
        WHERE student_id = %s AND status IN ('UNPAID','OVERDUE')
          AND (year < %s OR (year = %s AND month < %s))
    """, (student_id, year, year, month))
    overdue_row = cursor.fetchone()
    overdue_months = int(overdue_row["cnt"] or 0) if overdue_row else 0
    late_fine = overdue_months * LATE_FINE_PER_MONTH

    total_payable = monthly + previous_due + late_fine
    due_date = date(year, month, 10)  # Due on 10th of each month

    cursor.execute("""
        INSERT INTO fee_invoices
          (student_id, school_id, invoice_number, month, year,
           monthly_fee, previous_due, late_fine, total_payable,
           amount_paid, balance_due, status, due_date)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,0,%s,'UNPAID',%s)
    """, (student_id, school_id, inv_no, month, year,
          monthly, previous_due, late_fine, total_payable,
          total_payable, due_date.strftime("%Y-%m-%d")))

    cursor.execute("SELECT * FROM fee_invoices WHERE invoice_number = %s", (inv_no,))
    return cursor.fetchone()


def _format_invoice(inv: dict) -> dict:
    for key in ["generated_at", "updated_at"]:
        if inv.get(key) and hasattr(inv[key], "strftime"):
            inv[key] = inv[key].strftime("%Y-%m-%d %H:%M:%S")
    if inv.get("due_date") and hasattr(inv["due_date"], "strftime"):
        inv["due_date"] = inv["due_date"].strftime("%Y-%m-%d")
    return inv


# ── 1. Generate / fetch this month's invoices for all students ─────────────────

@router.post("/generate-invoices")
def generate_monthly_invoices(current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    now = datetime.now()
    try:
        cursor.execute(
            "SELECT id FROM students WHERE school_id = %s", (school_id,)
        )
        students = cursor.fetchall()
        created = 0
        for s in students:
            inv = get_or_create_invoice(cursor, s["id"], school_id, now.year, now.month)
            if inv:
                created += 1
        conn.commit()
        return {"message": f"Invoices ensured for {created} students.", "month": now.month, "year": now.year}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


# ── 2. Get all invoices (admin view) ──────────────────────────────────────────

@router.get("/invoices")
def get_all_invoices(
    month: Optional[int] = None,
    year: Optional[int] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(auth.get_current_user)
):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        now = datetime.now()
        m = month or now.month
        y = year or now.year

        # Ensure invoices for ALL students for this month
        cursor.execute("SELECT id FROM students WHERE school_id=%s", (school_id,))
        all_students = cursor.fetchall()
        for s in all_students:
            # get_or_create_invoice checks if it already exists by invoice_number
            get_or_create_invoice(cursor, s["id"], school_id, y, m)
        conn.commit()

        query = """
            SELECT fi.*, s.name as student_name, s.class_name, s.section,
                   s.parent_phone, s.phone
            FROM fee_invoices fi
            JOIN students s ON fi.student_id = s.id
            WHERE fi.school_id = %s AND fi.month = %s AND fi.year = %s
        """
        params = [school_id, m, y]
        if status:
            query += " AND fi.status = %s"
            params.append(status)
        query += " ORDER BY fi.status DESC, s.name ASC"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # Add months_pending to each row
        for row in rows:
            cursor.execute("""
                SELECT COUNT(*) as cnt FROM fee_invoices
                WHERE student_id = %s AND status IN ('UNPAID','OVERDUE','PARTIALLY_PAID')
                  AND balance_due > 0
            """, (row['student_id'],))
            cnt_row = cursor.fetchone()
            row['months_pending'] = int(cnt_row['cnt'] or 0) if cnt_row else 0

        return [_format_invoice(r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


# ── 3. Get single student's invoices ─────────────────────────────────────────

@router.get("/student/{student_id}/invoices")
def get_student_invoices(student_id: str, current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT fi.*, s.name as student_name, s.class_name, s.section
            FROM fee_invoices fi
            JOIN students s ON fi.student_id = s.id
            WHERE fi.student_id = %s AND fi.school_id = %s
            ORDER BY fi.year DESC, fi.month DESC
        """, (student_id, school_id))
        rows = cursor.fetchall()
        return [_format_invoice(r) for r in rows]
    finally:
        cursor.close(); conn.close()


# ── 4. Get invoice payments history ──────────────────────────────────────────

@router.get("/invoice/{invoice_id}/payments")
def get_invoice_payments(invoice_id: int, current_user: dict = Depends(auth.get_current_user)):
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT fp.*, fi.invoice_number, s.name as student_name
            FROM fee_payments fp
            JOIN fee_invoices fi ON fp.invoice_id = fi.id
            JOIN students s ON fp.student_id = s.id
            WHERE fp.invoice_id = %s
            ORDER BY fp.created_at DESC
        """, (invoice_id,))
        rows = cursor.fetchall()
        for r in rows:
            if r.get("payment_date") and hasattr(r["payment_date"], "strftime"):
                r["payment_date"] = r["payment_date"].strftime("%Y-%m-%d")
            if r.get("created_at") and hasattr(r["created_at"], "strftime"):
                r["created_at"] = r["created_at"].strftime("%Y-%m-%d %H:%M:%S")
        return rows
    finally:
        cursor.close(); conn.close()


# ── 5. Record a counter payment ───────────────────────────────────────────────

@router.post("/record-payment")
def record_payment(req: RecordPaymentRequest, current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get("school_id", "")
    recorded_by = current_user.get("full_name", "Staff")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM fee_invoices WHERE id = %s", (req.invoice_id,))
        invoice = cursor.fetchone()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        pay_date = req.payment_date or datetime.now().strftime("%Y-%m-%d")
        amount = round(float(req.amount), 2)

        # Insert payment record
        cursor.execute("""
            INSERT INTO fee_payments
              (invoice_id, student_id, school_id, amount, payment_method,
               reference_number, notes, payment_date, recorded_by)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (req.invoice_id, invoice["student_id"], school_id,
              amount, req.payment_method, req.reference_number,
              req.notes, pay_date, recorded_by))

        # Update invoice amounts
        new_paid = float(invoice["amount_paid"]) + amount
        new_balance = max(0, float(invoice["total_payable"]) - new_paid)

        if new_balance <= 0:
            new_status = "PAID"
        elif new_paid > 0:
            new_status = "PARTIALLY_PAID"
        else:
            new_status = invoice["status"]

        cursor.execute("""
            UPDATE fee_invoices
            SET amount_paid = %s, balance_due = %s, status = %s
            WHERE id = %s
        """, (new_paid, new_balance, new_status, req.invoice_id))

        conn.commit()
        return {
            "message": "Payment recorded successfully",
            "amount_paid": new_paid,
            "balance_due": new_balance,
            "status": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


# ── 6. Send reminder for an invoice ──────────────────────────────────────────

@router.post("/send-reminder")
async def send_reminder(request: ReminderRequest, current_user: dict = Depends(auth.get_current_user)):
    try:
        student = database.get_student_by_id(request.student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        from datetime import timedelta
        last_sent = student.get("last_reminder_sent")
        if last_sent:
            if isinstance(last_sent, str):
                last_sent_dt = datetime.fromisoformat(last_sent.replace("Z", "+00:00"))
            else:
                last_sent_dt = last_sent
            if datetime.now() - last_sent_dt < timedelta(hours=1):
                diff = timedelta(hours=1) - (datetime.now() - last_sent_dt)
                mins = int(diff.total_seconds() // 60)
                raise HTTPException(status_code=429, detail=f"Please wait {mins} min before resending.")

        phone = student.get("parent_phone") or student.get("phone")
        if not phone:
            raise HTTPException(status_code=400, detail="Parent phone not found")

        message = (
            f"📚 *Visio School: Fee Reminder*\n\n"
            f"Dear Parent,\nFee of *{request.amount}* is due for *{student['name']}*.\n"
            f"Fee type: {request.fee_type}\n\n"
            f"Please pay at the school counter.\nThank you!"
        )

        try:
            from tasks import send_whatsapp_message
            send_whatsapp_message.delay(phone, message)
        except Exception:
            pass

        database.update_last_reminder_sent(request.student_id)
        return {"status": "success", "message": f"Reminder sent to {student['name']}'s parent."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 7. Overdue stats for dashboard ────────────────────────────────────────────

@router.get("/students")
async def get_fees_students(current_user: dict = Depends(auth.get_current_user)):
    return database.get_all_students_for_fees(school_id=current_user.get("school_id", ""))


@router.get("/stats")
async def get_fee_stats(current_user: dict = Depends(auth.get_current_user)):
    return database.get_fee_stats(school_id=current_user.get("school_id", ""))


# ── 8. Mark payment done (legacy simple endpoint) ─────────────────────────────

@router.post("/mark-payment-done")
async def mark_payment_done(request: dict, current_user: dict = Depends(auth.get_current_user)):
    student_ids = request.get("student_ids", [])
    if not student_ids:
        raise HTTPException(status_code=400, detail="No student IDs provided")
    try:
        conn = database.create_connection()
        cursor = conn.cursor()
        current_month_start = datetime.now().replace(day=1).strftime("%Y-%m-%d")
        placeholders = ", ".join(["%s"] * len(student_ids))
        cursor.execute(
            f"UPDATE students SET last_payment_date=%s, opening_balance=0 WHERE id IN ({placeholders})",
            [current_month_start] + student_ids
        )
        conn.commit()
        cursor.close(); conn.close()
        return {"status": "success", "message": f"Payment cleared for {len(student_ids)} students."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 9. Broadcast auto-reminders (7-day cycle) ─────────────────────────────────

@router.post("/broadcast-reminders")
async def broadcast_reminders(current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get("school_id", "")
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        now = datetime.now()
        # Get unpaid/overdue invoices where last reminder > 7 days or never sent
        cursor.execute("""
            SELECT fi.id, fi.student_id, fi.balance_due, fi.total_payable,
                   fi.late_fine, fi.month, fi.year,
                   s.name, s.parent_phone, s.phone, s.last_reminder_sent
            FROM fee_invoices fi
            JOIN students s ON fi.student_id = s.id
            WHERE fi.school_id = %s AND fi.status IN ('UNPAID','OVERDUE','PARTIALLY_PAID')
              AND (s.last_reminder_sent IS NULL
                   OR s.last_reminder_sent < NOW() - INTERVAL 7 DAY)
        """, (school_id,))
        targets = cursor.fetchall()

        queued = 0
        for t in targets:
            phone = t.get("parent_phone") or t.get("phone")
            if not phone:
                continue
            month_name = datetime(t["year"], t["month"], 1).strftime("%B %Y")
            msg = (
                f"📚 *Visio School: Fee Due Reminder*\n\n"
                f"Dear Parent,\nThis is a reminder for *{t['name']}*.\n\n"
                f"📅 Month: {month_name}\n"
                f"💰 Total Due: ₹{float(t['balance_due']):,.0f}\n"
                f"⚠️ Late Fine: ₹{float(t['late_fine']):,.0f}\n\n"
                f"Please pay at the school counter. Thank you!"
            )
            try:
                from tasks import send_whatsapp_message
                send_whatsapp_message.delay(phone, msg)
            except Exception:
                pass

            # Log reminder
            cursor.execute("""
                INSERT INTO reminder_logs (student_id, school_id, invoice_id, phone, message)
                VALUES (%s,%s,%s,%s,%s)
            """, (t["student_id"], school_id, t["id"], phone, msg))
            cursor.execute(
                "UPDATE students SET last_reminder_sent=NOW() WHERE id=%s", (t["student_id"],)
            )
            queued += 1

        conn.commit()
        return {"status": "success", "queued": queued}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()
