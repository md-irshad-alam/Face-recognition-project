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
        # Step 0: Identify schools that are OPEN today (not a holiday or week-off)
        cursor.execute("SELECT DISTINCT school_id FROM students")
        all_schools = [row['school_id'] for row in cursor.fetchall()]
        
        today = datetime.now().date()
        day_name = today.strftime("%A")
        
        open_schools = []
        for sid in all_schools:
            is_off = False
            
            # Check week off
            cursor.execute("SELECT week_off_days FROM school_settings WHERE school_id = %s", (sid,))
            settings = cursor.fetchone()
            if settings and 'week_off_days' in settings and settings['week_off_days']:
                try:
                    week_offs = json.loads(settings['week_off_days'])
                except json.JSONDecodeError:
                    week_offs = ["Sunday"]
                if day_name in week_offs:
                    is_off = True
            
            # Check holiday
            if not is_off:
                cursor.execute("""
                    SELECT id FROM school_holidays 
                    WHERE school_id = %s AND %s >= start_date AND %s <= end_date
                """, (sid, today, today))
                if cursor.fetchone():
                    is_off = True
                    
            if not is_off:
                open_schools.append(sid)
        
        if not open_schools:
            print(f"All schools are off today ({day_name} / Holiday). Skipping attendance sweep.")
            return

        # Format open_schools for SQL IN clause
        format_strings = ','.join(['%s'] * len(open_schools))
        
        # Step 1: Identify students who have NO attendance record for today in OPEN schools
        query = f"""
            SELECT s.id as student_id, s.school_id
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = CURDATE()
            WHERE a.id IS NULL AND s.is_on_hold = FALSE AND s.school_id IN ({format_strings})
        """
        cursor.execute(query, tuple(open_schools))
        missing_students = cursor.fetchall()

        if not missing_students:
            print("All active students in open schools have an attendance record today.")
            return

        print(f"Found {len(missing_students)} students missing attendance today in open schools. Marking 'Absent'...")

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
