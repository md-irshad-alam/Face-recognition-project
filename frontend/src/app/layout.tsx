import React from 'react'
import ThemeRegistry from './ThemeRegistry'

export const metadata = {
  title: 'VISIO | Insight • Clarity • Innovation',
  description: 'Advanced management portal powered by Visio.',
}

import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Providers from './Providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/visio-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Providers>
            <ThemeRegistry>
              {children}
              <Toaster position="bottom-right" />
            </ThemeRegistry>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
