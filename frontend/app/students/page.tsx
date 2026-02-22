'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import AttendanceSection from '../../components/dashboard/AttendanceSection'

// --- Styled Components ---
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F3F4F6;
  font-family: 'Inter', sans-serif;
  color: #1F2937;
`

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; 
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`

const PageTitle = styled.h1`
    font-size: 1.8rem;
    font-weight: 700;
`

export default function StudentsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <Container>
            <Sidebar isOpen={sidebarOpen} />
            <MainContent style={{ marginLeft: sidebarOpen ? '280px' : '0' }}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <PageTitle>Students Directory</PageTitle>
                <AttendanceSection /> {/* Reusing the table component */}
            </MainContent>
        </Container>
    )
}
