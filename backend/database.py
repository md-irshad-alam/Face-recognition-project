import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    """Create a database connection to the MySQL database."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            database=os.getenv('DB_NAME', 'smart-school'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '') 
        )
    except Error as e:
        print(f"The error '{e}' occurred")

    return connection

def init_db():
    """Initialize the database with schema.sql."""
    # First connect without database to create it if needed
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
        )
        cursor = conn.cursor()
        
        db_name = os.getenv('DB_NAME', 'face_db')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")
        
        # Read schema.sql
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
            
        # Execute statements
        # This is a simple parser, might need more robustness for complex SQL
        statements = schema_sql.split(';')
        for statement in statements:
            if statement.strip():
                cursor.execute(statement)
        
        conn.commit()
        print("Database initialized successfully.")
        cursor.close()
        conn.close()
    except Error as e:
        print(f"Error initializing DB: {e}")


# --- CRUD Operations ---

def get_all_students():
    conn = create_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def get_student_by_id(student_id):
    conn = create_connection()
    if not conn: return None
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students WHERE id = %s", (student_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row

def mark_attendance(student_id):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        # Check if already marked for today
        cursor.execute("SELECT * FROM attendance WHERE student_id = %s AND date = CURDATE()", (student_id,))
        existing = cursor.fetchone()
        
        if not existing:
            cursor.execute("""
                INSERT INTO attendance (student_id, date, check_in_time, status)
                VALUES (%s, CURDATE(), CURTIME(), 'Present')
            """, (student_id,))
            conn.commit()
            print(f"Attendance marked for {student_id}")
            return True
            return True
        else:
            print(f"Attendance already marked for {student_id}")
            return False
            
    except Error as e:
        print(f"Error marking attendance: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def check_attendance_status(student_id):
    """Check if attendance is already marked for today."""
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendance WHERE student_id = %s AND date = CURDATE()", (student_id,))
        existing = cursor.fetchone()
        return existing is not None
    except Error as e:
        print(f"Error checking attendance: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_attendance_history(student_id):
    conn = create_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM attendance WHERE student_id = %s ORDER BY date DESC", (student_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def get_dashboard_stats():
    conn = create_connection()
    if not conn: return {"total": 0, "present": 0, "absent": 0}
    
    try:
        cursor = conn.cursor()
        
        # Total Students
        cursor.execute("SELECT COUNT(*) FROM students")
        result_total = cursor.fetchone()
        total_students = result_total[0] if result_total else 0
        
        # Present Today
        cursor.execute("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE date = CURDATE() AND status = 'Present'")
        result_present = cursor.fetchone()
        present_today = result_present[0] if result_present else 0
        
        # Absent (Total - Present)
        absent_today = total_students - present_today
        
        return {
            "total": total_students,
            "present": present_today,
            "absent": absent_today
        }
    except Error as e:
        print(f"Error getting stats: {e}")
        return {"total": 0, "present": 0, "absent": 0}
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_todays_attendance():
    """Get all attendance records for today with student details."""
    conn = create_connection()
    if not conn: return []
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                s.id as student_id,
                s.name,
                s.class_name as program,
                s.section,
                s.photo_url,
                a.check_in_time,
                a.status
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.date = CURDATE()
            ORDER BY a.check_in_time DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Add remarks logic
        for row in rows:
            # Simple logic: Late if after 10:00:00
            # check_in_time is a timedelta or time object depending on connector
            # Converting to string for simpler frontend handling if needed, 
            # but let's assume we send HH:MM:SS string or similar.
            # MySQL connector usually returns timedelta for TIME columns.
            
            check_in = row['check_in_time']
            # Convert timedelta to string for JSON serialization
            total_seconds = check_in.total_seconds()
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)
            seconds = int(total_seconds % 60)
            time_str = f"{hours:02}:{minutes:02}:{seconds:02}"
            row['check_in_time'] = time_str
            
            # Late logic: 10:00 AM = 36000 seconds
            if total_seconds > 36000: # 10*60*60
                row['remarks'] = 'Late'
            else:
                row['remarks'] = 'On Time'
                
        return rows
    except Error as e:
        print(f"Error getting todays attendance: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

