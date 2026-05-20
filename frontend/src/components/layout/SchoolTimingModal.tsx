import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RiCloseLine, RiTimeLine, RiSave3Line } from 'react-icons/ri';
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
  max-width: 400px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  gap: 20px;
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

const Footer = styled.div`
  padding: 20px 24px;
  background: #F8FAFC;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

export default function SchoolTimingModal({ onClose }: SchoolTimingModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    attendance_start_time: '08:00',
    attendance_end_time: '09:00',
    school_end_time: '15:00'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/timings');
      if (res.data) {
        // Handle HH:MM:SS from db, truncate to HH:MM for input type="time"
        setSettings({
          attendance_start_time: res.data.attendance_start_time?.slice(0, 5) || '08:00',
          attendance_end_time: res.data.attendance_end_time?.slice(0, 5) || '09:00',
          school_end_time: res.data.school_end_time?.slice(0, 5) || '15:00'
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
      await api.post('/settings/timings', settings);
      toast.success('Timings updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update timings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <Header>
          <Title><RiTimeLine color="#3B82F6" /> School Timings</Title>
          <CloseBtn onClick={onClose}><RiCloseLine size={20} /></CloseBtn>
        </Header>
        
        <Body>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Loading...</div>
          ) : (
            <>
              <FormGroup>
                <Label>Attendance Start Time</Label>
                <Input 
                  type="time" 
                  value={settings.attendance_start_time}
                  onChange={e => setSettings({...settings, attendance_start_time: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Attendance End Time (Late Mark After)</Label>
                <Input 
                  type="time" 
                  value={settings.attendance_end_time}
                  onChange={e => setSettings({...settings, attendance_end_time: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>School End Time (Absent After)</Label>
                <Input 
                  type="time" 
                  value={settings.school_end_time}
                  onChange={e => setSettings({...settings, school_end_time: e.target.value})}
                />
              </FormGroup>
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
