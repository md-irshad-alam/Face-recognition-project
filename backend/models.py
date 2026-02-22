from pydantic import BaseModel
from datetime import date, datetime

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_email: str

class ExamCreate(BaseModel):
    name: str
    date: date  # YYYY-MM-DD
    time: str  # HH:MM
    duration: int # minutes
    schedule_type: str # Fixed, Flexi, etc.
    exam_type: str # Objective, Subjective
    proctor_base: bool
    description: str | None = None

class ExamResponse(ExamCreate):
    id: int
    created_at: datetime | None = None

class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str # A, B, C, D
    marks: int = 1
    explanation: str | None = None

class QuestionSchema(QuestionCreate):
    id: int
    exam_id: int
    created_at: datetime | None = None

class StudentCreate(BaseModel):
    id: str
    name: str
    program: str
    section: str
    email: str
    phone: str
