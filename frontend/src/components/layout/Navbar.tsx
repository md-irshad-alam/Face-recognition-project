'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import {
  RiSearchLine,
  RiNotification3Line,
  RiLogoutBoxRLine,
  RiUserLine,
  RiMenuLine,        // hamburger icon
} from 'react-icons/ri'
import { useAuth } from '@/context/AuthContext'

/* ──────────────────────────────────────────── 
   Styled Components
──────────────────────────────────────────── */
const NavbarContainer = styled.header`
  height: 72px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 90;
  gap: 16px;

  @media (max-width: 1024px) {
    padding: 0 20px;
  }
`

/* Hamburger — only visible on mobile */
const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    background: #F1F5F9;
    color: #4F46E5;
  }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const SearchSection = styled.div`
  flex: 1;
  max-width: 560px;
  position: relative;

  /* On small screens, shrink but keep visible */
  @media (max-width: 480px) {
    max-width: none;
  }
`

const SearchIconWrap = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  display: flex;
  align-items: center;
  pointer-events: none;
`

const SearchInput = styled.input`
  width: 100%;
  background-color: #F1F5F9;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 16px 10px 44px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1E293B;
  transition: all 0.2s;

  &::placeholder { color: #94A3B8; }

  &:focus {
    background-color: #FFFFFF;
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px #E0E7FF;
    outline: none;
  }
`

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`

const NotifButton = styled.button`
  position: relative;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  transition: all 0.2s;
  background: none;
  border: none;
  flex-shrink: 0;

  /* Hide notifications on very small screens to keep navbar clean */
  @media (max-width: 480px) {
    display: none;
  }

  &:hover {
    background-color: #F1F5F9;
    color: #4F46E5;
  }
`

const NotifDot = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  background-color: #EF4444;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
`

const ProfileWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #F8FAFC;
  border: 1px solid transparent;
  user-select: none;

  &:hover {
    background-color: #F1F5F9;
    border-color: #E2E8F0;
  }
`

/* Name/role text — hidden on small screens so only the avatar shows */
const ProfileLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 1024px) {
    display: none;
  }
`

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 800;
  color: #1E293B;
  white-space: nowrap;
`

const UserRole = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const ProfileAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  flex-shrink: 0;
`

const Dropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 8px;
  display: ${p => p.$open ? 'flex' : 'none'};
  flex-direction: column;
  gap: 4px;
  z-index: 1000;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    right: 0;
    width: 100%;
    height: 10px;
    background: transparent;
  }
`

const DropdownItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${p => p.$danger ? '#EF4444' : '#475569'};
  cursor: pointer;
  transition: all 0.2s;
  background: none;
  border: none;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${p => p.$danger ? '#FEF2F2' : '#F1F5F9'};
    color: ${p => p.$danger ? '#DC2626' : '#4F46E5'};
  }
`

/* ──────────────────────────────────────────── 
   Component
──────────────────────────────────────────── */
interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const nameParts = user.full_name.trim().split(' ')
  const initials = (nameParts[0]?.[0] || 'U') + (nameParts[nameParts.length - 1]?.[0] || '')

  return (
    <NavbarContainer>
      {/* ── Hamburger — only appears on screens ≤ 1024px ── */}
      <HamburgerBtn
        id="sidebar-hamburger"
        aria-label="Open navigation menu"
        onClick={onMenuToggle}
      >
        <RiMenuLine size={24} />
      </HamburgerBtn>

      {/* ── Search ── */}
      <SearchSection>
        <SearchIconWrap>
          <RiSearchLine size={18} />
        </SearchIconWrap>
        <SearchInput placeholder="Search records, students, teachers..." />
      </SearchSection>

      {/* ── Right actions ── */}
      <ActionsSection>
        <NotifButton aria-label="Notifications">
          <RiNotification3Line size={22} />
          <NotifDot />
        </NotifButton>

        <ProfileWrap onMouseLeave={() => setOpen(false)}>
          <ProfileSection onClick={() => setOpen(!open)}>
            {/* Name hidden on mobile, avatar always shown */}
            <ProfileLabel>
              <UserName>{user.full_name}</UserName>
              <UserRole>{user.role}</UserRole>
            </ProfileLabel>
            <ProfileAvatar>{initials.toUpperCase()}</ProfileAvatar>
          </ProfileSection>

          <Dropdown $open={open}>
            <DropdownItem>
              <RiUserLine /> Profile Settings
            </DropdownItem>
            <div style={{ width: '100%', height: '1px', background: '#F1F5F9', margin: '4px 0' }} />
            <DropdownItem $danger onClick={(e) => {
              e.stopPropagation()
              logout()
            }}>
              <RiLogoutBoxRLine /> Sign Out
            </DropdownItem>
          </Dropdown>
        </ProfileWrap>
      </ActionsSection>
    </NavbarContainer>
  )
}
