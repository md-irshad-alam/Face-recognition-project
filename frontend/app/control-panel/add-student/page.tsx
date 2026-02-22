'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import Sidebar from '../../../components/dashboard/Sidebar'
import Header from '../../../components/dashboard/Header'
import AddStudentForm from '../../../components/control-panel/AddStudentForm'
import { viewSizeCalculator } from '../../../utils/responsive'

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #F3F4F6;
`

const MainContent = styled.div<{ $expand: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $expand }) => ($expand ? '280px' : '0')};
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`

const ContentWrapper = styled.div`
    padding: ${viewSizeCalculator(24)};
    margin: 0 auto;
    width: 100%;
    max-width: 1200px;
`

const PageHeader = styled.div`
    margin-bottom: 2rem;
    
    h1 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
    }
    p {
        color: #6B7280;
    }
`

export default function AddStudentPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <Container>
            <Sidebar isOpen={sidebarOpen} />
            <MainContent $expand={sidebarOpen}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <ContentWrapper>
                    <PageHeader>
                        <h1>Add New Student</h1>
                        <p>Enter the student's details to register them in the system.</p>
                    </PageHeader>
                    
                    <AddStudentForm />
                </ContentWrapper>
            </MainContent>
        </Container>
    )
}
