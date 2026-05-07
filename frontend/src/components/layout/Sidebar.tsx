'use client'

import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  RiDashboardLine,
  RiGroupLine,
  RiUserStarLine,
  RiCalendarCheckLine,
  RiHandCoinLine,
  RiTimeLine,
  RiWhatsappLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri'
import { useAuth } from '@/context/AuthContext'

/* ── Styled Components ───────────────────────────────────────────────────── */

const COLLAPSED_W = 68
const EXPANDED_W  = 260

const Backdrop = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 98;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease;
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  }
`

const SidebarPanel = styled.aside<{ $collapsed: boolean }>`
  width: ${p => p.$collapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`};
  height: 100vh;
  background: #F8FAFC;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Poppins', 'Inter', sans-serif;

  @media (min-width: 1025px) {
    transform: translateX(0) !important;
  }

  @media (max-width: 1024px) {
    width: ${EXPANDED_W}px;
    transform: translateX(-${EXPANDED_W}px);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
    &.is-open {
      transform: translateX(0);
      box-shadow: 6px 0 32px rgba(0,0,0,0.18);
    }
  }
`

const LogoSection = styled.div<{ $collapsed: boolean }>`
  display: flex;
  flex-direction: ${p => p.$collapsed ? 'column-reverse' : 'row'};
  align-items: center;
  justify-content: ${p => p.$collapsed ? 'flex-start' : 'space-between'};
  padding: ${p => p.$collapsed ? '12px 0 24px 0' : '8px 16px 32px 20px'};
  gap: ${p => p.$collapsed ? '20px' : '0'};
  min-height: 40px;
  overflow: hidden;
`

const LogoInner = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex-shrink: 0;
`

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const LogoTitle = styled.h2<{ $collapsed: boolean }>`
  font-size: 1.125rem;
  font-weight: 800;
  color: #312E81;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  opacity: ${p => p.$collapsed ? 0 : 1};
  width: ${p => p.$collapsed ? 0 : 'auto'};
  transition: opacity 0.2s, width 0.2s;
  overflow: hidden;
  font-family: 'Poppins', 'Inter', sans-serif;
`

const CloseBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s;
  flex-shrink: 0;
  &:hover { background: #E2E8F0; color: #1E293B; }
  @media (max-width: 1024px) {
    display: flex; align-items: center; justify-content: center;
  }
`

const CollapseBtn = styled.button<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #E2E8F0;
  background: white;
  color: #64748B;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);

  &:hover { background: #EEF2FF; color: #4F46E5; border-color: #4F46E5; }

  @media (max-width: 1024px) { display: none; }
`

const NavSection = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
  overflow: hidden;
`

const NavItemWrapper = styled.div<{ $active: boolean; $collapsed: boolean }>`
  position: relative;

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: ${p => p.$collapsed ? '11px 0' : '11px 12px'};
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: ${p => p.$active ? 600 : 500};
    color: ${p => p.$active ? '#4F46E5' : '#64748B'};
    background-color: ${p => p.$active ? '#EEF2FF' : 'transparent'};
    transition: all 0.15s ease;
    text-decoration: none;
    justify-content: ${p => p.$collapsed ? 'center' : 'flex-start'};
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Poppins', 'Inter', sans-serif;
  }

  a:hover {
    color: #4F46E5;
    background-color: #EEF2FF;
  }

  ${p => p.$active && css`
    &::after {
      content: '';
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 26px;
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
  flex-shrink: 0;
`

const NavLabel = styled.span<{ $collapsed: boolean }>`
  opacity: ${p => p.$collapsed ? 0 : 1};
  width: ${p => p.$collapsed ? 0 : 'auto'};
  transition: opacity 0.2s, width 0.2s;
  overflow: hidden;
  font-family: 'Poppins', 'Inter', sans-serif;
`

const Tooltip = styled.div`
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: #1E293B;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  z-index: 999;
  font-family: 'Poppins', 'Inter', sans-serif;
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #1E293B;
  }
`

/* ── Nav Items ─────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: RiDashboardLine,    href: '/dashboard',          roles: ['admin', 'teacher'] },
  { label: 'Students',       icon: RiGroupLine,         href: '/students',           roles: ['admin', 'teacher'] },
  { label: 'Teachers',       icon: RiUserStarLine,      href: '/teachers',           roles: ['admin'] },
  { label: 'Attendance',     icon: RiCalendarCheckLine, href: '/attendance',         roles: ['admin', 'teacher'] },
  { label: 'Leave Requests', icon: RiTimeLine,          href: '/leaves',             roles: ['admin', 'teacher'] },
  { label: 'Fees',           icon: RiHandCoinLine,      href: '/fees',               roles: ['admin'] },
  { label: 'WhatsApp Setup', icon: RiWhatsappLine,      href: '/settings/whatsapp', roles: ['admin'] },
]

/* ── Tooltip nav item ──────────────────────────────────────────────────── */

function NavItem({ item, isActive, collapsed, onClick }: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavItemWrapper
      $active={isActive}
      $collapsed={collapsed}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={item.href} onClick={onClick}>
        <NavIcon $active={isActive}>
          <item.icon />
        </NavIcon>
        <NavLabel $collapsed={collapsed}>{item.label}</NavLabel>
      </Link>
      {collapsed && hovered && <Tooltip>{item.label}</Tooltip>}
    </NavItemWrapper>
  );
}

/* ── Component ─────────────────────────────────────────────────────────── */

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onCollapse: (v: boolean) => void
}

export default function Sidebar({ open, onClose, collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const rawRole = (user?.role || 'teacher').toLowerCase()
  const role = rawRole === 'org_admin' ? 'admin' : rawRole
  const filteredItems = NAV_ITEMS.filter(item =>
    item.roles.map(r => r.toLowerCase()).includes(role)
  )

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {open && <Backdrop onClick={onClose} />}

      <SidebarPanel $collapsed={collapsed} className={open ? 'is-open' : ''}>
        <LogoSection $collapsed={collapsed}>
          <LogoInner $collapsed={collapsed}>
            <LogoIcon>
              <img
                src="/visio-logo.png"
                alt="Visio"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </LogoIcon>
            <LogoTitle $collapsed={collapsed}>VISIO</LogoTitle>
          </LogoInner>

          {/* Mobile close */}
          <CloseBtn onClick={onClose} aria-label="Close menu">
            <RiCloseLine size={22} />
          </CloseBtn>

          {/* Desktop collapse toggle */}
          <CollapseBtn
            $collapsed={collapsed}
            onClick={() => onCollapse(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <RiArrowRightSLine size={16} /> : <RiArrowLeftSLine size={16} />}
          </CollapseBtn>
        </LogoSection>

        <NavSection>
          {filteredItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <NavItem
                key={item.label}
                item={item}
                isActive={isActive}
                collapsed={collapsed}
                onClick={() => { if (open) onClose() }}
              />
            )
          })}
        </NavSection>
      </SidebarPanel>
    </>
  )
}
