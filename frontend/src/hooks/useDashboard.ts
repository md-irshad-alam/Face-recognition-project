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

export interface FeeStats {
  collected: number
  outstanding: number
  rate: number
  monthly: { month: string; value: number }[]
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
  const [feeStats, setFeeStats] = useState<FeeStats | null>(null)
  const [exams, setExams] = useState<RecentExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, examsRes, feeStatsRes] = await Promise.all([
        api.get<DashboardStats>('/stats'),
        api.get<{ exams: RecentExam[] }>('/exams'),
        api.get<FeeStats>('/fees/stats')
      ])
      
      // Handle different response formats
      const statsData = (statsRes as any).data || statsRes;
      const examsData = (examsRes as any).data?.exams || (examsRes as any).exams || [];
      const feeData = (feeStatsRes as any).data || feeStatsRes;
      
      setStats(statsData)
      setExams(Array.isArray(examsData) ? examsData.slice(0, 5) : [])
      setFeeStats(feeData)
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
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  return { stats, feeStats, exams, loading, error, refresh: fetchDashboardData }
}
