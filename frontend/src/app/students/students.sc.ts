import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 0;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  // background-color: #f8fafc;
  // height: 100vh;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
`;

export const PageHeaderWrapper = styled.div`
padding
  // padding-left: rem
  // background: #f8fafc;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0.5rem;
  }
`;

export const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 8px;
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

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 8px;

  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

export const StatCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  &:hover {
    border-color: #4F46E5;
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.1);
  }
`;

export const StatIconBox = styled.div<{ $bg: string; $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StatLabel = styled.span`
  font-size: 0.8125rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const StatValue = styled.span`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1E293B;
  line-height: 1.2;
`;

export const Header = styled.div`
padding-left:0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 20px;

  @media (max-width: 900px) {
    
    align-items:center;
    gap: 1.5rem;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.025em;
  @media (max-width: 900px) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748B;
  margin: 0;
  font-weight: 500;
  @media (max-width: 900px) {
    display: none;
    
  }
`;



export const PrimaryButton = styled.button`
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);

  &:hover {
    background: #4338CA;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled.button`
  background: white;
  color: #1E293B;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #94A3B8;
    background: #F8FAFC;
    transform: translateY(-1px);
  }
`;

export const TableCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
`;

export const TableHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: #fff;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 460px;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 16px;
    color: #94A3B8;
    font-size: 1.25rem;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px 16px 12px 48px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1E293B;
  transition: all 0.2s;

  &::placeholder {
    color: #94A3B8;
  }

  &:focus {
    outline: none;
    border-color: #4F46E5;
    background: white;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F8FAFC;
  padding: 6px 16px;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  color: #64748B;

  svg {
    font-size: 1.1rem;
  }
`;

export const FilterSelect = styled.select`
  background: transparent;
  border: none;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1E293B;
  cursor: pointer;
  outline: none;
  padding-right: 8px;

  option {
    background: white;
    font-weight: 500;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const Th = styled.th`
  padding: 16px 32px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
`;

export const Td = styled.td`
  padding: 20px 32px;
  font-size: 0.9375rem;
  vertical-align: middle;
  border-bottom: 1px solid #F1F5F9;
`;

export const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const Avatar = styled.div<{ src?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${p => p.src ? `url(${p.src})` : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'};
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

export const StudentName = styled.div`
  font-weight: 700;
  color: #1E293B;
  font-size: 0.9375rem;
`;

export const StudentEmail = styled.div`
  font-size: 0.8125rem;
  color: #64748B;
  font-weight: 500;
`;

export const GradePill = styled.span`
  background: #F1F5F9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.8125rem;
  display: inline-block;
`;

export const StatusBadge = styled.span<{ $onHold?: boolean }>`
  background: ${p => p.$onHold ? '#FEF2F2' : '#F0FDF4'};
  color: ${p => p.$onHold ? '#EF4444' : '#22C55E'};
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

export const ActionButton = styled.button<{ $variant?: 'danger' | 'warning' | 'success' }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid #E2E8F0;
  background: white;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1.1rem;

  &:hover {
    border-color: ${p => 
      p.$variant === 'danger' ? '#EF4444' : 
      p.$variant === 'warning' ? '#F59E0B' : 
      p.$variant === 'success' ? '#10B981' : '#4F46E5'};
    color: ${p => 
      p.$variant === 'danger' ? '#EF4444' : 
      p.$variant === 'warning' ? '#F59E0B' : 
      p.$variant === 'success' ? '#10B981' : '#4F46E5'};
    background: ${p => 
      p.$variant === 'danger' ? '#FEF2F2' : 
      p.$variant === 'warning' ? '#FFFBEB' : 
      p.$variant === 'success' ? '#F0FDF4' : '#F5F3FF'};
    transform: translateY(-2px);
  }
`;

export const SkeletonRow = styled.div`
  height: 48px;
  width: 100%;
  background: linear-gradient(90deg, #F8FAFC 25%, #F1F5F9 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 12px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const Pagination = styled.div`
  padding: 24px 32px;
  background: #fff;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PaginationInfo = styled.span`
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 600;
`;

export const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid ${p => p.$active ? '#4F46E5' : '#E2E8F0'};
  background: ${p => p.$active ? '#4F46E5' : 'white'};
  color: ${p => p.$active ? 'white' : '#64748B'};
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #4F46E5;
    color: ${p => p.$active ? 'white' : '#4F46E5'};
    background: ${p => p.$active ? '#4F46E5' : '#F5F3FF'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Compatibility aliases for any other potential usages
export { 
  Header as PageHeader, 
  Title as PageTitle, 
  Subtitle as PageSubtitle,
  TableHeader as TableToolbar,
  SearchContainer as SearchWrapper
};
