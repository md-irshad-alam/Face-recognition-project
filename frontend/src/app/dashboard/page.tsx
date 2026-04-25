'use client'

import React, { useState } from 'react';
import { 
  RiGroupLine, 
  RiUserFollowLine, 
  RiHandCoinLine, 
  RiErrorWarningLine,
  RiMoneyDollarCircleLine,
  RiHospitalLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
  RiPresentationFill,
} from 'react-icons/ri';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title as ChartTitle, 
  Tooltip, 
  Legend, 
  ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { useDashboard } from '@/hooks/useDashboard';
import { api } from '@/services/api';
import Modal from '@/components/ui/Modal';
import * as SC from './dashboard.sc';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Register ChartJS
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ChartTitle, 
  Tooltip, 
  Legend, 
  ArcElement
);

export default function DashboardPage() {
  const { stats, exams, loading } = useDashboard();
  const queryClient = useQueryClient();
  const [showBarGraph, setShowBarGraph] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch Pending Leaves
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['admin', 'pending-leaves'],
    queryFn: async () => {
      const res = await api.get<any[]>('/admin/pending-leaves');
      return res;
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

  // Chart Data: Attendance Trends (Line)
  const trendsData = {
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    datasets: [{
      label: 'Attendance',
      data: [92, 95, 96.8, 94, 98, 96],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#4F46E5',
      pointBorderWidth: 1.5,
    }]
  };

  // Chart Data: Attendance by Class (Bar)
  const barData = {
    labels: ['10-A', '10-B', '9-A', '9-B', '8-A', '7-A'],
    datasets: [{
      label: 'Present',
      data: [38, 32, 45, 29, 41, 36],
      backgroundColor: '#4F46E5',
      borderRadius: 6,
      barThickness: 16
    }]
  };

  // Chart Data: Fee Analytics (Doughnut)
  const feeData = {
    labels: ['Collected', 'Pending'],
    datasets: [{
      data: [82, 18],
      backgroundColor: ['#4F46E5', '#F1F5F9'],
      borderWidth: 0,
      hoverOffset: 4,
      cutout: '84%'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 8,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      y: { display: false },
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { weight: '800' as const, size: 9 } } }
    }
  };

  if (loading && !stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Synchronizing institutional pulse...</div>;

  return (
    <SC.DashboardWrapper>
      {/* Hero Section */}
      <SC.HeroSection>
        <SC.PageTitle>Dashboard</SC.PageTitle>
        <SC.PageSubtitle>Academy's real-time trajectory at a glance.</SC.PageSubtitle>
      </SC.HeroSection>

      {/* Stats Grid */}
      <SC.StatsGrid>
        <SC.StatCard>
          <SC.StatHeader>
            <SC.StatIcon $bg="#EEF2FF" $color="#4F46E5"><RiGroupLine /></SC.StatIcon>
            <SC.StatBadge $type="success">Live</SC.StatBadge>
          </SC.StatHeader>
          <SC.StatContent>
            <SC.StatLabel>Total Students</SC.StatLabel>
            <SC.StatValue>{stats?.total ?? '...'}</SC.StatValue>
          </SC.StatContent>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatHeader>
            <SC.StatIcon $bg="#ECFDF5" $color="#10B981"><RiUserFollowLine /></SC.StatIcon>
            <SC.StatBadge $type="info">{stats ? Math.round((stats.present / stats.total) * 100) : '--'}%</SC.StatBadge>
          </SC.StatHeader>
          <SC.StatContent>
            <SC.StatLabel>Present Today</SC.StatLabel>
            <SC.StatValue>{stats?.present ?? '...'}</SC.StatValue>
          </SC.StatContent>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatHeader>
            <SC.StatIcon $bg="#FFF5F5" $color="#EF4444"><RiHandCoinLine /></SC.StatIcon>
            <SC.StatBadge $type="danger">Alert</SC.StatBadge>
          </SC.StatHeader>
          <SC.StatContent>
            <SC.StatLabel>Absent Students</SC.StatLabel>
            <SC.StatValue>{stats?.absent ?? '...'}</SC.StatValue>
          </SC.StatContent>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatHeader>
            <SC.StatIcon $bg="#F5F3FF" $color="#7C3AED"><RiPresentationFill /></SC.StatIcon>
            <SC.StatBadge $type="success">Active</SC.StatBadge>
          </SC.StatHeader>
          <SC.StatContent>
            <SC.StatLabel>Live Attendance</SC.StatLabel>
            <SC.StatValue>{stats?.present ?? '0'}</SC.StatValue>
          </SC.StatContent>
        </SC.StatCard>
      </SC.StatsGrid>

      {/* Middle Section: Trends & Alerts */}
      <SC.ChartRow>
        <SC.ChartCard>
          <SC.CardHeader>
            <SC.TrendsHeader>
              <SC.CardTitle>Attendance Trends</SC.CardTitle>
              <SC.CardSubtitle>Institutional flow analysis</SC.CardSubtitle>
            </SC.TrendsHeader>
            <SC.ToggleGroup>
              <SC.ToggleBtn $active={!showBarGraph} onClick={() => setShowBarGraph(false)}>Trends</SC.ToggleBtn>
              <SC.ToggleBtn $active={showBarGraph} onClick={() => setShowBarGraph(true)}>Class</SC.ToggleBtn>
            </SC.ToggleGroup>
          </SC.CardHeader>
          <div style={{ height: '220px' }}>
            {showBarGraph ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <Line data={trendsData} options={chartOptions} />
            )}
          </div>
        </SC.ChartCard>

          <SC.AlertsCard>
            <div className="alert-header">
              <h2>Critical Alerts</h2>
              {pendingLeaves.length > 0 && <p>{pendingLeaves.length} items require attention</p>}
            </div>
            
            {pendingLeaves.length > 0 && (
              <SC.AlertItem>
                <div className="icon-box" style={{ color: '#4F46E5', background: '#EEF2FF' }}><RiCalendarEventLine /></div>
                <div className="content">
                  <h4>Faculty Leave Requests</h4>
                  <p>{pendingLeaves.length} teachers have applied for leave.</p>
                </div>
              </SC.AlertItem>
            )}

            <SC.AlertItem>
              <div className="icon-box"><RiErrorWarningLine /></div>
              <div className="content">
                <h4>Attendance Warning</h4>
                <p>Class 10-B: 6 students absent today.</p>
              </div>
            </SC.AlertItem>

            <SC.ReviewBtn onClick={() => setShowReviewModal(true)}>Review All</SC.ReviewBtn>
          </SC.AlertsCard>
      </SC.ChartRow>

      {/* Bottom Section: Fee Analytics & Schedule Exam */}
      <SC.BottomRow>
        <SC.ChartCard>
          <SC.CardTitle>Fee Analytics</SC.CardTitle>
          <SC.DonutWrapper>
            <Doughnut data={feeData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            <SC.DonutCenter>
              <h2>82%</h2>
              <span>Collected</span>
            </SC.DonutCenter>
          </SC.DonutWrapper>
          <SC.LegendList>
            <SC.LegendItem>
              <SC.LegendLabel $color="#4F46E5">Collected</SC.LegendLabel>
              <SC.LegendValue>$42.5k</SC.LegendValue>
            </SC.LegendItem>
            <SC.LegendItem>
              <SC.LegendLabel $color="#F1F5F9">Pending</SC.LegendLabel>
              <SC.LegendValue>$8.2k</SC.LegendValue>
            </SC.LegendItem>
          </SC.LegendList>
        </SC.ChartCard>

        <SC.ChartCard>
          <SC.SectionTitleBox>
            <SC.CardTitle>Fee Distribution</SC.CardTitle>
            <p style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Monthly fee status overview</p>
          </SC.SectionTitleBox>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', marginTop: '24px', padding: '0 12px' }}>
            {[
              { month: 'Jan', value: 45 },
              { month: 'Feb', value: 55 },
              { month: 'Mar', value: 75 },
              { month: 'Apr', value: 85 },
              { month: 'May', value: 95 },
              { month: 'Jun', value: 70 },
            ].map((data) => (
              <div key={data.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '20px', height: '120px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${data.value}%`, background: '#4F46E5', borderRadius: '10px' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8' }}>{data.month}</span>
              </div>
            ))}
          </div>
        </SC.ChartCard>
      </SC.BottomRow>
      <Modal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
        title="Institutional Alerts & Approvals"
        width="600px"
      >
        <SC.ModalAlertList>
          {pendingLeaves.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>No pending approvals at this time.</p>
          ) : (
            pendingLeaves.map((leave: any) => (
              <SC.ModalAlertItem key={leave.id}>
                <SC.AlertInfo>
                  <h4>{leave.first_name} {leave.last_name}</h4>
                  <p>{leave.leave_type.toUpperCase()} LEAVE • {leave.start_date} {leave.end_date ? `- ${leave.end_date}` : ''}</p>
                  <span className="meta">{leave.department} • Applied on {leave.applied_at.split(' ')[0]}</span>
                  {leave.reason && <p style={{ fontStyle: 'italic', marginTop: 4 }}>"{leave.reason}"</p>}
                </SC.AlertInfo>
                <SC.ActionGroup>
                  <SC.ActionBtn $variant="reject" onClick={() => handleLeaveAction(leave.id, 'REJECTED')}>Reject</SC.ActionBtn>
                  <SC.ActionBtn $variant="approve" onClick={() => handleLeaveAction(leave.id, 'APPROVED')}>Approve</SC.ActionBtn>
                </SC.ActionGroup>
              </SC.ModalAlertItem>
            ))
          )}
        </SC.ModalAlertList>
      </Modal>
    </SC.DashboardWrapper>
  );
}
