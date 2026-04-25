import styled from 'styled-components';

export const PageWrapper = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;

  .title-area {
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }
    p {
      color: #64748B;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
    }
  }
`;

export const PrimaryButton = styled.button`
  background: #4F46E5;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);

  &:hover {
    background: #4338CA;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const RevenueChartCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid #F1F5F9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    .info {
      h3 { font-size: 1.25rem; font-weight: 800; color: #1E293B; margin: 0 0 4px 0; }
      p { font-size: 0.875rem; color: #94A3B8; margin: 0; }
    }

    .selectors {
      display: flex;
      gap: 12px;
    }
  }
`;

export const ChartPlaceholder = styled.div`
  height: 240px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 10px;
  gap: 12px;

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    height: 100%;
    justify-content: flex-end;
  }

  .bar {
    width: 100%;
    background: #EEF2FF;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    .fill {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: #4F46E5;
      border-radius: 8px;
      transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  .label {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
  }
`;

export const MiniStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const StatCard = styled.div<{ $type?: 'overdue' }>`
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid #F1F5F9;
  position: relative;
  overflow: hidden;

  .icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${p => p.$type === 'overdue' ? '#FEF2F2' : '#F0FDF4'};
    color: ${p => p.$type === 'overdue' ? '#EF4444' : '#10B981'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .badge {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 0.6875rem;
    font-weight: 800;
    background: ${p => p.$type === 'overdue' ? '#FEF2F2' : '#F0FDF4'};
    color: ${p => p.$type === 'overdue' ? '#B91C1C' : '#15803D'};
  }

  label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #64748B;
    margin-bottom: 4px;
  }

  .value {
    font-size: 1.75rem;
    font-weight: 800;
    color: #0F172A;
  }
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #F1F5F9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

export const FilterBar = styled.div`
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F1F5F9;

  .filters {
    display: flex;
    gap: 1rem;
  }

  .export-btn {
    color: #4F46E5;
    font-size: 0.875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-decoration: none;
    
    &:hover { text-decoration: underline; }
  }
`;

export const Select = styled.select`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid #F1F5F9;
  background: #F8FAFC;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1E293B;
  cursor: pointer;
  outline: none;

  &:focus { border-color: #4F46E5; }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const Th = styled.th`
  padding: 1.25rem 2rem;
  font-size: 0.6875rem;
  font-weight: 800;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #F1F5F9;
`;

export const Td = styled.td`
  padding: 1.25rem 2rem;
  font-size: 0.875rem;
  color: #1E293B;
  font-weight: 500;
  border-bottom: 1px solid #F1F5F9;
`;

export const StudentCell = styled.div`
  .name { font-weight: 800; color: #1E293B; display: block; }
  .id { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin-top: 2px; }
`;

export const StatusPill = styled.span<{ $status: 'Paid' | 'Unpaid' | 'Overdue' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${p => p.$status === 'Paid' && `
    background: #F0FDF4;
    color: #10B981;
    &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #10B981; }
  `}

  ${p => p.$status === 'Unpaid' && `
    background: #EEF2FF;
    color: #4F46E5;
    &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4F46E5; }
  `}

  ${p => p.$status === 'Overdue' && `
    background: #FEF2F2;
    color: #EF4444;
    &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #EF4444; }
  `}
`;

export const ActionButton = styled.button<{ $urgent?: boolean }>`
  background: ${p => p.$urgent ? '#B91C1C' : 'none'};
  color: ${p => p.$urgent ? 'white' : '#4F46E5'};
  border: none;
  font-size: 0.8125rem;
  font-weight: 800;
  cursor: pointer;
  padding: ${p => p.$urgent ? '8px 16px' : '0'};
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    text-decoration: ${p => p.$urgent ? 'none' : 'underline'};
    opacity: 0.9;
    transform: ${p => p.$urgent ? 'translateY(-1px)' : 'none'};
  }
`;

export const Pagination = styled.div`
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .info { font-size: 0.8125rem; color: #94A3B8; font-weight: 600; }
  .controls { display: flex; gap: 8px; }
`;

export const PageBtn = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${p => p.$active ? '#4F46E5' : '#F1F5F9'};
  background: ${p => p.$active ? '#4F46E5' : 'white'};
  color: ${p => p.$active ? 'white' : '#1E293B'};
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${p => p.$active ? '#4F46E5' : '#F8FAFC'};
  }
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 32px;
  border-bottom: 2px solid #F1F5F9;
  margin-bottom: 24px;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 12px 4px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${props => props.$active ? '#4F46E5' : '#94A3B8'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#4F46E5' : 'transparent'};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #4F46E5;
  }
`;
