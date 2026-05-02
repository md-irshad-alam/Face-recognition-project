import requests
import json
import time
import base64
import os

# Configuration
API_URL = "http://127.0.0.1:8085"
API_KEY = "admin123"
INSTANCE_NAME = "smart_school"

def setup():
    print(f"🚀 Initializing WhatsApp Gateway...")
    headers = {
        "Content-Type": "application/json",
        "apikey": API_KEY
    }

    # 1. Reset/Delete old session for a fresh start
    try:
        requests.delete(f"{API_URL}/instance/logout/{INSTANCE_NAME}", headers=headers)
        requests.delete(f"{API_URL}/instance/delete/{INSTANCE_NAME}", headers=headers)
        time.sleep(1)
    except:
        pass

    # 2. Create Instance
    payload = {
        "instanceName": INSTANCE_NAME,
        "token": API_KEY,
        "qrcode": True,
        "integration": "WHATSAPP-BAILEYS"
    }
    
    try:
        requests.post(f"{API_URL}/instance/create", json=payload, headers=headers)
        print("✅ Instance ready. Generating QR Code...")
        time.sleep(2)
    except Exception as e:
        print(f"⚠️ Warning during creation: {e}")

    # 3. Fetch QR Code with retries
    for i in range(10):
        print(f"🔗 Attempt {i+1}/10: Fetching QR Code...")
        try:
            response = requests.get(f"{API_URL}/instance/connect/{INSTANCE_NAME}", headers=headers)
            data = response.json()

            if data.get("base64"):
                qr_data = data["base64"].split(",")[1]
                with open("qr_code.png", "wb") as f:
                    f.write(base64.b64decode(qr_data))
                
                print("\n" + "="*50)
                print("📸 QR CODE GENERATED!")
                print("="*50)
                print(f"Saved as: qr_code.png")
                print(f"\n👉 Transfer 'qr_code.png' to your computer to scan it,")
                print(f"   or view it via your web browser if the static path is configured.")
                print("="*50)
                
                # Only try to open automatically if on Mac with a display
                if os.name == 'posix' and os.uname().sysname == 'Darwin':
                    try:
                        os.system("open qr_code.png")
                    except:
                        pass
                return
            else:
                print("⏳ Not ready yet, waiting 5 seconds...")
                time.sleep(5)
        except Exception as e:
            print(f"⚠️ Attempt failed: {e}")
            time.sleep(5)
    
    print("❌ Failed to get QR code after 10 attempts. Please try running again in a minute.")

if __name__ == "__main__":
    setup()
