'use client'

import React, { useState } from 'react';
import { 
  RiCompass3Fill,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiDoubleQuotesL
} from 'react-icons/ri';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import * as SC from './login.sc';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SC.PageWrapper>
      <SC.Navbar>
        <SC.Logo onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <RiCompass3Fill size={28} />
          Lumina Academy
        </SC.Logo>
        <SC.NavLinks>
          <SC.FooterLink href="#">Product</SC.FooterLink>
          <SC.FooterLink href="#">Solutions</SC.FooterLink>
          <SC.FooterLink href="#">Pricing</SC.FooterLink>
        </SC.NavLinks>
        <SC.NavActions>
           <Link href="/login" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#4F46E5', fontWeight: 700, fontSize: '0.875rem', marginRight: '8px' }}>Sign In</span>
          </Link>
          <Button $variant="primary" onClick={() => router.push('/signup')}>Create Account</Button>
        </SC.NavActions>
      </SC.Navbar>

      <SC.MainContent>
        <SC.LoginCard>
          <SC.HeroPanel>
            <div>
              <SC.HeroTag>The Intellectual Sanctuary</SC.HeroTag>
              <SC.HeroTitle>Elevate your academic journey.</SC.HeroTitle>
              <SC.HeroDescription>
                Experience a digital environment designed for deep focus and administrative excellence.
              </SC.HeroDescription>
            </div>

            <SC.QuoteCard>
              <SC.QuoteHeader>
                <SC.QuoteIcon>
                  <RiDoubleQuotesL size={20} />
                </SC.QuoteIcon>
                <SC.QuoteAuthor>
                  <SC.AuthorName>Dr. Helena Thorne</SC.AuthorName>
                  <SC.AuthorRole>DEAN OF ARCHITECTURE</SC.AuthorRole>
                </SC.QuoteAuthor>
              </SC.QuoteHeader>
              <SC.QuoteText>
                "Lumina hasn't just changed our workflow; it's transformed the very rhythm of our institution's daily life."
              </SC.QuoteText>
            </SC.QuoteCard>
          </SC.HeroPanel>

          <SC.FormPanel>
            <SC.FormHeader>
              <SC.FormTitle>Welcome back to Lumina Academy</SC.FormTitle>
              <SC.FormSubtitle>Please enter your details to continue</SC.FormSubtitle>
            </SC.FormHeader>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ 
                  padding: '12px 16px', 
                  background: '#FEF2F2', 
                  color: '#DC2626', 
                  borderRadius: '10px', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  marginBottom: '20px',
                  border: '1px solid #FEE2E2'
                }}>
                  {error}
                </div>
              )}

              <SC.InputGroup>
                <SC.Label>Email Address</SC.Label>
                <SC.Input 
                  type="email" 
                  placeholder="dean.thorne@university.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.LabelRow>
                  <SC.Label>Password</SC.Label>
                  <SC.ForgotLink href="#">Forgot password?</SC.ForgotLink>
                </SC.LabelRow>
                <SC.InputWrapper>
                  <SC.Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <SC.EyeIcon onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                  </SC.EyeIcon>
                </SC.InputWrapper>
              </SC.InputGroup>

              <SC.CheckboxGroup>
                <input type="checkbox" id="remember" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <SC.CheckboxLabel htmlFor="remember">Remember me for 30 days</SC.CheckboxLabel>
              </SC.CheckboxGroup>

              <SC.SignInButton type="submit" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                {!loading && <RiArrowRightLine size={20} />}
              </SC.SignInButton>
            </form>

            <SC.Divider>Or continue with</SC.Divider>

            <SC.SocialGrid>
              <SC.SocialButton type="button">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                Google
              </SC.SocialButton>
              <SC.SocialButton type="button">
                <img src="https://www.svgrepo.com/show/448239/microsoft.svg" alt="Microsoft" />
                Microsoft
              </SC.SocialButton>
            </SC.SocialGrid>

            <SC.SignupPrompt>
              Don't have an account? <Link href="/signup">Request Access</Link>
            </SC.SignupPrompt>
          </SC.FormPanel>
        </SC.LoginCard>
      </SC.MainContent>

      <SC.Footer>
        <SC.FooterLogo>
          <RiCompass3Fill size={20} />
          The Academic Architect
        </SC.FooterLogo>
        <SC.Copyright>© 2024 THE ACADEMIC ARCHITECT. PRESTIGIOUS EDUCATION MANAGEMENT.</SC.Copyright>
        <SC.FooterLinks>
          <SC.FooterLink href="#">Privacy Policy</SC.FooterLink>
          <SC.FooterLink href="#">Terms of Service</SC.FooterLink>
          <SC.FooterLink href="#">Security</SC.FooterLink>
          <SC.FooterLink href="#">Status</SC.FooterLink>
        </SC.FooterLinks>
      </SC.Footer>
    </SC.PageWrapper>
  );
}
