'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiLoader4Line, RiCheckboxCircleLine, RiErrorWarningLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import * as SC from '../../login/login.sc'; // Reusing styles

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your credentials...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const data = await api.get<any>(`/auth/verify?token=${token}`);
        setStatus('success');
        setMessage(data.message || 'Verification successful!');
        toast.success('Email verified! Redirecting to setup your account.');
        
        // Redirect to signup with email prefilled
        setTimeout(() => {
          router.push(`/signup?email=${encodeURIComponent(data.email)}&token=${encodeURIComponent(token)}`);
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired or already used.');
        toast.error('Verification failed.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <SC.FormContainer style={{ textAlign: 'center', padding: '60px 40px' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {status === 'loading' && (
          <>
            <RiLoader4Line size={64} className="animate-spin" color="#4F46E5" style={{ margin: '0 auto 24px' }} />
            <SC.FormTitle>Verifying Email</SC.FormTitle>
            <SC.FormSubtitle>{message}</SC.FormSubtitle>
          </>
        )}

        {status === 'success' && (
          <>
            <RiCheckboxCircleLine size={64} color="#10B981" style={{ margin: '0 auto 24px' }} />
            <SC.FormTitle>Verified!</SC.FormTitle>
            <SC.FormSubtitle>{message}</SC.FormSubtitle>
            <p style={{ marginTop: '20px', color: '#64748B' }}>Hold tight, we're taking you to the next step...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <RiErrorWarningLine size={64} color="#EF4444" style={{ margin: '0 auto 24px' }} />
            <SC.FormTitle>Verification Error</SC.FormTitle>
            <SC.FormSubtitle style={{ color: '#EF4444' }}>{message}</SC.FormSubtitle>
            <SC.SubmitButton onClick={() => router.push('/signup')} style={{ marginTop: '30px' }}>
              Back to Signup
            </SC.SubmitButton>
          </>
        )}
      </motion.div>
    </SC.FormContainer>
  );
}

export default function VerifyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
