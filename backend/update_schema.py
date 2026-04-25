import mysql.connector
import os

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='smart_school',
            user='root',
            password='Irshad12' 
        )
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def apply_schema_update():
    conn = create_connection()
    if not conn:
        return

    cursor = conn.cursor()
    
    # Check if columns exist
    try:
        cursor.execute("DESCRIBE students")
        columns = [row[0] for row in cursor.fetchall()]
        
        if 'admission_date' not in columns:
            print("Adding admission_date column...")
            cursor.execute("ALTER TABLE students ADD COLUMN admission_date DATE")
            
        if 'photo_url' not in columns:
            print("Adding photo_url column...")
            cursor.execute("ALTER TABLE students ADD COLUMN photo_url VARCHAR(255)")
            
        # Check users table for role
        cursor.execute("DESCRIBE users")
        user_columns = [row[0] for row in cursor.fetchall()]
        if 'role' not in user_columns:
            print("Adding role column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'admin'")
            
        # Create teachers table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS teachers (
            id VARCHAR(50) PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(100) UNIQUE,
            highest_education VARCHAR(100),
            years_of_experience INT,
            specialization VARCHAR(100),
            photo_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        conn.commit()
        print("Schema updated successfully.")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    apply_schema_update()
