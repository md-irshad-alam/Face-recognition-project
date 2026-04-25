from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File, Query
import database
import auth
from models import TeacherResponse
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter(
    prefix="/teachers",
    tags=["teachers"],
    dependencies=[Depends(auth.require_admin)]
)

@router.post("/", response_model=TeacherResponse)
async def add_teacher(
    id: str                      = Form(...),
    first_name: str              = Form(...),
    last_name: str               = Form(...),
    email: str                   = Form(...),
    phone: str                   = Form(...),
    highest_education: str       = Form(...),
    years_of_experience: int     = Form(...),
    specialization: str          = Form(...),
    department: Optional[str]    = Form(None),
    role: Optional[str]          = Form('teacher'),
    bio: Optional[str]           = Form(None),
    office_days: str             = Form(''),
    office_time: str             = Form(''),
    assigned_classes: str        = Form('[]'),
    notifications: str           = Form('[]'),
    photo: UploadFile            = File(None),
):
    try:
        existing = database.get_teacher_by_id(id)
        if existing:
            raise HTTPException(status_code=400, detail="Teacher ID already exists")

        photo_url = None
        if photo:
            if not photo.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

            os.makedirs("static/teachers", exist_ok=True)
            file_extension = os.path.splitext(photo.filename)[1]
            photo_filename = f"t_{id}{file_extension}"
            photo_path = f"static/teachers/{photo_filename}"

            try:
                img = Image.open(photo.file)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                max_width = 800
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.LANCZOS)
                img.save(photo_path, quality=85, optimize=True)
                photo_url = f"/static/teachers/{photo_filename}"
            except Exception as e:
                print(f"Error processing image: {e}")
                raise HTTPException(status_code=500, detail="Failed to process image")

        teacher_data = {
            "id": id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "highest_education": highest_education,
            "years_of_experience": years_of_experience,
            "specialization": specialization,
            "department": department or specialization,
            "photo_url": photo_url,
            "bio": bio,
            "office_days": office_days,
            "office_time": office_time,
            "assigned_classes": assigned_classes,
            "notifications": notifications,
        }

        success = database.create_teacher(teacher_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add teacher to DB")

        # Create user account with the supplied role
        resolved_role = role if role in ('admin', 'teacher', 'hod', 'lecturer') else 'teacher'
        hashed_pwd = auth.get_password_hash(id)
        auth.create_user(email, hashed_pwd, f"{first_name} {last_name}", role=resolved_role)

        return database.get_teacher_by_id(id)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[TeacherResponse])
def get_teachers():
    return database.get_all_teachers()


@router.get("/stats")
def get_teacher_stats():
    """Aggregated stats for the Faculty Directory header cards."""
    teachers  = database.get_all_teachers()
    total     = len(teachers)
    phd       = sum(1 for t in teachers if t.get('is_phd') or
                    (t.get('highest_education') or '').lower().startswith('phd'))
    on_leave  = sum(1 for t in teachers if t.get('status') == 'on_leave')
    depts     = len({t.get('department') or t.get('specialization') for t in teachers if
                     t.get('department') or t.get('specialization')})
    return {
        "total_faculty": total,
        "departments":   depts,
        "phd_certified": phd,
        "on_leave_today": on_leave,
        "phd_pct": f"{round(phd / total * 100)}% of total faculty" if total else "N/A",
    }


@router.put("/{teacher_id}")
async def update_teacher(
    teacher_id: str,
    first_name: Optional[str]          = Form(None),
    last_name: Optional[str]           = Form(None),
    email: Optional[str]               = Form(None),
    phone: Optional[str]               = Form(None),
    highest_education: Optional[str]   = Form(None),
    years_of_experience: Optional[int] = Form(None),
    specialization: Optional[str]      = Form(None),
    department: Optional[str]          = Form(None),
    role: Optional[str]                = Form(None),
    status: Optional[str]              = Form(None),
    office_days: Optional[str]         = Form(None),
    office_time: Optional[str]         = Form(None),
    assigned_classes: Optional[str]    = Form(None),
    notifications: Optional[str]       = Form(None),
    photo: UploadFile                  = File(None),
):
    teacher = database.get_teacher_by_id(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    photo_url = None
    if photo and photo.filename:
        if not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid file type.")
        os.makedirs("static/teachers", exist_ok=True)
        ext      = os.path.splitext(photo.filename)[1]
        filename = f"t_{teacher_id}{ext}"
        path     = f"static/teachers/{filename}"
        try:
            img = Image.open(photo.file)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            if img.width > 800:
                ratio      = 800 / img.width
                new_height = int(img.height * ratio)
                img = img.resize((800, new_height), Image.LANCZOS)
            img.save(path, quality=85, optimize=True)
            photo_url = f"/static/teachers/{filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to process image")

    update_data: dict = {}
    if first_name:          update_data['first_name']          = first_name
    if last_name:           update_data['last_name']           = last_name
    if email:               update_data['email']               = email
    if phone:               update_data['phone']               = phone
    if highest_education:   update_data['highest_education']   = highest_education
    if years_of_experience: update_data['years_of_experience'] = years_of_experience
    if specialization:      update_data['specialization']      = specialization
    if department:          update_data['department']          = department
    if status:              update_data['status']              = status
    if office_days:         update_data['office_days']         = office_days
    if office_time:         update_data['office_time']         = office_time
    if assigned_classes:    update_data['assigned_classes']    = assigned_classes
    if notifications:       update_data['notifications']       = notifications
    if photo_url:           update_data['photo_url']           = photo_url

    database.update_teacher(teacher_id, update_data)

    # Also update role in users table if supplied
    if role:
        target_email = email or teacher.get('email')
        if target_email:
            database.update_teacher_role(target_email, role)

    return {"message": "Teacher updated successfully"}


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: str):
    success = database.delete_teacher(teacher_id)
    if not success:
        raise HTTPException(status_code=404, detail="Teacher not found or failed to delete")
    return {"message": "Teacher deleted successfully"}


class RoleUpdate(BaseModel):
    role: str

@router.put("/{teacher_id}/role")
def update_teacher_role(teacher_id: str, role_data: RoleUpdate):
    teacher = database.get_teacher_by_id(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    valid_roles = ["admin", "teacher", "hod", "lecturer", "user"]
    if role_data.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    success = database.update_teacher_role(teacher.get('email'), role_data.role)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update teacher role")

    return {"message": f"Successfully updated role to {role_data.role}"}
