'use client'

import React, { useState, Suspense } from 'react';
import { 
  RiEyeLine, 
  RiEyeOffLine, 
  RiArrowRightLine,
  RiEyeFill,
  RiShieldCheckLine,
  RiSmartphoneLine,
  RiLoader4Line
} from 'react-icons/ri';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import * as SC from './login.sc';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth() as any; // Temporary cast for direct state manipulation if needed
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<any>('/auth/login', { email, password });
      
      if (data.requires_2fa) {
        setRequires2FA(true);
        toast.success('Security code sent to your email.');
      } else {
        // Fallback for legacy login if 2FA not enabled (though requirement says mandatory)
        handleSuccess(data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Institutional portal access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the security code.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<any>('/auth/2fa/verify', { email, code: otp });
      handleSuccess(data);
    } catch (err: any) {
      toast.error(err.message || 'Invalid security code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (data: any) => {
    // Save token for API calls
    localStorage.setItem('token', data.access_token);
    // Persist user object — AuthContext will save to localStorage with 7-day expiry
    setUser(data.user);
    toast.success('Access Granted. Welcome back.');
    router.push(callbackUrl === '/login' ? '/dashboard' : callbackUrl);
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
          <AnimatePresence mode="wait">
            {!requires2FA ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
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
                    <SC.Label>Email Address</SC.Label>
                    <SC.Input 
                      type="email" 
                      placeholder="name@example.com" 
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

                  <SC.SubmitButton type="submit" disabled={loading}>
                    {loading ? <RiLoader4Line className="animate-spin" /> : 'Enter Dashboard'}
                    {!loading && <RiArrowRightLine size={20} />}
                  </SC.SubmitButton>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="2fa"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <SC.FormHeader>
                  <SC.FormTitle>Two-Factor Auth</SC.FormTitle>
                  <SC.FormSubtitle>A security code has been sent to <strong>{email}</strong>.</SC.FormSubtitle>
                </SC.FormHeader>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '24px', 
                  background: '#F8FAFC', 
                  borderRadius: '12px', 
                  marginBottom: '28px',
                  border: '1px dashed #CBD5E1',
                  textAlign: 'center'
                }}>
                  <RiSmartphoneLine size={48} color="#64748B" />
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>Please enter the 6-digit code to verify your identity.</p>
                </div>

                <form onSubmit={handleVerify2FA}>
                  <SC.InputGroup>
                    <SC.Label>Verification Code</SC.Label>
                    <SC.Input 
                      type="text" 
                      placeholder="000000" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 800 }}
                      disabled={loading}
                    />
                  </SC.InputGroup>

                  <SC.SubmitButton type="submit" disabled={loading || otp.length < 6}>
                    {loading ? <RiLoader4Line className="animate-spin" /> : 'Verify & Continue'}
                    {!loading && <RiShieldCheckLine size={20} />}
                  </SC.SubmitButton>
                  
                  <button 
                    type="button" 
                    onClick={() => setRequires2FA(false)}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.875rem', marginTop: '16px', cursor: 'pointer', width: '100%' }}
                  >
                    Back to login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

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
