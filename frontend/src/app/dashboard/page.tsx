'use client'

import React, { useState, useMemo } from 'react';
import { 
  RiGroupLine, RiUserStarLine, RiTimerLine, RiCalendarCheckLine,
  RiArrowUpSLine, RiArrowDownSLine, RiAddLine, RiDownloadLine,
  RiErrorWarningLine, RiCalendarEventLine, RiCheckLine, RiCloseLine
} from 'react-icons/ri';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, Title as ChartTitle, Tooltip, 
  Legend, ArcElement, Filler
} from 'chart.js';
// @ts-ignore
import { Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { useDashboard } from '@/hooks/useDashboard';
import { api } from '@/services/api';
import Modal from '@/components/ui/Modal';
import * as SC from './dashboard.sc';
import { useQuery, useQueryClient } from '@tanstack/react-query';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ChartTitle, Tooltip, Legend, ArcElement, Filler
);

export default function DashboardPage() {
  const { stats, exams, loading } = useDashboard();
  const queryClient = useQueryClient();
  const [activeTrendTab, setActiveTrendTab] = useState<'daily' | 'weekly'>('daily');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch Pending Leaves
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['admin', 'pending-leaves'],
    queryFn: async () => {
      try {
        const res = await api.get<any[]>('/admin/pending-leaves');
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error("Failed to fetch pending leaves:", err);
        return [];
      }
    }
  });

  const handleLeaveAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/admin/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-leaves'] });
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  // Dynamic vs Dummy Logic
  const displayStats = useMemo(() => ({
    total: stats?.total ?? 1250, // Dummy fallback
    present: stats?.present ?? 1182,
    absent: stats?.absent ?? 68,
    teachers: stats?.teachers ?? 84,
    presentRate: stats ? Math.round((stats.present / stats.total) * 100) : 94,
    isDummy: !stats
  }), [stats]);

  const trendsData = {
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    datasets: [{
      label: 'Attendance %',
      data: [92, 95, 98, 94, 96, 95],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#4F46E5',
      pointBorderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      y: { display: false, min: 80, max: 100 },
      x: { 
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { weight: '700', size: 10 } }
      }
    }
  };

  const feeData = {
    labels: ['Collected', 'Pending'],
    datasets: [{
      data: [ displayStats.isDummy ? 85 : 78, displayStats.isDummy ? 15 : 22 ],
      backgroundColor: ['#4F46E5', '#F1F5F9'],
      borderWidth: 0,
      cutout: '80%',
      borderRadius: 20
    }]
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <SC.DashboardWrapper>
      <SC.WelcomeSection>
        <SC.Greeting>
          <h1>Dashboard</h1>
          <p>Academy's real-time trajectory at a glance.</p>
        </SC.Greeting>
      </SC.WelcomeSection>

      <SC.StatsGrid>
        <SC.StatCard>
          <SC.StatIconBox $color="#4F46E5"><RiGroupLine /></SC.StatIconBox>
          <SC.StatInfo>
            <label>Total Students</label>
            <h2>{displayStats.total}</h2>
            <SC.TrendBadge $up={true}><RiArrowUpSLine /> Live</SC.TrendBadge>
          </SC.StatInfo>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatIconBox $color="#10B981"><RiCalendarCheckLine /></SC.StatIconBox>
          <SC.StatInfo>
            <label>Present Today</label>
            <h2>{displayStats.present}</h2>
            <SC.TrendBadge $up={true}><RiArrowUpSLine /> {displayStats.presentRate}%</SC.TrendBadge>
          </SC.StatInfo>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatIconBox $color="#EF4444"><RiErrorWarningLine /></SC.StatIconBox>
          <SC.StatInfo>
            <label>Absent Students</label>
            <h2>{displayStats.absent}</h2>
            <SC.TrendBadge $up={displayStats.absent > 10}><RiArrowDownSLine /> Alert</SC.TrendBadge>
          </SC.StatInfo>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatIconBox $color="#7C3AED"><RiTimerLine /></SC.StatIconBox>
          <SC.StatInfo>
            <label>Live Attendance</label>
            <h2>{displayStats.present}</h2>
            <SC.TrendBadge $up={true}><RiArrowUpSLine /> Active</SC.TrendBadge>
          </SC.StatInfo>
        </SC.StatCard>
      </SC.StatsGrid>

      <SC.MainContent>
        <SC.Card>
          <SC.CardHeader>
            <div className="title-area">
              <h3>Attendance Trajectory</h3>
              <p>Real-time institutional participation tracking.</p>
            </div>
            <SC.ToggleGroup>
              <SC.ToggleButton $active={activeTrendTab === 'daily'} onClick={() => setActiveTrendTab('daily')}>Daily</SC.ToggleButton>
              <SC.ToggleButton $active={activeTrendTab === 'weekly'} onClick={() => setActiveTrendTab('weekly')}>Weekly</SC.ToggleButton>
            </SC.ToggleGroup>
          </SC.CardHeader>
          <div style={{ height: '280px', marginTop: '20px' }}>
            <Line data={trendsData} options={chartOptions} />
          </div>
        </SC.Card>

        <SC.Card>
          <SC.CardHeader>
            <div className="title-area">
              <h3>Critical Alerts</h3>
              <p>Items requiring immediate attention.</p>
            </div>
          </SC.CardHeader>
          <SC.AlertsContainer>
            {pendingLeaves.length > 0 && (
              <SC.AlertItem $type="info" onClick={() => setShowReviewModal(true)} style={{ cursor: 'pointer' }}>
                <div className="icon-box"><RiCalendarEventLine /></div>
                <div className="content">
                  <h4>Faculty Leave Requests</h4>
                  <p>{pendingLeaves.length} teachers waiting for approval.</p>
                </div>
              </SC.AlertItem>
            )}
            <SC.AlertItem $type="warning">
              <div className="icon-box"><RiErrorWarningLine /></div>
              <div className="content">
                <h4>System Sync Alert</h4>
                <p>Biometric node 'Terminal-04' reported high latency.</p>
              </div>
            </SC.AlertItem>
            <SC.AlertItem $type="danger">
              <div className="icon-box"><RiErrorWarningLine /></div>
              <div className="content">
                <h4>Absence Outlier</h4>
                <p>Grade 10-A shows 15% drop in attendance today.</p>
              </div>
            </SC.AlertItem>
          </SC.AlertsContainer>
          <SC.ActionButton $variant="primary" onClick={() => setShowReviewModal(true)} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            Review All Actions
          </SC.ActionButton>
        </SC.Card>
      </SC.MainContent>

      <SC.AnalyticsGrid>
        <SC.Card>
          <SC.CardHeader>
            <div className="title-area">
              <h3>Financial Pulse</h3>
              <p>Monthly fee collection efficiency.</p>
            </div>
          </SC.CardHeader>
          <SC.FeeDonutWrapper>
            <Doughnut data={feeData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            <SC.DonutCenter>
              <h2>{displayStats.isDummy ? 85 : 78}%</h2>
              <span>Collected</span>
            </SC.DonutCenter>
          </SC.FeeDonutWrapper>
          <SC.LegendContainer>
            <SC.LegendItem color="#4F46E5">
              <span className="label">Total Collected</span>
              <span className="value">₹{displayStats.isDummy ? '4.2L' : '3.8L'}</span>
            </SC.LegendItem>
            <SC.LegendItem color="#F1F5F9">
              <span className="label">Outstanding</span>
              <span className="value">₹{displayStats.isDummy ? '82K' : '1.2L'}</span>
            </SC.LegendItem>
          </SC.LegendContainer>
        </SC.Card>

        <SC.Card>
          <SC.CardHeader>
            <div className="title-area">
              <h3>Fee Distribution</h3>
              <p>Monthly fee status overview</p>
            </div>
          </SC.CardHeader>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between', 
            height: '200px', 
            marginTop: '24px', 
            padding: '0 12px' 
          }}>
            {[
              { month: 'Jan', value: 45 },
              { month: 'Feb', value: 55 },
              { month: 'Mar', value: 75 },
              { month: 'Apr', value: 85 },
              { month: 'May', value: 95 },
              { month: 'Jun', value: 70 },
            ].map((data) => (
              <div key={data.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ 
                  width: '24px', 
                  height: '140px', 
                  background: '#F1F5F9', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  position: 'relative',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: `${data.value}%`, 
                    background: 'linear-gradient(to top, #4F46E5, #6366F1)', 
                    borderRadius: '10px',
                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8' }}>{data.month}</span>
              </div>
            ))}
          </div>
        </SC.Card>
      </SC.AnalyticsGrid>

      <Modal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
        title="Institutional Approvals"
        width="600px"
      >
        <SC.ModalAlertList>
          {pendingLeaves.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748B' }}>No pending approvals at this time.</p>
          ) : (
            pendingLeaves.map((leave: any) => (
              <SC.ModalAlertItem key={leave.id}>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#1E293B', margin: 0 }}>{leave.first_name} {leave.last_name}</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0' }}>
                    {leave.leave_type} Leave • {leave.start_date}
                  </p>
                </div>
                <SC.ActionGroup>
                  <SC.ActionBtn $variant="reject" onClick={() => handleLeaveAction(leave.id, 'REJECTED')}><RiCloseLine size={18} /></SC.ActionBtn>
                  <SC.ActionBtn $variant="approve" onClick={() => handleLeaveAction(leave.id, 'APPROVED')}><RiCheckLine size={18} /></SC.ActionBtn>
                </SC.ActionGroup>
              </SC.ModalAlertItem>
            ))
          )}
        </SC.ModalAlertList>
      </Modal>
    </SC.DashboardWrapper>
  );
}
