import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 32px;
  // padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 24px;
  }
`;

export const Header = styled.div`
  h4 {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #4F46E5;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 2.5rem;
    font-weight: 900;
    color: #0F172A;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }
  p {
    font-size: 0.9375rem;
    color: #64748B;
    max-width: 600px;
    line-height: 1.6;
  }
`;

export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 440px;
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

/* ─── Summary Cards ─── */
export const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const BalanceCard = styled.div<{ $color: string }>`
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: 100%;
    background: ${props => props.$color};
    opacity: 0.3;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F8FAFC;
    color: ${props => props.color};
  }
  
  span {
    font-size: 0.6875rem;
    font-weight: 700;
    color: #94A3B8;
  }
`;

export const CardValue = styled.div`
  .val {
    font-size: 2rem;
    font-weight: 900;
    color: #0F172A;
    margin-bottom: 4px;
  }
  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

/* ─── Apply Form ─── */
export const FormCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

export const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
`;

export const FormSubtitle = styled.p`
  font-size: 0.875rem;
  color: #64748B;
  margin-bottom: 24px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  width: 100%;
  
  label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94A3B8;
    margin-left: 4px;
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  padding: 0 16px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1E293B;
  background: #F8FAFC;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 18px;

  &:focus {
    border-color: #4F46E5;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
`;

export const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Input = styled.input`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  padding: 0 16px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1E293B;
  background: #F8FAFC;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #4F46E5;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
`;

export const Textarea = styled.textarea`
  height: 120px;
  width: 100%;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  padding: 16px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1E293B;
  background: #F8FAFC;
  outline: none;
  resize: none;
  transition: all 0.2s;

  &:focus {
    border-color: #4F46E5;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
`;

export const SubmitBtn = styled.button`
  width: 100%;
  height: 56px;
  background: #4F46E5;
  color: #fff;
  border: none;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
  margin-top: 12px;

  &:hover {
    background: #4338CA;
    transform: translateY(-2px);
    box-shadow: 0 15px 25px rgba(79, 70, 229, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/* ─── Archive Table ─── */
export const TableSection = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
  overflow-x: auto;
  width: 100%;

  @media (max-width: 640px) {
    padding: 20px;
    margin: 0 -8px;
    border-radius: 16px;
  }
`;

export const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #94A3B8;
  }
`;

export const TableFilters = styled.div`
  display: flex;
  gap: 16px;
  
  button {
    font-size: 0.75rem;
    font-weight: 700;
    background: none;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    position: relative;
    padding-bottom: 4px;
    
    &.active {
      color: #4F46E5;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: #4F46E5;
      }
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

export const Th = styled.th`
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 800;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 16px 8px;
  border-bottom: 1px solid #F1F5F9;
`;

export const Tr = styled.tr`
  transition: all 0.2s;
  &:hover {
    background: #F8FAFC;
  }
`;

export const Td = styled.td`
  padding: 20px 8px;
  font-size: 0.875rem;
  color: #1E293B;
  border-bottom: 1px solid #F1F5F9;
  
  .type-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    .icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F1F5F9;
      color: #64748B;
    }
    span {
      font-weight: 700;
    }
  }
  
  .duration-cell {
    display: flex;
    flex-direction: column;
    span.dates {
      font-weight: 600;
      color: #0F172A;
    }
    span.days {
      font-size: 0.6875rem;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
    }
  }
`;

export const StatusPill = styled.span<{ $status: 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_REVIEW' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  
  ${props => props.$status === 'COMPLETED' && `
    background: #DCFCE7;
    color: #15803D;
  `}
  ${props => (props.$status === 'APPROVED' || props.$status === 'COMPLETED') && `
    background: #D1FAE5;
    color: #059669;
  `}
  ${props => props.$status === 'REJECTED' && `
    background: #FEE2E2;
    color: #B91C1C;
  `}
  ${props => (props.$status === 'PENDING' || props.$status === 'IN_REVIEW') && `
    background: #EFF6FF;
    color: #2563EB;
  `}
`;

/* ─── Right Column (Active Requests) ─── */
export const ActiveSection = styled.div`
  background: #EEF2FF;
  border-radius: 32px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ActiveCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.05);
  
  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #F1F5F9;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .info {
    flex: 1;
    h4 {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 2px;
    }
    p {
      font-size: 0.75rem;
      color: #94A3B8;
      font-weight: 500;
    }
  }
`;

export const ViewAllLink = styled.button`
  margin-top: auto;
  background: none;
  border: none;
  color: #4F46E5;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;
