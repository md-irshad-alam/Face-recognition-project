'use client'

import React, { useState } from 'react';
import { 
  RiEyeLine, 
  RiEyeOffLine, 
  RiArrowRightLine,
  RiEyeFill
} from 'react-icons/ri';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import * as SC from './login.sc';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
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
    <SC.PageWrapper>
      <SC.Navbar>
        <SC.Logo onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <RiEyeFill size={28} />
          VISIO
        </SC.Logo>
        <SC.NavLinks>
          <SC.NavLink href="/about">About Us</SC.NavLink>
        </SC.NavLinks>
        <SC.NavActions>
           <Link href="/login" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#4F46E5', fontWeight: 700, fontSize: '0.875rem', marginRight: '8px' }}>Sign In</span>
          </Link>
          <Button $variant="primary" onClick={() => router.push('/signup')}>Create Account</Button>
        </SC.NavActions>
      </SC.Navbar>

      <SC.MainContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SC.LoginCard>
            <SC.HeroPanel>
              <SC.IllustrationWrapper>
                <img src="/visio-illustration.png" alt="Visio Brand Illustration" />
              </SC.IllustrationWrapper>
            </SC.HeroPanel>

            <SC.FormPanel>
              <SC.FormHeader>
                <SC.FormTitle>Sign In to VISIO</SC.FormTitle>
                <SC.FormSubtitle>Welcome back. Your portal is ready.</SC.FormSubtitle>
              </SC.FormHeader>

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
                  <input type="checkbox" id="remember" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <SC.CheckboxLabel htmlFor="remember">Stay logged in for 30 days</SC.CheckboxLabel>
                </SC.CheckboxGroup>

                <SC.SignInButton type="submit" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Enter Dashboard'}
                  {!loading && <RiArrowRightLine size={20} />}
                </SC.SignInButton>
              </form>

              <SC.Divider>Secure Portal Access</SC.Divider>

              <SC.SignupPrompt>
                New institution? <Link href="/signup">Request Access</Link>
              </SC.SignupPrompt>
            </SC.FormPanel>
          </SC.LoginCard>
        </motion.div>
      </SC.MainContent>

      <SC.Footer>
        <SC.FooterLogo>
          <RiEyeFill size={20} />
          VISIO
        </SC.FooterLogo>
        <SC.Copyright>© 2024 VISIO. ALL SYSTEMS SECURED.</SC.Copyright>
        <SC.FooterLinks>
          <SC.FooterLink href="#">Privacy Architecture</SC.FooterLink>
          <SC.FooterLink href="#">Service Protocols</SC.FooterLink>
        </SC.FooterLinks>
      </SC.Footer>
    </SC.PageWrapper>
  );
}
