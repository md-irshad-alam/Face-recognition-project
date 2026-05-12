from fastapi import APIRouter, HTTPException, Depends
import requests
import os
from dotenv import load_dotenv
import auth

load_dotenv()

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

WPP_SERVER_URL = os.getenv("WPP_SERVER_URL", "http://127.0.0.1:21465")
WPP_SECRET_KEY = os.getenv("WPP_SECRET_KEY", "THISISMYSECURETOKEN")

def get_headers():
    return {
        "Authorization": f"Bearer {WPP_SECRET_KEY}",
        "Content-Type": "application/json"
    }

@router.get("/status")
async def get_whatsapp_status(current_user: dict = Depends(auth.require_admin)):
    """Check if WhatsApp instance is connected."""
    session_name = current_user.get("school_id", "default")
    url = f"{WPP_SERVER_URL}/api/{session_name}/status-session"
    try:
        response = requests.get(url, headers=get_headers(), timeout=5)
        if response.status_code == 200:
            data = response.json()
            # WPPConnect status can be 'CONNECTED', 'QRCODE', 'INITIALIZING', etc.
            status = data.get("response")
            if isinstance(status, dict):
                status = status.get("status")
            
            if not status:
                status = data.get("status")
                
            return {"connected": status == "CONNECTED", "state": status}
        elif response.status_code == 404:
            return {"connected": False, "state": "not_found", "message": "Session does not exist"}
        else:
            return {"connected": False, "state": "error", "message": f"API returned {response.status_code}"}
    except Exception as e:
        return {"connected": False, "state": "offline", "message": str(e)}

import asyncio
import time

@router.get("/qr")
async def get_whatsapp_qr(current_user: dict = Depends(auth.require_admin)):
    """Fetch a fresh QR code from WPPConnect with retry logic."""
    session_name = current_user.get("school_id", "default")
    
    # 1. Start session
    start_url = f"{WPP_SERVER_URL}/api/{session_name}/start-session"
    try:
        requests.post(start_url, headers=get_headers(), timeout=5)
    except:
        pass 

    # 2. Poll for QR code using status-session (which returns JSON with base64)
    status_url = f"{WPP_SERVER_URL}/api/{session_name}/status-session"
    max_retries = 20 # Try for ~60 seconds
    
    for i in range(max_retries):
        try:
            response = requests.get(status_url, headers=get_headers(), timeout=10)
            if response.status_code == 200:
                data = response.json()
                # WPPConnect status-session returns 'qrcode' as a base64 data URL
                qr_base64 = data.get("qrcode")
                if qr_base64:
                    print(f"✅ QR Code ready on attempt {i+1}!")
                    return {"base64": qr_base64}
                
                print(f"⏳ Session state: {data.get('status')} - QR not ready yet (attempt {i+1}/{max_retries})")
            
        except Exception as e:
            print(f"⚠️ Error on attempt {i+1}: {str(e)}")

        await asyncio.sleep(3)

    raise HTTPException(
        status_code=408, 
        detail="QR Code generation timed out. Please ensure your phone is disconnected and try again."
    )

@router.post("/logout")
async def logout_whatsapp(current_user: dict = Depends(auth.require_admin)):
    """Logout the WhatsApp instance."""
    session_name = current_user.get("school_id", "default")
    url = f"{WPP_SERVER_URL}/api/{session_name}/logout-session"
    try:
        response = requests.post(url, headers=get_headers(), timeout=5)
        return {"status": "success", "message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
