import mysql.connector
import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(password_hash)

def fix_user():
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='Irshad12',
            database='smart_school'
        )
        cursor = conn.cursor()
        
        email = "jonh@gmail.com"
        password = "123456"
        hashed = get_password_hash(password)
        
        print(f"Updating password for {email}...")
        cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s", (hashed, email))
        conn.commit()
        print("Updated successfully.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    fix_user()
