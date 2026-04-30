from fastapi import APIRouter, HTTPException, Depends
import requests
import os
from dotenv import load_dotenv
import auth

load_dotenv()

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "http://127.0.0.1:8085")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "admin123")
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE", "smart_school")

def get_headers():
    return {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
    }

@router.get("/status")
async def get_whatsapp_status(current_user: dict = Depends(auth.require_admin)):
    """Check if WhatsApp instance is connected."""
    url = f"{EVOLUTION_API_URL}/instance/connectionState/{EVOLUTION_INSTANCE}"
    try:
        response = requests.get(url, headers=get_headers(), timeout=5)
        if response.status_code == 200:
            data = response.json()
            # In Evolution API v2, the state is under instance.state
            state = data.get("instance", {}).get("state") or data.get("state")
            return {"connected": state == "open", "state": state}
        elif response.status_code == 404:
            return {"connected": False, "state": "not_found", "message": "Instance does not exist"}
        else:
            return {"connected": False, "state": "error", "message": f"API returned {response.status_code}"}
    except Exception as e:
        return {"connected": False, "state": "offline", "message": str(e)}

@router.get("/qr")
async def get_whatsapp_qr(current_user: dict = Depends(auth.require_admin)):
    """Fetch a fresh QR code from Evolution API."""
    # 1. Try to create instance first (in case it doesn't exist)
    create_url = f"{EVOLUTION_API_URL}/instance/create"
    payload = {
        "instanceName": EVOLUTION_INSTANCE,
        "token": EVOLUTION_API_KEY,
        "qrcode": True,
        "integration": "WHATSAPP-BAILEYS"
    }
    
    try:
        requests.post(create_url, json=payload, headers=get_headers(), timeout=5)
    except:
        pass # Ignore if already exists

    # 2. Fetch QR
    connect_url = f"{EVOLUTION_API_URL}/instance/connect/{EVOLUTION_INSTANCE}"
    try:
        response = requests.get(connect_url, headers=get_headers(), timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch QR code")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evolution API Error: {str(e)}")

@router.post("/logout")
async def logout_whatsapp(current_user: dict = Depends(auth.require_admin)):
    """Logout the WhatsApp instance."""
    url = f"{EVOLUTION_API_URL}/instance/logout/{EVOLUTION_INSTANCE}"
    try:
        response = requests.delete(url, headers=get_headers(), timeout=5)
        return {"status": "success", "message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
