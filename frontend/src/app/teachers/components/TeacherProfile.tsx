import React, { useState } from 'react';
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
  RiMailSendLine
} from 'react-icons/ri';
import { Teacher } from '@/hooks/useTeachers';
import * as SC from './TeacherProfile.sc';

interface TeacherProfileProps {
  teacher: Teacher;
  onBack: () => void;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, onBack }) => {
  // Helpers for mockup data
  const initials = `${teacher.first_name?.[0] ?? ''}${teacher.last_name?.[0] ?? ''}`.toUpperCase();
  const fullName = `${teacher.first_name} ${teacher.last_name}`;
  const daysPresent = 24; // Mock data
  const leavesTaken = 2; // Mock data
  
  // Split specialization into tags
  const skills = teacher.specialization 
    ? teacher.specialization.split(',').map(s => s.trim()) 
    : ['Academic Research', 'Curriculum Design', 'Student Mentorship'];

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
        </SC.MainCard>
      </SC.Sidebar>

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
