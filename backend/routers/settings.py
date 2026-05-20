from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
import database
import auth

router = APIRouter(prefix="/settings", tags=["Settings"])

class TimingSettings(BaseModel):
    attendance_start_time: str
    attendance_end_time: str
    school_end_time: str

@router.get("/timings")
def get_timings(current_user: dict = Depends(auth.get_current_user)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")

    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT attendance_start_time, attendance_end_time, school_end_time FROM school_settings WHERE school_id = %s", (school_id,))
        settings = cursor.fetchone()
        
        if settings:
            # Helper to convert timedelta to string if needed
            def format_time(t):
                if not t: return "00:00:00"
                if hasattr(t, 'total_seconds'):
                    s = int(t.total_seconds())
                    hours, remainder = divmod(s, 3600)
                    minutes, seconds = divmod(remainder, 60)
                    return f"{hours:02}:{minutes:02}:{seconds:02}"
                return str(t)
            
            return {
                "attendance_start_time": format_time(settings.get('attendance_start_time', '08:00:00')),
                "attendance_end_time": format_time(settings.get('attendance_end_time', '09:00:00')),
                "school_end_time": format_time(settings.get('school_end_time', '15:00:00'))
            }
        else:
            return {
                "attendance_start_time": "08:00:00",
                "attendance_end_time": "09:00:00",
                "school_end_time": "15:00:00"
            }
    finally:
        cursor.close()
        conn.close()

@router.post("/timings")
def update_timings(settings: TimingSettings, current_user: dict = Depends(auth.require_admin)):
    school_id = current_user.get('school_id')
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID missing")
        
    conn = database.create_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        
        # Check if settings exist for this school
        cursor.execute("SELECT school_id FROM school_settings WHERE school_id = %s", (school_id,))
        exists = cursor.fetchone()
        
        if exists:
            cursor.execute("""
                UPDATE school_settings 
                SET attendance_start_time = %s, attendance_end_time = %s, school_end_time = %s
                WHERE school_id = %s
            """, (settings.attendance_start_time, settings.attendance_end_time, settings.school_end_time, school_id))
        else:
            cursor.execute("""
                INSERT INTO school_settings (school_id, attendance_start_time, attendance_end_time, school_end_time)
                VALUES (%s, %s, %s, %s)
            """, (school_id, settings.attendance_start_time, settings.attendance_end_time, settings.school_end_time))
            
        conn.commit()
        return {"message": "Timings updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating timings: {str(e)}")
    finally:
        cursor.close()
        conn.close()
