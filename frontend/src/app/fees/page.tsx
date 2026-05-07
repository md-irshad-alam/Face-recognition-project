'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RiMoneyDollarCircleLine, RiCheckboxCircleLine, RiErrorWarningLine,
  RiTimeLine, RiSendPlaneFill, RiAddLine, RiRefreshLine,
  RiFileTextLine, RiHistoryLine, RiMore2Fill
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import Modal from '@/components/ui/Modal';
import * as SC from './fees.sc';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── PDF Generator ─────────────────────────────────────────────────────────────
const downloadPDF = async (inv: any) => {
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text('VISIO SCHOOL', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('SMART EDUCATION ECOSYSTEM', 14, 28);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', pageWidth - 14, 22, { align: 'right' });
  doc.setFontSize(10);
  doc.text(`#${inv.invoice_number}`, pageWidth - 14, 28, { align: 'right' });

  // Bill To / Info
  doc.setDrawColor(241, 245, 249);
  doc.line(14, 35, pageWidth - 14, 35);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('BILL TO', 14, 45);
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(inv.student_name, 14, 52);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Class: ${inv.class_name} ${inv.section}`, 14, 58);
  doc.text(`Parent: ${inv.parent_phone || 'N/A'}`, 14, 63);

  doc.setTextColor(148, 163, 184);
  doc.text('INVOICE DATE', pageWidth - 50, 45);
  doc.setTextColor(30, 41, 59);
  doc.text(new Date().toLocaleDateString(), pageWidth - 50, 52);
  doc.setTextColor(148, 163, 184);
  doc.text('DUE DATE', pageWidth - 50, 58);
  doc.setTextColor(239, 68, 68);
  doc.text(inv.due_date || '10th of Month', pageWidth - 50, 65);

  // Summary Table
  autoTable(doc, {
    startY: 75,
    head: [['Description', 'Amount']],
    body: [
      ['Monthly Tuition Fee', `INR ${parseFloat(inv.monthly_fee).toLocaleString()}`],
      ['Previous Arrears / Due', `INR ${parseFloat(inv.previous_due).toLocaleString()}`],
      ['Late Payment Charges', `INR ${parseFloat(inv.late_fine).toLocaleString()}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], fontSize: 10, halign: 'left' },
    columnStyles: { 1: { halign: 'right' } }
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Total Section
  doc.setDrawColor(241, 245, 249);
  doc.line(pageWidth - 80, finalY + 5, pageWidth - 14, finalY + 5);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Payable:', pageWidth - 80, finalY + 15);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`INR ${parseFloat(inv.total_payable).toLocaleString()}`, pageWidth - 14, finalY + 15, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Amount Paid:', pageWidth - 80, finalY + 22);
  doc.setTextColor(16, 185, 129);
  doc.text(`INR ${parseFloat(inv.amount_paid).toLocaleString()}`, pageWidth - 14, finalY + 22, { align: 'right' });

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Balance Due:', pageWidth - 80, finalY + 32);
  doc.setTextColor(239, 68, 68);
  doc.text(`INR ${parseFloat(inv.balance_due).toLocaleString()}`, pageWidth - 14, finalY + 32, { align: 'right' });

  // Payment History
  try {
    const payments = await api.get<any[]>(`/fees/invoice/${inv.id}/payments`);
    if (payments && payments.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('TRANSACTION HISTORY', 14, finalY + 50);

      autoTable(doc, {
        startY: finalY + 55,
        head: [['Date', 'Ref ID', 'Method', 'Amount', 'Status']],
        body: payments.map(p => [
          new Date(p.payment_date).toLocaleDateString(),
          p.transaction_id || 'N/A',
          p.payment_method || 'CASH',
          `INR ${parseFloat(p.amount_paid).toLocaleString()}`,
          p.status
        ]),
        theme: 'grid',
        headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontSize: 9 },
        styles: { fontSize: 8 }
      });
    }
  } catch (err) { console.error('PDF History Error:', err); }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer generated invoice and does not require a physical signature.', pageWidth / 2, 285, { align: 'center' });
  }

  doc.save(`Invoice_${inv.invoice_number}.pdf`);
};

