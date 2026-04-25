import mysql.connector

def migrate():
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='Irshad12',
            database='smart_school'
        )
        cursor = conn.cursor()
        
        print("Adding password column to teachers...")
        try:
            cursor.execute("ALTER TABLE teachers ADD COLUMN password VARCHAR(255)")
            print("Password column added.")
        except Exception as e:
            print(f"Password column already exists or error: {e}")
            
        print("Adding role column to teachers...")
        try:
            cursor.execute("ALTER TABLE teachers ADD COLUMN role VARCHAR(20) DEFAULT 'teacher'")
            print("Role column added.")
        except Exception as e:
            print(f"Role column already exists or error: {e}")
            
        conn.commit()
        cursor.close()
        conn.close()
        print("Migration complete.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
