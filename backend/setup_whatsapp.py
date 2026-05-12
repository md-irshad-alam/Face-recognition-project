import requests
import json
import time
import base64
import os

# Configuration
WPP_SERVER_URL = os.getenv("WPP_SERVER_URL", "http://127.0.0.1:21465")
WPP_SECRET_KEY = os.getenv("WPP_SECRET_KEY", "THISISMYSECURETOKEN")
WPP_SESSION_NAME = os.getenv("WPP_SESSION_NAME", "smart_school")

def setup():
    print(f"🚀 Initializing WPPConnect WhatsApp Gateway...")
    headers = {
        "Authorization": f"Bearer {WPP_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    # 1. Reset/Logout session for a fresh start
    try:
        requests.post(f"{WPP_SERVER_URL}/api/{WPP_SESSION_NAME}/logout-session", headers=headers)
        time.sleep(1)
    except:
        pass

    # 2. Start Session
    try:
        requests.post(f"{WPP_SERVER_URL}/api/{WPP_SESSION_NAME}/start-session", headers=headers)
        print("✅ Session initialization started. Fetching QR Code...")
        time.sleep(2)
    except Exception as e:
        print(f"⚠️ Warning during session start: {e}")

    # 3. Fetch QR Code with retries
    for i in range(10):
        print(f"🔗 Attempt {i+1}/10: Fetching QR Code...")
        try:
            response = requests.get(f"{WPP_SERVER_URL}/api/{WPP_SESSION_NAME}/qrcode-session", headers=headers)
            data = response.json()

            # WPPConnect returns 'qrcode' field with base64
            qr_base64 = data.get("qrcode")
            if qr_base64:
                if "," in qr_base64:
                    qr_data = qr_base64.split(",")[1]
                else:
                    qr_data = qr_base64
                
                with open("qr_code.png", "wb") as f:
                    f.write(base64.b64decode(qr_data))
                
                print("\n" + "="*50)
                print("📸 QR CODE GENERATED!")
                print("="*50)
                print(f"Saved as: qr_code.png")
                print(f"\n👉 Scan the 'qr_code.png' to link your account.")
                print("="*50)
                
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
