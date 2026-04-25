'use client'

import React, { useState } from 'react';
import { 
  RiShieldCheckLine, 
  RiPieChartLine, 
  RiCalendarCheckLine,
  RiArrowRightLine,
  RiCompass3Fill
} from 'react-icons/ri';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { api } from '@/services/api';
import * as SC from './signup.sc';

export default function SignupPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Required: Name, institutional email, and security password.');
      return;
    }
    if (!agreed) {
      setError('Educational protocols require agreement to terms and data processing.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
        role: 'admin'
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. The email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SC.PageWrapper>
      <SC.Navbar>
        <SC.Logo onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RiCompass3Fill size={28} color="#4F46E5" />
          Academic Architect
        </SC.Logo>
        <SC.NavLinks>
          <SC.NavLink href="#">Product</SC.NavLink>
          <SC.NavLink href="#">Solutions</SC.NavLink>
          <SC.NavLink href="#">Pricing</SC.NavLink>
        </SC.NavLinks>
        <SC.NavActions>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9375rem', marginRight: '24px' }}>Sign In</span>
          </Link>
          <Button $variant="primary" onClick={() => router.push('/signup')}>Create Account</Button>
        </SC.NavActions>
      </SC.Navbar>

      <SC.MainContainer>
        <SC.HeroSection>
          <SC.HeroContent>
            <SC.HeroTitle>The Intellectual Sanctuary.</SC.HeroTitle>
            <SC.HeroSubtitle>
              Elevating institutional management to an art form through precision engineering.
            </SC.HeroSubtitle>

            <SC.FeatureList>
              <SC.FeatureItem>
                <SC.FeatureIcon $bg="#EEF2FF" $color="#4F46E5">
                  <RiCalendarCheckLine />
                </SC.FeatureIcon>
                <SC.FeatureText>
                  <SC.FeatureTitle>Streamlined Attendance</SC.FeatureTitle>
                  <SC.FeatureDesc>
                    Biometric and digital tracking that integrates seamlessly with student records.
                  </SC.FeatureDesc>
                </SC.FeatureText>
              </SC.FeatureItem>

              <SC.FeatureItem>
                <SC.FeatureIcon $bg="#ECFDF5" $color="#10B981">
                  <RiPieChartLine />
                </SC.FeatureIcon>
                <SC.FeatureText>
                  <SC.FeatureTitle>Academic Excellence</SC.FeatureTitle>
                  <SC.FeatureDesc>
                    Advanced analytics to monitor performance and foster student growth trajectories.
                  </SC.FeatureDesc>
                </SC.FeatureText>
              </SC.FeatureItem>

              <SC.FeatureItem>
                <SC.FeatureIcon $bg="#F5F3FF" $color="#8B5CF6">
                  <RiShieldCheckLine />
                </SC.FeatureIcon>
                <SC.FeatureText>
                  <SC.FeatureTitle>Secure Integration</SC.FeatureTitle>
                  <SC.FeatureDesc>
                    Enterprise-grade security protocols protecting your institution's intellectual data.
                  </SC.FeatureDesc>
                </SC.FeatureText>
              </SC.FeatureItem>
            </SC.FeatureList>
          </SC.HeroContent>

          <SC.TestimonialCard>
            <SC.TestimonialText>
              "This platform has transformed how we perceive data. It's not just software; it's a partner in our academic mission."
            </SC.TestimonialText>
            <SC.UserInfo>
              <SC.Avatar src="https://i.pravatar.cc/150?u=helena" alt="Dr. Helena Thorne" />
              <SC.UserDetail>
                <SC.UserName>DR. HELENA THORNE</SC.UserName>
                <SC.UserRole>Dean of Sciences, Lumina University</SC.UserRole>
              </SC.UserDetail>
            </SC.UserInfo>
          </SC.TestimonialCard>
        </SC.HeroSection>

        <SC.FormSection>
          <SC.FormContainer>
            <SC.FormTitle>Begin your journey</SC.FormTitle>
            <SC.FormSubtitle>Join a community of 500+ prestigious academic institutions worldwide.</SC.FormSubtitle>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 14px', 
              background: '#EEF2FF', 
              color: '#4338CA', 
              borderRadius: '8px', 
              fontSize: '0.8125rem', 
              fontWeight: 700,
              marginBottom: '28px',
              border: '1px solid #E0E7FF'
            }}>
              <RiShieldCheckLine size={18} />
              INSTITUTIONAL ADMINISTRATOR ACCESS ONLY
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ 
                  padding: '12px 16px', 
                  background: '#FEF2F2', 
                  color: '#DC2626', 
                  borderRadius: '10px', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  marginBottom: '24px',
                  border: '1px solid #FEE2E2'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ 
                  padding: '12px 16px', 
                  background: '#F0FDF4', 
                  color: '#16A34A', 
                  borderRadius: '10px', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  marginBottom: '24px',
                  border: '1px solid #DCFCE7'
                }}>
                  Account created successfully! Redirecting to login...
                </div>
              )}

              <SC.InputGrid>
                <SC.InputGroup>
                  <SC.Label>Full Name</SC.Label>
                  <SC.Input 
                    placeholder="Johnathan Sterling" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading || success}
                  />
                </SC.InputGroup>
                <SC.InputGroup>
                  <SC.Label>Institutional Email</SC.Label>
                  <SC.Input 
                    type="email"
                    placeholder="j.sterling@university.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                  />
                </SC.InputGroup>
              </SC.InputGrid>


              <SC.InputGroup>
                <SC.Label>Password</SC.Label>
                <SC.Input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '8px' }}>
                  Minimum 8 characters with high complexity suggested.
                </p>
              </SC.InputGroup>

              <SC.CheckboxGroup>
                <SC.Checkbox 
                  type="checkbox" 
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading || success}
                />
                <SC.CheckboxLabel htmlFor="terms">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>, and consent to academic data processing.
                </SC.CheckboxLabel>
              </SC.CheckboxGroup>

              <SC.SubmitButton type="submit" disabled={loading || success}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </SC.SubmitButton>
            </form>

            <SC.BottomText>
              Already part of the network? <Link href="/login">Sign In</Link>
            </SC.BottomText>
          </SC.FormContainer>
        </SC.FormSection>
      </SC.MainContainer>

      <SC.Footer>
        <SC.Logo style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiCompass3Fill size={20} color="#4F46E5" />
          Academic Architect
        </SC.Logo>
        <SC.FooterNote>© 2024 THE ACADEMIC ARCHITECT. PRESTIGIOUS EDUCATION MANAGEMENT.</SC.FooterNote>
        <SC.FooterLinks>
          <SC.FooterLink href="#">Privacy Policy</SC.FooterLink>
          <SC.FooterLink href="#">Terms of Service</SC.FooterLink>
          <SC.FooterLink href="#">Security</SC.FooterLink>
        </SC.FooterLinks>
      </SC.Footer>
    </SC.PageWrapper>
  );
}
