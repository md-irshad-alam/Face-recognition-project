from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user" 

class UserLogin(BaseModel):
    email: str
    password: str
    current_device: Optional[str] = None

class GoogleLogin(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_email: str
    role: str

class TeacherCreate(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: str
    email: str
    highest_education: str
    years_of_experience: int
    specialization: str
    department: Optional[str] = None
    bio: Optional[str] = None
    office_days: Optional[str] = None
    office_time: Optional[str] = None
    assigned_classes: Optional[str] = None # JSON string or comma-separated
    notifications: Optional[str] = None
    status: Optional[str] = 'active'
    is_phd: Optional[bool] = False
    photo_url: Optional[str] = None

class TeacherResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: str
    highest_education: Optional[str] = None
    years_of_experience: Optional[int] = None
    specialization: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = 'teacher'
    status: Optional[str] = 'active'
    is_phd: bool = False
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    assigned_classes: List[str] = []

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None

class ExamCreate(BaseModel):
    name: str
    date: date  
    time: str  
    duration: int 
    schedule_type: str 
    exam_type: str 
    proctor_base: bool
    description: Optional[str] = None

class ExamResponse(ExamCreate):
    id: int
    created_at: Optional[datetime] = None

class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str 
    marks: int = 1
    explanation: Optional[str] = None

class QuestionSchema(QuestionCreate):
    id: int
    exam_id: int
    created_at: Optional[datetime] = None

class StudentCreate(BaseModel):
    id: str
    name: str
    program: str
    section: str
    email: str
    phone: str

class ScanRequest(BaseModel):
    image: str
    device_id: str
    timestamp: str
    school_id: str
