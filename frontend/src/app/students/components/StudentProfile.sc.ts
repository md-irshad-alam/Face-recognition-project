import styled from 'styled-components';

export const ProfileWrapper = styled.div`
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
`;

export const ProfileScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
    gap: 1.5rem;
  }
`;

export const ProfileHeaderWrapper = styled.div`
  padding: 2rem 2rem 1rem;
  background: #f8fafc;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem 0.5rem;
  }
`;

export const Breadcrumbs = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  color: #4F46E5;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;

  span {
    color: #94A3B8;
  }
`;

export const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title-area {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #0F172A;
    margin: 0;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    h1 { font-size: 2rem; }
  }
`;

export const BackBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: white;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s;

  &:hover {
    background: #F8FAFC;
    color: #4F46E5;
    border-color: #4F46E5;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

export const EditButton = styled.button`
  background: #4F46E5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4338CA;
    transform: translateY(-2px);
  }
`;

export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ProfileCard = styled.div`
  background: white;
  border-radius: 32px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
`;



export const AvatarBox = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 32px;
  background: #EEF2FF;
  position: relative;
  margin-bottom: 1.5rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 32px;
  }

  .badge {
    position: absolute;
    bottom: -6px;
    right: -6px;
    width: 28px;
    height: 28px;
    background: #10B981;
    color: white;
    border-radius: 50%;
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
`;

export const StudentName = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px;
`;

export const StudentId = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  margin: 0;
`;



export const ActionBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  background: ${p => p.$primary ? '#4F46E5' : '#F1F5F9'};
  color: ${p => p.$primary ? 'white' : '#4F46E5'};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

export const InfoList = styled.div`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  
  label {
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  span {
    color: #1e293b;
    font-weight: 700;
  }

  .status-pill {
    background: #DCFCE7;
    color: #10B981;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
  }
`;

export const EmergencyCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);

  h3 {
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 1rem;
    letter-spacing: 0.1em;
  }
`;

export const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    width: 40px;
    height: 40px;
    background: #FEF2F2;
    color: #EF4444;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .details {
    h4 { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #1e293b; }
    p { margin: 0; font-size: 0.8125rem; color: #64748b; }
  }
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div<{ $variant?: 'blue' | 'white' | 'red' }>`
  background: ${p => p.$variant === 'blue' ? '#EEF2FF' : 'white'};
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid ${p => p.$variant === 'blue' ? 'transparent' : '#E2E8F0'};
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;

  label {
    font-size: 0.6875rem;
    font-weight: 800;
    color: ${p => p.$variant === 'blue' ? '#4F46E5' : '#94A3B8'};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
  }

  p {
    font-size: 0.8125rem;
    color: #64748b;
    margin: 0;
  }

  .badge {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: #4F46E5;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
`;

export const ProgressBox = styled.div`
  margin-top: 8px;
  .track {
    height: 8px;
    background: #F1F5F9;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .fill {
    height: 100%;
    background: #4F46E5;
    width: 98.2%;
  }
  .labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.6875rem;
    font-weight: 700;
    color: #94A3B8;
    strong { color: #1e293b; }
    .absent { color: #EF4444; }
  }
`;

export const ContentBox = styled.div`
  background: white;
  border-radius: 32px;
  padding: 0;
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
`;

export const TabBar = styled.div`
  padding: 0 2rem;
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid #F1F5F9;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 1.5rem 0;
  font-size: 0.8125rem;
  font-weight: 800;
  color: ${p => p.$active ? '#4F46E5' : '#94A3B8'};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #4F46E5;
    display: ${p => p.$active ? 'block' : 'none'};
    border-radius: 3px;
  }
`;

export const TabContent = styled.div`
  padding: 2.5rem;

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

export const SectionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 1.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: #4F46E5;
    border-radius: 2px;
  }
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const DataItem = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    margin-bottom: 6px;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
  }
`;

export const HighlightCard = styled.div`
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
`;

export const QRWrapper = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    .download-overlay {
      opacity: 1;
      transform: scale(1);
    }
    transform: scale(1.02);
  }
`;

export const DownloadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(79, 70, 229, 0.9);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 8px;

  svg {
    font-size: 2rem;
  }

  span {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

export const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const GradeCard = styled.div`
  background: white;
  border: 1px solid #F1F5F9;
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;

  label {
    display: block;
    font-size: 0.625rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .grade {
    font-size: 2rem;
    font-weight: 800;
    color: #4F46E5;
  }
`;
