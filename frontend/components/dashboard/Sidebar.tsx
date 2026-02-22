'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter, usePathname } from 'next/navigation'
import { 
  FaUserGraduate, 
  FaChartBar, 
  FaChalkboardTeacher, 
  FaBook,
  FaCogs,
  FaPlus
} from 'react-icons/fa'

// --- Styled Components ---
const SidebarContainer = styled.aside`
  width: 280px;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 10;
  
  @media (max-width: 1024px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    &.open {
      transform: translateX(0);
    }
  }
`

const LogoSection = styled.div`
  padding: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const NavList = styled.nav`
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const NavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: ${(props) => (props.$active ? '#4F46E5' : '#6B7280')};
  background-color: ${(props) => (props.$active ? '#EEF2FF' : 'transparent')};
  font-weight: ${(props) => (props.$active ? '600' : '500')};
  transition: all 0.2s;

  &:hover {
    background-color: #EEF2FF;
    color: #4F46E5;
  }
`

interface SidebarProps {
  isOpen: boolean
  toggleSidebar?: () => void
}


// ... styled components ...

const SubNavList = styled.div<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 2.5rem; /* Indent sub-items */
  max-height: ${({ $isOpen }) => ($isOpen ? '200px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
`

const SubNavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: ${(props) => (props.$active ? '#4F46E5' : '#6B7280')};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: #4F46E5;
  }
`

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [controlPanelOpen, setControlPanelOpen] = useState(pathname.includes('/control-panel'))

  const toggleControlPanel = () => {
      setControlPanelOpen(!controlPanelOpen)
  }

  return (
    <SidebarContainer className={isOpen ? 'open' : ''}>
      <LogoSection>
        <FaUserGraduate /> HiTech University
      </LogoSection>
      <NavList>
        <NavItem onClick={() => router.push('/')} $active={pathname === '/'}>
          <FaChartBar /> Dashboard
        </NavItem>
        <NavItem onClick={() => router.push('/attendance')} $active={pathname === '/attendance'}>
           <FaUserGraduate /> Attendance
        </NavItem>
        <NavItem onClick={() => router.push('/students')} $active={pathname === '/students'}>
          <FaChalkboardTeacher /> Students
        </NavItem>
        <NavItem>
          <FaBook /> Academic
        </NavItem>
        <NavItem onClick={() => router.push('/examinations')} $active={pathname === '/examinations'}>
          <FaBook /> Examinations
        </NavItem>
        <NavItem>
          <FaBook /> Study Materials
        </NavItem>
        
        {/* Control Panel */}
        <NavItem onClick={toggleControlPanel} $active={pathname.includes('/control-panel')}>
            <FaCogs /> Control Panel
        </NavItem>
        <SubNavList $isOpen={controlPanelOpen}>
            <SubNavItem 
                onClick={() => router.push('/control-panel/add-student')}
                $active={pathname === '/control-panel/add-student'}
            >
                <FaPlus size={12} /> Add Student Details
            </SubNavItem>
            {/* Future sub-items can go here */}
        </SubNavList>

      </NavList>
    </SidebarContainer>
  )
}
