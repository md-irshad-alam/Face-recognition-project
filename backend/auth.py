"""
auth.py — Authentication & authorisation helpers.

JWT now carries:  sub (email), role, school_id
All DB operations that are school-scoped use school_id extracted from the token.
"""

from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests

import os
import hashlib
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY                  = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY")
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080
REFRESH_TOKEN_EXPIRE_DAYS   = 7

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password helpers ───────────────────────────────────────────────────────────

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Pre-hash with SHA-256 to stay within bcrypt's 72-byte limit."""
    pre_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(pre_hash, hashed_password)


def get_password_hash(password: str) -> str:
    pre_hash = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre_hash)


# ── JWT helpers ────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire    = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Google OAuth ───────────────────────────────────────────────────────────────

async def verify_google_token(token: str):
    try:
        return id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
    except ValueError as e:
        print(f"Google Token Verification Error: {e}")
        return None


# ── User DB operations ─────────────────────────────────────────────────────────
from mysql.connector import Error
import database                   # import here to avoid circular dependency

def create_user(
    email:         str,
    password_hash: Optional[str],
    full_name:     str,
    school_id:     str,
    google_id:     Optional[str] = None,
    role:          str           = "user",
) -> bool:
    conn = database.create_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, password_hash, full_name, google_id, role, school_id) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (email, password_hash, full_name, google_id, role, school_id),
        )
        conn.commit()
        return True
    except Error as e:
        print(f"Error creating user: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


def get_user_by_email(email: str) -> Optional[dict]:
    conn = database.create_connection()
    if not conn:
        return None
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


def get_school_admin(school_id: str) -> Optional[dict]:
    """Return the admin user for a given school, or None."""
    conn = database.create_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM users WHERE school_id = %s AND role = 'admin' LIMIT 1",
            (school_id,),
        )
        return cursor.fetchone()
    except Error as e:
        print(f"Error checking school admin: {e}")
        return None
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


# ── FastAPI dependency injection ───────────────────────────────────────────────
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload   = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email:     str = payload.get("sub")
        role:      str = payload.get("role")
        school_id: str = payload.get("school_id", "")
        if not email or not role:
            raise credentials_exception
        user = get_user_by_email(email)
        if user is None:
            raise credentials_exception
        # Ensure school_id is always present on the user dict
        user.setdefault("school_id", school_id)
        return user
    except JWTError:
        raise credentials_exception


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") not in ("admin", "ORG_ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Admin access required.",
        )
    return current_user


# ── Audit Logging ──────────────────────────────────────────────────────────────

def log_action(user_id: Optional[int], action: str, details: str, school_id: str, ip_address: Optional[str] = None):
    conn = database.create_connection()
    if not conn:
        return
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details, school_id, ip_address) "
            "VALUES (%s, %s, %s, %s, %s)",
            (user_id, action, details, school_id, ip_address),
        )
        conn.commit()
    except Exception as e:
        print(f"Audit log error: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


# ── 2FA Helpers ────────────────────────────────────────────────────────────────
import pyotp

def generate_totp_secret():
    return pyotp.random_base32()

def verify_totp(secret: str, token: str):
    totp = pyotp.TOTP(secret)
    return totp.verify(token)

import random
import string

def generate_email_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


# ── Refresh Token ──────────────────────────────────────────────────────────────

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Account Security ───────────────────────────────────────────────────────────

def increment_failed_login(email: str):
    conn = database.create_connection()
    if not conn: return
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT failed_login_attempts FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if user:
            attempts = user['failed_login_attempts'] + 1
            locked_until = None
            if attempts >= 5:
                locked_until = datetime.utcnow() + timedelta(minutes=15)
            
            cursor.execute(
                "UPDATE users SET failed_login_attempts = %s, locked_until = %s WHERE email = %s",
                (attempts, locked_until, email)
            )
            conn.commit()
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def reset_failed_login(email: str):
    conn = database.create_connection()
    if not conn: return
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = %s",
            (email,)
        )
        conn.commit()
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
