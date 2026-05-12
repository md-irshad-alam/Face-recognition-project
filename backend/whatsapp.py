import requests
import os
from dotenv import load_dotenv

load_dotenv()

WPP_SERVER_URL = os.getenv('WPP_SERVER_URL', "http://127.0.0.1:21465")
WPP_SECRET_KEY = os.getenv('WPP_SECRET_KEY', "THISISMYSECURETOKEN")
WPP_SESSION_NAME = os.getenv('WPP_SESSION_NAME', 'smart_school')

def send_whatsapp_notification(number, message, school_id="default"):
    """
    Send a WhatsApp message via WPPConnect Server.
    """
    if not WPP_SERVER_URL or not WPP_SECRET_KEY:
        return False

    url = f"{WPP_SERVER_URL}/api/{school_id}/send-message"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {WPP_SECRET_KEY}'
    }
    
    # Clean and format phone number (default 91 for India)
    clean_number = "".join(filter(str.isdigit, str(number)))
    if len(clean_number) == 10:
        clean_number = "91" + clean_number
    
    payload = {
        "phone": clean_number,
        "message": message
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Failed to send WhatsApp notification: {e}")
        return False
