import { useState, useCallback } from 'react'
import { api } from '@/services/api'

export interface Student {
  id: string
  name: string
  class_name: string
  section: string
  email: string
  phone: string
  parent_phone?: string
  dob?: string
  admission_date?: string
  photo_url?: string
  is_on_hold?: boolean
  student_type?: string
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Student[]>('/students')
      setStudents(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteStudent = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/students/${id}`)
      return true
    } catch {
      return false
    }
  }

  const createStudent = async (payload: FormData | Record<string, any>): Promise<boolean> => {
    try {
      if (payload instanceof FormData) {
        await api.postForm('/students', payload)
      } else {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            fd.append(key, String(value));
          }
        });
        await api.postForm('/students', fd)
      }
      return true
    } catch (err) {
      console.error("Student creation error:", err);
      return false
    }
  }

  const toggleHold = async (id: string, status: boolean): Promise<boolean> => {
    try {
      await api.put(`/students/${id}/hold?hold_status=${status}`, {})
      return true
    } catch {
      return false
    }
  }

  const updateStudent = async (id: string, payload: FormData | Record<string, any>): Promise<boolean> => {
    try {
      if (payload instanceof FormData) {
        await api.put(`/students/${id}`, payload)
      } else {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            fd.append(key, String(value));
          }
        });
        await api.put(`/students/${id}`, fd)
      }
      return true
    } catch (err) {
      console.error("Student update error:", err);
      return false
    }
  }

  return { students, loading, error, fetchStudents, deleteStudent, createStudent, toggleHold, updateStudent }
}
