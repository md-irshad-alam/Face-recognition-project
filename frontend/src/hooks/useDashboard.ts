'use client'

import { api } from '@/services/api'
import { useState, useEffect, useCallback } from 'react'


export interface DashboardStats {
  total: number
  present: number
  absent: number
  teachers: number
  exams: number
}

export interface RecentExam {
  id: number
  name: string
  date: string
  time: string
  duration: number
  exam_type: string
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [exams, setExams] = useState<RecentExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, examsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/exams')
      ])
      
      setStats(statsRes.data)
      setExams(examsRes.data.slice(0, 5)) // Show top 5
      setError(null)
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
      setError("Failed to synchronize institutional pulse data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return { stats, exams, loading, error, refresh: fetchDashboardData }
}
