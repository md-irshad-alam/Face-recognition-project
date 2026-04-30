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

export const BlogSection = styled.div`
  max-width: 440px;
`;

export const BlogTag = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: #6366F1;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  display: block;
  margin-bottom: 16px;
`;

export const BlogTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  color: #0F172A;
  line-height: 1.2;
  margin-bottom: 24px;
  letter-spacing: -0.04em;
`;

export const BlogContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const BlogPara = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    font-size: 1rem;
    font-weight: 800;
    color: #1E293B;
    margin: 0;
  }

  p {
    font-size: 0.9375rem;
    color: #64748B;
    line-height: 1.6;
    margin: 0;
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
  max-width: 540px;
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
  margin-bottom: 40px;
`;

export const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
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

export const Select = styled.select`
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  font-size: 1rem;
  font-weight: 500;
  color: #1E293B;
  appearance: none;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 24px;
  margin-bottom: 40px;
`;

export const Checkbox = styled.input`
  margin-top: 4px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  cursor: pointer;
`;

export const CheckboxLabel = styled.label`
  font-size: 0.9375rem;
  color: #64748B;
  line-height: 1.5;

  a {
    color: #4F46E5;
    text-decoration: none;
    font-weight: 700;
  }
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
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;

  &:hover {
    background: #4338CA;
    transform: translateY(-2px);
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
