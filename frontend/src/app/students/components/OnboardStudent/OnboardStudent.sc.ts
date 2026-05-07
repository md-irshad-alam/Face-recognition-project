import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100vh;
  // padding: 2rem;
  background: #f8fafc;
  overflow: hidden;
  animation: fadeIn 0.3s ease-in-out;

  @media (max-width: 1024px) {
    height: auto;
    min-height: 100vh;
    padding: 0;
    overflow: visible;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  max-width: 600px;
  line-height: 1.5;
`;

export const StepperContainer = styled.div`
  width: 100%;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 640px) {
    padding: 16px;
    gap: 12px;
  }
`;

export const Step = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: ${props => (props.$active || props.$completed ? 1 : 0.5)};
`;

export const StepNumber = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => (props.$active || props.$completed ? props.theme.colors.primary : '#F1F5F9')};
  color: ${props => (props.$active || props.$completed ? 'white' : props.theme.colors.textSecondary)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
`;

export const StepText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StepLabel = styled.span`
  font-weight: 700;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textPrimary};
`;

export const StepStatus = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

export const FormCard = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid ${props => props.theme.colors.border};
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  overflow-y: auto;

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
    padding: 20px;
    gap: 24px;
  }
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

export const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const PhotoUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

export const PhotoUpload = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 20px;
  border: 2px dashed ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #F8FAFC;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: #EEF2FF;
  }
`;

export const PhotoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: ${props => props.theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const InputsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid ${props => props.theme.colors.border};
  background: #F8FAFC;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: white;
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primary}15;
  }
`;

export const Select = styled.select`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid ${props => props.theme.colors.border};
  background: #F8FAFC url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'%3E%3Cpath d='M12 16L6 10H18L12 16Z'%3E%3C/path%3E%3C/svg%3E") no-repeat right 16px center;
  background-size: 20px;
  font-size: 0.9375rem;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background-color: white;
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primary}15;
  }
`;

export const GradeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 8px;
`;

export const GradeButton = styled.button<{ $active?: boolean }>`
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  background: ${props => (props.$active ? props.theme.colors.primary : 'white')};
  color: ${props => (props.$active ? 'white' : props.theme.colors.textPrimary)};
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => (props.$active ? props.theme.colors.primary : '#EEF2FF')};
  }
`;

export const ActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  min-height: 64px;
  background: white;
  padding: 16px 32px;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 12px 20px;
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  color: ${props => props.theme.colors.textSecondary};
  background: white;
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.theme.colors.textPrimary};
    border-color: ${props => props.theme.colors.textSecondary};
    background: #F8FAFC;
  }
`;

export const ReviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  padding: 24px;
  background: #F8FAFC;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

export const ReviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ReviewLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
`;

export const ReviewValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
`;

export const NextButton = styled.button`
  padding: 14px 28px;
  border-radius: 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px ${props => props.theme.colors.primary}40;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.theme.colors.primary}60;
  }
`;
