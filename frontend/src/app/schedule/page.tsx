'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { RiAddLine, RiCloseLine, RiSave3Line, RiEdit2Line, RiDeleteBin7Line } from 'react-icons/ri';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
`;

const Button = styled.button<{ $primary?: boolean, $danger?: boolean }>`
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: ${p => p.$primary || p.$danger ? 'none' : '1px solid #e2e8f0'};
  background: ${p => p.$primary ? '#3b82f6' : p.$danger ? '#ef4444' : 'white'};
  color: ${p => p.$primary || p.$danger ? 'white' : '#475569'};
  
  &:hover {
    background: ${p => p.$primary ? '#2563eb' : p.$danger ? '#dc2626' : '#f8fafc'};
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  background: none;
  border: none;
  color: ${p => p.$danger ? '#ef4444' : '#3b82f6'};
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { background: ${p => p.$danger ? '#fee2e2' : '#eff6ff'}; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div<{ $large?: boolean }>`
  background: white;
  width: 100%;
  max-width: ${p => p.$large ? '900px' : '650px'};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  &:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  background: white;
  &:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  }
  
  th {
    background: #f8fafc;
    font-weight: 600;
    color: #475569;
    font-size: 0.875rem;
  }
`;

const GRADES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const SECTIONS = ['A', 'B', 'C'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generates time slots nicely
const getNextPeriodTime = (lastEndTime: string) => {
  // Simple increment 45 minutes logic
  try {
    const [h, m] = lastEndTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + 45);
    const endH = date.getHours().toString().padStart(2, '0');
    const endM = date.getMinutes().toString().padStart(2, '0');
    return `${endH}:${endM}`;
  } catch {
    return '12:00';
  }
};

export default function MasterScheduleView() {
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Edit mode state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    day_of_week: 'Monday',
    period_number: 1,
    start_time: '08:00',
    end_time: '08:45',
    grade: '1st',
    section: 'A',
    teacher_id: '',
    subject: ''
  });
  
  // Bulk Assign mode state
  const [bulkData, setBulkData] = useState({
    teacher_id: '',
    day_of_week: 'Monday'
  });
  
  const [bulkPeriods, setBulkPeriods] = useState<any[]>([]);

  // Filters
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTime, setFilterTime] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchTeachers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedule');
      if (res) setSchedules(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schedule');
    }
  };

  const filteredSchedules = schedules.filter((s: any) => {
    const tName = s.teacher_name || '';
    const subj = s.subject || '';
    const timeStr = `${s.start_time} - ${s.end_time}`;
    
    return tName.toLowerCase().includes(filterTeacher.toLowerCase()) &&
           subj.toLowerCase().includes(filterSubject.toLowerCase()) &&
           timeStr.toLowerCase().includes(filterTime.toLowerCase());
  });

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers');
      if (res) setTeachers(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setBulkData({
      teacher_id: '',
      day_of_week: 'Monday'
    });
    
    // Default 3 periods
    setBulkPeriods([
      { id: Date.now() + 1, period_number: 1, start_time: '08:00', end_time: '08:45', subject: '', grade: '1st', section: 'A' },
      { id: Date.now() + 2, period_number: 2, start_time: '08:45', end_time: '09:30', subject: '', grade: '1st', section: 'A' },
      { id: Date.now() + 3, period_number: 3, start_time: '09:30', end_time: '10:15', subject: '', grade: '1st', section: 'A' }
    ]);
    
    setShowModal(true);
  };

  const handleOpenEdit = (schedule: any) => {
    setEditingId(schedule.id);
    
    let g = '1st';
    let s = 'A';
    if (schedule.classes && schedule.classes.length > 0) {
      const parts = schedule.classes[0].split(' ');
      if (parts.length >= 2) {
        g = parts[0];
        s = parts[1];
      }
    }
    
    setEditFormData({
      day_of_week: schedule.day_of_week,
      period_number: schedule.period_number,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      grade: g,
      section: s,
      teacher_id: schedule.teacher_id,
      subject: schedule.subject
    });
    
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule entry?')) return;
    try {
      await api.delete(`/schedule/${id}`);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleSaveBulk = async () => {
    if (!bulkData.teacher_id) {
      toast.error("Please select a teacher.");
      return;
    }
    
    const validPeriods = bulkPeriods.filter(p => p.subject.trim() !== '');
    if (validPeriods.length === 0) {
      toast.error("Please add a subject for at least one period.");
      return;
    }
    
    const payload = validPeriods.map(p => ({
      day_of_week: bulkData.day_of_week,
      teacher_id: bulkData.teacher_id,
      period_number: p.period_number,
      start_time: p.start_time,
      end_time: p.end_time,
      subject: p.subject,
      classes: [`${p.grade} ${p.section}`]
    }));
    
    setLoading(true);
    try {
      await api.post('/schedule/bulk', payload);
      toast.success('Timetable saved successfully');
      setShowModal(false);
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveEdit = async () => {
    if (!editFormData.teacher_id) {
      toast.error("Please select a teacher.");
      return;
    }
    
    const payload = {
      ...editFormData,
      classes: [`${editFormData.grade} ${editFormData.section}`]
    };
    
    setLoading(true);
    try {
      await api.put(`/schedule/${editingId}`, payload);
      toast.success('Schedule updated successfully');
      setShowModal(false);
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  // Bulk actions
  const addPeriodRow = () => {
    const last = bulkPeriods[bulkPeriods.length - 1];
    const newPeriodNumber = last ? last.period_number + 1 : 1;
    const newStart = last ? last.end_time : '08:00';
    const newEnd = getNextPeriodTime(newStart);
    
    setBulkPeriods([
      ...bulkPeriods,
      {
        id: Date.now(),
        period_number: newPeriodNumber,
        start_time: newStart,
        end_time: newEnd,
        subject: '',
        grade: last ? last.grade : '1st',
        section: last ? last.section : 'A'
      }
    ]);
  };

  const removePeriodRow = (id: number) => {
    setBulkPeriods(bulkPeriods.filter(p => p.id !== id));
  };

  const updateBulkPeriod = (id: number, field: string, value: any) => {
    setBulkPeriods(bulkPeriods.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <Container>
      <Header>
        <Title>Master Schedule</Title>
        <Button $primary onClick={handleOpenCreate}>
          <RiAddLine size={20} /> Assign Timetable
        </Button>
      </Header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Input 
          placeholder="Filter by Teacher..." 
          value={filterTeacher} 
          onChange={e => setFilterTeacher(e.target.value)} 
          style={{ flex: 1 }}
        />
        <Input 
          placeholder="Filter by Subject..." 
          value={filterSubject} 
          onChange={e => setFilterSubject(e.target.value)} 
          style={{ flex: 1 }}
        />
        <Input 
          placeholder="Filter by Time (e.g. 08:00)..." 
          value={filterTime} 
          onChange={e => setFilterTime(e.target.value)} 
          style={{ flex: 1 }}
        />
      </div>

      <Table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Period</th>
            <th>Time</th>
            <th>Class</th>
            <th>Subject</th>
            <th>Teacher</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.map((s: any) => (
            <tr key={s.id}>
              <td>{s.day_of_week}</td>
              <td>{s.period_number}</td>
              <td>{s.start_time} - {s.end_time}</td>
              <td>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {s.classes && s.classes.length > 0 ? s.classes.join(', ') : '-'}
                </span>
              </td>
              <td>{s.subject}</td>
              <td>{s.teacher_name}</td>
              <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <ActionButton onClick={() => handleOpenEdit(s)} title="Edit">
                  <RiEdit2Line size={18} />
                </ActionButton>
                <ActionButton $danger onClick={() => handleDelete(s.id)} title="Delete">
                  <RiDeleteBin7Line size={18} />
                </ActionButton>
              </td>
            </tr>
          ))}
          {filteredSchedules.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>
                {schedules.length === 0 ? 'No schedule entries found.' : 'No entries match your filters.'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* MODAL */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalCard $large={editingId === null} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {editingId ? 'Edit Schedule Entry' : 'Smart Timetable Assignment'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                <RiCloseLine size={24} color="#64748b" />
              </button>
            </ModalHeader>
            <ModalBody>
              
              {/* EDIT MODE (Single Period) */}
              {editingId !== null ? (
                <>
                  <FormGroup>
                    <Label>Day of Week</Label>
                    <Select value={editFormData.day_of_week} onChange={e => setEditFormData({...editFormData, day_of_week: e.target.value})}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </FormGroup>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormGroup>
                      <Label>Grade</Label>
                      <Select value={editFormData.grade} onChange={e => setEditFormData({...editFormData, grade: e.target.value})}>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>Section</Label>
                      <Select value={editFormData.section} onChange={e => setEditFormData({...editFormData, section: e.target.value})}>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </FormGroup>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormGroup><Label>Start Time</Label><Input type="time" value={editFormData.start_time} onChange={e => setEditFormData({...editFormData, start_time: e.target.value})} /></FormGroup>
                    <FormGroup><Label>End Time</Label><Input type="time" value={editFormData.end_time} onChange={e => setEditFormData({...editFormData, end_time: e.target.value})} /></FormGroup>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormGroup><Label>Period Number</Label><Input type="number" min={1} max={8} value={editFormData.period_number} onChange={e => setEditFormData({...editFormData, period_number: parseInt(e.target.value)})} /></FormGroup>
                    <FormGroup><Label>Subject</Label><Input placeholder="e.g. Mathematics" value={editFormData.subject} onChange={e => setEditFormData({...editFormData, subject: e.target.value})} /></FormGroup>
                  </div>
                  <FormGroup>
                    <Label>Assigned Teacher</Label>
                    <Select value={editFormData.teacher_id} onChange={e => setEditFormData({...editFormData, teacher_id: e.target.value})}>
                      <option value="">Select a teacher...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                    </Select>
                  </FormGroup>
                </>
              ) : (
                
                /* BULK ASSIGN MODE (Smart Grid) */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <FormGroup>
                      <Label>Teacher</Label>
                      <Select value={bulkData.teacher_id} onChange={e => setBulkData({...bulkData, teacher_id: e.target.value})}>
                        <option value="">Select a teacher...</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>Day of Week</Label>
                      <Select value={bulkData.day_of_week} onChange={e => setBulkData({...bulkData, day_of_week: e.target.value})}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </Select>
                    </FormGroup>
                  </div>
                  
                  <Table style={{ marginTop: '8px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Period</th>
                        <th style={{ width: '120px' }}>Times</th>
                        <th style={{ width: '180px' }}>Subject</th>
                        <th>Class & Section</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPeriods.map(p => (
                        <tr key={p.id}>
                          <td>
                            <Input 
                              type="number" 
                              style={{ width: '60px', padding: '6px' }} 
                              value={p.period_number} 
                              onChange={e => updateBulkPeriod(p.id, 'period_number', parseInt(e.target.value))} 
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <Input type="time" style={{ padding: '4px' }} value={p.start_time} onChange={e => updateBulkPeriod(p.id, 'start_time', e.target.value)} />
                              <Input type="time" style={{ padding: '4px' }} value={p.end_time} onChange={e => updateBulkPeriod(p.id, 'end_time', e.target.value)} />
                            </div>
                          </td>
                          <td>
                            <Input 
                              placeholder="e.g. Math" 
                              style={{ width: '100%', padding: '8px' }}
                              value={p.subject}
                              onChange={e => updateBulkPeriod(p.id, 'subject', e.target.value)}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Select style={{ padding: '6px', flex: 1 }} value={p.grade} onChange={e => updateBulkPeriod(p.id, 'grade', e.target.value)}>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                              </Select>
                              <Select style={{ padding: '6px', width: '70px' }} value={p.section} onChange={e => updateBulkPeriod(p.id, 'section', e.target.value)}>
                                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </Select>
                            </div>
                          </td>
                          <td>
                            {bulkPeriods.length > 1 && (
                              <ActionButton $danger onClick={() => removePeriodRow(p.id)} title="Remove row">
                                <RiCloseLine size={20} />
                              </ActionButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                    <Button type="button" onClick={addPeriodRow}>
                      <RiAddLine size={18} /> Add Period
                    </Button>
                  </div>
                </>
              )}

            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
              <Button $primary onClick={editingId ? handleSaveEdit : handleSaveBulk} disabled={loading}>
                <RiSave3Line /> {loading ? 'Saving...' : editingId ? 'Update Schedule' : 'Save Timetable'}
              </Button>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}
