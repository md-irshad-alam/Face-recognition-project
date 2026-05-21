import cv2
import face_recognition
import numpy as np
import os
import time
import requests
import datetime
import mysql.connector

# Configuration
# Note: Ideally these credentials should be in a .env file, but hardcoded here for the component boilerplate
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "visio_school"
SCHOOL_ID = "school_001"

FACES_DIR = "teacher_faces" # Directory containing images named like {teacher_id}.jpg

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

def load_teacher_embeddings():
    known_encodings = []
    known_ids = []
    
    if not os.path.exists(FACES_DIR):
        print(f"Directory {FACES_DIR} not found. Please create it and add teacher face images.")
        return known_encodings, known_ids
        
    for filename in os.listdir(FACES_DIR):
        if filename.endswith((".jpg", ".jpeg", ".png")):
            teacher_id = os.path.splitext(filename)[0]
            filepath = os.path.join(FACES_DIR, filename)
            try:
                img = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(img)
                if encodings:
                    known_encodings.append(encodings[0])
                    known_ids.append(teacher_id)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                
    return known_encodings, known_ids

def log_staff_attendance(teacher_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    today = datetime.date.today()
    
    # Check if already marked today
    cursor.execute(
        "SELECT id FROM staff_attendance_logs WHERE teacher_id = %s AND date = %s AND school_id = %s",
        (teacher_id, today, SCHOOL_ID)
    )
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return False # Already marked
        
    # Mark present
    now = datetime.datetime.now().time()
    cursor.execute("""
        INSERT INTO staff_attendance_logs (teacher_id, date, check_in_time, status, school_id)
        VALUES (%s, %s, %s, 'present', %s)
    """, (teacher_id, today, now, SCHOOL_ID))
    conn.commit()
    
    # Get teacher name for UI feedback
    cursor.execute("SELECT first_name, last_name FROM teachers WHERE id = %s", (teacher_id,))
    teacher = cursor.fetchone()
    name = f"{teacher[0]} {teacher[1]}" if teacher else teacher_id
    
    cursor.close()
    conn.close()
    return name

def start_terminal():
    print("Loading teacher embeddings...")
    known_encodings, known_ids = load_teacher_embeddings()
    print(f"Loaded {len(known_ids)} teacher profiles.")
    
    if not known_ids:
        print("No embeddings loaded. Exiting.")
        return

    print("Initializing webcam...")
    video_capture = cv2.VideoCapture(0)
    
    if not video_capture.isOpened():
        print("Cannot open webcam")
        return
        
    cooldowns = {} # Prevent spamming DB for the same person
    
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
            
        # Resize for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            name = "Unknown"
            
            if True in matches:
                first_match_index = matches.index(True)
                teacher_id = known_ids[first_match_index]
                
                # Check cooldown
                now = time.time()
                if teacher_id not in cooldowns or (now - cooldowns[teacher_id] > 60): # 1 minute cooldown
                    teacher_name = log_staff_attendance(teacher_id)
                    if teacher_name:
                        print(f"✅ Logged check-in for {teacher_name} ({teacher_id}) at {datetime.datetime.now().strftime('%H:%M:%S')}")
                    cooldowns[teacher_id] = now
                
                name = teacher_id

            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            # Draw a box around the face
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.7, (255, 255, 255), 1)

        cv2.imshow('Staff Face Recognition Terminal', frame)

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    start_terminal()
