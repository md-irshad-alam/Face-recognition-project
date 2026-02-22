import database

def migrate_db():
    conn = database.create_connection()
    if not conn:
        print("Failed to connect to database.")
        return
        
    try:
        cursor = conn.cursor()
        
        print("Running migrations...")
        
        # 1. Rename program to class_name (if it exists)
        try:
            cursor.execute("ALTER TABLE students CHANGE program class_name VARCHAR(50);")
            print("- Renamed 'program' to 'class_name'")
        except Exception as e:
            print(f"- Note: Could not rename program to class_name (maybe already done?): {e}")

        # 2. Add dob
        try:
            cursor.execute("ALTER TABLE students ADD COLUMN dob DATE;")
            print("- Added 'dob' column")
        except Exception as e:
            print(f"- Note: Could not add dob column: {e}")
            
        # 3. Add is_on_hold
        try:
            cursor.execute("ALTER TABLE students ADD COLUMN is_on_hold BOOLEAN DEFAULT FALSE;")
            print("- Added 'is_on_hold' column")
        except Exception as e:
            print(f"- Note: Could not add is_on_hold column: {e}")
            
        conn.commit()
        print("Migration completed successfully.")
        
    except Exception as e:
        print(f"Critical error during migration: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    migrate_db()
