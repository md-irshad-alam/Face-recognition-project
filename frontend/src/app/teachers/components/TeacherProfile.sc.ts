import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const ProfileWrapper = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  padding: 8px;
`;

/* ─── Left Sidebar ─── */
export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const MainCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 40px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

export const PhotoWrapper = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 24px;
`;

export const ProfilePhoto = styled.div<{ $bg?: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${props => props.$bg || '#F1F5F9'};
  background-size: cover;
  background-position: center;
  border: 4px solid #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 800;
  color: #fff;
`;

export const StatusDot = styled.div<{ $active: boolean }>`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${props => props.$active ? '#10B981' : '#CBD5E1'};
  border: 3px solid #fff;
`;

export const TeacherName = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
`;

export const TeacherTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4F46E5;
  margin-bottom: 32px;
`;

export const InfoList = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

export const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
`;

export const InfoLabel = styled.span`
  color: #64748B;
  font-weight: 500;
`;

export const InfoValue = styled.span`
  color: #0F172A;
  font-weight: 700;
`;

export const MessageBtn = styled.button`
  width: 100%;
  height: 48px;
  background: #4F46E5;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
    background: #4338CA;
  }
`;

/* ─── Main Content ─── */
export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #F1F5F9;
  color: #0F172A;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  &:hover {
    background: #F8FAFC;
    transform: translateX(-2px);
    color: #4F46E5;
    border-color: #E2E8F0;
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

export const SummaryCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
`;

export const SummaryHeader = styled.div<{ $color?: string; $bg?: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || '#EEF2FF'};
    color: ${props => props.$color || '#4F46E5'};
  }

  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #64748B;
  }
`;

export const SummaryValue = styled.div`
  font-size: 2.25rem;
  font-weight: 800;
  color: #0F172A;
  
  small {
    font-size: 0.875rem;
    color: #64748B;
    margin-left: 8px;
  }
`;

export const OfficeTime = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #0F172A;
  
  p {
    font-size: 0.75rem;
    color: #64748B;
    margin-top: 4px;
  }
`;

export const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

export const SectionCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  
  svg {
    color: #4F46E5;
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 800;
    color: #0F172A;
  }
`;

export const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

export const SkillTag = styled.span`
  background: #EEF2FF;
  color: #4F46E5;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const BioSection = styled.div`
  h4 {
    font-size: 0.6875rem;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #94A3B8;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 0.8125rem;
    line-height: 1.6;
    color: #64748B;
  }
`;

export const ClassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ClassItem = styled.div`
  background: #F8FAFC;
  padding: 16px 20px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F1F5F9;
    transform: translateX(4px);
  }
  
  .info {
    h5 {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 4px;
    }
    p {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748B;
    }
  }
  
  svg {
    color: #94A3B8;
  }
`;

export const EducationCard = styled(SectionCard)`
  grid-column: span 2;
`;

export const EduTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  padding-left: 20px;
  
  &::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: #F1F5F9;
  }
`;

export const EduItem = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #4F46E5;
    z-index: 1;
  }
  
  .main {
    h5 {
      font-size: 0.9375rem;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }
    p {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #64748B;
    }
  }
`;

export const EduBadge = styled.span`
  background: #D1FAE5;
  color: #059669;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.6875rem;
  font-weight: 800;
`;

export const DownloadCV = styled.button`
  color: #4F46E5;
  background: none;
  border: none;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    text-decoration: underline;
  }
`;
