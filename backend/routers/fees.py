from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import database
from tasks import send_whatsapp_message, broadcast_whatsapp_messages

router = APIRouter(prefix="/fees", tags=["Fees"])

class ReminderRequest(BaseModel):
    student_id: str
    amount: str
    fee_type: str

@router.post("/send-reminder")
async def send_reminder(request: ReminderRequest):
    try:
        student = database.get_student_by_id(request.student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Production Check: One message per student per hour (Cooldown)
        from datetime import datetime, timedelta
        last_sent = student.get('last_reminder_sent')
        if last_sent:
            # If last_sent is a string, parse it. If it's a datetime, use it.
            if isinstance(last_sent, str):
                last_sent_dt = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
            else:
                last_sent_dt = last_sent
            
            cooldown_period = timedelta(hours=1)
            if datetime.now() - last_sent_dt < cooldown_period:
                diff = cooldown_period - (datetime.now() - last_sent_dt)
                minutes_left = int(diff.total_seconds() // 60)
                raise HTTPException(
                    status_code=429, 
                    detail=f"Reminder already sent recently. Please wait {minutes_left} minutes before sending again."
                )

        phone = student.get('parent_phone') or student.get('phone')
        if not phone:
            raise HTTPException(status_code=400, detail="Parent phone not found")

        message = (
            f"💸 *Smart School: Fee Reminder*\n\n"
            f"Dear Parent, this is a reminder to pay the fee of *{request.amount}* for *{student['name']}* ({request.fee_type}).\n\n"
            f"📍 *Payment Method:* Please pay at the school accounts counter (Cash/UPI).\n\n"
            f"Thank you!"
        )
        
        # Send via WhatsApp (Task)
        send_whatsapp_message.delay(phone, message)
        
        # Update timestamp immediately to prevent race conditions
        database.update_last_reminder_sent(request.student_id)

        return {"status": "success", "message": f"Reminder sent to {student['name']}'s parent."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reminder Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/broadcast-reminders")
async def broadcast_reminders():
    try:
        pending_students = database.get_all_students_for_fees()
        if not pending_students:
            return {"status": "success", "message": "No pending fees found."}

        broadcast_list = []
        for s in pending_students:
            if s['status'] != 'Paid':
                # Get real student phone from DB
                student_full = database.get_student_by_id(s['id'])
                phone = student_full.get('parent_phone') or student_full.get('phone')
                
                if phone:
                    message = (
                        f"💸 *Smart School: Bulk Fee Reminder*\n\n"
                        f"Dear Parent, this is a reminder to pay the fee of *{s['amount']}* for *{s['name']}* ({s['type']}).\n\n"
                        f"📍 *Payment Method:* Please pay at the school accounts counter (Cash/UPI).\n\n"
                        f"Thank you!"
                    )
                    broadcast_list.append({"phone": phone, "message": message})

        if broadcast_list:
            broadcast_whatsapp_messages.delay(broadcast_list)

        return {"status": "success", "message": f"Broadcasting {len(broadcast_list)} reminders."}
    except Exception as e:
        print(f"Broadcast Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-payment-done")
async def mark_payment_done(request: dict):
    # request: {"student_ids": ["ID1", "ID2"]}
    student_ids = request.get("student_ids", [])
    if not student_ids:
        raise HTTPException(status_code=400, detail="No student IDs provided")
    
    try:
        conn = database.create_connection()
        cursor = conn.cursor()
        
        from datetime import datetime
        # Set last_payment_date to the 1st of the current month (meaning they've paid for this month)
        current_month_start = datetime.now().replace(day=1).strftime('%Y-%m-%d')
        
        # Construct placeholders for IN clause
        placeholders = ', '.join(['%s'] * len(student_ids))
        # Update both the date anchor and clear the opening balance
        query = f"""
            UPDATE students 
            SET last_payment_date = %s, 
                opening_balance = 0,
                status = 'Paid'
            WHERE id IN ({placeholders})
        """
        
        params = [current_month_start] + student_ids
        cursor.execute(query, params)
        conn.commit()
        
        cursor.close()
        conn.close()
        return {"status": "success", "message": f"Payment cleared for {len(student_ids)} students."}
    except Exception as e:
        print(f"Payment Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
