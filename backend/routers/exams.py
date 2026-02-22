from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
import database
from models import ExamCreate, ExamResponse, QuestionCreate, QuestionSchema

router = APIRouter()

@router.post("/exams", response_model=ExamResponse)
async def create_exam(exam: ExamCreate):
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        INSERT INTO exams (name, date, time, duration, schedule_type, exam_type, proctor_base, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            exam.name,
            exam.date,
            exam.time,
            exam.duration,
            exam.schedule_type,
            exam.exam_type,
            exam.proctor_base,
            exam.description
        )
        cursor.execute(query, values)
        conn.commit()
        exam_id = cursor.lastrowid
        
        # Return the created exam with ID
        return {**exam.model_dump(), "id": exam_id, "created_at": None} # created_at is handled by DB defaults, simplified return
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/exams", response_model=List[ExamResponse])
async def get_exams():
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM exams ORDER BY date ASC, time ASC"
        cursor.execute(query)
        exams = cursor.fetchall()
        # Convert proctor_base from 0/1 to boolean if needed, or pydantic handles it
        return exams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# --- Question Management ---
from fastapi import UploadFile, File
import pandas as pd
import io

@router.post("/exams/parse-file")
async def parse_questions_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or Excel.")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Normalize headers
        df.columns = [str(c).lower().strip().replace(' ', '_') for c in df.columns]
        
        required_cols = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing)}")
            
        valid_rows = []
        invalid_rows = []
        
        for index, row in df.iterrows():
            try:
                # Basic validation
                if pd.isna(row['question']) or pd.isna(row['correct_option']):
                     raise ValueError("Missing required fields")
                     
                q = {
                    "question": str(row['question']),
                    "option_a": str(row['option_a']),
                    "option_b": str(row['option_b']),
                    "option_c": str(row['option_c']),
                    "option_d": str(row['option_d']),
                    "correct_option": str(row['correct_option']).upper().strip(),
                    "marks": int(row.get('marks', 1)),
                    "explanation": str(row.get('explanation', '')) if not pd.isna(row.get('explanation')) else None
                }
                
                if q['correct_option'] not in ['A', 'B', 'C', 'D']:
                     raise ValueError("Correct option must be A, B, C, or D")
                     
                valid_rows.append(q)
            except Exception as e:
                # Convert row to dict and handle NaN for JSON serialization
                row_dict = row.to_dict()
                clean_row = {k: (None if pd.isna(v) else v) for k, v in row_dict.items()}
                invalid_rows.append({"row": index + 2, "error": str(e), "data": clean_row})
                
        return {"valid": valid_rows, "invalid": invalid_rows}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing file: {str(e)}")

@router.post("/exams/{exam_id}/questions")
async def bulk_create_questions(exam_id: int, questions: List[QuestionCreate]):
    conn = database.create_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_option, marks, explanation)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = [
            (exam_id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.marks, q.explanation)
            for q in questions
        ]
        cursor.executemany(query, values)
        conn.commit()
        return {"message": f"Successfully added {len(questions)} questions"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/exams/{exam_id}/questions", response_model=List[QuestionSchema])
async def get_exam_questions(exam_id: int):
    conn = database.create_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM questions WHERE exam_id = %s", (exam_id,))
        return cursor.fetchall()
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