// ── Inline popup action menu ───────────────────────────────────────────────────
function ActionMenu({ inv, onPay, onHistory, onRemind }: {
  inv: any;
  onPay: (inv: any) => void;
  onHistory: (inv: any) => void;
  onRemind: (inv: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
      <SC.MenuButton onClick={() => setOpen(v => !v)} aria-label="Action Menu">
        <RiMore2Fill size={20} />
      </SC.MenuButton>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 190, overflow: 'hidden', animation: 'slideDown 0.2s ease-out' }}>
          <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {inv.status !== 'PAID' && (
            <button onClick={() => { setOpen(false); onPay(inv); }}
              style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s' }}>
              <RiAddLine size={18} /> Record Payment
            </button>
          )}
          <button onClick={() => { setOpen(false); onHistory(inv); }}
            style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s' }}>
            <RiHistoryLine size={18} /> Payment History
          </button>
          {inv.status !== 'PAID' && (
            <button onClick={() => { setOpen(false); onRemind(inv); }}
              style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#D97706', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
              <RiSendPlaneFill size={18} /> Send Reminder
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLOR: Record<string, string> = {
  PAID: '#10B981', PARTIALLY_PAID: '#F59E0B', UNPAID: '#4F46E5', OVERDUE: '#EF4444'
};

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<'invoices'|'history'|'legacy'>('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('');

  // Payment modal
  const [payModal, setPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // History modal
  const [histModal, setHistModal] = useState(false);
  const [histPayments, setHistPayments] = useState<any[]>([]);

  // Legacy fee data
  const [legacyData, setLegacyData] = useState<any[]>([]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { month: filterMonth, year: filterYear };
      if (filterStatus) params.status = filterStatus;
      const qs = new URLSearchParams(Object.entries(params).map(([k,v]) => [k, String(v)]));
      const data = await api.get<any[]>(`/fees/invoices?${qs}`);
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load invoices');
    } finally { setLoading(false); }
  };

  const fetchLegacy = async () => {
    try {
      const data = await api.get<any[]>('/fees/students');
      setLegacyData(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { fetchInvoices(); }, [filterMonth, filterYear, filterStatus]);
  useEffect(() => { if (activeTab === 'legacy') fetchLegacy(); }, [activeTab]);

  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'PAID').length;
    const overdue = invoices.filter(i => i.status === 'OVERDUE').length;
    const partial = invoices.filter(i => i.status === 'PARTIALLY_PAID').length;
    const totalDue = invoices.reduce((s, i) => s + parseFloat(i.balance_due || 0), 0);
    const totalCollected = invoices.reduce((s, i) => s + parseFloat(i.amount_paid || 0), 0);
    return { paid, overdue, partial, totalDue, totalCollected, total: invoices.length };
  }, [invoices]);

  const openPayModal = (inv: any) => {
    setSelectedInvoice(inv);
    setPayAmount(String(parseFloat(inv.balance_due || 0).toFixed(2)));
    setPayMethod('CASH');
    setPayRef('');
    setPayNotes('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayModal(true);
  };

  const submitPayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await api.post('/fees/record-payment', {
        invoice_id: selectedInvoice.id,
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        reference_number: payRef || null,
        notes: payNotes || null,
        payment_date: payDate,
      });
      toast.success('Payment recorded!');
      setPayModal(false);
      fetchInvoices();
    } catch (e: any) {
      toast.error(e.message || 'Failed to record payment');
    } finally { setSubmitting(false); }
  };

  const openHistory = async (inv: any) => {
    setSelectedInvoice(inv);
    setHistModal(true);
    try {
      const data = await api.get<any[]>(`/fees/invoice/${inv.id}/payments`);
      setHistPayments(Array.isArray(data) ? data : []);
    } catch { setHistPayments([]); }
  };

  const sendReminder = async (inv: any) => {
    try {
      await api.post('/fees/send-reminder', {
        student_id: inv.student_id,
        amount: `₹${parseFloat(inv.balance_due).toLocaleString('en-IN')}`,
        fee_type: 'Monthly Fee'
      });
      toast.success(`Reminder sent to ${inv.student_name}'s parent`, { icon: '📲' });
    } catch (e: any) {
      toast.error(e.message || 'Failed to send reminder');
    }
  };

  const generateInvoices = async () => {
    try {
      const res = await api.post<any>('/fees/generate-invoices', {});
      toast.success(res.message || 'Invoices generated!');
      fetchInvoices();
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate invoices');
    }
  };

  const broadcastReminders = async () => {
    try {
      const res = await api.post<any>('/fees/broadcast-reminders', {});
      toast.success(`Sent ${res.queued} reminders!`);
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const years = [filterYear - 1, filterYear, filterYear + 1];

  return (
    <SC.PageWrapper>
      <SC.Header>
        <div className="title-area">
          <h1>Fee Management</h1>
          <p>Automated invoicing, counter payments & parent reminders.</p>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <SC.PrimaryButton style={{ background:'#059669' }} onClick={broadcastReminders}>
            <RiSendPlaneFill /> Auto Reminders
          </SC.PrimaryButton>
          <SC.PrimaryButton onClick={generateInvoices}>
            <RiFileTextLine /> Generate Invoices
          </SC.PrimaryButton>
        </div>
      </SC.Header>

      {/* Stats Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
        {[
          { label:'Total Invoices', val: stats.total, icon:<RiFileTextLine size={20}/>, color:'#4F46E5', bg:'#EEF2FF' },
          { label:'Paid', val: stats.paid, icon:<RiCheckboxCircleLine size={20}/>, color:'#10B981', bg:'#F0FDF4' },
          { label:'Partial', val: stats.partial, icon:<RiTimeLine size={20}/>, color:'#F59E0B', bg:'#FFFBEB' },
          { label:'Overdue', val: stats.overdue, icon:<RiErrorWarningLine size={20}/>, color:'#EF4444', bg:'#FEF2F2' },
          { label:'Collected', val:`₹${stats.totalCollected.toLocaleString('en-IN',{maximumFractionDigits:0})}`, icon:<RiMoneyDollarCircleLine size={20}/>, color:'#10B981', bg:'#F0FDF4' },
          { label:'Outstanding', val:`₹${stats.totalDue.toLocaleString('en-IN',{maximumFractionDigits:0})}`, icon:<RiErrorWarningLine size={20}/>, color:'#EF4444', bg:'#FEF2F2' },
        ].map(c => (
          <div key={c.label} style={{ background:'white', borderRadius:20, padding:'20px 24px', border:'1px solid #F1F5F9' }}>
            <div style={{ width:40,height:40,borderRadius:12,background:c.bg,color:c.color,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12 }}>
              {c.icon}
            </div>
            <p style={{ margin:0, fontSize:'0.75rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase' }}>{c.label}</p>
            <p style={{ margin:'4px 0 0', fontSize:'1.5rem', fontWeight:900, color:'#0F172A' }}>{c.val}</p>
          </div>
        ))}
      </div>

      <SC.TabContainer>
        <SC.Tab $active={activeTab==='invoices'} onClick={()=>setActiveTab('invoices')}><RiFileTextLine /> Invoices</SC.Tab>
      </SC.TabContainer>

      {activeTab === 'invoices' && (
        <>
          {/* Filters */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <SC.Select value={filterMonth} onChange={e=>setFilterMonth(+e.target.value)}>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </SC.Select>
            <SC.Select value={filterYear} onChange={e=>setFilterYear(+e.target.value)}>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </SC.Select>
            <SC.Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value=''>All Status</option>
              <option value='PAID'>Paid</option>
              <option value='PARTIALLY_PAID'>Partially Paid</option>
              <option value='UNPAID'>Unpaid</option>
              <option value='OVERDUE'>Overdue</option>
            </SC.Select>
            <button onClick={fetchInvoices} style={{ background:'#F1F5F9', border:'none', borderRadius:10, padding:'9px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontWeight:700, color:'#64748B' }}>
              <RiRefreshLine /> Refresh
            </button>
          </div>

          <SC.TableContainer>
            {loading ? (
              <div style={{ padding:60, textAlign:'center', color:'#94A3B8' }}>Loading invoices…</div>
            ) : invoices.length === 0 ? (
              <div style={{ padding:60, textAlign:'center', color:'#94A3B8' }}>
                <RiFileTextLine size={40} style={{ opacity:0.3, marginBottom:12 }} /><br/>
                No invoices for this period. Click "Generate Invoices" to create them.
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC' }}>
                      {['Invoice #','Student','Class','Monthly Fee','Prev Due','Late Fine','Total','Paid','Balance','Months Pending','Status','Actions'].map(h=>(
                        <th key={h} style={{ padding:'14px 16px', fontSize:'0.6875rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', textAlign:'left', borderBottom:'1px solid #F1F5F9', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                        <td style={{ padding:'14px 16px', fontSize:'0.8125rem', fontWeight:400, color:'#4F46E5', cursor:'pointer', textDecoration:'underline' }} onClick={() => downloadPDF(inv)}>
                          {inv.invoice_number}
                        </td>
                        <td style={{ padding:'14px 16px', fontWeight:400, color:'#1E293B' }}>{inv.student_name}</td>
                        <td style={{ padding:'14px 16px', fontSize:'0.8125rem', color:'#64748B', fontWeight:400 }}>{inv.class_name} {inv.section}</td>
                        <td style={{ padding:'14px 16px', fontWeight:400 }}>₹{parseFloat(inv.monthly_fee||0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'14px 16px', color: '#64748B', fontWeight:400 }}>
                          ₹{parseFloat(inv.previous_due||0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding:'14px 16px', color: '#64748B', fontWeight:400 }}>
                          ₹{parseFloat(inv.late_fine||0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding:'14px 16px', fontWeight:400 }}>₹{parseFloat(inv.total_payable||0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'14px 16px', color:'#10B981', fontWeight:400 }}>₹{parseFloat(inv.amount_paid||0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'14px 16px', color: '#1E293B', fontWeight:400 }}>
                          ₹{parseFloat(inv.balance_due||0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding:'14px 16px' }}>
                          <span style={{ padding:'4px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:400, background: (inv.status === 'PAID' ? '#F0FDF4' : '#FEF2F2'), color: (inv.status === 'PAID' ? '#10B981' : '#EF4444') }}>
                            {inv.status === 'PAID' ? '0 Months' : `${inv.months_pending} Months`}
                          </span>
                        </td>
                        <td style={{ padding:'14px 16px' }}>
                          <span style={{ padding:'4px 10px', borderRadius:20, fontSize:'0.6875rem', fontWeight:400, background:STATUS_COLOR[inv.status]+'20', color:STATUS_COLOR[inv.status] }}>
                            {inv.status.replace('_',' ')}
                          </span>
                        </td>
                        <td style={{ padding:'14px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {inv.status === 'PAID' ? (
                              <button onClick={() => openHistory(inv)} title="Payment History"
                                style={{ background:'none', border:'none', color:'#64748B', cursor:'pointer', padding:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <RiHistoryLine size={20} />
                              </button>
                            ) : (
                              <ActionMenu 
                                inv={inv} 
                                onPay={openPayModal} 
                                onHistory={openHistory} 
                                onRemind={sendReminder} 
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SC.TableContainer>
        </>
      )}

      {/* REMOVED activeTab === 'legacy' section */}

      {/* ── Record Payment Modal ── */}
      <Modal isOpen={payModal} onClose={()=>setPayModal(false)} title="Record Counter Payment" width="520px">
        {selectedInvoice && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'#F8FAFC', borderRadius:16, padding:16 }}>
              <p style={{ margin:0, fontWeight:800, color:'#1E293B' }}>{selectedInvoice.student_name}</p>
              <p style={{ margin:'4px 0 0', fontSize:'0.8125rem', color:'#64748B' }}>{selectedInvoice.invoice_number} • Due: ₹{parseFloat(selectedInvoice.balance_due).toLocaleString('en-IN')}</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748B', marginBottom:6, textTransform:'uppercase' }}>Amount (₹)*</label>
                <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)}
                  style={{ width:'100%', height:48, borderRadius:12, border:'1.5px solid #E2E8F0', padding:'0 14px', fontSize:'1rem', fontWeight:700, background:'#F8FAFC', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748B', marginBottom:6, textTransform:'uppercase' }}>Payment Date*</label>
                <input type="date" value={payDate} onChange={e=>setPayDate(e.target.value)}
                  style={{ width:'100%', height:48, borderRadius:12, border:'1.5px solid #E2E8F0', padding:'0 14px', fontSize:'0.875rem', background:'#F8FAFC', outline:'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748B', marginBottom:6, textTransform:'uppercase' }}>Payment Method*</label>
              <select value={payMethod} onChange={e=>setPayMethod(e.target.value)}
                style={{ width:'100%', height:48, borderRadius:12, border:'1.5px solid #E2E8F0', padding:'0 14px', fontSize:'0.875rem', fontWeight:600, background:'#F8FAFC', outline:'none', appearance:'none' }}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DD">Demand Draft</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748B', marginBottom:6, textTransform:'uppercase' }}>Reference / Receipt No.</label>
              <input value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder="UPI ref, cheque no, etc."
                style={{ width:'100%', height:48, borderRadius:12, border:'1.5px solid #E2E8F0', padding:'0 14px', fontSize:'0.875rem', background:'#F8FAFC', outline:'none' }} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748B', marginBottom:6, textTransform:'uppercase' }}>Notes</label>
              <textarea value={payNotes} onChange={e=>setPayNotes(e.target.value)} rows={2} placeholder="Optional notes…"
                style={{ width:'100%', borderRadius:12, border:'1.5px solid #E2E8F0', padding:'12px 14px', fontSize:'0.875rem', background:'#F8FAFC', outline:'none', resize:'none', fontFamily:'inherit' }} />
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>setPayModal(false)}
                style={{ flex:1, height:48, borderRadius:12, border:'none', background:'#F1F5F9', color:'#64748B', fontWeight:700, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={submitPayment} disabled={submitting}
                style={{ flex:2, height:48, borderRadius:12, border:'none', background:'#4F46E5', color:'white', fontWeight:800, cursor:'pointer', opacity:submitting?0.7:1 }}>
                {submitting ? 'Saving…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Payment History Modal ── */}
      <Modal isOpen={histModal} onClose={()=>setHistModal(false)} title="Payment History" width="560px">
        {selectedInvoice && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'#F8FAFC', borderRadius:12, padding:14 }}>
              <p style={{ margin:0, fontWeight:800 }}>{selectedInvoice.student_name}</p>
              <p style={{ margin:'4px 0 0', fontSize:'0.8125rem', color:'#64748B' }}>{selectedInvoice.invoice_number}</p>
            </div>
            {histPayments.length === 0 ? (
              <p style={{ textAlign:'center', color:'#94A3B8', padding:30 }}>No payments recorded yet.</p>
            ) : histPayments.map((p:any) => (
              <div key={p.id} style={{ border:'1px solid #F1F5F9', borderRadius:16, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ margin:0, fontWeight:800, color:'#10B981', fontSize:'1.125rem' }}>
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </p>
                    <p style={{ margin:'4px 0 0', fontSize:'0.75rem', color:'#94A3B8' }}>
                      {p.payment_date} • {p.payment_method} {p.reference_number ? `• ${p.reference_number}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize:'0.6875rem', fontWeight:700, color:'#64748B' }}>by {p.recorded_by}</span>
                </div>
                {p.notes && <p style={{ margin:'8px 0 0', fontSize:'0.8125rem', color:'#64748B' }}>{p.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </SC.PageWrapper>
  );
}
