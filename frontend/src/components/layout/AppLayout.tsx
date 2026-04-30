'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: #F8FAFC;
`

/**
 * On desktop (> 1024px):
 *   Sidebar is fixed 260px wide, so main area needs margin-left: 260px.
 *
 * On mobile (≤ 1024px):
 *   Sidebar is a floating overlay drawer — it does NOT push content.
 *   Main area takes the full viewport width (margin-left: 0).
 */
const MainArea = styled.main`
  margin-left: 260px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
  }
`

const PageContent = styled.div`
  flex: 1;
  padding: 32px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Sidebar starts CLOSED on mobile — user must tap hamburger to open
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <LayoutContainer>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <MainArea>
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <PageContent>
          {children}
        </PageContent>
      </MainArea>
    </LayoutContainer>
  )
}
