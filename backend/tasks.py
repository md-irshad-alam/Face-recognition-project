from celery import Celery
import os
import requests
from datetime import timedelta

# Initialize Celery
# Note: In production, use a secure broker like Redis or RabbitMQ
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
celery_app = Celery("tasks", broker=CELERY_BROKER_URL)

# SMS Gateway Config (Msg91 example)
MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY")
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "SCHOOL")

# WhatsApp Evolution API Config
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "http://localhost:8080")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "your_api_key")
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE", "MainInstance")

@celery_app.task(name="send_whatsapp_message")
def send_whatsapp_message(phone, message):
    """
    Sends a WhatsApp message using Evolution API v2.
    Solo messages are sent instantly.
    """
    print(f"Sending WhatsApp to {phone}: {message}")
    
    url = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}"
    headers = {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "number": phone,
        "text": message
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"WhatsApp API Error: {e}")
        return False

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
