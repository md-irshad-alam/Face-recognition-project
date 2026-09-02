from fastapi import APIRouter, Request, BackgroundTasks
import logging
from services.gemini import process_parent_message
from services.waha_service import send_text_message
from database import create_connection

router = APIRouter()
logger = logging.getLogger("webhook")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    logger.addHandler(handler)

def log_intent_to_db(phone: str, intent: str, text: str):
    """Log the parent intent to the audit_logs table."""
    conn = create_connection()
    if not conn: return
    try:
        cursor = conn.cursor()
        # Ensure we look up phone robustly (ignoring possible country code mismatch for simplicity here)
        cursor.execute("SELECT id, school_id FROM students WHERE parent_phone LIKE %s LIMIT 1", (f"%{phone[-10:]}",))
        student = cursor.fetchone()
        if student:
            school_id = student[1]
            cursor.execute(
                "INSERT INTO audit_logs (action, details, school_id) VALUES (%s, %s, %s)",
                ("AI_INTENT_LOG", f"Intent: {intent}, Msg: {text[:150]}", school_id)
            )
            conn.commit()
    except Exception as e:
        logger.error(f"Failed to log intent to DB: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@router.post("/waha")
async def waha_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
    except Exception:
        data = {}
    
    event = data.get("event")
    payload = data.get("payload", {})
    
    if event == "message" and not payload.get("fromMe"):
        sender_id = payload.get("from", "")
        message_text = payload.get("body", "")
        
        phone = sender_id.split("@")[0] if "@" in sender_id else sender_id
        
        if not message_text:
            message_text = payload.get("text", "")
            
        if not message_text and "message" in payload:
            msg_obj = payload.get("message", {})
            if "extendedTextMessage" in msg_obj:
                message_text = msg_obj["extendedTextMessage"].get("text", "")
            elif "conversation" in msg_obj:
                message_text = msg_obj.get("conversation", "")

        if message_text and sender_id:
            logger.info(f"Received WAHA message from {phone} (Text: {message_text[:50]})")
            
            # Process via Gemini
            intent, reply_text = await process_parent_message(message_text)
            
            # Log intent to DB in background
            background_tasks.add_task(log_intent_to_db, phone, intent, message_text)
            
            # Send reply
            await send_text_message(phone, reply_text)
        else:
            logger.info(f"Ignored WAHA event or empty message from {phone}. Payload: {payload}")
            
    return {"status": "ok"}
