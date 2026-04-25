import requests
import os
from dotenv import load_dotenv

load_dotenv()

EVOLUTION_API_URL = os.getenv('EVOLUTION_API_URL')
EVOLUTION_API_KEY = os.getenv('EVOLUTION_API_KEY')
EVOLUTION_INSTANCE = os.getenv('EVOLUTION_INSTANCE', 'smart_school')

def send_whatsapp_notification(number, message):
    """
    Send a WhatsApp message via Evolution API.
    :param number: Recipient phone number (with country code, no + or spaces)
    :param message: The text message to send
    """
    if not EVOLUTION_API_URL or not EVOLUTION_API_KEY:
        print("WhatsApp notification skipped: API credentials not configured.")
        return False

    url = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}"
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
    }
    
    # Ensure number is in correct format (remove +, spaces, dashes)
    clean_number = "".join(filter(str.isdigit, str(number)))
    
    payload = {
        "number": clean_number,
        "text": message
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        print(f"WhatsApp notification sent to {clean_number}")
        return True
    except Exception as e:
        print(f"Failed to send WhatsApp notification: {e}")
        return False
