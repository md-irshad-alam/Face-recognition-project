import styled from 'styled-components';

export const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #F8FAFC;
  margin: -40px;
  padding: 32px 40px;
  min-height: calc(100vh - 80px); /* Fit within viewport */
  overflow: hidden; /* Encourage fitting without scroll */
`;

export const HeroSection = styled.div`
  margin-bottom: 4px;
`;

export const PageTitle = styled.h1`
  font-size: 2.25rem; /* Reduced from 3rem */
  font-weight: 900;
  color: #0F172A;
  margin: 0 0 4px;
  letter-spacing: -0.04em;
`;

export const PageSubtitle = styled.p`
  font-size: 0.9375rem; /* Reduced from 1.125rem */
  color: #64748B;
  font-weight: 500;
  margin: 0;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px; /* Reduced from 24px */

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 20px; /* Reduced from 28px */
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }
`;

export const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StatIcon = styled.div<{ $bg: string; $color: string }>`
  width: 44px; /* Reduced from 52px */
  height: 44px;
  border-radius: 12px;
  background-color: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

export const StatBadge = styled.span<{ $type: 'success' | 'danger' | 'warning' | 'info' }>`
  background: ${p => 
    p.$type === 'success' ? '#DCFCE7' : 
    p.$type === 'danger' ? '#FEE2E2' : 
    p.$type === 'warning' ? '#FEF3C7' : '#F5F3FF'};
  color: ${p => 
    p.$type === 'success' ? '#166534' : 
    p.$type === 'danger' ? '#991B1B' : 
    p.$type === 'warning' ? '#92400E' : '#4F46E5'};
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
`;

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StatLabel = styled.span`
  font-size: 0.6875rem; /* Reduced from 0.8125rem */
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const StatValue = styled.span`
  font-size: 1.75rem; /* Reduced from 2.25rem */
  font-weight: 900;
  color: #1E293B;
  letter-spacing: -0.02em;
  line-height: 1;
`;

export const ChartRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px; /* Reduced from 28px */

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);
`;

export const SectionTitleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem; /* Reduced from 1.5rem */
  font-weight: 800;
  color: #0F172A;
  margin: 0;
`;

export const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 500;
  margin: 0;
`;

/* ─── Exam List Styles ─── */
export const ExamItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  margin-bottom: 8px;
  transition: all 0.2s;

  &:hover {
    background: white;
    border-color: #4F46E5;
    transform: translateX(4px);
  }
`;

export const ExamDateBadge = styled.div`
  width: 44px;
  height: 44px;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;

  span:first-child { font-size: 1rem; color: #1E293B; line-height: 1; }
  span:last-child { font-size: 0.5625rem; color: #94A3B8; text-transform: uppercase; }
`;

export const ExamDetails = styled.div`
  flex: 1;
  h4 { font-size: 0.875rem; font-weight: 800; color: #1E293B; margin: 0 0 1px; }
  p { font-size: 0.75rem; color: #64748B; margin: 0; font-weight: 500; }
`;

export const AlertsCard = styled.div`
  background: #FFF5F5;
  border: 1px solid #FEE2E2;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  .alert-header h2 {
    color: #991B1B;
    font-size: 1.25rem;
    font-weight: 900;
    margin: 0 0 2px;
  }
  
  .alert-header p {
    color: #EF4444;
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }
`;

export const AlertItem = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #FEF2F2;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.25rem;
  }

  .content h4 {
    font-size: 0.875rem;
    font-weight: 800;
    color: #0F172A;
    margin: 0 0 4px;
  }
  
  .content p {
    font-size: 0.75rem;
    color: #64748B;
    font-weight: 500;
    line-height: 1.4;
    margin: 0;
  }
`;

export const ReviewBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background-color: #B91C1C;
  color: white;
  font-weight: 800;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;

  &:hover {
    background-color: #991B1B;
    transform: translateY(-2px);
  }
`;

export const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LogCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  padding: 24px;
  height: 100%;
`;

export const DonutWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px; /* Reduced from 260px */
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DonutCenter = styled.div`
  position: absolute;
  text-align: center;
  
  h2 {
    font-size: 2.25rem; /* Reduced from 2.75rem */
    font-weight: 900;
    color: #1E293B;
    margin: 0;
    line-height: 1;
  }
  
  span {
    font-size: 0.625rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

export const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

export const LegendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LegendLabel = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #64748B;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.$color};
  }
`;

export const LegendValue = styled.span`
  font-size: 0.9375rem;
  font-weight: 800;
  color: #1E293B;
`;

export const ToggleGroup = styled.div`
  background: #F1F5F9;
  padding: 3px;
  border-radius: 10px;
  display: flex;
  gap: 2px;
`;

export const ToggleBtn = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  background: ${p => p.$active ? '#4F46E5' : 'transparent'};
  color: ${p => p.$active ? 'white' : '#64748B'};
  transition: all 0.2s ease;
`;

export const TrendsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

/* ─── Modal Specific Styles ─── */
export const ModalAlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ModalAlertItem = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: #4F46E5;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export const AlertInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h4 {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #0F172A;
    margin: 0;
  }

  p {
    font-size: 0.8125rem;
    color: #64748B;
    font-weight: 500;
    margin: 0;
  }
  
  .meta {
    font-size: 0.6875rem;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionBtn = styled.button<{ $variant: 'approve' | 'reject' }>`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$variant === 'approve' ? '#10B981' : '#F1F5F9'};
  color: ${p => p.$variant === 'approve' ? 'white' : '#64748B'};

  &:hover {
    background: ${p => p.$variant === 'approve' ? '#059669' : '#E2E8F0'};
    color: ${p => p.$variant === 'approve' ? 'white' : '#1E293B'};
    transform: translateY(-1px);
  }
`;
