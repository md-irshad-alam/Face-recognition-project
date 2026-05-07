"""
email_service.py — Sends real emails via SMTP.

Setup (one-time):
  Add these to your .env file:

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_gmail@gmail.com
    SMTP_PASS=your_app_password    ← Gmail App Password (NOT your account password)
    SMTP_FROM=your_gmail@gmail.com
    SMTP_FROM_NAME=Visio School

  For Gmail: https://myaccount.google.com/apppasswords
    → Select App: "Mail" → Device: "Other" → copy the 16-char code into SMTP_PASS
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Visio School")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _send(to_email: str, subject: str, html_body: str) -> bool:
    """Core SMTP sender. Returns True on success, False on failure."""
    if not SMTP_USER or not SMTP_PASS:
        print("[EMAIL] SMTP not configured — add SMTP_USER and SMTP_PASS to .env")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())
        print(f"[EMAIL] ✅ Sent '{subject}' to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("[EMAIL] ❌ Auth failed — check SMTP_USER / SMTP_PASS in .env")
        return False
    except Exception as e:
        print(f"[EMAIL] ❌ Failed to send to {to_email}: {e}")
        return False


def send_verification_email(to_email: str, token: str) -> bool:
    """Sends the account verification / magic-link email."""
    link = f"{FRONTEND_URL}/auth/verify?token={token}"
    subject = "Verify your Visio School account"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;margin:0;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0"
                 style="background:#fff;border-radius:24px;padding:48px;border:1px solid #E2E8F0;">
            <tr><td>
              <h2 style="color:#4F46E5;margin:0 0 8px;font-size:28px;">Visio School</h2>
              <p style="color:#94A3B8;margin:0 0 32px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Institution Management Platform</p>

              <h3 style="color:#0F172A;font-size:20px;font-weight:800;margin:0 0 12px;">Verify your email address</h3>
              <p style="color:#64748B;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Click the button below to verify your email and complete your account setup.
                This link is valid for <strong>10 minutes</strong>.
              </p>

              <a href="{link}"
                 style="display:inline-block;background:#4F46E5;color:#fff;text-decoration:none;
                        padding:16px 40px;border-radius:14px;font-weight:700;font-size:16px;">
                Verify Email Address
              </a>

              <p style="color:#94A3B8;font-size:13px;margin:32px 0 0;">
                Or copy this link:<br/>
                <a href="{link}" style="color:#4F46E5;word-break:break-all;">{link}</a>
              </p>

              <hr style="border:none;border-top:1px solid #F1F5F9;margin:32px 0;"/>
              <p style="color:#CBD5E1;font-size:12px;margin:0;">
                If you didn't create a Visio School account, ignore this email safely.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    return _send(to_email, subject, html)


def send_otp_email(to_email: str, otp: str, full_name: str = "") -> bool:
    """Sends the 2FA / login OTP email."""
    subject = "Your Visio School login code"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;margin:0;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0"
                 style="background:#fff;border-radius:24px;padding:48px;border:1px solid #E2E8F0;">
            <tr><td>
              <h2 style="color:#4F46E5;margin:0 0 8px;font-size:28px;">Visio School</h2>
              <p style="color:#94A3B8;margin:0 0 32px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Login Verification</p>

              <h3 style="color:#0F172A;font-size:20px;font-weight:800;margin:0 0 12px;">
                Your login code{f", {full_name.split()[0]}" if full_name else ""}
              </h3>
              <p style="color:#64748B;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Use the code below to complete your login. It expires in <strong>5 minutes</strong>.
              </p>

              <div style="background:#EEF2FF;border-radius:16px;padding:28px;text-align:center;margin:0 0 24px;">
                <span style="font-size:48px;font-weight:900;color:#4F46E5;letter-spacing:12px;">{otp}</span>
              </div>

              <p style="color:#94A3B8;font-size:13px;margin:0;">
                Never share this code with anyone. Visio School staff will never ask for it.
              </p>

              <hr style="border:none;border-top:1px solid #F1F5F9;margin:32px 0;"/>
              <p style="color:#CBD5E1;font-size:12px;margin:0;">
                If you didn't try to log in, your password may be compromised. Change it immediately.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    return _send(to_email, subject, html)
