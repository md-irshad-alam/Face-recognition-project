import httpx
import os
import logging
import re
from dotenv import load_dotenv

load_dotenv()

WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3001")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "visio_waha_secure_key_123")
logger = logging.getLogger("waha_service")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    logger.addHandler(handler)

def format_phone_number(phone: str) -> str:
    """Strip to digits only, prepend '91' country code if 10 digits."""
    clean = re.sub(r'\D', '', str(phone or ""))
    if len(clean) == 10:
        clean = "91" + clean
    return clean

async def send_text_message(phone_number: str, message_text: str, session: str = "default") -> bool:
    """Send a text message using WAHA."""
    clean_number = format_phone_number(phone_number)
    if not clean_number:
        logger.error("Invalid phone number")
        return False
        
    chat_id = f"{clean_number}@c.us"
    url = f"{WAHA_BASE_URL}/api/sendText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY
    }
    
    payload = {
        "session": session,
        "chatId": chat_id,
        "text": message_text
    }
    
    async with httpx.AsyncClient() as client:
        try:
            logger.info(f"Sending WAHA message to {chat_id}")
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
            
            if response.status_code in (200, 201):
                logger.info("Message sent successfully")
                return True
            else:
                logger.error(f"WAHA Error: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Failed to send WAHA message: {e}")
            return False
