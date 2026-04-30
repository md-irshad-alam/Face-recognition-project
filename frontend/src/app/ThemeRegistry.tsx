'use client'

import React from 'react'
import { ThemeProvider } from 'styled-components'
import { usePathname } from 'next/navigation'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'
import AppLayout from '@/components/layout/AppLayout'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname === '/signup' || pathname === '/about';

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
      <AppLayout>
        {children}
      </AppLayout>
    </ThemeProvider>
  )
}
