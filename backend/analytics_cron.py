import os
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'Irshad12'),
        database=os.getenv('DB_NAME', 'smart_school')
    )

def run_predictive_analytics():
    print(f"[{datetime.now()}] Starting Weekly Predictive 'Defaulter & Drop-Out' Analytics Cron...")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. Complex Aggregation Query to find At-Risk Students
        # Combines Attendance < 70%, Active Pending/Delayed Dues, and Exam Averages.
        query = """
            SELECT 
                s.id AS student_id,
                s.name AS student_name,
                COALESCE(s.parent_name, 'Parent') AS parent_name,
                s.school_id,
                att.attendance_pct,
                fee.pending_dues,
                COALESCE(ex.avg_exam_pct, 100) AS avg_exam_pct
            FROM students s
            JOIN (
                SELECT student_id, 
                       (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS attendance_pct
                FROM face_attendance_logs
                WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY student_id
            ) att ON s.id = att.student_id
            JOIN (
                SELECT student_id, COUNT(*) as pending_dues
                FROM fee_payment_history
                WHERE status IN ('pending', 'delayed') AND due_date < CURDATE()
                GROUP BY student_id
            ) fee ON s.id = fee.student_id
            LEFT JOIN (
                SELECT student_id, 
                       (SUM(marks_obtained) / SUM(total_marks)) * 100 AS avg_exam_pct
                FROM exam_marks
                GROUP BY student_id
            ) ex ON s.id = ex.student_id
            WHERE att.attendance_pct < 70 AND fee.pending_dues > 0;
        """
        
        cursor.execute(query)
        at_risk_students = cursor.fetchall()
        
        if not at_risk_students:
            print("No at-risk students found for this week. All good!")
            return
            
        print(f"Found {len(at_risk_students)} at-risk students. Generating alerts...")

        # 2. Process each student and UPSERT into risk_alerts
        upsert_query = """
            INSERT INTO risk_alerts 
                (student_id, risk_tier, calculated_attendance, pending_dues_count, status, pre_rendered_message)
            VALUES 
                (%s, %s, %s, %s, 'open', %s)
            ON DUPLICATE KEY UPDATE 
                risk_tier = VALUES(risk_tier),
                calculated_attendance = VALUES(calculated_attendance),
                pending_dues_count = VALUES(pending_dues_count),
                status = 'open',
                pre_rendered_message = VALUES(pre_rendered_message),
                detected_at = CURRENT_TIMESTAMP;
        """
        
        alerts_data = []
        for student in at_risk_students:
            # Classification Logic
            risk_tier = 'CRITICAL' if student['avg_exam_pct'] < 40 else 'HIGH'
            
            # Message Templating (Hindi localization as requested)
            school_name = "Visio School"  # Could dynamically fetch based on school_id
            formatted_att = round(student['attendance_pct'], 1)
            
            message = (
                f"नमस्ते {student['parent_name']}, {school_name} की ओर से। "
                f"आपके बच्चे {student['student_name']} की उपस्थिति पिछले 30 दिनों में काफी कम "
                f"(केवल {formatted_att}%) रही है और फीस भुगतान भी लंबित है। कृपया प्रशासनिक कार्यालय से संपर्क करें।"
            )
            
            alerts_data.append((
                student['student_id'],
                risk_tier,
                student['attendance_pct'],
                student['pending_dues'],
                message
            ))
            
        # Execute Batch Upsert
        cursor.executemany(upsert_query, alerts_data)
        conn.commit()
        
        print(f"Successfully processed and stored {cursor.rowcount} alerts in risk_alerts.")

    except Exception as e:
        print(f"Error during predictive analytics job: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_predictive_analytics()
