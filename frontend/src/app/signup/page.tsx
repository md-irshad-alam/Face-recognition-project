'use client'

import React, { useState } from 'react';
import { 
  RiShieldCheckLine, 
  RiArrowRightLine,
  RiEyeFill
} from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import * as SC from './signup.sc'
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Required: Name, institutional email, and security password.');
      return;
    }
    if (!agreed) {
      toast.error('Educational protocols require agreement to terms and data processing.');
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
      toast.success('Institutional account created successfully.');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. The email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SC.PageWrapper>
      <SC.Navbar>
        <SC.Logo onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RiEyeFill size={28} color="#4F46E5" />
          VISIO
        </SC.Logo>
        <SC.NavLinks>
          <SC.NavLink href="/about">About Us</SC.NavLink>
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
          <SC.IllustrationWrapper>
            <img src="/visio-illustration.png" alt="Visio Brand Illustration" />
          </SC.IllustrationWrapper>
        </SC.HeroSection>

        <SC.FormSection>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%' }}
          >
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
          </motion.div>
        </SC.FormSection>
      </SC.MainContainer>

      <SC.Footer>
        <SC.Logo style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiEyeFill size={20} color="#4F46E5" />
          VISIO
        </SC.Logo>
        <SC.FooterNote>© 2024 VISIO. ALL SYSTEMS SECURED.</SC.FooterNote>
        <SC.FooterLinks>
          <SC.FooterLink href="#">Privacy Architecture</SC.FooterLink>
          <SC.FooterLink href="#">Service Protocols</SC.FooterLink>
        </SC.FooterLinks>
      </SC.Footer>
    </SC.PageWrapper>
  );
}
