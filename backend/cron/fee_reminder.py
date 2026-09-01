from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
import logging
from database import create_connection
from services.waha_service import send_text_message

logger = logging.getLogger("fee_reminder_cron")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    logger.addHandler(handler)

scheduler = AsyncIOScheduler()

async def check_and_send_fee_reminders():
    logger.info("Running daily fee reminder cron job...")
    conn = create_connection()
    if not conn:
        logger.error("Failed to connect to database for cron job")
        return

    try:
        cursor = conn.cursor(dictionary=True)
        # Fetch fees due in exactly 7 days
        target_date = (datetime.now() + timedelta(days=7)).date()
        
        query = """
            SELECT f.id, f.due_date, f.status, f.student_id, 
                   s.name as student_name, s.parent_phone, s.total_monthly_fee
            FROM fee_payment_history f
            JOIN students s ON f.student_id = s.id
            WHERE f.status = 'pending' AND f.due_date = %s
        """
        cursor.execute(query, (target_date,))
        records = cursor.fetchall()

        count = 0
        for row in records:
            parent_phone = row['parent_phone']
            amount = row['total_monthly_fee']
            student_name = row['student_name']
            
            if not parent_phone:
                continue
                
            upi_link = f"upi://pay?pa=yourschool@upi&pn=VisioSchool&am={amount}&cu=INR"
            
            message = (
                f"Dear Parent,\n\n"
                f"This is a gentle reminder that the fee of INR {amount} for {student_name} "
                f"is due on {target_date.strftime('%Y-%m-%d')}.\n\n"
                f"You can pay easily using this UPI link: {upi_link}\n\n"
                f"Thank you,\nVisio School"
            )
            
            success = await send_text_message(parent_phone, message)
            if success:
                count += 1
                
        logger.info(f"Sent {count} fee reminders.")
            
    except Exception as e:
        logger.error(f"Error in fee reminder cron: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def start_scheduler():
    scheduler.add_job(check_and_send_fee_reminders, 'cron', hour=9, minute=0)
    scheduler.start()
