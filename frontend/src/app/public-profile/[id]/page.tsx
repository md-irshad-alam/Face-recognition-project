'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  RiShieldUserLine, RiVerifiedBadgeFill, RiPulseLine, RiHistoryLine
} from 'react-icons/ri';
import { api } from '@/services/api';
import * as SC from '../../students/components/StudentProfile.sc';
import { Student } from '@/hooks/useStudents';
import styled from 'styled-components';

// Public specific overrides
const PublicWrapper = styled(SC.ProfileWrapper)`
  padding: 60px 20px;
  background: radial-gradient(circle at top right, #EEF2FF, #FFFFFF);
  min-height: 100vh;
`;

const PublicContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const InstitutionalBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  background: white;
  border-radius: 100px;
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.1);
  width: fit-content;
  margin: 0 auto 24px;
  border: 1px solid #E2E8F0;

  span {
    font-size: 0.75rem;
    font-weight: 800;
    color: #4F46E5;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

export default function PublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        // Fetch student data. 
        // Endpoint is already public as verified in main.py
        const response = await fetch(`http://127.0.0.1:8000/students/${id}`);
        if (!response.ok) throw new Error('Student not found');
        const data = await response.json();
        setStudent(data.student);
      } catch (err) {
        console.error('Error fetching public student:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPublicData();
  }, [id]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #EEF2FF', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontWeight: 600, color: '#64748B' }}>Verifying Institutional ID...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!student) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
      <div style={{ textAlign: 'center', maxWidth: '300px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Record Not Found</h2>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>The student ID provided does not match any active records in our system.</p>
      </div>
    </div>
  );

  return (
    <PublicWrapper>
      <PublicContainer>
        <InstitutionalBadge>
          <RiVerifiedBadgeFill color="#4F46E5" size={18} />
          <span>Verified Institutional Record</span>
        </InstitutionalBadge>

        <SC.ProfileCard style={{ padding: '3rem' }}>
          <SC.AvatarBox style={{ width: '160px', height: '160px' }}>
            <img 
              src={student.photo_url ? `http://127.0.0.1:8000${student.photo_url}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.id} 
              alt={student.name} 
            />
            <div className="badge"><RiVerifiedBadgeFill /></div>
          </SC.AvatarBox>

          <SC.StudentName style={{ fontSize: '2rem' }}>{student.name}</SC.StudentName>
          <SC.StudentId style={{ fontSize: '1rem' }}>ID: {student.id}</SC.StudentId>

          <div style={{ display: 'flex', gap: '24px', marginTop: '2rem', width: '100%', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Grade</label>
              <span style={{ fontWeight: 700, color: '#1E293B' }}>{student.class_name}</span>
            </div>
            <div style={{ width: '1px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Section</label>
              <span style={{ fontWeight: 700, color: '#1E293B' }}>{student.section}</span>
            </div>
            <div style={{ width: '1px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
              <span style={{ fontWeight: 700, color: student.is_on_hold ? '#EF4444' : '#10B981' }}>{student.is_on_hold ? 'On Hold' : 'Active'}</span>
            </div>
          </div>
        </SC.ProfileCard>

        <SC.ContentBox>
          <SC.TabContent>
            <SC.SectionTitle>Administrative Details</SC.SectionTitle>
            <SC.DataItem>
              <label>Official Full Name</label>
              <p>{student.name}</p>
            </SC.DataItem>
            <SC.DataItem>
              <label>Institutional Email</label>
              <p>{student.email || 'N/A'}</p>
            </SC.DataItem>
            <SC.DataItem>
              <label>Enrollment Date</label>
              <p>{student.admission_date || 'Verified System Entry'}</p>
            </SC.DataItem>

            <div style={{ 
              marginTop: '40px', 
              padding: '24px', 
              background: '#F8FAFC', 
              borderRadius: '20px', 
              border: '1px dashed #E2E8F0',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', fontWeight: 600, lineHeight: 1.6 }}>
                This profile is verified by the institutional authority.<br/>
                For official transcript verification, please contact the administration office.
              </p>
            </div>
          </SC.TabContent>
        </SC.ContentBox>
      </PublicContainer>
    </PublicWrapper>
  );
}
