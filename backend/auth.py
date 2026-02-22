from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests

# Config
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
import hashlib

def verify_password(plain_password, hashed_password):
    # Pre-hash to avoid bcrypt 72 byte limit
    # SHA256 hexdigest is 64 bytes, which fits in bcrypt
    password_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(password_hash, hashed_password)

def get_password_hash(password):
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(password_hash)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_google_token(token: str):
    try:
        # Real verification
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID) 
        
        return id_info
    except ValueError as e:
        # Invalid token
        print(f"Google Token Verification Error: {e}")
        return None

# --- User Database Operations ---
from mysql.connector import Error
import database # Import database module to access create_connection

def create_user(email, password_hash, full_name, google_id=None):
    conn = database.create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password_hash, full_name, google_id) VALUES (%s, %s, %s, %s)", 
                       (email, password_hash, full_name, google_id))
        conn.commit()
        return True
    except Error as e:
        print(f"Error creating user: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_user_by_email(email):
    conn = database.create_connection()
    if not conn: return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        return cursor.fetchone()
    except Error as e:
        print(f"Error getting user: {e}")
        return None
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
