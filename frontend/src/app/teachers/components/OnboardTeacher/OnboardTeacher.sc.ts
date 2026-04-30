import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Badge = styled.span`
  background: #DCFCE7;
  color: #166534;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  width: fit-content;
`;

export const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
  letter-spacing: -0.04em;

  span {
    color: #4F46E5;
    font-family: serif;
    font-style: italic;
    font-weight: 400;
    margin-left: 8px;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748B;
  margin: 0;
  max-width: 650px;
  line-height: 1.6;
`;

export const StepperContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
`;

export const Step = styled.div<{ $active?: boolean; $done?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  opacity: ${props => props.$active || props.$done ? 1 : 0.4};
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -10px;
    top: 50%;
    width: 20px;
    height: 2px;
    background: #E2E8F0;
  }
`;

export const StepNumber = styled.div<{ $active?: boolean; $done?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${props => props.$active || props.$done ? '#4F46E5' : '#F1F5F9'};
  color: ${props => props.$active || props.$done ? 'white' : '#64748B'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9375rem;
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'};
`;

export const StepLabel = styled.span`
  font-weight: 700;
  font-size: 0.9375rem;
  color: #1E293B;
  white-space: nowrap;
`;

export const FormCard = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #E2E8F0;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  min-height: 420px; /* Prevents action buttons from jumping */
`;

/* — Toggle Switch ————————————————————————— */
export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4F46E5;
    background: white;
  }
`;

export const ToggleTrack = styled.div<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 20px;
  background: ${props => props.$active ? '#4F46E5' : '#CBD5E1'};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ToggleThumb = styled.div<{ $active: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 3px;
  left: ${props => props.$active ? '23px' : '3px'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const ToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ToggleTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1E293B;
`;

export const ToggleSub = styled.span`
  font-size: 0.8125rem;
  color: #64748B;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const SectionHeader = styled.h3`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 1.375rem;
  font-weight: 800;
  color: #1E293B;
  margin: 0;

  svg {
    color: #4F46E5;
  }
`;

export const FieldGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols || 2}, 1fr);
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border-radius: 14px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  font-size: 1rem;
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

export const Select = styled.select`
  width: 100%;
  padding: 14px 18px;
  border-radius: 14px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  font-size: 1rem;
  font-weight: 500;
  color: #1E293B;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #4F46E5;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FooterActions = styled.div`
  display: flex;
  gap: 16px;
`;

export const DraftButton = styled.button`
  padding: 14px 28px;
  border-radius: 14px;
  background: #F1F5F9;
  color: #1E293B;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #E2E8F0;
  }
`;

export const NextButton = styled.button`
  padding: 14px 32px;
  border-radius: 14px;
  background: #4F46E5;
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }
`;

export const ReviewBox = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
`;

export const InfoValue = styled.span`
  font-size: 1.0625rem;
  font-weight: 600;
  color: #1E293B;
`;
