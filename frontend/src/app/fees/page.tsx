'use client'

import React, { useState, useMemo } from 'react';
import { 
  RiSendPlaneFill, 
  RiWallet3Line, 
  RiErrorWarningLine, 
  RiDownloadLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMore2Fill,
  RiCheckLine
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import * as SC from './fees.sc';

import DataTable from '@/components/DataTable';
import Modal from '@/components/ui/Modal';

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'mark-payment'>('overview');
  const [feeData, setFeeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/fees/students`)
      .then(res => res.json())
      .then(data => {
        setFeeData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch fees data", err);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSendReminder = async (studentId: string, studentName: string, amount: string, feeType: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/fees/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          amount: amount,
          fee_type: feeType
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`WhatsApp reminder sent to ${studentName}'s parent.`, { icon: '📲' });
      } else {
        throw new Error(data.detail || 'Failed to send reminder');
      }
    } catch (err: any) {
      toast.error(err.message || 'Messaging gateway connection failed');
    }
  };

  const processPayment = async () => {
    if (selectedStudents.length === 0) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/fees/mark-payment-done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_ids: selectedStudents })
      });
      if (response.ok) {
        toast.success("Payments synchronized successfully!");
        setSelectedStudents([]);
        setShowConfirmModal(false);
        fetchData();
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update payment status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment status");
    }
  };

  const overviewColumns = useMemo(() => [
    { header: 'Std ID', accessor: 'id', width: '150px' },
    { header: 'Student Name', accessor: (row: any) => (
      <SC.StudentCell>
        <span className="name">{row.name}</span>
      </SC.StudentCell>
    )},
    { header: 'Fee Type', accessor: 'type' },
    { header: 'Amount', accessor: (row: any) => <span style={{ fontWeight: 800, color: '#1E293B' }}>₹{row.amount.replace('$', '')}</span> },
    { header: 'Due Month', accessor: (row: any) => <span style={{ color: '#64748B' }}>Oct 2023</span> },
    { header: 'Status', accessor: (row: any) => <SC.StatusPill $status={row.status}>{row.status}</SC.StatusPill> },
    { header: 'Action', align: 'right' as const, accessor: (row: any) => (
      row.status === 'Paid' ? <RiMore2Fill size={20} color="#94A3B8" /> :
      <SC.ActionButton onClick={() => handleSendReminder(row.id, row.name, row.amount, row.type)}>Send Reminder</SC.ActionButton>
    )}
  ], []);

  const paymentColumns = useMemo(() => [
    { 
      header: 'Select', 
      accessor: (row: any) => (
        <input 
          type="checkbox" 
          checked={selectedStudents.includes(row.id)}
          onChange={(e) => {
            const id = row.id;
            setSelectedStudents(prev => 
              e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
            );
          }}
        />
      ), 
      width: '50px' 
    },
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Amount', accessor: (row: any) => `₹${row.amount.replace('$', '')}` },
    { header: 'Due Months', accessor: () => 'Oct' },
    { header: 'Action', align: 'right' as const, accessor: (row: any) => (
      <SC.ActionButton onClick={() => {
        setSelectedStudents([row.id]);
        setShowConfirmModal(true);
      }}>Mark Done</SC.ActionButton>
    )}
  ], [selectedStudents]);

  return (
    <SC.PageWrapper>
      <SC.Header>
        <div className="title-area">
          <h1>Institutional Billing</h1>
          <p>Professional oversight of student financial records and cash collection.</p>
        </div>
        {selectedStudents.length > 0 && (
          <SC.PrimaryButton onClick={() => setShowConfirmModal(true)} style={{ background: '#059669' }}>
            <RiCheckLine size={20} />
            Mark {selectedStudents.length} as Paid
          </SC.PrimaryButton>
        )}
      </SC.Header>

      <SC.TabContainer>
        <SC.Tab $active={activeTab === 'overview'} onClick={() => {
          setActiveTab('overview');
          setSelectedStudents([]);
        }}>Overview</SC.Tab>
        <SC.Tab $active={activeTab === 'mark-payment'} onClick={() => setActiveTab('mark-payment')}>Mark Payment Done</SC.Tab>
      </SC.TabContainer>

      <SC.TableContainer>
        <DataTable 
          columns={activeTab === 'overview' ? overviewColumns : paymentColumns}
          data={activeTab === 'mark-payment' ? feeData.filter(s => s.status !== 'Paid') : feeData}
          loading={loading}
          pageSize={activeTab=='overview'? 8 : 10}
          currentPage={page}
          onPageChange={setPage}
        />
      </SC.TableContainer>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Payment Reconciliation"
        width="450px"
      >
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ background: '#F0FDF4', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#16A34A' }}>
            <RiWallet3Line size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Confirm Cash Payment</h3>
          <p style={{ color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You are about to mark payment as <strong>Paid</strong> for {selectedStudents.length} student(s). This will update the institutional records permanently.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <SC.ActionButton 
              style={{ flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none' }}
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </SC.ActionButton>
            <SC.PrimaryButton 
              style={{ flex: 2, background: '#10B981' }}
              onClick={processPayment}
            >
              Confirm Payment
            </SC.PrimaryButton>
          </div>
        </div>
      </Modal>
    </SC.PageWrapper>
  );
}
