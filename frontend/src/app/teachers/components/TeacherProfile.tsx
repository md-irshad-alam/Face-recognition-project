import React, { useState, useRef } from 'react';
import { 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiBook3Line, 
  RiGroupLine, 
  RiTimeLine, 
  RiAwardLine, 
  RiBriefcaseLine, 
  RiGraduationCapLine,
  RiDownloadLine,
  RiMailSendLine,
  RiCameraLine,
  RiUpload2Line,
  RiCheckboxCircleLine,
  RiCloseLine
} from 'react-icons/ri';
import { Teacher } from '@/hooks/useTeachers';
import * as SC from './TeacherProfile.sc';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';

interface TeacherProfileProps {
  teacher: Teacher;
  onBack: () => void;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, onBack }) => {
  const initials = `${teacher.first_name?.[0] ?? ''}${teacher.last_name?.[0] ?? ''}`.toUpperCase();
  const fullName = `${teacher.first_name} ${teacher.last_name}`;
  const daysPresent = 24;
  const leavesTaken = 2;
  
  const skills = teacher.specialization 
    ? teacher.specialization.split(',').map(s => s.trim()) 
    : ['Academic Research', 'Curriculum Design', 'Student Mentorship'];

  // Face Enrollment State
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(!!(teacher as any).face_embedding_path);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setFaceFile(file);
    setFacePreview(URL.createObjectURL(file));
    setUsingCamera(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setUsingCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 100);
    } catch {
      toast.error('Could not access webcam');
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `face_${teacher.id}.jpg`, { type: 'image/jpeg' });
      setFaceFile(file);
      setFacePreview(canvas.toDataURL('image/jpeg'));
      setUsingCamera(false);
      stream?.getTracks().forEach(t => t.stop());
      setStream(null);
    }, 'image/jpeg', 0.92);
  };

  const handleEnroll = async () => {
    if (!faceFile) { toast.error('Please capture or upload a photo first'); return; }
    setEnrolling(true);
    try {
      const formData = new FormData();
      formData.append('photo', faceFile);
      await api.postForm(`/schedule/register-face/${teacher.id}`, formData);
      toast.success(`Face enrolled successfully for ${fullName}`);
      setEnrolled(true);
      setShowFaceModal(false);
    } catch (err: any) {
      toast.error(err?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const closeModal = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setUsingCamera(false);
    setFacePreview(null);
    setFaceFile(null);
    setShowFaceModal(false);
  };

  return (
    <SC.ProfileWrapper>
      {/* ─── Left Sidebar ─── */}
      <SC.Sidebar>
        <SC.MainCard>
          <SC.PhotoWrapper>
            <SC.ProfilePhoto $bg={teacher.photo_url ? `url(${teacher.photo_url})` : 'linear-gradient(135deg,#667eea,#764ba2)'}>
              {!teacher.photo_url && initials}
            </SC.ProfilePhoto>
            <SC.StatusDot $active={teacher.status !== 'on_leave'} />
          </SC.PhotoWrapper>
          
          <SC.TeacherName>{fullName}</SC.TeacherName>
          <SC.TeacherTitle>{teacher.role === 'hod' ? 'Head of Department' : `Senior Professor of ${teacher.department || 'Mathematics'}`}</SC.TeacherTitle>
          
          <SC.InfoList>
            <SC.InfoItem>
              <SC.InfoLabel>Employee ID</SC.InfoLabel>
              <SC.InfoValue>EDU-{teacher.id.padStart(4, '0')}-22</SC.InfoValue>
            </SC.InfoItem>
            <SC.InfoItem>
              <SC.InfoLabel>Joined Date</SC.InfoLabel>
              <SC.InfoValue>{teacher.created_at ? new Date(teacher.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 12, 2018'}</SC.InfoValue>
            </SC.InfoItem>
            <SC.InfoItem>
              <SC.InfoLabel>Department</SC.InfoLabel>
              <SC.InfoValue>{teacher.department || 'Science & Math'}</SC.InfoValue>
            </SC.InfoItem>
          </SC.InfoList>
          
          <SC.MessageBtn>
            <RiMailSendLine size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Send Message
          </SC.MessageBtn>
          
          {/* Face Enrollment Button */}
          <button
            onClick={() => setShowFaceModal(true)}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '10px 16px',
              borderRadius: 10,
              border: enrolled ? '1.5px solid #10B981' : '1.5px solid #3B82F6',
              background: enrolled ? '#F0FDF4' : '#EFF6FF',
              color: enrolled ? '#059669' : '#2563EB',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {enrolled ? <RiCheckboxCircleLine size={18} /> : <RiCameraLine size={18} />}
            {enrolled ? 'Face Enrolled ✓' : 'Enroll Face'}
          </button>
        </SC.MainCard>
      </SC.Sidebar>

      {/* Face Enrollment Modal */}
      {showFaceModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: 20, width: '100%', maxWidth: 480,
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.125rem', color: '#0F172A' }}>Face Enrollment</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Register biometric profile for {fullName}</p>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <RiCloseLine size={24} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Preview / Camera area */}
              <div style={{
                width: '100%', height: 220, borderRadius: 12, overflow: 'hidden',
                background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, position: 'relative'
              }}>
                {usingCamera ? (
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : facePreview ? (
                  <img src={facePreview} alt="Face preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                    <RiCameraLine size={48} />
                    <p style={{ fontSize: '0.875rem', marginTop: 8 }}>No photo selected</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {usingCamera ? (
                  <button onClick={captureFrame} style={{
                    flex: 1, padding: '10px', background: '#3B82F6', color: 'white',
                    border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}>
                    <RiCameraLine size={18} /> Capture Photo
                  </button>
                ) : (
                  <button onClick={startCamera} style={{
                    flex: 1, padding: '10px', background: '#0F172A', color: 'white',
                    border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}>
                    <RiCameraLine size={18} /> Use Camera
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
                <button onClick={() => fileInputRef.current?.click()} style={{
                  flex: 1, padding: '10px', background: 'white', color: '#334155',
                  border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  <RiUpload2Line size={18} /> Upload Photo
                </button>
              </div>

              <button
                onClick={handleEnroll}
                disabled={!faceFile || enrolling}
                style={{
                  width: '100%', padding: '12px', background: faceFile ? '#10B981' : '#E2E8F0',
                  color: faceFile ? 'white' : '#94A3B8', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.9rem', cursor: faceFile ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <RiCheckboxCircleLine size={20} />
                {enrolling ? 'Enrolling...' : 'Save & Enroll Face'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <SC.ContentArea>
        <SC.TopBar>
          <SC.BackBtn onClick={onBack} title="Return to Directory">
            <RiArrowLeftSLine size={24} />
          </SC.BackBtn>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Faculty Member Profile</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Comprehensive academic and professional overview.</p>
          </div>
        </SC.TopBar>

        <SC.StatsGrid>
          <SC.SummaryCard>
            <SC.SummaryHeader $bg="#D1FAE5" $color="#059669">
              <div className="icon"><RiAwardLine size={20} /></div>
              <label>Days Present</label>
            </SC.SummaryHeader>
            <SC.SummaryValue>{daysPresent}<small>days this month</small></SC.SummaryValue>
          </SC.SummaryCard>

          <SC.SummaryCard>
            <SC.SummaryHeader $bg="#FEF3C7" $color="#D97706">
              <div className="icon"><RiTimeLine size={20} /></div>
              <label>Number of Leaves</label>
            </SC.SummaryHeader>
            <SC.SummaryValue>{leavesTaken}<small>approved</small></SC.SummaryValue>
          </SC.SummaryCard>

          <SC.SummaryCard>
            <SC.SummaryHeader>
              <div className="icon"><RiTimeLine size={20} /></div>
              <label>Office Hours</label>
            </SC.SummaryHeader>
            <SC.OfficeTime>
              {teacher.office_days || 'Mon, Wed, Fri'}
              <p>{teacher.office_time || '14:00 - 16:00 PM'}</p>
            </SC.OfficeTime>
          </SC.SummaryCard>
        </SC.StatsGrid>

        <SC.Grid2Col>
          <SC.SectionCard>
            <SC.SectionHeader>
              <RiAwardLine size={22} />
              <h3>Expertise & Skills</h3>
            </SC.SectionHeader>
            <SC.TagCloud>
              {skills.map(skill => <SC.SkillTag key={skill}>{skill}</SC.SkillTag>)}
            </SC.TagCloud>
            <SC.BioSection>
              <h4>RESEARCH FOCUS</h4>
              <p>{teacher.bio || 'Currently exploring the intersections of academic excellence and modern pedagogy. Focused on developing inclusive learning environments and advanced research methodologies.'}</p>
            </SC.BioSection>
          </SC.SectionCard>

          <SC.SectionCard>
            <SC.SectionHeader>
              <RiBriefcaseLine size={22} />
              <h3>Assigned Classes</h3>
            </SC.SectionHeader>
            <SC.ClassList>
              {(teacher.assigned_classes || ['Advanced Mathematics III', 'Foundations of Logic', 'Vector Calculus']).map((cls, idx) => (
                <SC.ClassItem key={idx}>
                  <div className="info">
                    <h5>{cls}</h5>
                    <p>Section {String.fromCharCode(65 + idx)} • Room {302 + idx}</p>
                  </div>
                  <RiArrowRightSLine size={20} />
                </SC.ClassItem>
              ))}
            </SC.ClassList>
          </SC.SectionCard>

          <SC.EducationCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <SC.SectionHeader style={{ marginBottom: 0 }}>
                <RiGraduationCapLine size={22} />
                <h3>Education History</h3>
              </SC.SectionHeader>
              <SC.DownloadCV>
                <RiDownloadLine size={16} /> Download CV
              </SC.DownloadCV>
            </div>
            
            <SC.EduTimeline>
              <SC.EduItem>
                <div className="main">
                  <h5>{teacher.highest_education || 'PhD in Pure Mathematics'}</h5>
                  <p>Stanford University, Stanford, CA</p>
                </div>
                <SC.EduBadge>2012 - 2016</SC.EduBadge>
              </SC.EduItem>
              <SC.EduItem>
                <div className="main">
                  <h5>Master of Science in Theoretical Physics</h5>
                  <p>Massachusetts Institute of Technology</p>
                </div>
                <SC.EduBadge style={{ background: '#F1F5F9', color: '#64748B' }}>2010 - 2012</SC.EduBadge>
              </SC.EduItem>
            </SC.EduTimeline>
          </SC.EducationCard>
        </SC.Grid2Col>
      </SC.ContentArea>
    </SC.ProfileWrapper>
  );
};

export default TeacherProfile;
