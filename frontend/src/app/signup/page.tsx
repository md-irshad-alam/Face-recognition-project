'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { 
  RiShieldCheckLine, 
  RiArrowRightLine,
  RiEyeFill,
  RiMailLine,
  RiLockPasswordLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import * as SC from './signup.sc'
import Link from 'next/link';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  const [step, setStep] = useState<1 | 2>(tokenFromUrl ? 2 : 1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(emailFromUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password Requirements
  const requirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'One uppercase letter', regex: /[A-Z]/ },
    { label: 'One lowercase letter', regex: /[a-z]/ },
    { label: 'One number', regex: /[0-9]/ },
    { label: 'One special character', regex: /[@$!%*?&]/ },
  ];

  const checkRequirement = (regex: RegExp) => regex.test(password);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required.');
      return;
    }
    if (!agreed) {
      toast.error('Please accept terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, accept_terms: agreed });
      toast.success('Security link sent to your inbox from support@visio.school');
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message || 'System error. Failed to send verification email.');
      setLoading(false);
    }
  };

  const [schoolId, setSchoolId] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !password || !confirmPassword || !schoolId) {
      toast.error('All fields are mandatory.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    const isStrong = requirements.every(req => req.regex.test(password));
    if (!isStrong) {
      toast.error('Please meet all password complexity requirements.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', {
        email,
        password,
        full_name: fullName,
        school_id: schoolId,
        token: tokenFromUrl
      });
      toast.success('Registration complete. Welcome to the network.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Authentication system error.');
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
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
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

                <form onSubmit={handleVerifyEmail}>
                  <SC.InputGroup>
                    <SC.Label>Institutional Email</SC.Label>
                    <SC.Input 
                      placeholder="admin@visio.school" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </SC.InputGroup>

                  <SC.CheckboxGroup>
                    <SC.Checkbox 
                      type="checkbox" 
                      id="terms"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      disabled={loading}
                    />
                    <SC.CheckboxLabel htmlFor="terms">
                      I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                    </SC.CheckboxLabel>
                  </SC.CheckboxGroup>

                  <SC.SubmitButton type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                    {!loading && <RiMailLine size={20} />}
                  </SC.SubmitButton>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SC.FormTitle>Complete Setup</SC.FormTitle>
                <SC.FormSubtitle>Finalize your administrator profile and secure your access.</SC.FormSubtitle>

                <form onSubmit={handleSignup}>
                  <SC.InputGroup>
                    <SC.Label>Full Name</SC.Label>
                    <SC.Input 
                      placeholder="Johnathan Sterling" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </SC.InputGroup>

                  <SC.InputGroup>
                    <SC.Label>School Code (Unique ID)</SC.Label>
                    <SC.Input 
                      placeholder="e.g. st-marys" 
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      disabled={loading}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>This will be your institution's unique identifier.</p>
                  </SC.InputGroup>

                  <SC.InputGroup>
                    <SC.Label>Verified Email</SC.Label>
                    <SC.Input 
                      value={email}
                      readOnly
                      disabled
                      style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
                    />
                  </SC.InputGroup>

                  <SC.InputGrid>
                    <SC.InputGroup>
                      <SC.Label>Set Password</SC.Label>
                      <SC.Input 
                        type="password"
                        placeholder="••••••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </SC.InputGroup>
                    <SC.InputGroup>
                      <SC.Label>Confirm Password</SC.Label>
                      <SC.Input 
                        type="password"
                        placeholder="••••••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                    </SC.InputGroup>
                  </SC.InputGrid>

                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>SECURITY REQUIREMENTS:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {requirements.map((req, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: checkRequirement(req.regex) ? '#10B981' : '#94A3B8' }}>
                          {checkRequirement(req.regex) ? <RiCheckLine /> : <RiCloseLine />}
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <SC.SubmitButton type="submit" disabled={loading}>
                    {loading ? 'Securing Account...' : 'Complete Registration'}
                    {!loading && <RiLockPasswordLine size={20} />}
                  </SC.SubmitButton>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <SC.BottomText>
            Already part of the network? <Link href="/login">Sign In</Link>
          </SC.BottomText>
        </SC.FormContainer>
      </motion.div>
    </SC.FormSection>
  );
}

export default function SignupPage() {
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
          <SignupForm />
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
