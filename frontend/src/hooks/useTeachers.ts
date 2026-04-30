import { useState, useCallback } from 'react'
import { api } from '@/services/api'

export interface Teacher {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: string
  specialization?: string
  highest_education?: string
  years_of_experience?: number
  role?: string
  status?: 'active' | 'on_leave' | 'inactive'
  photo_url?: string
  assigned_classes?: string[]
  created_at?: string
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Teacher[]>('/teachers/')
      setTeachers(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTeacher = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/teachers/${id}`)
      return true
    } catch {
      return false
    }
  }

  const createTeacher = async (payload: FormData | Record<string, any>): Promise<boolean> => {
    try {
      if (payload instanceof FormData) {
        await api.postForm('/teachers/', payload)
      } else {
        // Convert object to FormData because institutional backend expects multipart/form-data
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            fd.append(key, String(value));
          }
        });
        await api.postForm('/teachers/', fd)
      }
      return true
    } catch (err) {
      console.error("Teacher creation error:", err);
      return false
    }
  }

  const updateTeacher = async (id: string, payload: FormData | Record<string, any>): Promise<boolean> => {
    try {
      if (payload instanceof FormData) {
        await api.put(`/teachers/${id}`, payload)
      } else {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            fd.append(key, String(value));
          }
        });
        await api.put(`/teachers/${id}`, fd)
      }
      return true
    } catch (err) {
      console.error("Teacher update error:", err);
      return false
    }
  }

  return { teachers, loading, error, fetchTeachers, deleteTeacher, createTeacher, updateTeacher }
}
