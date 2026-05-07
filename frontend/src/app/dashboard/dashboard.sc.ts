import styled from 'styled-components';

export const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

export const WelcomeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const Greeting = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 900;
    color: #0F172A;
    margin: 0;
    letter-spacing: -0.04em;

    @media (max-width: 480px) {
      font-size: 1.75rem;
    }
  }

  p {
    font-size: 1.125rem;
    color: #64748B;
    font-weight: 500;
    margin: 4px 0 0;

    @media (max-width: 480px) {
      font-size: 0.875rem;
    }
  }
`;

export const QuickActions = styled.div`
  display: flex;
  gap: 12px;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${p => p.$variant === 'primary' ? '#4F46E5' : 'white'};
  color: ${p => p.$variant === 'primary' ? 'white' : '#1E293B'};
  border: ${p => p.$variant === 'primary' ? 'none' : '1.5px solid #E2E8F0'};
  box-shadow: ${p => p.$variant === 'primary' ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$variant === 'primary' ? '0 8px 16px rgba(79, 70, 229, 0.3)' : '0 4px 12px rgba(0,0,0,0.05)'};
    background: ${p => p.$variant === 'primary' ? '#4338CA' : '#F8FAFC'};
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 20px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.05);
    border-color: #4F46E530;
  }

  .sparkline-box {
    width: 100px;
    height: 50px;
    flex-shrink: 0;
  }
`;

export const StatIconBox = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${p => p.$color}15;
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  
  label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #64748B;
    margin-bottom: 4px;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1E293B;
    margin: 0;
    letter-spacing: -0.02em;
  }
`;

export const TrendBadge = styled.div<{ $up?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${p => p.$up ? '#10B981' : '#EF4444'};
  background: ${p => p.$up ? '#F0FDF4' : '#FEF2F2'};
  padding: 4px 8px;
  border-radius: 20px;
  width: fit-content;
`;

export const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: white;
  border-radius: 28px;
  border: 1px solid #E2E8F0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 24px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    gap: 16px;
    border-radius: 20px;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .title-area {
    h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }
    p {
      font-size: 0.875rem;
      color: #64748B;
      margin: 4px 0 0;
    }
  }
`;

export const ToggleGroup = styled.div`
  background: #F1F5F9;
  padding: 4px;
  border-radius: 12px;
  display: flex;
  gap: 2px;
`;

export const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 10px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  background: ${p => p.$active ? 'white' : 'transparent'};
  color: ${p => p.$active ? '#4F46E5' : '#64748B'};
  box-shadow: ${p => p.$active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'};
  transition: all 0.2s;
`;

export const AlertsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const AlertItem = styled.div<{ $type: 'warning' | 'danger' | 'info' }>`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  background: ${p => 
    p.$type === 'danger' ? '#FEF2F2' : 
    p.$type === 'warning' ? '#FFFBEB' : '#F0F9FF'};
  border: 1px solid ${p => 
    p.$type === 'danger' ? '#FEE2E2' : 
    p.$type === 'warning' ? '#FEF3C7' : '#E0F2FE'};
  transition: all 0.2s;

  &:hover {
    transform: translateX(4px);
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: white;
    color: ${p => 
      p.$type === 'danger' ? '#EF4444' : 
      p.$type === 'warning' ? '#F59E0B' : '#0EA5E9'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  }

  .content {
    h4 {
      font-size: 0.875rem;
      font-weight: 800;
      color: #1E293B;
      margin: 0 0 4px;
    }
    p {
      font-size: 0.8125rem;
      color: #64748B;
      margin: 0;
      line-height: 1.4;
    }
  }
`;

export const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const FeeDonutWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DonutCenter = styled.div`
  position: absolute;
  text-align: center;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 900;
    color: #0F172A;
    margin: 0;

    @media (max-width: 480px) {
      font-size: 1.75rem;
    }
  }
  span {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

export const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const LegendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F1F5F9;

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748B;
    
    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${p => p.color};
    }
  }

  .value {
    font-weight: 800;
    color: #1E293B;
  }
`;

export const PieChartWrapper = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
`;



export const ModalAlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ModalAlertItem = styled.div`
  background: #F8FAFC;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionBtn = styled.button<{ $variant: 'approve' | 'reject' }>`
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  background: ${p => p.$variant === 'approve' ? '#10B981' : '#F1F5F9'};
  color: ${p => p.$variant === 'approve' ? 'white' : '#64748B'};
`;

// --- Leave Modal Styled Components ---
export const LeaveModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  .icon-box {
    width: 42px;
    height: 42px;
    background: #EEF2FF;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4F46E5;
  }

  .title-area {
    h3 { font-size: 1.125rem; font-weight: 800; color: #1E293B; margin: 0; }
    span { font-size: 0.6875rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
  }
`;
export const ProfileName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;
export const LeaveRequestCard = styled.div`
  background: #F4F7FF;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  height:180px;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-color: #4F46E530;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .profile {
    display: flex;
    gap: 12px;
    align-items: center;
    img { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
    h4 { font-size: 1rem; font-weight: 800; color: #1E293B; margin: 0; }
    .badge-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-top: 12px;
    border-top: 1px solid #E2E8F0;
  }

  .info-group {
    label { display: block; font-size: 0.625rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    span { font-size: 0.8125rem; font-weight: 700; color: #1E293B; }
    p { font-size: 0.8125rem; color: #475569; margin: 4px 0 0; line-height: 1.5; }
  }
`;

export const LeaveTypeChip = styled.span<{ $type?: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${p => p.$type === 'sick' ? '#FEF2F2' : '#F5F3FF'};
  color: ${p => p.$type === 'sick' ? '#EF4444' : '#7C3AED'};
`;

export const LeaveActionBtn = styled.button<{ $variant: 'approve' | 'reject' }>`
  flex: 1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  
  background: ${p => p.$variant === 'approve' ? '#4F46E5' : 'white'};
  color: ${p => p.$variant === 'approve' ? 'white' : '#64748B'};
  border: ${p => p.$variant === 'approve' ? 'none' : '1.5px solid #E2E8F0'};

  &:hover {
    background: ${p => p.$variant === 'approve' ? '#4338CA' : '#F8FAFC'};
    transform: translateY(-1px);
  }
`;

export const LeaveModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #F1F5F9;
  margin-top: 12px;

  .history-link {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748B;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    &:hover { color: #4F46E5; }
  }

  .footer-actions {
    display: flex;
    gap: 16px;
    span { font-size: 0.75rem; font-weight: 800; color: #4F46E5; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; }
  }
`;
