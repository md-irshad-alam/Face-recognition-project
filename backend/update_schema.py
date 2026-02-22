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
            
        conn.commit()
        print("Schema updated successfully.")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    apply_schema_update()
