from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import cv2
import face_recognition
import numpy as np
import os
import base64
import json
import database
import auth
import face_engine  # ← Optimized engine: FAISS + Redis + adaptive thresholds
from dataclasses import asdict
from routers import exams, teachers, fees, whatsapp, students, auth as auth_router
from routers import monitoring
from models import UserCreate, UserLogin, GoogleLogin, Token, StudentCreate, ScanRequest
import migrate
import face_state
from school_utils import validate_school_email, extract_school_id

app = FastAPI(title="Face Recognition Attendance System")

# Mount static files for student photos
os.makedirs("static/students", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(students.router)
app.include_router(fees.router)
app.include_router(whatsapp.router)
app.include_router(auth_router.router)
app.include_router(monitoring.router)

# Pull origins from environment variable or fallback to production/localhost defaults
default_origins = "https://visio.school,https://www.visio.school,http://localhost:3000,http://127.0.0.1:3000"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", default_origins)
origins = [origin.strip().rstrip("/") for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ─── WebSocket Connection Manager ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.dashboard_connections: list[WebSocket] = []

    async def connect_dashboard(self, ws: WebSocket):
        await ws.accept()
        self.dashboard_connections.append(ws)

    def disconnect_dashboard(self, ws: WebSocket):
        if ws in self.dashboard_connections:
            self.dashboard_connections.remove(ws)

    async def broadcast_attendance(self, event: dict):
        dead = []
        for ws in self.dashboard_connections:
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_dashboard(ws)

manager = ConnectionManager()

def load_known_faces():
    """Loads known faces from the 'faces' directory and populates the FAISS index."""
    faces_dir = "faces"
    if not os.path.exists(faces_dir):
        os.makedirs(faces_dir)
        return

    print("Loading known faces into optimized FAISS index...")
    for filename in os.listdir(faces_dir):
        if filename.endswith((".jpg", ".jpeg", ".png")):
            filepath = os.path.join(faces_dir, filename)
            try:
                image = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    face_state.add_face(encodings[0], os.path.splitext(filename)[0])
            except Exception as e:
                print(f"Error loading {filename}: {e}")
    
    face_engine.load_faces_into_index(face_state.known_face_encodings, face_state.known_face_names)
    print(f"Total known faces loaded: {len(face_state.known_face_names)}")

@app.on_event("startup")
async def startup_event():
    load_known_faces()
    database.init_db()
    migrate.migrate_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Face Recognition Attendance System API"}

@app.get("/attendance/today")
def get_todays_attendance_list(class_name: str = None, current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get('school_id', '')
    return database.get_todays_attendance(class_name=class_name, school_id=school_id)

@app.get("/stats")
def get_stats(current_user: dict = Depends(auth.get_current_user)):
    return database.get_dashboard_stats(school_id=current_user.get('school_id', ''))

@app.get("/summary")
def get_summary(current_user: dict = Depends(auth.get_current_user)):
    return database.get_dashboard_summary(school_id=current_user.get('school_id', ''))

@app.get("/devices")
def get_devices(current_user: dict = Depends(auth.get_current_user)):
    return database.get_active_devices()

@app.post("/scan-face")
async def scan_face(payload: ScanRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(auth.get_current_user)):
    try:
        image_data = payload.image
        if "," in image_data:
            image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)

        background_tasks.add_task(database.update_device_status, payload.device_id, current_user.get('full_name'), "Mobile", getattr(payload, 'battery', None))

        student_id, metrics = face_engine.recognize_face(image_bytes)
        school_id = current_user.get('school_id', '')

        if not metrics.face_found:
            result = {"status": "error", "message": "No face detected", "attendance_marked": False, "device_id": payload.device_id, "timestamp": payload.timestamp}
        elif student_id:
            student = database.get_student_by_id(student_id)
            if student:
                already_marked = database.check_attendance_status(student_id, school_id=school_id)
                if already_marked:
                    result = {"status": "already_marked", "student_name": student['name'], "student_id": student_id, "message": "Attendance already marked", "attendance_marked": False, "photo_url": student.get('photo_url')}
                else:
                    background_tasks.add_task(database.mark_attendance, student_id, school_id)
                    result = {"status": "success", "student_name": student['name'], "student_id": student_id, "message": "Attendance marked successfully", "attendance_marked": True}
            else:
                result = {"status": "fail", "message": "Student not found", "attendance_marked": False}
        else:
            result = {"status": "fail", "message": "Face not recognized", "attendance_marked": False}

        await manager.broadcast_attendance({"type": "attendance_event", "data": result})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/attendance")
async def attendance_websocket(websocket: WebSocket):
    await manager.connect_dashboard(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_dashboard(websocket)

@app.websocket("/ws/face-recognition")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            header, encoded = data.split(",", 1)
            image_bytes = base64.b64decode(encoded)
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None: continue

            rgb_frame = cv2.cvtColor(cv2.resize(frame, (0, 0), fx=0.25, fy=0.25), cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            results = []
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(face_state.known_face_encodings, face_encoding)
                if True in matches:
                    idx = matches.index(True)
                    student_id = face_state.known_face_names[idx]
                    student = database.get_student_by_id(student_id)
                    if student:
                        results.append({"student_id": student_id, "name": student['name'], "status": "Verified"})
            await websocket.send_json({"faces": results})
    except Exception:
        pass

@app.get("/leaves/me")
def get_my_leaves(current_user: dict = Depends(auth.get_current_user)):
    conn = database.create_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM teachers WHERE LOWER(email) = %s", (current_user.get('email', '').lower(),))
    teacher = cursor.fetchone(); cursor.close(); conn.close()
    if not teacher: return {"balance": {"sick_leave": 0}, "requests": []}
    return database.get_teacher_leaves(teacher['id'])

@app.post("/leaves")
def apply_leave(data: dict, current_user: dict = Depends(auth.get_current_user)):
    conn = database.create_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM teachers WHERE email = %s", (current_user['email'],))
    teacher = cursor.fetchone(); cursor.close(); conn.close()
    if not teacher: raise HTTPException(status_code=403, detail="Only faculty members can apply")
    database.create_leave_request(teacher['id'], data)
    return {"message": "Leave request submitted"}

@app.get("/admin/pending-leaves")
def get_pending_leaves(current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get('school_id', '')
    conn = database.create_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT lr.*, t.first_name, t.last_name FROM leave_requests lr JOIN teachers t ON lr.teacher_id = t.id WHERE lr.status = 'PENDING' AND t.school_id = %s", (school_id,))
    requests = cursor.fetchall(); cursor.close(); conn.close()
    return requests

@app.put("/admin/leaves/{request_id}/status")
def update_leave_status(request_id: int, data: dict, current_user: dict = Depends(auth.require_admin)):
    conn = database.create_connection(); cursor = conn.cursor()
    cursor.execute("UPDATE leave_requests SET status = %s WHERE id = %s", (data.get('status'), request_id))
    conn.commit(); cursor.close(); conn.close()
    return {"message": "Status updated"}

APK_PATH = "static/apps/app-release.apk"
APK_VERSION = "1.0.0"

@app.get("/download/app/info")
def download_app_info():
    """Return APK availability, version, and file size for the frontend download button."""
    if os.path.exists(APK_PATH):
        size_bytes = os.path.getsize(APK_PATH)
        size_mb = round(size_bytes / (1024 * 1024), 1)
        return {"available": True, "version": APK_VERSION, "size_mb": size_mb}
    return {"available": False, "version": APK_VERSION, "size_mb": None}

@app.get("/download/app")
def download_app():
    if os.path.exists(APK_PATH):
        return FileResponse(
            APK_PATH,
            filename=f"Visio-v{APK_VERSION}.apk",
            media_type="application/vnd.android.package-archive",
        )
    raise HTTPException(status_code=404, detail="APK not found. Please contact support.")
