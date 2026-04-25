'use client'

import React, { useState, useEffect } from 'react';
import { 
  RiEditLine, RiArrowLeftSLine, RiShieldUserLine,
  RiVerifiedBadgeFill, RiPulseLine, RiHistoryLine, RiAwardLine
} from 'react-icons/ri';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '@/services/api';
import * as SC from './StudentProfile.sc';
import { toast } from 'react-hot-toast';
import { Student } from '@/hooks/useStudents';

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
  onEdit: (student: Student) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onBack, onEdit }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'fees' | 'exams'>('details');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const data = await api.get<{ student: Student; history: any[] }>(`/students/${studentId}`);
        setStudent(data.student);
      } catch (err) {
        console.error('Error fetching student:', err);
        toast.error('Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <SC.ProfileWrapper>
        <p style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>Loading profile...</p>
      </SC.ProfileWrapper>
    );
  }

  if (!student) {
    return (
      <SC.ProfileWrapper>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <p style={{ opacity: 0.5, marginBottom: '20px' }}>Student not found.</p>
          <SC.ActionBtn onClick={onBack}>Back to Directory</SC.ActionBtn>
        </div>
      </SC.ProfileWrapper>
    );
  }

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/students?id=${student.id}` : '';

  return (
    <SC.ProfileWrapper>
      <SC.Breadcrumbs>
        DIRECTORY <span>/</span> STUDENT PROFILE
      </SC.Breadcrumbs>

      <SC.ProfileHeader>
        <div className="title-area">
          <SC.BackBtn onClick={onBack} title="Back to Directory">
            <RiArrowLeftSLine size={24} />
          </SC.BackBtn>
          <h1>{student.name}</h1>
        </div>
        <SC.HeaderActions>
          <SC.EditButton onClick={() => onEdit(student)}>
            <RiEditLine /> Edit Record
          </SC.EditButton>
        </SC.HeaderActions>
      </SC.ProfileHeader>

      <SC.MainGrid>
        <SC.LeftColumn>
          <SC.ProfileCard>
            <SC.QRCodeMini title="Scan to view profile">
              <QRCodeCanvas value={profileUrl} size={32} />
            </SC.QRCodeMini>
            
            <SC.AvatarBox>
              <img 
                src={student.photo_url ? `http://127.0.0.1:8000${student.photo_url}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.id} 
                alt={student.name} 
              />
              <div className="badge"><RiVerifiedBadgeFill /></div>
            </SC.AvatarBox>

            <SC.StudentName>{student.name}</SC.StudentName>
            <SC.StudentId>ID: {student.id} • Grade {student.class_name}</SC.StudentId>

            <SC.ButtonGroup>
              <SC.ActionBtn $primary onClick={() => toast.success('Message feature coming soon!')}>Message</SC.ActionBtn>
              <SC.ActionBtn onClick={() => toast.success('Viewing timeline...')}>Timeline</SC.ActionBtn>
            </SC.ButtonGroup>

            <SC.InfoList>
              <SC.InfoItem>
                <label>Academic Status</label>
                <span className="status-pill">Exceptional</span>
              </SC.InfoItem>
              <SC.InfoItem>
                <label>Curriculum</label>
                <span>Advanced STEM</span>
              </SC.InfoItem>
              <SC.InfoItem>
                <label>Advisor</label>
                <span>Dr. Emily Chen</span>
              </SC.InfoItem>
            </SC.InfoList>
          </SC.ProfileCard>

          <SC.EmergencyCard>
            <h3>Emergency Contact</h3>
            <SC.ContactRow>
              <div className="icon"><RiShieldUserLine /></div>
              <div className="details">
                <h4>Primary Guardian</h4>
                <p>{student.phone || 'Contact not provided'}</p>
              </div>
            </SC.ContactRow>
          </SC.EmergencyCard>
        </SC.LeftColumn>

        <SC.RightColumn>
          <SC.MetricsRow>
            <SC.MetricCard $variant="blue">
              <label>Daily Sync</label>
              <h3>Marked Present</h3>
              <p>Logged 8:45 AM</p>
              <div className="badge"><RiPulseLine /></div>
            </SC.MetricCard>

            <SC.MetricCard>
              <label>Attendance <strong>98.2%</strong></label>
              <SC.ProgressBox>
                <div className="track"><div className="fill" /></div>
                <div className="labels">
                  <span><strong>174</strong> Days</span>
                  <span className="absent"><strong>3</strong> Absent</span>
                </div>
              </SC.ProgressBox>
            </SC.MetricCard>

            <SC.MetricCard>
              <label>Fees Balance</label>
              <h3>$1,250.00</h3>
              <p>Due in 12 days</p>
              <div className="badge" style={{ background: '#EF4444' }}><RiHistoryLine /></div>
            </SC.MetricCard>
          </SC.MetricsRow>

          <SC.ContentBox>
            <SC.TabBar>
              <SC.Tab $active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</SC.Tab>
              <SC.Tab $active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>Attendance</SC.Tab>
              <SC.Tab $active={activeTab === 'fees'} onClick={() => setActiveTab('fees')}>Fees</SC.Tab>
              <SC.Tab $active={activeTab === 'exams'} onClick={() => setActiveTab('exams')}>Exams</SC.Tab>
            </SC.TabBar>

            <SC.TabContent>
              {activeTab === 'details' && (
                <>
                  <SC.SectionTitle>Personal Records</SC.SectionTitle>
                  <SC.DetailsGrid>
                    <div>
                      <SC.DataItem>
                        <label>Full Legal Name</label>
                        <p>{student.name}</p>
                      </SC.DataItem>
                      <SC.DataItem>
                        <label>Date of Birth</label>
                        <p>March 14, 2007 (17 Years Old)</p>
                      </SC.DataItem>
                      <SC.DataItem>
                        <label>Primary Residence</label>
                        <p>42 Academic Way, University District Palo Alto, CA 94301</p>
                      </SC.DataItem>
                    </div>
                    <div>
                      <SC.SectionTitle>Academic Highlights</SC.SectionTitle>
                      <SC.HighlightCard>
                        <div className="icon"><RiAwardLine /></div>
                        <div className="info">
                          <label>Term 1 GPA</label>
                          <h3>3.98</h3>
                        </div>
                      </SC.HighlightCard>
                      <SC.HighlightCard>
                        <div className="icon"><RiVerifiedBadgeFill /></div>
                        <div className="info">
                          <label>Scholarship Tier</label>
                          <h3>Honor Roll</h3>
                        </div>
                      </SC.HighlightCard>
                    </div>
                  </SC.DetailsGrid>

                  <SC.SectionTitle>Performance Index</SC.SectionTitle>
                  <SC.PerformanceGrid>
                    <SC.GradeCard><label>Math</label><div className="grade">A+</div></SC.GradeCard>
                    <SC.GradeCard><label>Physics</label><div className="grade">A</div></SC.GradeCard>
                    <SC.GradeCard><label>History</label><div className="grade">B+</div></SC.GradeCard>
                    <SC.GradeCard><label>Literature</label><div className="grade">A-</div></SC.GradeCard>
                  </SC.PerformanceGrid>
                </>
              )}
              {activeTab !== 'details' && (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                  <p>Extended data for {activeTab} will be integrated in the next sync.</p>
                </div>
              )}
            </SC.TabContent>
          </SC.ContentBox>
        </SC.RightColumn>
      </SC.MainGrid>
    </SC.ProfileWrapper>
  );
};

export default StudentProfile;
