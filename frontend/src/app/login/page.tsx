'use client'

import React, { useState, Suspense } from 'react';
import { 
  RiEyeLine, 
  RiEyeOffLine, 
  RiArrowRightLine,
  RiEyeFill,
  RiShieldCheckLine
} from 'react-icons/ri';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import * as SC from './login.sc';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Access Granted. Welcome back.');
        router.push(callbackUrl);
      } else {
        toast.error('Verification failed. Invalid credentials.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Institutional portal access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SC.FormSection>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%' }}
      >
        <SC.FormContainer>
          <SC.FormHeader>
            <SC.FormTitle>Sign In to VISIO</SC.FormTitle>
            <SC.FormSubtitle>Join a network of elite academic administrators.</SC.FormSubtitle>
          </SC.FormHeader>

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
            SECURE PORTAL ACCESS
          </div>

          <form onSubmit={handleSubmit}>
            <SC.InputGroup>
              <SC.Label>Institutional Email</SC.Label>
              <SC.Input 
                type="email" 
                placeholder="name@institution.edu" 
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
              <input 
                type="checkbox" 
                id="remember" 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
              />
              <SC.CheckboxLabel htmlFor="remember">Stay logged in for 30 days</SC.CheckboxLabel>
            </SC.CheckboxGroup>

            <SC.SubmitButton type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
              {!loading && <RiArrowRightLine size={20} />}
            </SC.SubmitButton>
          </form>

          <SC.Divider>Secure Network Verification</SC.Divider>

          <SC.BottomText>
            New institution? <Link href="/signup">Request Access</Link>
          </SC.BottomText>
        </SC.FormContainer>
      </motion.div>
    </SC.FormSection>
  );
}

export default function LoginPage() {
  const router = useRouter();
  
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

        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
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
