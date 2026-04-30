'use client'

import React, { useEffect } from 'react'
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
} from 'react-icons/ri'
import { useAuth } from '@/context/AuthContext'

/* ────────────────────────────────────────────
   Styled Components
──────────────────────────────────────────── */

/**
 * Dark semi-transparent backdrop — only rendered on mobile.
 * Clicking it closes the drawer.
 */
const Backdrop = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 98;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  }
`

/**
 * The sidebar panel itself.
 *
 * Desktop (> 1024px):
 *   - Always visible, fixed on the left, takes up 260px.
 *
 * Mobile (≤ 1024px):
 *   - Position fixed, ALWAYS starts off-screen (translateX(-100%)).
 *   - Slides in with translateX(0) when the `.is-open` class is applied.
 */
const SidebarPanel = styled.aside`
  width: 260px;
  height: 100vh;
  background: #F8FAFC;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  padding: 28px 0 24px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;

  /* ── Desktop: always visible, no transition needed ── */
  @media (min-width: 1025px) {
    transform: translateX(0) !important;
  }

  /* ── Mobile: hidden by default, slides in when .is-open ── */
  @media (max-width: 1024px) {
    transform: translateX(-260px);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;

    &.is-open {
      transform: translateX(0);
      box-shadow: 6px 0 32px rgba(0, 0, 0, 0.18);
    }
  }
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 40px;
`

const LogoInner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const LogoTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 900;
  color: #312E81;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.02em;
`

/** ✕ button — only visible on mobile */
const CloseBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover { background: #E2E8F0; color: #1E293B; }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const NavSection = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;
`

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

  ${p => p.$active && css`
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

/* ────────────────────────────────────────────
   Nav Items
──────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard',      icon: RiDashboardLine,    href: '/dashboard',          roles: ['admin', 'teacher'] },
  { label: 'Students',       icon: RiGroupLine,         href: '/students',           roles: ['admin', 'teacher'] },
  { label: 'Teachers',       icon: RiUserStarLine,      href: '/teachers',           roles: ['admin'] },
  { label: 'Attendance',     icon: RiCalendarCheckLine, href: '/attendance',         roles: ['admin', 'teacher'] },
  { label: 'Leave Requests', icon: RiTimeLine,          href: '/leaves',             roles: ['admin', 'teacher'] },
  { label: 'Fees',           icon: RiHandCoinLine,      href: '/fees',               roles: ['admin'] },
  { label: 'WhatsApp Setup', icon: RiWhatsappLine,      href: '/settings/whatsapp', roles: ['admin'] },
]

/* ────────────────────────────────────────────
   Component
──────────────────────────────────────────── */
interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = user?.role || 'teacher'
  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(role))

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop — only rendered when drawer is open on mobile */}
      {open && <Backdrop onClick={onClose} />}

      <SidebarPanel className={open ? 'is-open' : ''}>
        <LogoSection>
          <LogoInner>
            <LogoIcon>
              <img
                src="/visio-logo.png"
                alt="Visio"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </LogoIcon>
            <LogoTitle>VISIO</LogoTitle>
          </LogoInner>

          <CloseBtn onClick={onClose} aria-label="Close menu">
            <RiCloseLine size={22} />
          </CloseBtn>
        </LogoSection>

        <NavSection>
          {filteredItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <NavItemWrapper key={item.label} $active={isActive}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // Close drawer when user selects a tab (mobile only)
                    if (open) onClose()
                  }}
                >
                  <NavIcon $active={isActive}>
                    <item.icon />
                  </NavIcon>
                  {item.label}
                </Link>
              </NavItemWrapper>
            )
          })}
        </NavSection>
      </SidebarPanel>
    </>
  )
}
