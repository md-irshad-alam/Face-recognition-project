
import database
import auth
from datetime import datetime

email = "hayan0743@gmail.com"
new_password = "Hayan123"

conn = database.create_connection()
cursor = conn.cursor()

# 1. Update password
hashed_password = auth.get_password_hash(new_password)
cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s", (hashed_password, email))

# 2. Reset failed attempts and lock
cursor.execute("UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = %s", (email,))

conn.commit()
print(f"Fixed user {email}. Password set to {new_password} and account unlocked.")
