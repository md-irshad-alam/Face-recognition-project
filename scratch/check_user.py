
import database
import auth

email = "hayan0743@gmail.com"
conn = database.create_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
user = cursor.fetchone()
print(f"User: {user}")

if user:
    # Check if Hayan123 works
    worked = auth.verify_password("Hayan123", user['password_hash'])
    print(f"Password 'Hayan123' works: {worked}")
    
    # Check if ID works (Staff ID)
    cursor.execute("SELECT id FROM teachers WHERE email = %s", (email,))
    teacher = cursor.fetchone()
    if teacher:
        worked_id = auth.verify_password(teacher['id'], user['password_hash'])
        print(f"Teacher ID '{teacher['id']}' works as password: {worked_id}")
