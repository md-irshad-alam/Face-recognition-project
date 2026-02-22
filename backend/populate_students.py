import os
import mysql.connector
from datetime import datetime
import random

def create_connection():
    """Create a database connection to the MySQL database."""
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

def populate_students():
    conn = create_connection()
    if not conn:
        return

    cursor = conn.cursor()
    faces_dir = "faces"
    
    if not os.path.exists(faces_dir):
        print(f"Directory {faces_dir} not found.")
        return

    print("Scanning faces directory...")
    
    programs = ["Computer Science", "Information Technology", "Electronics", "Mechanical"]
    sections = ["A", "B", "C"]
    
    count = 0
    for filename in os.listdir(faces_dir):
        if filename.endswith((".jpg", ".jpeg", ".png")):
            # Extract name/id from filename
            name = os.path.splitext(filename)[0]
            student_id = name # Using name as ID as per existing logic
            
            # Generate dummy details
            email = f"{name.replace(' ', '.').lower()}@example.com"
            phone = f"+91{random.randint(7000000000, 9999999999)}"
            program = random.choice(programs)
            section = random.choice(sections)
            
            try:
                # Check if student exists
                cursor.execute("SELECT id FROM students WHERE id = %s", (student_id,))
                if cursor.fetchone():
                    print(f"Skipping {name} (already exists)")
                    continue

                query = """
                INSERT INTO students (id, name, program, section, email, phone)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                values = (student_id, name, program, section, email, phone)
                
                cursor.execute(query, values)
                print(f"Added {name}")
                count += 1
                
            except Exception as e:
                print(f"Error adding {name}: {e}")

    conn.commit()
    print(f"\nSuccessfully added {count} new students.")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    populate_students()
