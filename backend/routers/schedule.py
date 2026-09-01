from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel
import database
import auth
import json
import os
import shutil
import datetime

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.get("/staff-stats")
def get_staff_attendance_stats(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get('school_id')
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor(dictionary=True)
        today = datetime.date.today()
        
        # Total active teachers
        cursor.execute("SELECT COUNT(*) as total FROM teachers WHERE school_id = %s AND status = 'active'", (school_id,))
        total_row = cursor.fetchone()
        total = total_row['total'] if total_row else 0
        
        # Present today
        cursor.execute("""
            SELECT COUNT(DISTINCT teacher_id) as present 
            FROM staff_attendance_logs 
            WHERE date = %s AND status = 'present' AND school_id = %s
        """, (today, school_id))
        present_row = cursor.fetchone()
        present = present_row['present'] if present_row else 0
        
        return {
            "present": present,
            "total": total,
            "absent": total - present,
            "date": str(today)
        }
    finally:
        cursor.close()
        conn.close()

@router.post("/register-face/{teacher_id}")
async def register_teacher_face(
    teacher_id: str,
    photo: UploadFile = File(...),
    current_user: dict = Depends(auth.require_admin)
):
    school_id = current_user.get('school_id')
    
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM teachers WHERE id = %s AND school_id = %s", (teacher_id, school_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        # Save face photo to teacher_faces dir
        os.makedirs("teacher_faces", exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] if photo.filename else '.jpg'
        face_path = f"teacher_faces/{teacher_id}{ext}"
        
        with open(face_path, "wb") as f:
            content = await photo.read()
            f.write(content)
        
        # Hot-add to the live FAISS index — no server restart needed
        try:
            import face_recognition as fr
            import numpy as np
            import face_state, face_engine
            image = fr.load_image_file(face_path)
            encodings = fr.face_encodings(image)
            if encodings:
                face_state.add_face(encodings[0], f"T_{teacher_id}")
                face_engine.add_student_to_index(f"T_{teacher_id}", np.array(encodings[0]))
        except Exception as e:
            # Non-fatal — will be loaded on next restart
            print(f"Warning: could not hot-add teacher face to index: {e}")
        
        # Update teacher record with face path
        cursor.execute(
            "UPDATE teachers SET face_embedding_path = %s WHERE id = %s AND school_id = %s",
            (face_path, teacher_id, school_id)
        )
        conn.commit()
        
        return {"message": "Face registered successfully. Teacher is now scannable.", "path": face_path}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

class ScheduleEntry(BaseModel):
    day_of_week: str
    period_number: int
    start_time: str
    end_time: str
    classes: List[str]
    teacher_id: str
    subject: str

@router.get("/")
def get_schedule(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")
        
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT m.*, t.first_name, t.last_name 
            FROM master_timetable m
            LEFT JOIN teachers t ON m.teacher_id = t.id
            WHERE m.school_id = %s
            ORDER BY m.day_of_week, m.period_number
        """, (school_id,))
        rows = cursor.fetchall()
        
        # Helper to convert timedelta to string if needed
        def format_time(t):
            if not t: return "00:00"
            if hasattr(t, 'total_seconds'):
                s = int(t.total_seconds())
                hours, remainder = divmod(s, 3600)
                minutes, _ = divmod(remainder, 60)
                return f"{hours:02}:{minutes:02}"
            return str(t)
            
        for row in rows:
            row['teacher_name'] = f"{row.get('first_name', '')} {row.get('last_name', '')}".strip()
            row['start_time'] = format_time(row['start_time'])
            row['end_time'] = format_time(row['end_time'])
            if row.get('classes'):
                if isinstance(row['classes'], str):
                    if row.get('classes'):
                        try:
                            row['classes'] = json.loads(row['classes'])
                        except json.JSONDecodeError:
                            row['classes'] = []
                    else:
                        row['classes'] = []
            else:
                row['classes'] = []
                
        return rows
    finally:
        cursor.close()
        conn.close()

@router.post("/")
def create_schedule(entry: ScheduleEntry, current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")
        
    if not entry.teacher_id:
        raise HTTPException(status_code=400, detail="Please select an assigned teacher.")
        
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO master_timetable (
                day_of_week, period_number, start_time, end_time, 
                classes, teacher_id, subject, school_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            entry.day_of_week, entry.period_number, entry.start_time, entry.end_time,
            json.dumps(entry.classes), entry.teacher_id, entry.subject, school_id
        ))
        conn.commit()
        return {"message": "Schedule entry created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/bulk")
def create_bulk_schedule(entries: List[ScheduleEntry], current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")
        
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        for entry in entries:
            if not entry.teacher_id:
                raise HTTPException(status_code=400, detail="Teacher missing in entry")
                
            cursor.execute("""
                INSERT INTO master_timetable (
                    day_of_week, period_number, start_time, end_time, 
                    classes, teacher_id, subject, school_id
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                entry.day_of_week, entry.period_number, entry.start_time, entry.end_time,
                json.dumps(entry.classes), entry.teacher_id, entry.subject, school_id
            ))
        conn.commit()
        return {"message": "Bulk schedule entries created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.put("/{id}")
def update_schedule(id: int, entry: ScheduleEntry, current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")
        
    if not entry.teacher_id:
        raise HTTPException(status_code=400, detail="Please select an assigned teacher.")
        
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE master_timetable SET
                day_of_week = %s, period_number = %s, start_time = %s, end_time = %s, 
                classes = %s, teacher_id = %s, subject = %s
            WHERE id = %s AND school_id = %s
        """, (
            entry.day_of_week, entry.period_number, entry.start_time, entry.end_time,
            json.dumps(entry.classes), entry.teacher_id, entry.subject, id, school_id
        ))
        conn.commit()
        return {"message": "Schedule entry updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.delete("/{id}")
def delete_schedule(id: int, current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")
        
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM master_timetable WHERE id = %s AND school_id = %s", (id, school_id))
        conn.commit()
        return {"message": "Schedule entry deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
