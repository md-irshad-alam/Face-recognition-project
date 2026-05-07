'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { usePathname, useRouter } from 'next/navigation'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/context/AuthContext'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || 
                       pathname === '/signup' || 
                       pathname === '/about' || 
                       pathname.startsWith('/public-profile/');

  if (isPublicPage) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthGuard>
        <AppLayout>
          {children}
        </AppLayout>
      </AuthGuard>
    </ThemeProvider>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect when auth check is complete AND there's definitely no user
    if (!loading && !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // If we have a user (from localStorage or fresh), render immediately
  // This prevents the flash-to-login on reload
  if (user) {
    return <>{children}</>;
  }

  // No user yet — show spinner only while loading (checking localStorage / refresh)
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #EEF2FF', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Loading session...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // loading=false, user=null → redirect triggered by useEffect above
  return null;
}
