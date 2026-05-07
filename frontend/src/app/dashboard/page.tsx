'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  RiGroupLine, RiUserStarLine, RiTimerLine, RiCalendarCheckLine,
  RiArrowUpSLine, RiArrowDownSLine, RiAlertLine, RiCheckLine, RiCloseLine,
  RiErrorWarningLine, RiShieldLine, RiCalendarEventLine, RiMedalLine,
  RiRefreshLine, RiArrowRightLine, RiLoader4Line,
  RiHistoryLine
} from 'react-icons/ri';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title as ChartTitle, Tooltip,
  Legend, ArcElement, Filler
} from 'chart.js';
// @ts-ignore
import { Line, Doughnut, Pie } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { useDashboard } from '@/hooks/useDashboard';
import { api } from '@/services/api';
import Modal from '@/components/ui/Modal';
import * as SC from './dashboard.sc';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTitle, Tooltip, Legend, ArcElement, Filler);

const FLAG_COLOR: Record<string, string> = {
  AT_RISK: '#EF4444', LOW_ATTENDANCE: '#F59E0B',
  CONSECUTIVE_ABSENT: '#F97316', SUDDEN_DROP: '#7C3AED'
};
const FLAG_LABEL: Record<string, string> = {
  AT_RISK: 'At Risk', LOW_ATTENDANCE: 'Low Attendance',
  CONSECUTIVE_ABSENT: 'Consecutive Absent', SUDDEN_DROP: 'Sudden Drop'
};

