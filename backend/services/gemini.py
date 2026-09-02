import google.generativeai as genai
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("gemini_service")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    logger.addHandler(handler)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    logger.error(f"Failed to init Gemini model: {e}")
    model = None

SYSTEM_PROMPT = """
You are an AI assistant for Visio School.
Your job is to read messages from parents regarding fee collection and respond politely and briefly.
First, classify the intent into one of these categories:
- PROMISE_TO_PAY: The parent promises to pay the fee soon.
- DISPUTE: The parent disputes the fee amount or due date.
- GENERAL_QUERY: Any other general question.

Respond in this format:
INTENT: [Category]
REPLY: [Your short, polite response to the parent]
"""

async def process_parent_message(message_text: str) -> tuple[str, str]:
    if not model:
        return "GENERAL_QUERY", "Thank you for reaching out. We will get back to you shortly."
        
    try:
        response = await model.generate_content_async(f"{SYSTEM_PROMPT}\n\nParent's Message: {message_text}")
        content = response.text.strip()
        
        intent = "GENERAL_QUERY"
        if "INTENT:" in content:
            intent_line = content.split("INTENT:")[1].split("\n")[0].strip()
            if intent_line in ["PROMISE_TO_PAY", "DISPUTE", "GENERAL_QUERY"]:
                intent = intent_line
                
        reply = content
        if "REPLY:" in content:
            reply = content.split("REPLY:")[1].strip()
            
        return intent, reply
    except Exception as e:
        logger.error(f"Gemini processing error: {e}")
        return "GENERAL_QUERY", "Thank you for reaching out. We will get back to you shortly."
