import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            database=os.getenv('DB_NAME', 'face_db'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
        )
        cursor = conn.cursor()

        # Add role to users table if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'admin'")
            print("Added 'role' column to users table.")
        except Error as e:
            if e.errno == 1060: # unrecoverable duplicate column name
                print("'role' column already exists in users table.")
            else:
                print(f"Error altering users table: {e}")

        # Create teachers table
        create_teachers_sql = """
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
        );
        """
        cursor.execute(create_teachers_sql)
        print("Created 'teachers' table successfully.")

        conn.commit()
    except Error as e:
        print(f"Migration Error: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    migrate()
