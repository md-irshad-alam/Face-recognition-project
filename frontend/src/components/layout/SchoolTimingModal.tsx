import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RiCloseLine, RiTimeLine, RiSave3Line, RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { api } from '@/services/api';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalCard = styled.div`
  background: white;
  width: 100%;
  max-width: 700px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #F1F5F9;
    color: #0F172A;
  }
`;

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const WeekDaysWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const DayChip = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${p => p.$active ? '#3B82F6' : '#E2E8F0'};
  background: ${p => p.$active ? '#EFF6FF' : 'white'};
  color: ${p => p.$active ? '#1D4ED8' : '#64748B'};
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$active ? '#DBEAFE' : '#F8FAFC'};
  }
`;

const HolidayItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  background: ${p => p.$danger ? '#FEF2F2' : '#EFF6FF'};
  color: ${p => p.$danger ? '#EF4444' : '#3B82F6'};
  border: none;
  border-radius: 8px;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;

  &:hover { opacity: 0.8; }
`;

const Footer = styled.div`
  padding: 20px 24px;
  background: #F8FAFC;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #E2E8F0;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;

  ${props => props.$primary ? `
    background: #3B82F6;
    color: white;
    &:hover { background: #2563EB; transform: translateY(-1px); }
  ` : `
    background: white;
    color: #475569;
    border: 1px solid #E2E8F0;
    &:hover { background: #F8FAFC; }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface SchoolTimingModalProps {
  onClose: () => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchoolTimingModal({ onClose }: SchoolTimingModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    attendance_start_time: '08:00',
    attendance_end_time: '09:00',
    school_end_time: '15:00',
    week_off_days: ['Sunday'] as string[],
    holidays: [] as any[]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/timings');
      if (res?.data) {
        setSettings({
          attendance_start_time: res?.data.attendance_start_time?.slice(0, 5) || '08:00',
          attendance_end_time: res?.data.attendance_end_time?.slice(0, 5) || '09:00',
          school_end_time: res?.data.school_end_time?.slice(0, 5) || '15:00',
          week_off_days: res?.data.week_off_days || ['Sunday'],
          holidays: res?.data.holidays || []
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load school timings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate holidays
      for (const h of settings.holidays) {
        if (!h.title || !h.start_date || !h.end_date) {
          toast.error("Please fill all fields for holidays.");
          setSaving(false);
          return;
        }
      }
      
      await api.post('/settings/timings', settings);
      toast.success('Timings updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update timings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSettings(prev => {
      const isOff = prev.week_off_days.includes(day);
      const newOffDays = isOff 
        ? prev.week_off_days.filter(d => d !== day)
        : [...prev.week_off_days, day];
      return { ...prev, week_off_days: newOffDays };
    });
  };

  const addHoliday = () => {
    setSettings(prev => ({
      ...prev,
      holidays: [...prev.holidays, { id: null, title: '', start_date: '', end_date: '' }]
    }));
  };

  const removeHoliday = (idx: number) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== idx)
    }));
  };

  const updateHoliday = (idx: number, field: string, value: string) => {
    setSettings(prev => {
      const newHolidays = [...prev.holidays];
      newHolidays[idx][field] = value;
      return { ...prev, holidays: newHolidays };
    });
  };

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <Header>
          <Title><RiTimeLine color="#3B82F6" /> School Timings & Holidays</Title>
          <CloseBtn onClick={onClose}><RiCloseLine size={20} /></CloseBtn>
        </Header>
        
        <Body>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading...</div>
          ) : (
            <>
              {/* TIMINGS SECTION */}
              <div>
                <SectionTitle style={{ marginBottom: 16 }}>Daily Timings</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormGroup>
                    <Label>Attendance Start Time</Label>
                    <Input 
                      type="time" 
                      value={settings.attendance_start_time}
                      onChange={e => setSettings({...settings, attendance_start_time: e.target.value})}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Attendance End Time (Late)</Label>
                    <Input 
                      type="time" 
                      value={settings.attendance_end_time}
                      onChange={e => setSettings({...settings, attendance_end_time: e.target.value})}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>School End Time</Label>
                    <Input 
                      type="time" 
                      value={settings.school_end_time}
                      onChange={e => setSettings({...settings, school_end_time: e.target.value})}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* WEEK OFFS SECTION */}
              <div>
                <SectionTitle style={{ marginBottom: 12 }}>Week Off Days</SectionTitle>
                <WeekDaysWrap>
                  {DAYS.map(day => (
                    <DayChip 
                      key={day} 
                      $active={settings.week_off_days.includes(day)}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </DayChip>
                  ))}
                </WeekDaysWrap>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 8 }}>
                  Attendance and substitution alerts will be skipped on these days. Fee reminders remain active.
                </div>
              </div>

              {/* HOLIDAYS SECTION */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <SectionTitle style={{ borderBottom: 'none', paddingBottom: 0 }}>Special Holidays</SectionTitle>
                  <Button style={{ padding: '6px 12px', fontSize: '0.8125rem' }} onClick={addHoliday}>
                    <RiAddLine /> Add Holiday
                  </Button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {settings.holidays.length === 0 ? (
                    <div style={{ fontSize: '0.875rem', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>
                      No holidays added yet.
                    </div>
                  ) : (
                    settings.holidays.map((h, idx) => (
                      <HolidayItem key={idx}>
                        <Input 
                          placeholder="Holiday Name (e.g. Summer Break)" 
                          value={h.title}
                          onChange={e => updateHoliday(idx, 'title', e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <Input 
                          type="date"
                          value={h.start_date}
                          onChange={e => updateHoliday(idx, 'start_date', e.target.value)}
                        />
                        <Input 
                          type="date"
                          value={h.end_date}
                          onChange={e => updateHoliday(idx, 'end_date', e.target.value)}
                        />
                        <IconButton $danger onClick={() => removeHoliday(idx)}>
                          <RiDeleteBinLine />
                        </IconButton>
                      </HolidayItem>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </Body>

        <Footer>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button $primary onClick={handleSave} disabled={saving || loading}>
            <RiSave3Line /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Footer>
      </ModalCard>
    </Overlay>
  );
}
