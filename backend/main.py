from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import cv2
import face_recognition
import numpy as np
import os
import base64
import json
import database
import auth
from routers import exams, teachers, fees
from models import UserCreate, UserLogin, GoogleLogin, Token, StudentCreate, ScanRequest

app = FastAPI(title="Face Recognition Attendance System")
app.include_router(fees.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── WebSocket Connection Manager ─────────────────────────────────────────────
# Keeps track of all web dashboard clients and broadcasts scan events.

class ConnectionManager:
    def __init__(self):
        # Dashboard web clients listening for real-time attendance updates
        self.dashboard_connections: list[WebSocket] = []

    async def connect_dashboard(self, ws: WebSocket):
        await ws.accept()
        self.dashboard_connections.append(ws)
        print(f"[WS] Dashboard client connected. Total: {len(self.dashboard_connections)}")

    def disconnect_dashboard(self, ws: WebSocket):
        if ws in self.dashboard_connections:
            self.dashboard_connections.remove(ws)
        print(f"[WS] Dashboard client disconnected. Total: {len(self.dashboard_connections)}")

    async def broadcast_attendance(self, event: dict):
        """Push a scan result to all live dashboard clients."""
        dead = []
        for ws in self.dashboard_connections:
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_dashboard(ws)

manager = ConnectionManager()

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
def get_todays_attendance_list(class_name: str = None, section: str = None):
    return database.get_todays_attendance(class_name=class_name, section=section)

@app.get("/stats")
def get_stats():
    return database.get_dashboard_stats()

@app.get("/devices")
def get_devices():
    return database.get_active_devices()

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
    parent_phone: str = Form(None),
    dob: str = Form(None),
    admission_date: str = Form(...),
    student_type: str = Form('Regular'),
    transport_type: str = Form('Self'),
    tuition_fee: float = Form(0),
    transport_fee: float = Form(0),
    hostel_fee: float = Form(0),
    total_monthly_fee: float = Form(0),
    photo: UploadFile = File(None)
):
    try:
        # Check if student exists
        existing = database.get_student_by_id(id)
        if existing:
             raise HTTPException(status_code=400, detail="Student ID already exists")

        photo_url = None
        img_buffer = None
        
        if photo:
            if not photo.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Invalid file type")
            
            # Process image in memory
            from io import BytesIO
            img = Image.open(photo.file)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            max_width = 800
            if img.width > max_width:
                ratio = max_width / img.width
                img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
            
            img_buffer = BytesIO()
            file_extension = os.path.splitext(photo.filename)[1]
            # Use jpeg for optimization if possible, or keep original
            img.save(img_buffer, format='JPEG', quality=85)
            img_buffer.seek(0)
            photo_url = f"/static/students/{id}.jpg" # Standardize on jpg

        # 1. Insert into Database FIRST
        conn = database.create_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO students (
            id, name, class_name, section, email, phone, parent_phone, dob, admission_date, photo_url, 
            student_type, transport_type, tuition_fee, transport_fee, hostel_fee, total_monthly_fee, is_on_hold
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)
        """
        values = (
            id, name, class_name, section, email, phone, parent_phone, dob, admission_date, photo_url,
            student_type, transport_type, tuition_fee, transport_fee, hostel_fee, total_monthly_fee
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()

        # 2. On Successful DB insertion, save files to disk
        if img_buffer:
            os.makedirs("static/students", exist_ok=True)
            photo_path = f"static/students/{id}.jpg"
            with open(photo_path, "wb") as f:
                f.write(img_buffer.getbuffer())
            
            faces_dir = "faces"
            os.makedirs(faces_dir, exist_ok=True)
            face_path = os.path.join(faces_dir, f"{id}.jpg")
            with open(face_path, "wb") as f:
                f.write(img_buffer.getbuffer())

            # 3. Add to face recognition memory
            try:
                image_np = face_recognition.load_image_file(face_path)
                encodings = face_recognition.face_encodings(image_np)
                if encodings:
                    known_face_encodings.append(encodings[0])
                    known_face_names.append(id)
                    print(f"Added new face for ID: {id} to memory.")
            except Exception as e:
                print(f"Error updating face encodings: {e}")
        
        return {"message": "Student added successfully", "student_id": id, "photo_url": photo_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/students/{student_id}")
async def update_student(
    student_id: str,
    name: str = Form(...),
    class_name: str = Form(...),
    section: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    parent_phone: str = Form(None),
    dob: str = Form(None),
    admission_date: str = Form(None),
    student_type: str = Form('Regular'),
    transport_type: str = Form('Self'),
    tuition_fee: float = Form(0),
    transport_fee: float = Form(0),
    hostel_fee: float = Form(0),
    total_monthly_fee: float = Form(0),
    photo: UploadFile = File(None)
):
    try:
        existing = database.get_student_by_id(student_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Student not found")

        photo_url = existing.get('photo_url')
        if photo:
            if not photo.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Invalid file type")
            
            os.makedirs("static/students", exist_ok=True)
            file_extension = os.path.splitext(photo.filename)[1]
            photo_filename = f"{student_id}{file_extension}"
            photo_path = f"static/students/{photo_filename}"
            
            img = Image.open(photo.file)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            max_width = 800
            if img.width > max_width:
                ratio = max_width / img.width
                img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
            
            img.save(photo_path, quality=85, optimize=True)
            photo_url = f"/static/students/{photo_filename}"
            
            # Sync with faces directory
            faces_dir = "faces"
            os.makedirs(faces_dir, exist_ok=True)
            face_path = os.path.join(faces_dir, photo_filename)
            img.save(face_path, quality=95)
            
            # Update encodings
            try:
                image_np = face_recognition.load_image_file(face_path)
                encodings = face_recognition.face_encodings(image_np)
                if encodings:
                    if student_id in known_face_names:
                        idx = known_face_names.index(student_id)
                        known_face_encodings[idx] = encodings[0]
                    else:
                        known_face_encodings.append(encodings[0])
                        known_face_names.append(student_id)
            except Exception as e:
                print(f"Error updating encoding: {e}")

        conn = database.create_connection()
        cursor = conn.cursor()
        query = """
        UPDATE students 
        SET name = %s, class_name = %s, section = %s, email = %s, phone = %s, 
            parent_phone = %s, dob = %s, admission_date = %s, photo_url = %s,
            student_type = %s, transport_type = %s, tuition_fee = %s, 
            transport_fee = %s, hostel_fee = %s, total_monthly_fee = %s
        WHERE id = %s
        """
        values = (
            name, class_name, section, email, phone, parent_phone, dob, admission_date, photo_url,
            student_type, transport_type, tuition_fee, transport_fee, hostel_fee, total_monthly_fee,
            student_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Student updated successfully", "photo_url": photo_url}

    except Exception as e:
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fees/students")
async def get_fees_students():
    return database.get_all_students_for_fees()

@app.get("/students")
def get_students():
    return database.get_all_students()

@app.get("/students/classes")
def get_student_classes():
    return database.get_distinct_classes()

@app.get("/students/{student_id}")
def get_student(student_id: str):
    student = database.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    history = database.get_attendance_history(student_id)
    return {"student": student, "history": history}

@app.delete("/students/{student_id}")
def delete_student(student_id: str, current_user: dict = Depends(auth.require_admin)):
    """Delete a student and their attendance records. Admin only."""
    success = database.delete_student(student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found or failed to delete")
    return {"message": "Student deleted successfully"}

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



@app.post("/scan-face")
async def scan_face(payload: ScanRequest, current_user: dict = Depends(auth.get_current_user)):
    """
    Receives face image from mobile app, recognizes it, marks attendance,
    and broadcasts the result to all connected web dashboard clients via WebSocket.
    """
    try:
        # Strip base64 data URI prefix if present
        image_data = payload.image
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        # Convert to RGB for face_recognition
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        if not face_encodings:
            return {
                "status": "error",
                "message": "No face detected in image",
                "attendance_marked": False
            }

        face_encoding = face_encodings[0]
        # Use a tolerance of 0.6 (default) or 0.5 for more strictness. 
        # Lower distance means better match.
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
        
        # Update device status
        database.update_device_status(
            payload.device_id, 
            name=current_user.get('full_name'), 
            device_type="Mobile", 
            battery=getattr(payload, 'battery', None)
        )
        
        result = None

        if True in matches:
            best_match_index = np.argmin(face_distances)
            student_id = known_face_names[best_match_index]
            print(f"Recognized Student ID: {student_id} with distance: {face_distances[best_match_index]}")
            
            student = database.get_student_by_id(student_id)
            if student:
                already_marked = database.check_attendance_status(student_id)
                if not already_marked:
                    database.mark_attendance(student_id)

                result = {
                    "status": "success",
                    "student_name": student['name'],
                    "student_id": student_id,
                    "scanner_name": current_user['full_name'], # Identified the teacher
                    "message": "Attendance already marked today" if already_marked else "Attendance marked",
                    "attendance_marked": True,
                    "already_marked": already_marked,
                    "photo_url": student.get('photo_url'),
                    "class_name": student.get('class_name'),
                    "section": student.get('section'),
                    "device_id": payload.device_id,
                    "timestamp": payload.timestamp,
                }
        
        if result is None:
            result = {
                "status": "fail",
                "message": "Face not recognized",
                "scanner_name": current_user['full_name'],
                "attendance_marked": False,
                "device_id": payload.device_id,
                "timestamp": payload.timestamp,
            }

        # ── Broadcast to all connected web dashboard clients ────────────────
        await manager.broadcast_attendance({
            "type": "attendance_event",
            "data": result,
        })

        return result

    except Exception as e:
        print(f"Scan Face Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during face processing")


@app.websocket("/ws/attendance")
async def attendance_websocket(websocket: WebSocket):
    """
    Web dashboard clients connect here to receive real-time attendance events
    pushed by the mobile scan-face endpoint.
    """
    await manager.connect_dashboard(websocket)
    try:
        while True:
            # Keep connection alive; we only push from server side
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_dashboard(websocket)

@app.websocket("/ws/face-recognition")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    try:
        consecutive_unknown_count = 0
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
                found_known_face = False
                for face_encoding in face_encodings:
                    # Match against known faces
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                    name = "Unknown"
                    status = "Unverified"

                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    if len(face_distances) > 0:
                        best_match_index = np.argmin(face_distances)
                        if matches[best_match_index]:
                            found_known_face = True
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
                             
                if not found_known_face and len(face_encodings) > 0:
                    consecutive_unknown_count += 1
                    if consecutive_unknown_count >= 6:
                        results.append({"type": "intruder_alert"})
                        consecutive_unknown_count = 0 # reset after alarm
                else:
                    consecutive_unknown_count = 0

                # Send results back to client
                await websocket.send_json({"faces": results})

            except Exception as e:
                print(f"Error processing frame: {e}")

    except Exception as e:
        print(f"WebSocket error: {e}")

# --- Authentication ---
import auth
from models import UserResponse

@app.post("/auth/register")
def register(user: UserCreate):
    db_user = auth.get_user_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    # Defaulting to passed role or 'admin' for institutional safety
    success = auth.create_user(user.email, hashed_password, user.full_name, role=user.role or 'user')
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    return {"message": "User created successfully"}

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin):
    if user.current_device:
        print(f"Login attempt from device: {user.current_device}")
        # Register/Update device status on login
        database.update_device_status(
            user.current_device, 
            name=user.email, # Use email as a temporary name if full_name not yet fetched
            device_type="Mobile"
        )
    
    db_user = auth.get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not auth.verify_password(user.password, db_user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update device with full name if available
    if user.current_device:
        database.update_device_status(
            user.current_device, 
            name=db_user['full_name'], 
            device_type="Mobile"
        )

    access_token = auth.create_access_token(data={"sub": db_user['email'], "role": db_user.get('role', 'user')})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": db_user['full_name'],
        "user_email": db_user['email'],
        "role": db_user.get('role', 'user') or 'user'
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
        db_user = {"email": email, "full_name": name, "role": "user"}
    
    access_token = auth.create_access_token(data={"sub": email, "role": db_user.get('role', 'user')})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": db_user.get('full_name', name),
        "user_email": db_user.get('email', email),
        "role": db_user.get('role', 'user') or 'user'
    }

from models import UserResponse
from fastapi import Depends

@app.get("/auth/me", response_model=UserResponse)
def get_current_user_profile(current_user: dict = Depends(auth.get_current_user)):
    return {
        "id": current_user['id'],
        "email": current_user['email'],
        "full_name": current_user['full_name'],
        "role": current_user['role'],
        "created_at": current_user.get('created_at')
    }

@app.post("/auth/refresh-token", response_model=Token)
def refresh_token(current_user: dict = Depends(auth.get_current_user)):
    """
    Issues a fresh access token with the current role from the database.
    Fixes stale-role issues when a user's role is changed after login.
    """
    access_token = auth.create_access_token(
        data={"sub": current_user['email'], "role": current_user['role']}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": current_user['full_name'],
        "user_email": current_user['email'],
        "role": current_user['role']
    }


@app.get("/leaves/me")
def get_my_leaves(current_user: dict = Depends(auth.get_current_user)):
    # Look up teacher by email
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    email = current_user.get('email', '').lower()
    cursor.execute("SELECT id FROM teachers WHERE LOWER(email) = %s", (email,))
    teacher = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not teacher:
        print(f"DEBUG: Teacher not found for email: {email}")
        return {"balance": {"sick_leave": 0, "casual_leave": 0, "earned_leave": 0}, "requests": []}
        
    return database.get_teacher_leaves(teacher['id'])

@app.post("/leaves")
def apply_leave(data: dict, current_user: dict = Depends(auth.get_current_user)):
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM teachers WHERE email = %s", (current_user['email'],))
    teacher = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not teacher:
        raise HTTPException(status_code=403, detail="Only faculty members can apply for leave")
        
    success = database.create_leave_request(teacher['id'], data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to submit leave request")
        
    return {"message": "Leave request submitted"}

@app.get("/leaves/{teacher_id}")
def get_teacher_leaves_admin(teacher_id: str, current_user: dict = Depends(auth.get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Only administrators can access other users' leave data")
    return database.get_teacher_leaves(teacher_id)

@app.put("/leaves/{teacher_id}/balance")
def update_balance(teacher_id: str, data: dict, current_user: dict = Depends(auth.get_current_user)):
    # Check if admin
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Only administrators can adjust leave balances")
        
    success = database.update_leave_balance(
        teacher_id, 
        data.get('sick_leave', 15), 
        data.get('casual_leave', 10), 
        data.get('earned_leave', 30)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update leave balance")
        
    return {"message": "Leave balance updated"}

@app.get("/admin/pending-leaves")
def get_pending_leaves(current_user: dict = Depends(auth.require_admin)):
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT lr.*, t.first_name, t.last_name, t.department 
        FROM leave_requests lr 
        JOIN teachers t ON lr.teacher_id = t.id 
        WHERE lr.status = 'PENDING' 
        ORDER BY lr.applied_at DESC
    """)
    requests = cursor.fetchall()
    
    # Format dates
    for r in requests:
        if hasattr(r['applied_at'], 'strftime'):
            r['applied_at'] = r['applied_at'].strftime('%Y-%m-%d %H:%M:%S')
        if hasattr(r['start_date'], 'strftime'):
            r['start_date'] = r['start_date'].strftime('%Y-%m-%d')
        if r['end_date'] and hasattr(r['end_date'], 'strftime'):
            r['end_date'] = r['end_date'].strftime('%Y-%m-%d')
            
    cursor.close()
    conn.close()
    return requests

