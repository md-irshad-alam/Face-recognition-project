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
    try {
      const [statsRes, examsRes] = await Promise.all([
        api.get<DashboardStats>('/stats'),
        api.get<{ exams: RecentExam[] }>('/exams')
      ])
      
      // Handle different response formats (backend might return {data: ...} or direct object)
      const statsData = (statsRes as any).data || statsRes;
      const examsData = (examsRes as any).data?.exams || (examsRes as any).exams || [];
      
      setStats(statsData)
      setExams(Array.isArray(examsData) ? examsData.slice(0, 5) : [])
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
    // Auto-refresh every 30 seconds for live pulse
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  return { stats, exams, loading, error, refresh: fetchDashboardData }
}
