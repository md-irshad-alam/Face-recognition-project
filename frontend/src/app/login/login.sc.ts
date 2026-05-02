import Link from 'next/link';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  font-family: 'Inter', sans-serif;
`;

export const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  background: white;

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

export const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.02em;
`;

export const NavLinks = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

export const NavLink = styled(Link)`
  text-decoration: none;
  color: #1E293B;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.2s;
  padding: 8px 16px;
  border-radius: 8px;

  &:hover {
    color: #4F46E5;
    background: #F1F5F9;
  }
`;

export const NavActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

export const MainContainer = styled.main`
  display: flex;
  flex: 1;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

/* — Left Column —————————————————————————————— */
export const HeroSection = styled.div`
  flex: 1.1;
  background-color: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    display: none;
  }
`;

export const IllustrationWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }
`;

/* — Right Column (Form) —————————————————————— */
export const FormSection = styled.div`
  flex: 1.2;
  padding: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  @media (max-width: 1024px) {
    padding: 60px 24px;
    order: 1;
  }
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 480px;
`;

export const FormHeader = styled.div`
  margin-bottom: 40px;
`;

export const FormTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
`;

export const FormSubtitle = styled.p`
  font-size: 1.0625rem;
  color: #64748B;
  margin-bottom: 0;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

export const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ForgotLink = styled.a`
  font-size: 0.75rem;
  font-weight: 800;
  color: #4F46E5;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    text-decoration: underline;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  font-size: 1rem;
  font-weight: 500;
  color: #1E293B;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4F46E5;
    background: white;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
`;

export const EyeIcon = styled.div`
  position: absolute;
  right: 18px;
  color: #94A3B8;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
`;

export const CheckboxLabel = styled.label`
  font-size: 0.9375rem;
  color: #64748B;
  font-weight: 500;
  cursor: pointer;
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;

  &:hover {
    background: #4338CA;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
  color: #94A3B8;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E2E8F0;
  }
`;

export const BottomText = styled.p`
  width: 100%;
  text-align: center;
  margin-top: 24px;
  font-size: 0.9375rem;
  color: #64748B;

  a {
    color: #4F46E5;
    text-decoration: none;
    font-weight: 700;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

/* — Footer —————————————————————————————————— */
export const Footer = styled.footer`
  padding: 40px 80px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    padding: 40px 24px;
    text-align: center;
  }
`;

export const FooterNote = styled.span`
  font-size: 0.75rem;
  color: #94A3B8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 32px;
`;

export const FooterLink = styled.a`
  text-decoration: none;
  color: #94A3B8;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.2s;

  &:hover {
    color: #4F46E5;
  }
`;
