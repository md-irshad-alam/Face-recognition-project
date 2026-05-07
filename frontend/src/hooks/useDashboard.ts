'use client'

import { api } from '@/services/api'
import { useState, useEffect, useCallback } from 'react'


export interface DashboardStats {
  total: number
  present: number
  absent: number
  teachers: number
  exams: number
  attendance_trend: number[]
  student_trend: number[]
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

export interface DashboardSummary {
  stats: DashboardStats
  fees: FeeStats
  exams: RecentExam[]
  pending_leaves: number
  at_risk_count: number
  pending_promotions: number
}

export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      const summary = await api.get<DashboardSummary>('/summary')
      setData(summary)
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

  return { 
    stats: data?.stats || null, 
    feeStats: data?.fees || null, 
    exams: data?.exams || [], 
    counts: {
      leaves: data?.pending_leaves || 0,
      atRisk: data?.at_risk_count || 0,
      promotions: data?.pending_promotions || 0
    },
    loading, 
    error, 
    refresh: fetchDashboardData 
  }
}
