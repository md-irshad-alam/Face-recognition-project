'use client'

import React, { useState, useEffect } from 'react';
import { 
  RiEditLine, RiArrowLeftSLine, RiShieldUserLine,
  RiVerifiedBadgeFill, RiPulseLine, RiHistoryLine, RiAwardLine,
  RiDownload2Line
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

  const downloadQRCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = document.getElementById('student-qr') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `student-qr-${student?.id}.png`;
      link.href = url;
      link.click();
      toast.success('QR Code downloaded successfully');
    }
  };

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

  // Public URL for QR code
  const publicProfileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/public-profile/${student.id}` 
    : '';

  return (
    <SC.ProfileWrapper>
      <SC.ProfileHeaderWrapper>
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
      </SC.ProfileHeaderWrapper>

      <SC.ProfileScrollArea>
        <SC.MainGrid>
          <SC.LeftColumn>
            <SC.ProfileCard>
              <SC.AvatarBox>
                <img 
                  src={student.photo_url ? `http://127.0.0.1:8000${student.photo_url}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.id} 
                  alt={student.name} 
                />
                <div className="badge"><RiVerifiedBadgeFill /></div>
              </SC.AvatarBox>

              <SC.StudentName>{student.name}</SC.StudentName>
              <SC.StudentId>ID: {student.id} • Grade {student.class_name}</SC.StudentId>

              <SC.InfoList>
                <SC.InfoItem>
                  <label>Section</label>
                  <span>{student.section || 'A'}</span>
                </SC.InfoItem>
                <SC.InfoItem>
                  <label>Status</label>
                  <span className="status-pill">{student.is_on_hold ? 'On Hold' : 'Active'}</span>
                </SC.InfoItem>
                <SC.InfoItem>
                  <label>Admission Date</label>
                  <span>{student.admission_date || 'N/A'}</span>
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
                <h3>Attendance Log</h3>
                <p>Last checked: Today</p>
                <div className="badge"><RiPulseLine /></div>
              </SC.MetricCard>

              <SC.MetricCard>
                <label>Attendance <strong>95%</strong></label>
                <SC.ProgressBox>
                  <div className="track"><div className="fill" style={{ width: '95%' }} /></div>
                  <div className="labels">
                    <span>Present: <strong>95%</strong></span>
                    <span className="absent">Absent: <strong>5%</strong></span>
                  </div>
                </SC.ProgressBox>
              </SC.MetricCard>

              <SC.MetricCard>
                <label>Pending Due Month Fee</label>
                <h3>₹{(student as any).total_monthly_fee || 0}</h3>
                <p>Status: Pending</p>
                <div className="badge" style={{ background: '#EF4444' }}><RiHistoryLine /></div>
              </SC.MetricCard>
            </SC.MetricsRow>

            <SC.ContentBox>
              <SC.TabBar>
                <SC.Tab $active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</SC.Tab>
                <SC.Tab $active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>Attendance</SC.Tab>
                <SC.Tab $active={activeTab === 'fees'} onClick={() => setActiveTab('fees')}>Fees</SC.Tab>
              </SC.TabBar>

              <SC.TabContent>
                {activeTab === 'details' && (
                  <>
                    <SC.DetailsGrid>
                      <div>
                        <SC.SectionTitle>Personal Records</SC.SectionTitle>
                        <SC.DataItem>
                          <label>Full Legal Name</label>
                          <p>{student.name}</p>
                        </SC.DataItem>
                        <SC.DataItem>
                          <label>Date of Birth</label>
                          <p>{student.dob || 'Not provided'}</p>
                        </SC.DataItem>
                        <SC.DataItem>
                          <label>Guardian Address</label>
                          <p>{(student as any).address || 'No address recorded'}</p>
                        </SC.DataItem>
                      </div>
                      <div>
                        <SC.SectionTitle>Institutional QR Code</SC.SectionTitle>
                        <SC.HighlightCard>
                          <SC.QRWrapper onClick={downloadQRCode}>
                            <QRCodeCanvas 
                              id="student-qr"
                              value={publicProfileUrl} 
                              size={180} 
                              level="H"
                              includeMargin={true}
                            />
                            <SC.DownloadOverlay className="download-overlay">
                              <RiDownload2Line />
                              <span>Download</span>
                            </SC.DownloadOverlay>
                          </SC.QRWrapper>
                          <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textAlign: 'center' }}>
                            Scan to view public institutional profile
                          </p>
                        </SC.HighlightCard>
                      </div>
                    </SC.DetailsGrid>
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
      </SC.ProfileScrollArea>
    </SC.ProfileWrapper>
  );
};

export default StudentProfile;
