import os
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'Irshad12'),
        database=os.getenv('DB_NAME', 'smart_school')
    )

def run_daily_attendance_sweep():
    """
    Runs every day after school hours. 
    Finds all students who did not mark attendance today and automatically marks them 'Absent'.
    """
    print(f"[{datetime.now()}] Starting Daily Attendance Auto-Absent Sweep...")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Step 1: Identify students who have NO attendance record for today
        # We group this by school to respect multi-tenant settings
        query = """
            SELECT s.id as student_id, s.school_id
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = CURDATE()
            WHERE a.id IS NULL AND s.is_on_hold = FALSE
        """
        cursor.execute(query)
        missing_students = cursor.fetchall()

        if not missing_students:
            print("All active students have an attendance record today.")
            return

        print(f"Found {len(missing_students)} students missing attendance today. Marking 'Absent'...")

        # Step 2: Batch insert 'Absent' records for these students
        insert_query = """
            INSERT INTO attendance (student_id, date, check_in_time, status, school_id)
            VALUES (%s, CURDATE(), NULL, 'Absent', %s)
        """
        
        insert_data = [(st['student_id'], st['school_id']) for st in missing_students]
        
        cursor.executemany(insert_query, insert_data)
        conn.commit()

        print(f"Successfully marked {cursor.rowcount} students as Absent for today.")

    except Exception as e:
        print(f"Error during daily attendance sweep: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_daily_attendance_sweep()
