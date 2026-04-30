import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import auth

load_dotenv()

def create_connection():
    """Create a database connection to the MySQL database."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            database=os.getenv('DB_NAME', 'face_db'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '') 
        )
    except Error as e:
        print(f"The error '{e}' occurred")

    return connection

def init_db():
    """Initialize the database with schema.sql."""
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
        
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
            
        statements = schema_sql.split(';')
        for statement in statements:
            if statement.strip():
                cursor.execute(statement)
        
        conn.commit()
        print(f"Database {db_name} initialized successfully.")
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

def update_last_reminder_sent(student_id):
    conn = create_connection()
    if not conn: return
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE students SET last_reminder_sent = CURRENT_TIMESTAMP WHERE id = %s", (student_id,))
        conn.commit()
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def delete_student(student_id):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM attendance WHERE student_id = %s", (student_id,))
        cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error deleting student: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_student(student_id, data):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        query = """
            UPDATE students 
            SET name=%s, class_name=%s, section=%s, email=%s, phone=%s, parent_phone=%s, dob=%s, is_on_hold=%s 
            WHERE id=%s
        """
        values = (
            data.get('name'), data.get('class_name'), data.get('section'), 
            data.get('email'), data.get('phone'), data.get('parent_phone'), 
            data.get('dob'), data.get('is_on_hold', False), student_id
        )
        cursor.execute(query, values)
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error updating student: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def create_student(data):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO students (id, name, class_name, section, email, phone, parent_phone, dob, admission_date, photo_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('id'), data.get('name'), data.get('class_name'), 
            data.get('section'), data.get('email'), data.get('phone'), 
            data.get('parent_phone'), data.get('dob'), data.get('admission_date'), 
            data.get('photo_url')
        )
        cursor.execute(query, values)
        conn.commit()
        return True
    except Error as e:
        print(f"Error creating student: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def mark_attendance(student_id):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO attendance (student_id, date, check_in_time, status)
            VALUES (%s, CURDATE(), CURTIME(), 'Present')
        """, (student_id,))
        conn.commit()
        return True
            
    except Error as e:
        print(f"Error marking attendance: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def check_attendance_status(student_id):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendance WHERE student_id = %s AND date = CURDATE()", (student_id,))
        existing = cursor.fetchone()
        return existing is not None
    except Error as e:
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
    if not conn: return {"total": 0, "present": 0, "absent": 0, "teachers": 0, "exams": 0}
    try:
        cursor = conn.cursor()
        
        # Student Stats
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE date = CURDATE() AND status = 'Present'")
        present_today = cursor.fetchone()[0]
        absent_today = total_students - present_today
        
        # Teacher Stats
        cursor.execute("SELECT COUNT(*) FROM teachers")
        teachers_count = cursor.fetchone()[0]
        
        # Exam Stats
        cursor.execute("SELECT COUNT(*) FROM exams")
        exams_count = cursor.fetchone()[0]
        
        return {
            "total": total_students, 
            "present": present_today, 
            "absent": absent_today,
            "teachers": teachers_count,
            "exams": exams_count
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"total": 0, "present": 0, "absent": 0, "teachers": 0, "exams": 0}
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_todays_attendance(class_name=None):
    conn = create_connection()
    if not conn: return []
    try:
        cursor = conn.cursor(dictionary=True)
        # Filter by today's date to show daily attendance
        query = """
            SELECT s.id as student_id, s.name, s.class_name as program, s.section, s.photo_url, a.check_in_time, a.status, a.date
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            WHERE a.date = CURDATE()
        """
        params = []
        if class_name:
            if class_name == "__NONE__":
                return []
            if "," in class_name:
                classes = [c.strip() for c in class_name.split(",")]
                placeholders = ",".join(["%s"] * len(classes))
                query += f" AND s.class_name IN ({placeholders})"
                params.extend(classes)
            else:
                query += " AND s.class_name = %s"
                params.append(class_name)
            
        query += " ORDER BY a.date DESC, a.check_in_time DESC"
        
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        for row in rows:
            # Format time for display
            if row['check_in_time']:
                check_in = row['check_in_time']
                if hasattr(check_in, 'total_seconds'):
                    total_seconds = check_in.total_seconds()
                    hours = int(total_seconds // 3600); minutes = int((total_seconds % 3600) // 60); seconds = int(total_seconds % 60)
                    row['check_in_time'] = f"{hours:02}:{minutes:02}:{seconds:02}"
                else:
                    row['check_in_time'] = str(check_in)
            
            # Add date to the display if it's not today
            if row['date']:
                date_str = row['date'].strftime('%Y-%m-%d')
                row['check_in_time'] = f"{date_str} {row['check_in_time']}"
                
            row['remarks'] = 'Present'
        return rows
    except Exception as e:
        print(f"Error fetching attendance: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# --- Teacher CRUD Operations ---

def _normalize_teacher(row: dict):
    """Normalize MySQL teacher row for Pydantic/UI compatibility."""
    if not row: return None
    row['is_phd'] = bool(row.get('is_phd', 0))
    raw_classes = row.get('assigned_classes') or ''
    if isinstance(raw_classes, str):
        row['assigned_classes'] = [c.strip() for c in raw_classes.split(',') if c.strip()]
    elif not isinstance(raw_classes, list):
         row['assigned_classes'] = []
    return row

def get_all_teachers():
    conn = create_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True)
    # Avoid duplicate column names by prioritizing COALESCE results
    query = """
        SELECT
            t.id, t.first_name, t.last_name, t.phone, t.email, t.highest_education,
            t.years_of_experience, t.specialization, t.photo_url, t.created_at,
            t.bio, t.office_days, t.office_time, t.assigned_classes, t.notifications,
            COALESCE(u.role, 'teacher') AS role,
            COALESCE(t.department, t.specialization) AS department,
            COALESCE(t.status, 'active') AS status,
            COALESCE(t.is_phd, FALSE) AS is_phd
        FROM teachers t
        LEFT JOIN users u ON t.email = u.email
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [_normalize_teacher(r) for r in rows]

def get_teacher_by_id(teacher_id):
    conn = create_connection()
    if not conn: return None
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT
            t.id, t.first_name, t.last_name, t.phone, t.email, t.highest_education,
            t.years_of_experience, t.specialization, t.photo_url, t.created_at,
            t.bio, t.office_days, t.office_time, t.assigned_classes, t.notifications,
            COALESCE(u.role, 'teacher') AS role,
            COALESCE(t.department, t.specialization) AS department,
            COALESCE(t.status, 'active') AS status,
            COALESCE(t.is_phd, FALSE) AS is_phd
        FROM teachers t
        LEFT JOIN users u ON t.email = u.email
        WHERE t.id = %s
    """
    cursor.execute(query, (teacher_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return _normalize_teacher(row)

def create_teacher(teacher_data: dict):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        query = """
        INSERT INTO teachers (
            id, first_name, last_name, phone, email, highest_education, 
            years_of_experience, specialization, photo_url, department, bio, 
            office_days, office_time, assigned_classes, notifications, status, is_phd, password
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            teacher_data.get('id'), teacher_data.get('first_name'), teacher_data.get('last_name'), 
            teacher_data.get('phone'), teacher_data.get('email'), teacher_data.get('highest_education'), 
            teacher_data.get('years_of_experience'), teacher_data.get('specialization'), teacher_data.get('photo_url'),
            teacher_data.get('department'), teacher_data.get('bio'), 
            teacher_data.get('office_days'), teacher_data.get('office_time'), 
            teacher_data.get('assigned_classes'), teacher_data.get('notifications'),
            teacher_data.get('status', 'active'), teacher_data.get('is_phd', False),
            teacher_data.get('password')
        )
        cursor.execute(query, values)
        
        # Also sync to users table for login
        if teacher_data.get('email') and teacher_data.get('password'):
            hashed_password = auth.get_password_hash(teacher_data.get('password'))
            cursor.execute("SELECT id FROM users WHERE email = %s", (teacher_data.get('email'),))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO users (email, password_hash, full_name, role)
                    VALUES (%s, %s, %s, 'teacher')
                """, (teacher_data.get('email'), hashed_password, f"{teacher_data.get('first_name')} {teacher_data.get('last_name')}"))
            else:
                # Update password if user already exists
                cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s", (hashed_password, teacher_data.get('email')))
        
        conn.commit()
        return True
    except Error as e:
        print(f"Error creating teacher: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_teacher_role(teacher_email: str, new_role: str):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = %s WHERE email = %s", (new_role, teacher_email))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_teacher(teacher_id: str, data: dict):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        fields = []
        values = []
        allowed = ['first_name', 'last_name', 'email', 'phone', 'specialization', 'department', 
                   'highest_education', 'years_of_experience', 'status', 'photo_url', 'assigned_classes', 'password']
        for col in allowed:
            if col in data and data[col] is not None:
                val = ','.join(data[col]) if col == 'assigned_classes' and isinstance(data[col], list) else data[col]
                fields.append(f"{col} = %s")
                values.append(val)
        if not fields: return True
        values.append(teacher_id)
        cursor.execute(f"UPDATE teachers SET {', '.join(fields)} WHERE id = %s", values)
        conn.commit()
        return True
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def delete_teacher(teacher_id):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM teachers WHERE id = %s", (teacher_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_device_status(device_id, name=None, device_type=None, battery=None, ip=None):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        query = """
        INSERT INTO devices (device_id, device_name, device_type, battery_level, ip_address, status, last_seen)
        VALUES (%s, %s, %s, %s, %s, 'active', CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE 
            device_name = COALESCE(%s, device_name),
            device_type = COALESCE(%s, device_type),
            battery_level = COALESCE(%s, battery_level),
            ip_address = COALESCE(%s, ip_address),
            status = 'active',
            last_seen = CURRENT_TIMESTAMP
        """
        cursor.execute(query, (device_id, name, device_type, battery, ip, name, device_type, battery, ip))
        conn.commit()
        return True
    except Error as e:
        print(f"Error updating device: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_active_devices():
    conn = create_connection()
    if not conn: return []
    try:
        cursor = conn.cursor(dictionary=True)
        # Consider devices active if seen in the last 10 minutes
        query = "SELECT *, CASE WHEN last_seen > NOW() - INTERVAL 10 MINUTE THEN 'active' ELSE 'offline' END as computed_status FROM devices"
        cursor.execute(query)
        rows = cursor.fetchall()
        for row in rows:
            if row['last_seen']:
                row['last_sync'] = row['last_seen'].strftime('%Y-%m-%d %H:%M:%S')
            row['status'] = row['computed_status']
        return rows
    except Error as e:
        print(f"Error fetching devices: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_distinct_classes():
    conn = create_connection()
    if not conn: return []
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL AND class_name != ''")
        rows = cursor.fetchall()
        return [r[0] for r in rows]
    except Exception as e:
        print(f"Error fetching classes: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_teacher_leaves(teacher_id):
    conn = create_connection()
    if not conn: return {"balance": None, "requests": []}
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Get Balance (Initialize if missing)
        cursor.execute("SELECT * FROM leave_balances WHERE teacher_id = %s", (teacher_id,))
        balance = cursor.fetchone()
        
        if not balance:
            cursor.execute("""
                INSERT INTO leave_balances (teacher_id, sick_leave, casual_leave, earned_leave, academic_year)
                VALUES (%s, 15, 10, 30, '2023-24')
            """, (teacher_id,))
            conn.commit()
            cursor.execute("SELECT * FROM leave_balances WHERE teacher_id = %s", (teacher_id,))
            balance = cursor.fetchone()
            
        # 2. Get Requests
        cursor.execute("SELECT * FROM leave_requests WHERE teacher_id = %s ORDER BY applied_at DESC", (teacher_id,))
        requests = cursor.fetchall()
        
        # Format dates for JSON
        for r in requests:
            # Check if applied_at is a string already (if it was from a previous logic)
            if hasattr(r['applied_at'], 'strftime'):
                r['applied_at'] = r['applied_at'].strftime('%Y-%m-%d %H:%M:%S')
            if hasattr(r['start_date'], 'strftime'):
                r['start_date'] = r['start_date'].strftime('%Y-%m-%d')
            if r['end_date'] and hasattr(r['end_date'], 'strftime'):
                r['end_date'] = r['end_date'].strftime('%Y-%m-%d')
            if r['approved_at'] and hasattr(r['approved_at'], 'strftime'):
                r['approved_at'] = r['approved_at'].strftime('%Y-%m-%d')
                
        return {"balance": balance, "requests": requests}
    except Exception as e:
        print(f"Error fetching leave data: {e}")
        return {"balance": None, "requests": []}
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def create_leave_request(teacher_id, data):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        
        # 1. Calculate Days
        from datetime import datetime
        start = datetime.strptime(data.get('start_date'), '%Y-%m-%d')
        days = 1
        if data.get('end_date'):
            end = datetime.strptime(data.get('end_date'), '%Y-%m-%d')
            days = (end - start).days + 1
            if days < 1: days = 1
            
        # 2. Update Balance
        leave_type = data.get('leave_type') # 'sick', 'casual', 'earned'
        column = f"{leave_type}_leave"
        
        # Check if enough balance
        cursor.execute(f"SELECT {column} FROM leave_balances WHERE teacher_id = %s", (teacher_id,))
        row = cursor.fetchone()
        if not row or row[0] < days:
            # Optionally block if not enough balance, but usually allowed to go negative or handled by HR
            pass
            
        cursor.execute(f"UPDATE leave_balances SET {column} = {column} - %s WHERE teacher_id = %s", (days, teacher_id))
        
        # 3. Insert Request
        query = """
            INSERT INTO leave_requests (teacher_id, leave_type, start_date, end_date, reason, status)
            VALUES (%s, %s, %s, %s, %s, 'PENDING')
        """
        values = (teacher_id, leave_type, data.get('start_date'), data.get('end_date'), data.get('reason'))
        cursor.execute(query, values)
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating leave request: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_leave_balance(teacher_id, sick, casual, earned):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        # Check if exists
        cursor.execute("SELECT id FROM leave_balances WHERE teacher_id = %s", (teacher_id,))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE leave_balances 
                SET sick_leave = %s, casual_leave = %s, earned_leave = %s
                WHERE teacher_id = %s
            """, (sick, casual, earned, teacher_id))
        else:
            cursor.execute("""
                INSERT INTO leave_balances (teacher_id, sick_leave, casual_leave, earned_leave, academic_year)
                VALUES (%s, %s, %s, %s, '2023-24')
            """, (teacher_id, sick, casual, earned))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating leave balance: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def create_payment_link(student_id, amount, fee_type, gateway_id, link_url):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO payment_links (student_id, amount, fee_type, gateway_link_id, link_url, status)
            VALUES (%s, %s, %s, %s, %s, 'PENDING')
        """
        cursor.execute(query, (student_id, amount, fee_type, gateway_id, link_url))
        conn.commit()
        return True
    except Error as e:
        print(f"Error creating payment link record: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_payment_status(gateway_link_id, status, payment_id=None):
    conn = create_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        query = """
            UPDATE payment_links 
            SET status = %s, payment_id = %s 
            WHERE gateway_link_id = %s
        """
        cursor.execute(query, (status, payment_id, gateway_link_id))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error updating payment status: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_all_students_for_fees():
    from datetime import datetime
    conn = create_connection()
    if not conn: return []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, status, total_monthly_fee, student_type, last_payment_date, opening_balance FROM students")
        students = cursor.fetchall()
        
        today = datetime.now()
        results = []
        for s in students:
            lpd = s['last_payment_date']
            monthly_fee = float(s['total_monthly_fee'] or 0)
            opening_bal = float(s['opening_balance'] or 0)
            
            # Calculate months overdue (Arrears)
            if lpd:
                # Difference in months between today and last paid date
                # e.g. lpd is Sep, today is Oct -> 1 month arrears (Oct)
                months_overdue = (today.year - lpd.year) * 12 + today.month - lpd.month
                arrears = max(0, months_overdue) * monthly_fee
            else:
                arrears = monthly_fee # Assume at least current month is due
                months_overdue = 1
            
            total_due = arrears + opening_bal
            
            # Auto-calculate status
            status = 'Paid' if total_due <= 0 else ('Overdue' if arrears > monthly_fee else 'Unpaid')

            results.append({
                "id": s['id'],
                "name": s['name'],
                "type": s['student_type'] or 'Regular',
                "last_paid": lpd.strftime('%b %Y') if lpd else 'N/A',
                "monthly_fee": monthly_fee,
                "arrears": arrears,
                "opening_balance": opening_bal,
                "total_due": total_due,
                "status": status,
                "months_pending": max(0, months_overdue)
            })
        return results
    except Exception as e:
        print(f"Error in get_all_students_for_fees: {e}")
        return []
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
