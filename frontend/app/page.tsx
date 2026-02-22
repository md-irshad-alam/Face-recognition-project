'use client'

import React, { useState } from 'react'
import styled from 'styled-components'

import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaDollarSign } from 'react-icons/fa'
import { viewSizeCalculator } from '../utils/responsive'
import StatCard from '../components/dashboard/StatCard'
import ManagementChart from '../components/dashboard/charts/ManagementChart'
import GenderChart from '../components/dashboard/charts/GenderChart'
import CalendarWidget from '../components/dashboard/widgets/CalendarWidget'
import SubjectChart from '../components/dashboard/charts/SubjectChart'
import TopStudentsWidget from '../components/dashboard/widgets/TopStudentsWidget'
import GroupsWidget from '../components/dashboard/widgets/GroupsWidget'
import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #F3F4F6;
`

const MainContent = styled.div<{ $isSidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '280px' : '0')}; /* Matched with Sidebar width */

  @media (max-width: 1024px) {
    margin-left: 0;
  }
`

const DashboardContent = styled.div`
  padding: 20px; /* Fixed padding as requested */
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
`

const HeaderSection = styled.div`
    margin-bottom: ${viewSizeCalculator(10)};
    h1 {
        font-size: ${viewSizeCalculator(24)};
        font-weight: 700;
        color: #111827;
    }
    p {
        color: #6B7280;
        font-size: ${viewSizeCalculator(14)};
    }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${viewSizeCalculator(20)};
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr; /* Wide, Narrow, Narrow */
  gap: ${viewSizeCalculator(20)};
  
  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Container>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <MainContent $isSidebarOpen={isSidebarOpen}>
        <Header toggleSidebar={toggleSidebar} />
        <DashboardContent>
            <HeaderSection>
                <h1>Dashboard</h1>
                <p>School Management</p>
            </HeaderSection>

            <StatsGrid>
                <StatCard
                    title="Students" 
                    value="1256" 
                    icon={FaUserGraduate} 
                    gradient="linear-gradient(135deg, #F97316 0%, #FB923C 100%)" // Orange
                />
                <StatCard 
                    title="Teachers" 
                    value="102" 
                    icon={FaChalkboardTeacher} 
                    gradient="linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)" // Purple
                />
                <StatCard 
                    title="Private Teachers" 
                    value="102" 
                    icon={FaUserTie} 
                    gradient="linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)" // Cyan
                />
                <StatCard 
                    title="Total Avenue" 
                    value="$62532" 
                    icon={FaDollarSign} 
                    gradient="linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)" // Dark Blue
                />
            </StatsGrid>

            <ChartsGrid>
                <ManagementChart />
                <GenderChart/>
                <CalendarWidget />
            </ChartsGrid>

            <ChartsGrid>
                <SubjectChart />
                <TopStudentsWidget />
                <GroupsWidget />
            </ChartsGrid>
        </DashboardContent>
      </MainContent>
    </Container>
  )
}
