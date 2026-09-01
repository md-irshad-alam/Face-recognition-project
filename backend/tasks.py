from celery import Celery
import os
import requests
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Celery
# Note: In production, use a secure broker like Redis or RabbitMQ
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://127.0.0.1:6380/0")
celery_app = Celery("tasks", broker=CELERY_BROKER_URL)

# SMS Gateway Config (Msg91 example)
MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY")
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "SCHOOL")

# WhatsApp WAHA Server Config
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3001")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "visio_waha_secure_key_123")

@celery_app.task(name="send_whatsapp_message")
def send_whatsapp_message(phone, message, session_name="default"):
    """
    Sends a WhatsApp message using WAHA Server.
    """
    print(f"Sending WhatsApp to {phone} using session {session_name}: {message}")
    
    url = f"{WAHA_BASE_URL}/api/sendText"
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY
    }
    
    # Clean phone number and ensure country code (default to 91 for India if 10 digits)
    clean_number = "".join(filter(str.isdigit, str(phone)))
    if len(clean_number) == 10:
        clean_number = "91" + clean_number
    
    payload = {
        "session": session_name,
        "chatId": f"{clean_number}@c.us",
        "text": message
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        print(f"✅ WhatsApp message sent to {phone} via WAHA")
        return response.json() if response.content else {"status": "success"}
    except Exception as e:
        print(f"❌ WhatsApp API Error: {e}")
        return {"status": "error", "message": str(e)}

@celery_app.task(name="broadcast_whatsapp_messages")
def broadcast_whatsapp_messages(recipients_and_messages):
    """
    Sends bulk WhatsApp messages with a 60-second delay between each.
    recipients_and_messages: list of dicts [{"phone": "...", "message": "..."}]
    """
    for index, item in enumerate(recipients_and_messages):
        # Schedule each message with an increasing delay
        send_whatsapp_message.apply_async(
            args=[item["phone"], item["message"]],
            countdown=index * 60  # 60s delay between messages
        )
    return f"Queued {len(recipients_and_messages)} messages with 60s intervals."

@celery_app.task(name="send_payment_reminder")
def send_payment_reminder(phone, amount, link):
    """
    Sends an SMS and WhatsApp reminder to parents with the payment link.
    """
    message = (
        f"💸 *Smart School: Payment Reminder*\n\n"
        f"Dear Parent, this is a friendly reminder to pay the fee of *₹{amount}*.\n\n"
        f"🔗 *Payment Link:* {link}\n\n"
        f"Please ignore if already paid. Thank you!"
    )
    
    # Send SMS (Old logic)
    print(f"Sending SMS to {phone}: {message}")
    if MSG91_AUTH_KEY:
        try:
            url = "https://api.msg91.com/api/v2/sendsms"
            payload = {
                "sender": MSG91_SENDER_ID,
                "route": "4",
                "country": "91",
                "sms": [{"message": message, "to": [phone]}]
            }
            headers = {"authkey": MSG91_AUTH_KEY, "Content-Type": "application/json"}
            requests.post(url, json=payload, headers=headers)
        except Exception as e:
            print(f"SMS Gateway Error: {e}")

    # Send WhatsApp (New logic)
    send_whatsapp_message.delay(phone, message)
    
    return True

@celery_app.task(name="schedule_reminders")
def schedule_reminders(phone, amount, link):
    # Day 0 (Immediate)
    send_payment_reminder.delay(phone, amount, link)
    
    # Day 3
    send_payment_reminder.apply_async(
        args=[phone, amount, link],
        countdown=3 * 24 * 60 * 60 # 3 days in seconds
    )
    
    # Day 7
    send_payment_reminder.apply_async(
        args=[phone, amount, link],
        countdown=7 * 24 * 60 * 60 # 7 days in seconds
    )
