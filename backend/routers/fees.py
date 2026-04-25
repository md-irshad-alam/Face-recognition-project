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

        return {"status": "success", "message": f"Reminder sent to {student['name']}'s parent."}
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
        
        # Construct placeholders for IN clause
        placeholders = ', '.join(['%s'] * len(student_ids))
        query = f"UPDATE students SET status = 'Paid' WHERE id IN ({placeholders})"
        
        cursor.execute(query, tuple(student_ids))
        conn.commit()
        
        cursor.close()
        conn.close()
        return {"status": "success", "message": f"Payment marked as done for {len(student_ids)} students."}
    except Exception as e:
        print(f"Payment Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