export default function DashboardPage() {
  const { stats, feeStats, counts, loading } = useDashboard();
  const { user } = useAuth();
  const isAdmin = ['admin', 'org_admin'].includes((user?.role || '').toLowerCase());
  const queryClient = useQueryClient();
  const [activeTrendTab, setActiveTrendTab] = useState<'daily' | 'weekly'>('daily');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  // Pending Leaves (Only for modal display)
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['admin', 'pending-leaves'],
    queryFn: async () => {
      try { const r = await api.get<any[]>('/admin/pending-leaves'); return Array.isArray(r) ? r : []; }
      catch { return []; }
    },
    enabled: showLeaveModal
  });

  // At-Risk Students
  const { data: atRiskStudents = [], refetch: refetchFlags } = useQuery({
    queryKey: ['monitoring', 'at-risk'],
    queryFn: async () => {
      try { const r = await api.get<any[]>('/monitoring/at-risk'); return Array.isArray(r) ? r : []; }
      catch { return []; }
    },
    enabled: isAdmin
  });

  // Pending Promotions (Only for modal display)
  const { data: pendingPromotions = [], refetch: refetchPromos } = useQuery({
    queryKey: ['promotions', 'pending'],
    queryFn: async () => {
      try { const r = await api.get<any[]>('/promotions/pending'); return Array.isArray(r) ? r : []; }
      catch { return []; }
    },
    enabled: showPromotionModal
  });

  const handleLeaveAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/admin/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-leaves'] });
    } catch (err: any) { toast.error(err.message || 'Action failed'); }
  };

  const handleResolveFlag = async (flagId: number) => {
    try {
      await api.patch(`/monitoring/flag/${flagId}/resolve`, {});
      toast.success('Flag resolved');
      refetchFlags();
    } catch { toast.error('Failed to resolve flag'); }
  };

  const handleRunCheck = async () => {
    setIsRunningCheck(true);
    try {
      await api.post('/monitoring/run-check', {});
      toast.success('Attendance analysis started. Refresh in a moment.');
      setTimeout(() => refetchFlags(), 3000);
    } catch { toast.error('Failed to run check'); }
    finally { setIsRunningCheck(false); }
  };

  const handleGeneratePromotions = async () => {
    setIsGeneratingPromo(true);
    try {
      const data = await api.post<any>('/promotions/generate', {});
      toast.success(data.message || 'Promotions generated');
      refetchPromos();
    } catch { toast.error('Failed to generate promotions'); }
    finally { setIsGeneratingPromo(false); }
  };

  const handleReviewPromotion = async (id: number, action: 'approve' | 'reject') => {
    try {
      await api.post('/promotions/review', { promotion_id: id, action });
      toast.success(`Promotion ${action}d`);
      refetchPromos();
    } catch { toast.error('Action failed'); }
  };

  const handleBulkApprove = async () => {
    try {
      const data = await api.post<any>('/promotions/bulk-approve', {});
      toast.success(data.message || 'All approved');
      refetchPromos();
    } catch { toast.error('Bulk approve failed'); }
  };

  const displayStats = useMemo(() => ({
    total: stats?.total ?? 0,
    present: stats?.present ?? 0,
    absent: stats?.absent ?? 0,
    teachers: stats?.teachers ?? 0,
    presentRate: (stats && stats.total > 0) ? Math.round((stats.present / stats.total) * 100) : 0,
    isDummy: !stats
  }), [stats]);

  // Sparkline Chart Config
  const getSparklineData = (trend: number[], current: number, color: string) => {
    // Ensure we have a trend and at least 2 points for a line to render
    let dataPoints = trend && trend.length > 1 ? [...trend] : [current * 0.8, current * 0.9, current];
    dataPoints[dataPoints.length - 1] = current;

    return {
      labels: dataPoints.map((_, i) => i),
      datasets: [{
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}15`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      }]
    };
  };

  const sparklineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        enabled: true,
        backgroundColor: '#0F172A',
        padding: 6,
        cornerRadius: 6,
        displayColors: false,
        titleFont: { size: 0 }, // Hide title
        bodyFont: { size: 10, weight: 'bold' }
      } 
    },
    scales: { x: { display: false }, y: { display: false } }
  };

  const trendsData = {
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    datasets: [{
      label: 'Attendance %',
      data: stats?.attendance_trend && stats.attendance_trend.length > 0 
        ? stats.attendance_trend.map(v => (v / (stats.total || 1)) * 100)
        : [92, 95, 98, 94, 96, 95],
      borderColor: '#4F46E5', backgroundColor: 'rgba(79,70,229,0.08)',
      fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
      pointBackgroundColor: '#fff', pointBorderColor: '#4F46E5', pointBorderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 10, displayColors: false,
        titleFont: { size: 13, weight: 'bold' }, bodyFont: { size: 12 } }
    },
    scales: {
      y: { grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { weight: '600', size: 10 } } }
    }
  };

  const pieData = useMemo(() => ({
    labels: ['Collected', 'Pending'],
    datasets: [{ 
      data: [feeStats?.collected ?? 0, feeStats?.outstanding ?? 0],
      backgroundColor: ['#4F46E5', '#E2E8F0'], 
      borderWidth: 0,
      hoverOffset: 4
    }]
  }), [feeStats]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  }, []);

  return (
    <SC.DashboardWrapper>
      {/* Header */}
      <SC.WelcomeSection>
        <SC.Greeting>
          <h1>Dashboard</h1>
          <p>Academy's real-time trajectory at a glance.</p>
        </SC.Greeting>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleRunCheck} disabled={isRunningCheck}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
              {isRunningCheck ? <RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> : <RiRefreshLine />}
              Run Attendance Check
            </button>
            <button onClick={() => setShowLeaveModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', color: '#7C3AED', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
              <RiCalendarEventLine /> Leave Requests {counts.leaves > 0 && `(${counts.leaves})`}
            </button>
            <button onClick={() => setShowPromotionModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#4F46E5', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
              <RiMedalLine /> Promotions {counts.promotions > 0 && `(${counts.promotions})`}
            </button>
          </div>
        )}
      </SC.WelcomeSection>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Stats Grid */}
      <SC.StatsGrid>
        <SC.StatCard>
          <SC.StatInfo>
            <label>Total Students</label>
            <h2>{displayStats.total}</h2>
          </SC.StatInfo>
          <div className="sparkline-box">
            <Line key={`student-${displayStats.total}`} data={getSparklineData(stats?.student_trend || [120, 135, 128, 140, 138, 144], displayStats.total, '#4F46E5')} options={sparklineOptions} />
          </div>
        </SC.StatCard>
        
        <SC.StatCard>
          <SC.StatInfo>
            <label>Present Today</label>
            <h2>{displayStats.present}</h2>
          </SC.StatInfo>
          <div className="sparkline-box">
            <Line key={`present-${displayStats.present}`} data={getSparklineData(stats?.attendance_trend || [110, 125, 118, 130, 128, 132], displayStats.present, '#10B981')} options={sparklineOptions} />
          </div>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatInfo>
            <label>Absent Today</label>
            <h2>{displayStats.absent}</h2>
          </SC.StatInfo>
          <div className="sparkline-box">
            <Line key={`absent-${displayStats.absent}`} data={getSparklineData([5, 8, 4, 10, 7, 6], displayStats.absent, '#EF4444')} options={sparklineOptions} />
          </div>
        </SC.StatCard>

        <SC.StatCard>
          <SC.StatInfo>
            <label>Total Teachers</label>
            <h2>{displayStats.teachers}</h2>
          </SC.StatInfo>
          <div className="sparkline-box">
            <Line key={`teachers-${displayStats.teachers}`} data={getSparklineData([80, 82, 81, 84, 83, 84], displayStats.teachers, '#7C3AED')} options={sparklineOptions} />
          </div>
        </SC.StatCard>
      </SC.StatsGrid>

      {/* Charts Row */}
      <SC.MainContent>
        <SC.Card>
          <SC.CardHeader>
            <div className="title-area">
              <h3>Attendance Trajectory</h3>
              <p>Weekly participation tracking</p>
            </div>
            <SC.ToggleGroup>
              <SC.ToggleButton $active={activeTrendTab === 'daily'} onClick={() => setActiveTrendTab('daily')}>Daily</SC.ToggleButton>
              <SC.ToggleButton $active={activeTrendTab === 'weekly'} onClick={() => setActiveTrendTab('weekly')}>Weekly</SC.ToggleButton>
            </SC.ToggleGroup>
          </SC.CardHeader>
          <div style={{ height: '280px', marginTop: '16px' }}>
            <Line data={trendsData} options={chartOptions} />
          </div>
        </SC.Card>

        <SC.Card>
          <SC.CardHeader>
            <div className="title-area">
              <h3>Financial Pulse</h3>
              <p>Monthly fee collection</p>
            </div>
          </SC.CardHeader>
          <SC.PieChartWrapper>
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </SC.PieChartWrapper>
          <SC.LegendContainer>
            <SC.LegendItem color="#4F46E5">
              <span className="label">Collected</span>
              <span className="value">₹{(feeStats?.collected ?? 0).toLocaleString()}</span>
            </SC.LegendItem>
            <SC.LegendItem color="#E2E8F0">
              <span className="label">Outstanding</span>
              <span className="value">₹{(feeStats?.outstanding ?? 0).toLocaleString()}</span>
            </SC.LegendItem>
          </SC.LegendContainer>
        </SC.Card>
      </SC.MainContent>

      {/* Flagged / At-Risk Students */}
      {isAdmin && (
        <SC.Card style={{ marginTop: 20 }}>
          <SC.CardHeader>
            <div className="title-area">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiShieldLine color="#EF4444" size={18} />
                Flagged / At-Risk Students
              </h3>
              <p>
                {atRiskStudents.length > 0
                  ? `${atRiskStudents.length} student${atRiskStudents.length > 1 ? 's' : ''} need attention`
                  : 'No active flags — all students attending normally'}
              </p>
            </div>
            <button onClick={handleRunCheck} disabled={isRunningCheck}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Poppins, Inter, sans-serif' }}>
              <RiRefreshLine size={14} /> Refresh
            </button>
          </SC.CardHeader>

          {atRiskStudents.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <RiShieldLine size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, fontFamily: 'Poppins, Inter, sans-serif' }}>All students are attending regularly</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, Inter, sans-serif' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Student', 'Class', 'Issue', 'Attendance %', 'Consecutive Days', 'Reason', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1E293B', fontSize: '0.8125rem' }}>{s.student_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#64748B' }}>{s.class_name} {s.section}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700, background: (FLAG_COLOR[s.flag_type] || '#EF4444') + '20', color: FLAG_COLOR[s.flag_type] || '#EF4444' }}>
                          {FLAG_LABEL[s.flag_type] || s.flag_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: parseFloat(s.attendance_pct) < 60 ? '#EF4444' : '#F59E0B', fontSize: '0.875rem' }}>
                        {s.attendance_pct}%
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#64748B' }}>
                        {s.consecutive_days > 0 ? `${s.consecutive_days} days` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748B', maxWidth: 200 }}>{s.reason}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleResolveFlag(s.id)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', color: '#10B981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Poppins, Inter, sans-serif' }}>
                          <RiCheckLine size={13} /> Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SC.Card>
      )}

      {/* Pending Leave Modal */}
      <Modal 
        isOpen={showLeaveModal} 
        onClose={() => setShowLeaveModal(false)} 
        title="Pending Leave Approvals"
        subtitle={`${pendingLeaves.length} REQUESTS REQUIRING ATTENTION`}
        icon={<RiCalendarEventLine size={24} />}
        width="620px"
        padding="32px"
      >
        <SC.ModalAlertList style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
          {pendingLeaves.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <RiCheckLine size={48} style={{ color: '#10B981', marginBottom: 12 }} />
              <p style={{ color: '#64748B', fontWeight: 600 }}>All caught up! No pending leave requests.</p>
            </div>
          ) : (
            pendingLeaves.map((leave: any) => {
              const startDate = new Date(leave.start_date);
              const endDate = new Date(leave.end_date || leave.start_date);
              const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
              
              const truncateReason = (str: string) => {
                if (!str) return '';
                const words = str.split(' ');
                if (words.length > 20) return words.slice(0, 20).join(' ') + '...';
                return str;
              };

              return (
                <SC.LeaveRequestCard key={leave.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SC.ProfileName>
                      <h4 style={{ fontWeight: 800, color: '#1E293B', width: '100%' }}>{leave.first_name} {leave.last_name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', marginRight: 8 }}> {diffDays} {diffDays > 1 ? 'DAYS' : 'DAY'} •</span>
                        <SC.LeaveTypeChip $type={leave.leave_type}>{leave.leave_type} Leave</SC.LeaveTypeChip>
                      </div>
                    </SC.ProfileName>

                    
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>
                      {startDate.toLocaleDateString('en-US', formatOptions)} - {endDate.toLocaleDateString('en-US', formatOptions)}
                    </span>
                  
                  </div>

                 
                  
                  <div className="info-group">
                    <label>Reason</label>
                    <p>{truncateReason(leave.reason)}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <div style={{ width: '200px', display: 'flex', gap: 10 }}>
                      <SC.LeaveActionBtn $variant="approve" onClick={() => handleLeaveAction(leave.id, 'APPROVED')}>
                        <RiCheckLine size={16} /> Approve
                      </SC.LeaveActionBtn>
                      <SC.LeaveActionBtn $variant="reject" onClick={() => handleLeaveAction(leave.id, 'REJECTED')}>
                        <RiCloseLine size={16} /> Reject
                      </SC.LeaveActionBtn>
                    </div>
                  </div>
                </SC.LeaveRequestCard>
              );
            })
          )}
        </SC.ModalAlertList>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #F1F5F9', marginTop: 12 }}>
          <span 
            onClick={() => setShowLeaveModal(false)}
            style={{ fontSize: '0.875rem', fontWeight: 800, color: '#475569', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Dismiss All
          </span>
        </div>
      </Modal>

      {/* Promotions Modal */}
      <Modal isOpen={showPromotionModal} onClose={() => setShowPromotionModal(false)} title="Student Promotion Workflow" width="680px">
        <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleGeneratePromotions} disabled={isGeneratingPromo}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#4F46E5', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
            {isGeneratingPromo ? <RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> : <RiMedalLine />}
            Generate Promotions
          </button>
          {pendingPromotions.length > 0 && (
            <button onClick={handleBulkApprove}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#10B981', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
              <RiCheckLine /> Bulk Approve All ({pendingPromotions.length})
            </button>
          )}
        </div>

        {pendingPromotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontFamily: 'Poppins, Inter, sans-serif' }}>
            <RiMedalLine size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>No pending promotions. Click "Generate Promotions" to create promotion suggestions for all eligible students.</p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, Inter, sans-serif' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Student', 'From', 'To', 'Year', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingPromotions.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1E293B', fontSize: '0.8125rem' }}>{p.student_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#64748B' }}>{p.from_class} {p.from_section}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#10B981', fontSize: '0.875rem' }}>
                        <RiArrowRightLine size={14} /> {p.to_class} {p.to_section}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#94A3B8' }}>{p.academic_year}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleReviewPromotion(p.id, 'approve')}
                          style={{ padding: '5px 12px', borderRadius: 8, background: '#F0FDF4', color: '#10B981', border: '1px solid #BBF7D0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
                          ✓ Approve
                        </button>
                        <button onClick={() => handleReviewPromotion(p.id, 'reject')}
                          style={{ padding: '5px 12px', borderRadius: 8, background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif' }}>
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </SC.DashboardWrapper>
  );
}
