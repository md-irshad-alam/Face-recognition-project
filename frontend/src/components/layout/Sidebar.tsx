'use client'

import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  RiDashboardLine,
  RiGroupLine,
  RiUserStarLine,
  RiPresentationLine,
  RiCalendarCheckLine,
  RiFileCheckLine,
  RiHandCoinLine,
  RiPieChartLine,
  RiShieldCheckLine,
  RiSettings4Line,
  RiAdminLine,
  RiGraduationCapFill,
  RiTimeLine,
} from 'react-icons/ri'

/* ────────────────────────────────────────────
   Styled Components
──────────────────────────────────────────── */
const SidebarContainer = styled.aside`
  width: 260px;
  height: 100vh;
  background-color: #F8FAFC;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  padding: 28px 0 24px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  margin-bottom: 40px;
`

const LogoIcon = styled.div`
  background-color: #4F46E5;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`

const LogoTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 900;
  color: #312E81;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.02em;
`

const LogoSubtitle = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748B;
  letter-spacing: 0.02em;
`

const NavSection = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;
`

/* Use a wrapper div for the active indicator instead of passing prop to Link */
const NavItemWrapper = styled.div<{ $active: boolean }>`
  position: relative;

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: ${p => p.$active ? 700 : 600};
    color: ${p => p.$active ? '#4F46E5' : '#64748B'};
    background-color: ${p => p.$active ? '#EEF2FF' : 'transparent'};
    transition: all 0.15s ease;
    text-decoration: none;
  }

  a:hover {
    color: #4F46E5;
    background-color: #EEF2FF;
  }

  ${p => p.$active && `
    &::after {
      content: '';
      position: absolute;
      right: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 28px;
      background-color: #4F46E5;
      border-radius: 4px 0 0 4px;
    }
  `}
`

const NavIcon = styled.span<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$active ? '#4F46E5' : '#94A3B8'};
  transition: color 0.15s;
  font-size: 1.125rem;
`

const ProfileSection = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`

const ProfileAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #E2E8F0;
  flex-shrink: 0;
`

const ProfileAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const ProfileName = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1E293B;
`

const ProfileRole = styled.span`
  font-size: 0.6875rem;
  font-weight: 500;
  color: #94A3B8;
`

import { useAuth } from '@/context/AuthContext'

/* ────────────────────────────────────────────
   Nav Items Data
──────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard',   icon: RiDashboardLine,   href: '/dashboard', roles: ['admin', 'teacher'] },
  { label: 'Students',    icon: RiGroupLine,        href: '/students',  roles: ['admin', 'teacher'] },
  { label: 'Teachers',    icon: RiUserStarLine,     href: '/teachers',  roles: ['admin'] },
  { label: 'Classes',     icon: RiPresentationLine, href: '/classes',   roles: ['admin', 'teacher'] },
  { label: 'Attendance',  icon: RiCalendarCheckLine,href: '/attendance',roles: ['admin', 'teacher'] },
  { label: 'Leave Requests', icon: RiTimeLine, href: '/leaves', roles: ['admin', 'teacher'] },
  { label: 'Exams / MCQ', icon: RiFileCheckLine,    href: '/exams',     roles: ['admin', 'teacher'] },
  { label: 'Fees',        icon: RiHandCoinLine,     href: '/fees',      roles: ['admin'] },
  { label: 'Reports',     icon: RiPieChartLine,     href: '/reports',   roles: ['admin', 'teacher'] },
  { label: 'Subscription',icon: RiShieldCheckLine,  href: '/subscription', roles: ['admin'] },
  { label: 'Settings',    icon: RiSettings4Line,    href: '/settings',  roles: ['admin', 'teacher'] },
  { label: 'Admin Panel', icon: RiAdminLine,        href: '/admin-panel', roles: ['admin'] },
]

/* ────────────────────────────────────────────
   Component
──────────────────────────────────────────── */
export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = user?.role || 'teacher'

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(role))

  return (
    <SidebarContainer>
      <LogoSection>
        <LogoIcon>
          <RiGraduationCapFill />
        </LogoIcon>
        <LogoText>
          <LogoTitle>Academic{'\n'}Architect</LogoTitle>
          <LogoSubtitle>Institutional Portal</LogoSubtitle>
        </LogoText>
      </LogoSection>

      <NavSection>
        {filteredItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <NavItemWrapper key={item.label} $active={isActive}>
              <Link href={item.href}>
                <NavIcon $active={isActive}>
                  <item.icon />
                </NavIcon>
                {item.label}
              </Link>
            </NavItemWrapper>
          )
        })}
      </NavSection>

      <ProfileSection>
        <ProfileAvatar>
          <ProfileAvatarImg
            src={user?.photo_url || `https://i.pravatar.cc/150?u=${user?.email}`}
            alt={user?.first_name || 'User'}
          />
        </ProfileAvatar>
        <ProfileInfo>
          <ProfileName>{user?.first_name} {user?.last_name}</ProfileName>
          <ProfileRole>{role === 'admin' ? 'System Administrator' : 'Faculty Member'}</ProfileRole>
        </ProfileInfo>
      </ProfileSection>
    </SidebarContainer>
  )
}
