'use client'

import React, { useState } from 'react';
import { 
  RiBriefcaseLine, 
  RiHeartPulseLine, 
  RiCalendarEventLine, 
  RiMore2Fill,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInformationLine,
  RiHistoryLine
} from 'react-icons/ri';
import * as SC from './leaves.sc';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function LeaveManagementPage() {
  const queryClient = useQueryClient();
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Fetch real leave data
  const { data: leaveData, isLoading, error } = useQuery({
    queryKey: ['leaves', 'me'],
    queryFn: async () => {
      const res = await api.get<any>('/leaves/me');
      console.log('Leave Data Response:', res); 
      return res;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !startDate || !reason) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      await api.post('/leaves', {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate || null,
        reason: reason
      });
      
      toast.success('Leave request submitted successfully for review!');
      queryClient.invalidateQueries({ queryKey: ['leaves', 'me'] });
      
      // Reset form
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit request');
    }
  };

  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved'>('all');

  // Robustly extract balance and requests
  const balance = leaveData?.balance || { sick_leave: 0, casual_leave: 0, earned_leave: 0 };
  const requests = Array.isArray(leaveData?.requests) ? leaveData.requests : [];
  
  const activeRequests = requests.filter((r: any) => 
    r.status?.toUpperCase() === 'PENDING' || r.status?.toUpperCase() === 'IN_REVIEW'
  );
  
  const historicalArchive = requests.filter((r: any) => {
    if (historyFilter === 'approved') return r.status?.toUpperCase() === 'APPROVED' || r.status?.toUpperCase() === 'COMPLETED';
    return true; // Show all for 'all' tab
  });

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Portfolio...</div>;

  return (
    <SC.Container>
      <SC.Header>
        <h4>Human Resources</h4>
        <h1>Leave Portfolio</h1>
        <p>Manage your rest periods and track administrative approval workflows in one centralized hub.</p>
      </SC.Header>

      <SC.MainGrid>
        <SC.LeftColumn>
          {/* ── Summary Cards ── */}
          <SC.SummaryRow>
            <SC.BalanceCard $color="#EF4444">
              <SC.CardHeader color="#EF4444">
                <div className="icon"><RiHeartPulseLine size={22} /></div>
                <span>LMT: 15 DAYS</span>
              </SC.CardHeader>
              <SC.CardValue>
                <div className="val">{balance.sick_leave ?? 0}</div>
                <div className="label">Sick Leave Remaining</div>
              </SC.CardValue>
            </SC.BalanceCard>

            <SC.BalanceCard $color="#10B981">
              <SC.CardHeader color="#10B981">
                <div className="icon"><RiBriefcaseLine size={22} /></div>
                <span>LMT: 10 DAYS</span>
              </SC.CardHeader>
              <SC.CardValue>
                <div className="val">{balance.casual_leave ?? 0}</div>
                <div className="label">Casual Leave Remaining</div>
              </SC.CardValue>
            </SC.BalanceCard>

            <SC.BalanceCard $color="#4F46E5">
              <SC.CardHeader color="#4F46E5">
                <div className="icon"><RiCalendarEventLine size={22} /></div>
                <span>LMT: 30 DAYS</span>
              </SC.CardHeader>
              <SC.CardValue>
                <div className="val">{balance.earned_leave ?? 0}</div>
                <div className="label">Earned Leave Remaining</div>
              </SC.CardValue>
            </SC.BalanceCard>
          </SC.SummaryRow>

          {/* ── Historical Archive ── */}
          <SC.TableSection>
            <SC.TableHeader>
              <h3>Historical Archive</h3>
              <SC.TableFilters>
                <button 
                  className={historyFilter === 'all' ? 'active' : ''} 
                  onClick={() => setHistoryFilter('all')}
                >
                  All Records
                </button>
                <button 
                  className={historyFilter === 'approved' ? 'active' : ''} 
                  onClick={() => setHistoryFilter('approved')}
                >
                  Approved Only
                </button>
              </SC.TableFilters>
            </SC.TableHeader>

            <SC.Table>
              <thead>
                <tr>
                  <SC.Th>Request Type</SC.Th>
                  <SC.Th>Duration</SC.Th>
                  <SC.Th>Approval Date</SC.Th>
                  <SC.Th>Status</SC.Th>
                  <SC.Th></SC.Th>
                </tr>
              </thead>
              <tbody>
                {historicalArchive.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No historical records found.</td></tr>
                ) : historicalArchive.map((item: any) => (
                  <SC.Tr key={item.id}>
                    <SC.Td>
                      <div className="type-cell">
                        <div className="icon">
                          {item.leave_type === 'sick' ? <RiHeartPulseLine /> : <RiBriefcaseLine />}
                        </div>
                        <span style={{ textTransform: 'capitalize' }}>{item.leave_type} Leave</span>
                      </div>
                    </SC.Td>
                    <SC.Td>
                      <div className="duration-cell">
                        <span className="dates">{item.start_date} {item.end_date ? `- ${item.end_date}` : ''}</span>
                        <span className="days">Request on {item.applied_at.split(' ')[0]}</span>
                      </div>
                    </SC.Td>
                    <SC.Td>{item.approved_at || '—'}</SC.Td>
                    <SC.Td>
                      <SC.StatusPill $status={item.status}>{item.status}</SC.StatusPill>
                    </SC.Td>
                    <SC.Td style={{ textAlign: 'right' }}>
                      <RiMore2Fill style={{ cursor: 'pointer', color: '#94A3B8' }} />
                    </SC.Td>
                  </SC.Tr>
                ))}
              </tbody>
            </SC.Table>
          </SC.TableSection>
        </SC.LeftColumn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* ── Apply Form ── */}
          <SC.FormCard>
            <SC.FormTitle>Apply for Leave</SC.FormTitle>
            <SC.FormSubtitle>Request time off from your department.</SC.FormSubtitle>
            
            <form onSubmit={handleSubmit}>
              <SC.FormGroup>
                <label>Leave Category</label>
                <SC.Select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                  <option value="">Select type...</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="earned">Earned Leave</option>
                </SC.Select>
              </SC.FormGroup>

              <SC.DateRow>
                <SC.FormGroup>
                  <label>Start Date</label>
                  <SC.Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </SC.FormGroup>
                <SC.FormGroup>
                  <label>End Date</label>
                  <SC.Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </SC.FormGroup>
              </SC.DateRow>

              <SC.FormGroup>
                <label>Reason / Description</label>
                <SC.Textarea 
                  placeholder="Provide brief context for the request..." 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                />
              </SC.FormGroup>

              <SC.SubmitBtn type="submit">Submit Request</SC.SubmitBtn>
            </form>
          </SC.FormCard>
        </div>
      </SC.MainGrid>
    </SC.Container>
  );
}
