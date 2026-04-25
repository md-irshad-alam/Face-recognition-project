'use client'

import React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { theme } from '../../styles/theme'
import { GlobalStyle } from '../../styles/GlobalStyle'

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.white};
`

const MainArea = styled.main`
  margin-left: 260px;
  min-height: calc(100vh - 80px);
  padding: 40px;
  background-color: ${props => props.theme.colors.white};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    margin-left: 0;
    padding: 24px;
  }
`

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <LayoutContainer>
        <Sidebar />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Navbar />
          <MainArea>
            {children}
          </MainArea>
        </div>
      </LayoutContainer>
    </ThemeProvider>
  )
}
