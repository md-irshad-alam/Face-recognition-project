'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const EXPANDED_W  = 260
const COLLAPSED_W = 68

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: #F8FAFC;
  font-family: 'Poppins', 'Inter', sans-serif;
`

const MainArea = styled.main<{ $collapsed: boolean }>`
  margin-left: ${p => p.$collapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`};
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
  }
`

const PageContent = styled.div`
  flex: 1;
  padding: 28px 32px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) { padding: 20px; }
  @media (max-width: 480px) { padding: 16px; }
`

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <LayoutContainer>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />

      <MainArea $collapsed={collapsed}>
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <PageContent>
          {children}
        </PageContent>
      </MainArea>
    </LayoutContainer>
  )
}
