import mysql.connector
import os
from dotenv import load_dotenv
import re

# Load env from the backend directory
load_dotenv()

def create_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 3306)),
        database=os.getenv('DB_NAME', 'smart_school'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'Irshad12')
    )

def slugify(text):
    return re.sub(r'[\s]+', '_', text.strip()).lower()

def sync():
    faces_dir = "faces"
    static_dir = "static/students"
    os.makedirs(static_dir, exist_ok=True)

    conn = create_connection()
    cursor = conn.cursor()

    print("Cleaning old entries...")
    cursor.execute("DELETE FROM attendance")
    cursor.execute("DELETE FROM students")
    conn.commit()

    files = [f for f in os.listdir(faces_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    print(f"Found {len(files)} face images.")

    for filename in files:
        raw_name = os.path.splitext(filename)[0]
        student_id = raw_name # Use exact filename (minus ext) to match main.py's load_known_faces
        student_name = raw_name.replace('_', ' ').title()

        
        # Copy to static if not already there (simulating backend behavior)
        # In a real app we might move them, but here we just reference them
        photo_url = f"/static/students/{filename}"
        
        # Ensure file exists in static/students for frontend to show it
        # (Though we are just referencing the same file if we want, 
        # but let's assume we copy them for consistency with main.py)
        src = os.path.join(faces_dir, filename)
        dst = os.path.join(static_dir, filename)
        if not os.path.exists(dst):
            import shutil
            shutil.copy(src, dst)

        print(f"Adding student: {student_name} ({student_id})")
        
        query = """
        INSERT INTO students (id, name, class_name, section, email, phone, admission_date, photo_url)
        VALUES (%s, %s, %s, %s, %s, %s, CURDATE(), %s)
        """
        values = (
            student_id,
            student_name,
            "Computer Science",
            "A",
            f"{student_id}@school.edu",
            "9876543210",
            photo_url
        )
        cursor.execute(query, values)

    conn.commit()
    cursor.close()
    conn.close()
    print("Sync complete!")

if __name__ == "__main__":
    sync()
