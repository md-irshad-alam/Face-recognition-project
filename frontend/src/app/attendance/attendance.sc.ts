import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  background-color: #F8FAFC;
  margin: -40px;
  padding: 40px;
  // height: calc(100vh - 0px); /* Fill the viewport */
  overflow: hidden; /* Prevent whole page scroll */
  
  @media (max-width: 768px) {
    padding: 24px;
    margin: 0;
    height: auto;
    overflow-y: auto;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748B;
  font-weight: 500;
  margin: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

export const TitleGroup = styled.div`
  span {
    color: #4F46E5;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 4px;
  }
  h1 {
    font-size: 2.25rem;
    font-weight: 900;
    color: #0F172A;
    margin: 0;
    letter-spacing: -0.04em;
  }
`;

export const CameraStatus = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

export const CameraIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ECFDF5;
  color: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

export const StatusInfo = styled.div`
  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.6875rem;
    font-weight: 800;
    color: #10B981;
    text-transform: uppercase;
    
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
    }
  }
  .cam-name {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #1E293B;
    margin: 1px 0;
  }
  .sync {
    font-size: 0.6875rem;
    color: #94A3B8;
    font-weight: 500;
  }
`;

export const RefreshBtn = styled.button<{ $isRefreshing?: boolean }>`
  background: none;
  border: none;
  color: #4F46E5;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  svg {
    animation: ${p => p.$isRefreshing ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover { transform: scale(1.1); }
`;

export const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
  cursor: pointer;
  transition: all 0.2s;
  
  svg { color: #64748B; }
  span { font-size: 0.875rem; font-weight: 700; color: #334155; }

  &:hover {
    border-color: #4F46E5;
    background: #F8FAFC;
  }

  @media (max-width: 768px) {
    min-width: 0;
  }
`;

export const PDFButton = styled.button`
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 12px 24px;
  font-weight: 800;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background: #4338CA;
  }
`;

export const TableCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

export const AttendanceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 20px 32px;
    background: #F8FAFC;
    color: #94A3B8;
    font-size: 0.6875rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-bottom: 1px solid #F1F5F9;
  }
  
  td {
    padding: 16px 32px;
    border-bottom: 1px solid #F1F5F9;
    vertical-align: middle;
  }
  
  tr:last-child td { border-bottom: none; }
`;

export const StudentCell = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const Avatar = styled.div<{ $src?: string; $bg?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${p => p.$bg || '#6366F1'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.875rem;
  overflow: hidden;
  
  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const StudentInfo = styled.div`
  h4 { font-size: 0.9375rem; font-weight: 800; color: #1E293B; margin: 0; }
  p { font-size: 0.75rem; color: #94A3B8; margin: 0; font-weight: 500; }
`;

export const IDBadge = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748B;
  background: #F1F5F9;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.05em;
`;

export const StatusPill = styled.div<{ $status: 'Present' | 'Absent' | 'Late' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 800;
  background: ${p => 
    p.$status === 'Present' ? '#ECFDF5' : 
    p.$status === 'Absent' ? '#FFF1F2' : '#FFFBEB'};
  color: ${p => 
    p.$status === 'Present' ? '#10B981' : 
    p.$status === 'Absent' ? '#F43F5E' : '#F59E0B'};
    
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

export const TimeText = styled.span`
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
`;

export const ActionCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
`;

export const ToggleSwitch = styled.div<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  background: ${p => p.$active ? '#4F46E5' : '#E2E8F0'};
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${p => p.$active ? '23px' : '3px'};
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
`;

export const EditLink = styled.button`
  background: none;
  border: none;
  color: #4F46E5;
  font-size: 0.8125rem;
  font-weight: 800;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

export const PaginationRow = styled.div`
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  p { font-size: 0.8125rem; color: #94A3B8; font-weight: 500; font-style: italic; }
`;

export const PageControls = styled.div`
  display: flex;
  gap: 8px;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${p => p.$active ? '#4F46E5' : '#E2E8F0'};
  background: ${p => p.$active ? '#4F46E5' : 'white'};
  color: ${p => p.$active ? 'white' : '#64748B'};
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const AnalyticsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
`;

export const ChartCard = styled.div`
  background: #EEF2FF;
  border-radius: 32px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
`;

export const ChartInfo = styled.div`
  h3 { font-size: 1.5rem; font-weight: 900; color: #1E293B; margin: 0 0 12px; }
  p { font-size: 0.9375rem; color: #64748B; font-weight: 500; max-width: 300px;
    strong { color: #10B981; font-weight: 800; }
  }
`;

export const BarGraph = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 120px;
`;

export const Bar = styled.div<{ $height: number; $active?: boolean }>`
  width: 14px;
  height: ${p => p.$height}%;
  background: ${p => p.$active ? '#4F46E5' : '#C7D2FE'};
  border-radius: 4px 4px 0 0;
`;

export const PeakCard = styled.div`
  background: #3730A3;
  border-radius: 32px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;
`;

export const PeakBadge = styled.span`
  background: rgba(16, 185, 129, 0.2);
  color: #10B981;
  font-size: 0.625rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: absolute;
  top: 32px;
  right: 32px;
`;

export const PeakHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  
  .icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
  
  span { font-size: 0.8125rem; font-weight: 600; opacity: 0.8; }
`;

export const PeakTime = styled.div`
  h2 { font-size: 2.75rem; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -0.02em; }
  p { font-size: 0.875rem; font-weight: 600; opacity: 0.7; margin-top: 8px; }
`;

/* ─── Filter Modal Specific Styles ─── */
export const ClassGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
`;

export const ClassOption = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s;
  
  &:hover { background: #F8FAFC; }
`;

export const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #E2E8F0;
  cursor: pointer;
  accent-color: #4F46E5;
`;

export const ClassLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #334155;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

export const ActionBtn = styled.button<{ $variant?: 'primary' | 'secondary' | 'reset' }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  border: ${p => p.$variant === 'secondary' ? '1px solid #E2E8F0' : 'none'};
  background: ${p => 
    p.$variant === 'primary' ? '#4F46E5' : 
    p.$variant === 'reset' ? '#FEE2E2' : 'white'};
  color: ${p => 
    p.$variant === 'primary' ? 'white' : 
    p.$variant === 'reset' ? '#991B1B' : '#64748B'};

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;

/* ─── Tabs Styles ─── */
export const TabContainer = styled.div`
  display: flex;
  gap: 32px;
  border-bottom: 2px solid #E2E8F0;
  margin-bottom: 8px;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 800;
  color: ${p => p.$active ? '#4F46E5' : '#64748B'};
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #4F46E5;
    border-radius: 3px;
    opacity: ${p => p.$active ? 1 : 0};
    transform: scaleX(${p => p.$active ? 1 : 0.8});
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover { color: #4F46E5; }
`;

/* ─── Device Monitoring (Sync Dashboard) Styles ─── */
export const DeviceGrid = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 32px;
  flex: 1;
  overflow: hidden; /* Contain scrollable children */
  
  .main-feed {
    overflow-y: auto;
    padding-right: 8px;
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
    .main-feed, .side-panel { overflow: visible; }
  }
`;

export const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: row; /* Keep on same row */
    gap: 12px;
    margin-bottom: 24px;
    
    h1 { font-size: 1.5rem !important; }
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
`;

export const SyncButton = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : '1px solid #E2E8F0'};
  background: ${p => p.$primary ? '#4F46E5' : '#EEF2FF'};
  color: ${p => p.$primary ? 'white' : '#4F46E5'};
  box-shadow: ${p => p.$primary ? '0 10px 15px -3px rgba(79, 70, 229, 0.4)' : 'none'};
  transition: all 0.2s;

  &:hover { transform: translateY(-2px); }
`;

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 { font-size: 1.25rem; font-weight: 800; color: #1E293B; margin: 0; }
`;

export const NodeStatusGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const NodeBadge = styled.span<{ $offline?: boolean }>`
  background: ${p => p.$offline ? '#FEE2E2' : '#DCFCE7'};
  color: ${p => p.$offline ? '#B91C1C' : '#166534'};
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 800;
`;

export const DeviceCard = styled.div<{ $offline?: boolean }>`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Use space-between as requested */
  gap: 24px;
  opacity: ${p => p.$offline ? 0.7 : 1};
  transition: border-color 0.2s;

  &:hover { border-color: #4F46E5; }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const DeviceIcon = styled.div`
  width: 52px;
  height: 52px;
  background: #EEF2FF;
  color: #4F46E5;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const DeviceMain = styled.div`
  flex: 1;
`;

export const DeviceTitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  h4 { font-size: 1.125rem; font-weight: 800; color: #1E293B; margin: 0; }
  span { font-size: 0.625rem; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 4px;
    &::before { content: ''; width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
    &.offline { color: #F43F5E; }
  }
`;

export const DeviceMetrics = styled.div`
  display: flex;
  justify-content: space-between; /* Use space-between for details */
  gap: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748B;
  
  div { display: flex; align-items: center; gap: 6px; }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 12px;
  }
`;

export const DBMetric = styled.div`
  text-align: right;
  p { font-size: 0.6875rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin: 0 0 2px; }
  span { font-size: 0.9375rem; font-weight: 800; color: #334155; }
`;

export const DeviceActions = styled.div`
  display: flex;
  gap: 12px;
`;

export const RoundAction = styled.button<{ $danger?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { background: ${p => p.$danger ? '#FEE2E2' : '#EEF2FF'}; color: ${p => p.$danger ? '#EF4444' : '#4F46E5'}; border-color: transparent; }
`;

export const RebootBtn = styled.button`
  background: #312E81;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
`;

/* ─── Sidebar Cards (Health & Logs) ─── */
export const HealthCard = styled.div`
  background: linear-gradient(135deg, #4338CA 0%, #312E81 100%);
  border-radius: 32px;
  padding: 32px;
  color: white;
  margin-bottom: 24px;
  
  span { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; opacity: 0.8; letter-spacing: 0.1em; }
  h2 { font-size: 3.5rem; font-weight: 900; margin: 8px 0 20px; line-height: 1; }
`;

export const EfficiencyBar = styled.div`
  margin-top: 24px;
  .label { display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 800; margin-bottom: 8px; }
  .track { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
  .fill { height: 100%; background: #10B981; border-radius: 3px; width: 92%; }
`;

export const LogsCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 32px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  max-height: 400px; /* Take available space */
  
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 24px;
    h3 { font-size: 1.25rem; font-weight: 800; color: #1E293B; margin: 0; }
    svg { color: #94A3B8; }
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const LogsScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 16px;
  max-height: 500px; /* Fallback for desktop if layout is loose */

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #F1F5F9;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
  }
`;

export const ErrorLog = styled.div`
  background: #F8FAFC;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  
  .icon-box { width: 36px; height: 36px; border-radius: 10px; background: #FEF2F2; color: #F43F5E; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
  .details {
    .meta { display: flex; justify-content: space-between; font-size: 0.625rem; font-weight: 900; text-transform: uppercase; margin-bottom: 4px;
      label { color: #F43F5E; }
      time { color: #94A3B8; }
    }
    p { font-size: 0.8125rem; font-weight: 600; color: #334155; line-height: 1.4; margin: 0; }
  }
`;

export const AuditBtn = styled.button`
  width: 100%;
  padding: 14px;
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
  border-radius: 14px;
  font-weight: 800;
  color: #4F46E5;
  cursor: pointer;
  font-size: 0.8125rem;
  margin-top: 8px;
`;
