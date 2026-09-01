from fastapi import APIRouter, HTTPException, Depends
import requests
import os
import asyncio
from dotenv import load_dotenv
import auth

load_dotenv()
router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3001")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "visio_waha_secure_key_123")

def get_headers():
    return {"X-Api-Key": WAHA_API_KEY}

def get_session_name(current_user: dict):
    return current_user.get("school_id") or "default"

@router.get("/status")
async def get_whatsapp_status(current_user: dict = Depends(auth.require_admin)):
    """Check if WhatsApp instance is connected via WAHA."""
    url = f"{WAHA_BASE_URL}/api/sessions"
    try:
        response = requests.get(url, headers=get_headers(), timeout=5)
        if response.status_code == 200:
            sessions = response.json()
            session_name = get_session_name(current_user)
            # fallback to "default" if school_id isn't in sessions but default is
            session_data = next((s for s in sessions if s.get("name") == session_name), None)
            
            if not session_data:
                session_data = next((s for s in sessions if s.get("name") == "default"), None)
                
            if session_data:
                waha_status = session_data.get("status", "STOPPED")
                
                # Map WAHA status to WPPConnect status for frontend compatibility
                mapped_state = "offline"
                if waha_status == "WORKING":
                    mapped_state = "CONNECTED"
                elif waha_status == "SCAN_QR_CODE":
                    mapped_state = "QRCODE"
                elif waha_status == "STARTING":
                    mapped_state = "INITIALIZING"
                else:
                    mapped_state = waha_status
                    
                return {"connected": mapped_state == "CONNECTED", "state": mapped_state}
            
        return {"connected": False, "state": "STOPPED"}
    except Exception as e:
        return {"connected": False, "state": "offline", "message": str(e)}

@router.get("/qr")
async def get_whatsapp_qr(current_user: dict = Depends(auth.require_admin)):
    """Fetch QR code from WAHA."""
    # 1. Start the session
    start_url = f"{WAHA_BASE_URL}/api/sessions/start"
    try:
        requests.post(start_url, json={"name": "default"}, headers=get_headers(), timeout=5)
    except:
        pass

    # 2. Get the QR code
    # Note: Using 'default' session for WAHA to keep things simple and unified
    qr_url = f"{WAHA_BASE_URL}/api/default/auth/qr"
    max_retries = 60 # 120 seconds (first boot takes a while to download chromium)
    for i in range(max_retries):
        try:
            response = requests.get(qr_url, headers=get_headers(), timeout=5)
            if response.status_code == 200:
                # If WAHA returns an image binary directly
                if "image" in response.headers.get("Content-Type", ""):
                    import base64
                    b64 = base64.b64encode(response.content).decode('utf-8')
                    return {"base64": f"data:image/png;base64,{b64}"}
                
                # If WAHA returns JSON
                try:
                    data = response.json()
                    qr_base64 = data.get("qr") or data.get("qrcode") or data.get("data")
                    if qr_base64:
                        if not qr_base64.startswith("data:"):
                            qr_base64 = f"data:image/png;base64,{qr_base64}"
                        return {"base64": qr_base64}
                except:
                    pass
        except:
            pass
        await asyncio.sleep(2)
        
    raise HTTPException(status_code=408, detail="QR Code generation timed out.")

@router.post("/logout")
async def logout_whatsapp(current_user: dict = Depends(auth.require_admin)):
    url = f"{WAHA_BASE_URL}/api/sessions/logout"
    try:
        requests.post(url, json={"name": "default"}, headers=get_headers(), timeout=5)
        return {"status": "success", "message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
