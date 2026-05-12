from fastapi import APIRouter, HTTPException, Depends, Form, UploadFile, File
import database
import auth
import face_state
import face_recognition
import os
import pandas as pd
from io import BytesIO
from PIL import Image
from typing import List, Optional

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("")
def get_students(current_user: dict = Depends(auth.get_current_user)):
    return database.get_all_students(school_id=current_user.get('school_id', ''))

@router.get("/classes")
def get_student_classes(current_user: dict = Depends(auth.get_current_user)):
    return database.get_distinct_classes(school_id=current_user.get('school_id', ''))

@router.post("")
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
    last_payment_date: str = Form(None),
    opening_balance: float = Form(0),
    photo: UploadFile = File(None),
    current_user: dict = Depends(auth.require_admin)
):
    school_id = current_user.get('school_id', '')
    try:
        existing = database.get_student_by_id(id)
        if existing:
            raise HTTPException(status_code=400, detail="Student ID already exists")

        photo_url = None
        img_buffer = None
        
        if photo:
            img = Image.open(photo.file)
            if img.mode in ("RGBA", "P"): img = img.convert("RGB")
            img_buffer = BytesIO()
            img.save(img_buffer, format='JPEG', quality=85)
            img_buffer.seek(0)
            photo_url = f"/static/students/{id}.jpg"

        conn = database.create_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO students (
            id, name, class_name, section, email, phone, parent_phone, dob, admission_date, photo_url,
            student_type, transport_type, tuition_fee, transport_fee, hostel_fee, total_monthly_fee, is_on_hold,
            last_payment_date, opening_balance, school_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, %s, %s, %s)
        """
        values = (id, name, class_name, section, email, phone, parent_phone, dob, admission_date, photo_url,
                  student_type, transport_type, tuition_fee, transport_fee, hostel_fee, total_monthly_fee,
                  last_payment_date, opening_balance, school_id)
        cursor.execute(query, values)
        conn.commit()
        cursor.close(); conn.close()

        if img_buffer:
            os.makedirs("static/students", exist_ok=True)
            with open(f"static/students/{id}.jpg", "wb") as f: f.write(img_buffer.getbuffer())
            os.makedirs("faces", exist_ok=True)
            face_path = os.path.join("faces", f"{id}.jpg")
            with open(face_path, "wb") as f: f.write(img_buffer.getbuffer())
            
            image_np = face_recognition.load_image_file(face_path)
            encodings = face_recognition.face_encodings(image_np)
            if encodings: face_state.add_face(encodings[0], id)
        
        return {"message": "Student added successfully", "student_id": id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-upload")
async def bulk_upload_students(
    file: UploadFile = File(...),
    current_user: dict = Depends(auth.require_admin)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are accepted")
    
    school_id = current_user.get('school_id', '')
    try:
        import string
        import random

        def generate_unique_id():
            return ''.join(random.choices(string.digits, k=6))

        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))
        
        # Required columns mapping (ID is now system-generated)
        required_cols = ['name', 'class_name', 'section', 'email', 'phone', 'parent_phone']
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")

        conn = database.create_connection()
        cursor = conn.cursor()
        
        success_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Generate unique ID and check for collisions
                sid = generate_unique_id()
                while True:
                    cursor.execute("SELECT id FROM students WHERE id = %s", (sid,))
                    if not cursor.fetchone():
                        break
                    sid = generate_unique_id()
                
                query = """
                INSERT INTO students (
                    id, name, class_name, section, email, phone, parent_phone, dob, admission_date,
                    student_type, transport_type, tuition_fee, transport_fee, hostel_fee, total_monthly_fee, school_id
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """
                values = (
                    sid, row['name'], row['class_name'], row['section'], row['email'], 
                    row['phone'], row['parent_phone'], 
                    str(row.get('dob')) if pd.notnull(row.get('dob')) else None,
                    str(row.get('admission_date')) if pd.notnull(row.get('admission_date')) else str(date.today()),
                    row.get('student_type', 'Regular'), row.get('transport_type', 'Self'),
                    float(row.get('tuition_fee', 0)), float(row.get('transport_fee', 0)),
                    float(row.get('hostel_fee', 0)), float(row.get('total_monthly_fee', 0)),
                    school_id
                )
                cursor.execute(query, values)
                success_count += 1
            except Exception as e:
                errors.append(f"Row {index+2}: {str(e)}")
        
        conn.commit()
        cursor.close(); conn.close()
        
        return {
            "message": f"Successfully onboarded {success_count} students.",
            "success_count": success_count,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from datetime import date

@router.get("/{student_id}")
def get_student(student_id: str, current_user: dict = Depends(auth.get_current_user)):
    student = database.get_student_by_id(student_id, school_id=current_user.get('school_id', ''))
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    history = database.get_attendance_history(student_id, school_id=current_user.get('school_id', ''))
    return {"student": student, "history": history}

@router.delete("/{student_id}")
def delete_student(student_id: str, current_user: dict = Depends(auth.require_admin)):
    success = database.delete_student(student_id, school_id=current_user.get('school_id', ''))
    if not success: raise HTTPException(status_code=404, detail="Failed to delete student")
    face_state.remove_face(student_id)
    return {"message": "Student deleted successfully"}
