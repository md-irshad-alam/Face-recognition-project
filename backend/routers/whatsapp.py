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
    session_name = current_user.get("school_id") or "default"
    url = f"{WPP_SERVER_URL}/api/{session_name}/status-session"
    try:
        response = requests.get(url, headers=get_headers(), timeout=10)
        if response.status_code == 200:
            data = response.json()
            # WPPConnect status can be 'CONNECTED', 'QRCODE', 'INITIALIZING', etc.
            # Handle different response structures
            resp_obj = data.get("response")
            status = resp_obj.get("status") if isinstance(resp_obj, dict) else resp_obj
            
            if not status:
                status = data.get("status")
            
            # If status is still missing, check if it's just a raw string in some versions
            if not status and isinstance(data, str):
                status = data
                
            return {"connected": status == "CONNECTED", "state": status or "unknown"}
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
    session_name = current_user.get("school_id") or "default"
    
    # 1. Start session
    start_url = f"{WPP_SERVER_URL}/api/{session_name}/start-session"
    try:
        requests.post(start_url, headers=get_headers(), timeout=10)
    except Exception as e:
        print(f"⚠️ Start session failed: {e}")

    # 2. Poll for QR code using status-session
    status_url = f"{WPP_SERVER_URL}/api/{session_name}/status-session"
    max_retries = 30 # Try for ~90 seconds
    
    for i in range(max_retries):
        try:
            response = requests.get(status_url, headers=get_headers(), timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                # Check for QR code in multiple possible locations
                qr_base64 = data.get("qrcode")
                if not qr_base64 and isinstance(data.get("response"), dict):
                    qr_base64 = data.get("response", {}).get("qrcode")
                
                if qr_base64:
                    print(f"✅ QR Code ready on attempt {i+1}!")
                    return {"base64": qr_base64}
                
                state = data.get("status") or (data.get("response", {}).get("status") if isinstance(data.get("response"), dict) else data.get("response"))
                print(f"⏳ Session state: {state} - QR not ready yet (attempt {i+1}/{max_retries})")
            
        except Exception as e:
            print(f"⚠️ Error on attempt {i+1}: {str(e)}")

        await asyncio.sleep(3)

    raise HTTPException(
        status_code=408, 
        detail="QR Code generation timed out. Please refresh and try again."
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
