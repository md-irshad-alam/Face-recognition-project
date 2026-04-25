import styled from 'styled-components';

export const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
  font-family: 'Inter', sans-serif;
`;

export const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 80px;
  background: transparent;

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

export const NavLinks = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const NavLink = styled.a`
  text-decoration: none;
  color: #64748B;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: color 0.2s;

  &:hover {
    color: #4F46E5;
  }
`;

export const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.02em;

  svg {
    color: #4F46E5;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 1040px;
  background: white;
  border-radius: 32px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);

  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 480px;
  }
`;

/* — Left Panel —————————————————————————————— */
export const HeroPanel = styled.div`
  flex: 1;
  background-color: #F1F5F9;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  background-image: 
    radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%);

  @media (max-width: 900px) {
    display: none;
  }
`;

export const HeroTag = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: #4338CA;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  display: block;
`;

export const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.1;
  margin-bottom: 40px;
  letter-spacing: -0.04em;
`;

export const HeroDescription = styled.p`
  font-size: 1.125rem;
  color: #64748B;
  line-height: 1.6;
  max-width: 380px;
`;

export const QuoteCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const QuoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const QuoteIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #4F46E5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const QuoteAuthor = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AuthorName = styled.span`
  font-weight: 800;
  color: #1E293B;
  font-size: 0.8125rem;
`;

export const AuthorRole = styled.span`
  color: #94A3B8;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
`;

export const QuoteText = styled.p`
  font-size: 0.9375rem;
  font-style: italic;
  color: #475569;
  line-height: 1.6;
  margin: 0;
`;

/* — Right Panel (Form) —————————————————————— */
export const FormPanel = styled.div`
  flex: 1;
  padding: 64px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 1024px) {
    padding: 64px 48px;
  }

  @media (max-width: 640px) {
    padding: 48px 24px;
  }
`;

export const FormHeader = styled.div`
  margin-bottom: 40px;
`;

export const FormTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
`;

export const FormSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #64748B;
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
  gap: 10px;
  margin-bottom: 32px;
`;

export const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 500;
  cursor: pointer;
`;

export const SignInButton = styled.button`
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
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transition: all 0.2s;

  &:hover {
    background: #4338CA;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
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

export const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
`;

export const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #F1F5F9;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1E293B;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #E2E8F0;
    border-color: #CBD5E1;
  }

  img {
    width: 20px;
    height: 20px;
  }
`;

export const SignupPrompt = styled.p`
  text-align: center;
  font-size: 0.875rem;
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
  padding: 32px 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 32px 24px;
    text-align: center;
  }
`;

export const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 800;
  color: #0F172A;

  svg {
    color: #4F46E5;
  }
`;

export const Copyright = styled.span`
  font-size: 0.6875rem;
  color: #94A3B8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 24px;
`;

export const FooterLink = styled.a`
  text-decoration: none;
  font-size: 0.6875rem;
  color: #94A3B8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.2s;

  &:hover {
    color: #4F46E5;
  }
`;
