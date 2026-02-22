from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import face_recognition
import numpy as np
import os
import base64
import json
import database
from routers import exams

app = FastAPI(title="Face Recognition Attendance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store known face encodings and names
known_face_encodings = []
known_face_names = []

def load_known_faces():
    """Loads known faces from the 'faces' directory."""
    global known_face_encodings, known_face_names
    faces_dir = "faces"
    if not os.path.exists(faces_dir):
        os.makedirs(faces_dir)
        print(f"Created {faces_dir} directory. Please add images there.")
        return

    print("Loading known faces...")
    # Clear existing lists to avoid duplicates if reloaded
    known_face_encodings = []
    known_face_names = []
    
    for filename in os.listdir(faces_dir):
        if filename.endswith((".jpg", ".jpeg", ".png")):
            filepath = os.path.join(faces_dir, filename)
            try:
                image = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    encoding = encodings[0]
                    known_face_encodings.append(encoding)
                    # Use filename without extension as name/ID (e.g. "1001" for student ID)
                    name = os.path.splitext(filename)[0]
                    known_face_names.append(name)
                    print(f"Loaded face: {name}")
                else:
                    print(f"No face found in {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
    print(f"Total known faces loaded: {len(known_face_names)}")

# Load faces and init DB on startup
@app.on_event("startup")
async def startup_event():
    load_known_faces()
    database.init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Face Recognition Attendance System API"}

@app.get("/attendance/today")
def get_todays_attendance_list():
    return database.get_todays_attendance()

@app.get("/stats")
def get_stats():
    return database.get_dashboard_stats()

from fastapi import Form, UploadFile, File
from PIL import Image
import shutil

# ... existing imports

@app.post("/students")
async def create_student(
    id: str = Form(...),
    name: str = Form(...),
    class_name: str = Form(...),
    section: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    dob: str = Form(None), # YYYY-MM-DD
    admission_date: str = Form(...), # YYYY-MM-DD
    photo: UploadFile = File(None)
):
    try:
        # Check if student exists
        existing = database.get_student_by_id(id)
        if existing:
             raise HTTPException(status_code=400, detail="Student ID already exists")

        photo_url = None
        if photo:
            # Validate file size (already done on frontend, but good to double check if possible, though stream makes it hard without reading)
            # Validate file type
            if not photo.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
            
            # Create directory if not exists
            os.makedirs("static/students", exist_ok=True)
            
            # Save and optimize image
            file_extension = os.path.splitext(photo.filename)[1]
            photo_filename = f"{id}{file_extension}"
            photo_path = f"static/students/{photo_filename}"
            
            try:
                # Open image using Pillow
                img = Image.open(photo.file)
                
                # Convert to RGB if necessary (e.g. for PNGs with transparency if saving as JPEG, though we keep original format usually)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                    
                # Resize/Optimize (max width 800px)
                max_width = 800
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.LANCZOS)
                
                # Save optimized image
                img.save(photo_path, quality=85, optimize=True)
                photo_url = f"/static/students/{photo_filename}"
                
                # Also save to faces directory for recognition training
                faces_dir = "faces"
                os.makedirs(faces_dir, exist_ok=True)
                face_path = os.path.join(faces_dir, photo_filename)
                # verify if face is detectable before saving? Optional but good.
                img.save(face_path, quality=95) 
                
                # Reload faces efficiently (or just append directly)
                # For simplicity, let's append directly to global lists
                try:
                    image_np = face_recognition.load_image_file(face_path)
                    encodings = face_recognition.face_encodings(image_np)
                    if encodings:
                        known_face_encodings.append(encodings[0])
                        known_face_names.append(id) # ID as name
                        print(f"Added new face for ID: {id}")
                except Exception as e:
                    print(f"Error adding face encoding: {e}")
                
            except Exception as e:
                print(f"Error processing image: {e}")
                raise HTTPException(status_code=500, detail="Failed to process image")

        conn = database.create_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO students (id, name, class_name, section, email, phone, dob, admission_date, photo_url, is_on_hold)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)
        """
        values = (id, name, class_name, section, email, phone, dob, admission_date, photo_url)
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Student added successfully", "student_id": id, "photo_url": photo_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students")
def get_students():
    return database.get_all_students()

@app.get("/students/{student_id}")
def get_student(student_id: str):
    student = database.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    history = database.get_attendance_history(student_id)
    return {"student": student, "history": history}

@app.put("/students/{student_id}/hold")
def toggle_student_hold(student_id: str, hold_status: bool):
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE students SET is_on_hold = %s WHERE id = %s", (hold_status, student_id))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Student not found")
        return {"message": f"Student hold status updated to {hold_status}"}
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.websocket("/ws/face-recognition")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    try:
        while True:
            # Receive base64 image from client
            data = await websocket.receive_text()
            
            try:
                # Decode base64 image
                header, encoded = data.split(",", 1)
                image_bytes = base64.b64decode(encoded)
                
                # Convert to numpy array
                nparr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # Resize for faster processing
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

                # Face detection
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                results = []
                for face_encoding in face_encodings:
                    # Match against known faces
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                    name = "Unknown"
                    status = "Unverified"

                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    if len(face_distances) > 0:
                        best_match_index = np.argmin(face_distances)
                        if matches[best_match_index]:
                            student_id = known_face_names[best_match_index] # This is the Student ID
                            
                            # Verify if ID exists
                            student = database.get_student_by_id(student_id) 
                            if student:
                                # Check if student is on hold
                                if student.get('is_on_hold'):
                                    status = "On Hold"
                                # Check if already marked
                                elif database.check_attendance_status(student_id):
                                    status = "Already Marked"
                                else:
                                    database.mark_attendance(student_id)
                                    status = "Verified"
                                
                                results.append({
                                    "student_id": student_id,
                                    "name": student['name'],
                                    "status": status,
                                    "photo_url": student['photo_url'],
                                    "program": student.get('class_name'), # Map class_name to program for frontend compatibility
                                    "section": student['section']
                                })
                            else:
                                status = "No Record Found" # Face matches known encoding but not in DB? Rare edge case.
                                results.append({"name": "Unknown", "status": status})
                        else:
                             status = "No Record Found" # Unknown Face
                             results.append({"name": "Unknown", "status": status})

                # Send results back to client
                await websocket.send_json({"faces": results})

            except Exception as e:
                print(f"Error processing frame: {e}")

    except Exception as e:
        print(f"WebSocket error: {e}")

# --- Authentication ---
# --- Authentication ---
import auth
from models import UserCreate, UserLogin, GoogleLogin, Token, StudentCreate

@app.post("/auth/register")
def register(user: UserCreate):
    db_user = auth.get_user_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    success = auth.create_user(user.email, hashed_password, user.full_name)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    return {"message": "User created successfully"}

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin):
    db_user = auth.get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not auth.verify_password(user.password, db_user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": db_user['email']})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": db_user['full_name'],
        "user_email": db_user['email']
    }

@app.post("/auth/google", response_model=Token)
async def google_login(login_data: GoogleLogin):
    id_info = await auth.verify_google_token(login_data.token)
    if not id_info:
        raise HTTPException(status_code=401, detail="Invalid Google Token")
    
    email = id_info.get("email")
    name = id_info.get("name")
    google_id = id_info.get("sub")
    
    # Check if user exists
    db_user = auth.get_user_by_email(email)
    if not db_user:
        # Auto-register
        success = auth.create_user(email, None, name, google_id) # No password for Google users
        if not success:
             raise HTTPException(status_code=500, detail="Failed to create user")
        # Fetch again to get clean data or just use what we have
        db_user = {"email": email, "full_name": name}
    
    access_token = auth.create_access_token(data={"sub": email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": db_user.get('full_name', name),
        "user_name": db_user.get('full_name', name),
        "user_email": db_user.get('email', email)
    }

from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(exams.router)