@app.put("/admin/leaves/{request_id}/status")
def update_leave_status(request_id: int, data: dict, current_user: dict = Depends(auth.require_admin)):
    from datetime import datetime
    status = data.get('status') # 'APPROVED' or 'REJECTED'
    if status not in ['APPROVED', 'REJECTED']:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    conn = database.create_connection()
    cursor = conn.cursor()
    
    # If REJECTED, we should probably add the days back to the balance?
    # BUT wait, I already subtracted them during 'apply'. 
    # So if REJECTED, I MUST ADD THEM BACK.
    if status == 'REJECTED':
        cursor.execute("SELECT teacher_id, leave_type, start_date, end_date FROM leave_requests WHERE id = %s", (request_id,))
        req = cursor.fetchone()
        if req:
            tid, ltype, start, end = req
            days = 1
            if end:
                # Handle potential string vs date types
                if isinstance(start, str):
                    start = datetime.strptime(start, '%Y-%m-%d')
                if isinstance(end, str):
                    end = datetime.strptime(end, '%Y-%m-%d')
                days = (end - start).days + 1
            
            cursor.execute(f"UPDATE leave_balances SET {ltype}_leave = {ltype}_leave + %s WHERE teacher_id = %s", (days, tid))
            
    cursor.execute("UPDATE leave_requests SET status = %s, approved_at = %s WHERE id = %s", 
                   (status, datetime.utcnow() if status == 'APPROVED' else None, request_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Leave {status.lower()} successfully"}

@app.get("/check-email/{email}")
def check_email_uniqueness(email: str):
    conn = database.create_connection()
    cursor = conn.cursor()
    # Check teachers table
    cursor.execute("SELECT id FROM teachers WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return {"unique": False, "source": "teacher"}
    
    # Check users table
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return {"unique": False, "source": "user"}
        
    cursor.close()
    conn.close()
    return {"unique": True}

from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(exams.router)
app.include_router(teachers.router)
