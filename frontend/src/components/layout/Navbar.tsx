'use client'

import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  RiSearchLine, RiNotification3Line, RiLogoutBoxRLine, RiUserLine,
  RiMenuLine, RiDownloadCloud2Line, RiAndroidLine, RiArrowDownSLine,
  RiShieldCheckLine, RiSmartphoneLine, RiBellFill, RiCheckDoubleLine,
  RiAlertLine, RiTimeLine, RiMoneyDollarCircleLine, RiMedalLine,
} from 'react-icons/ri'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

/* ── Styled Components ─────────────────────────────────────────────────────── */
const NavbarContainer = styled.header`
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 90;
  gap: 16px;
  font-family: 'Poppins', 'Inter', sans-serif;
  @media (max-width: 1024px) { padding: 0 16px; }
`
const HamburgerBtn = styled.button`
  display: none;
  background: none; border: none; color: #64748B; cursor: pointer;
  padding: 8px; border-radius: 10px; flex-shrink: 0; transition: all 0.2s;
  &:hover { background: #F1F5F9; color: #4F46E5; }
  @media (max-width: 1024px) { display: flex; align-items: center; justify-content: center; }
`
const SearchSection = styled.div`
  flex: 1; max-width: 480px; position: relative;
  @media (max-width: 480px) { max-width: none; }
`
const SearchIconWrap = styled.div`
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #94A3B8; display: flex; align-items: center; pointer-events: none;
`
const SearchInput = styled.input`
  width: 100%; background: #F1F5F9; border: 1px solid transparent;
  border-radius: 10px; padding: 9px 16px 9px 40px;
  font-size: 0.8125rem; font-weight: 500; color: #1E293B;
  transition: all 0.2s; font-family: 'Poppins', 'Inter', sans-serif;
  &::placeholder { color: #94A3B8; }
  &:focus { background: #fff; border-color: #4F46E5; box-shadow: 0 0 0 3px #E0E7FF; outline: none; }
`
const ActionsSection = styled.div`
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
`

/* ── Notification bell & panel ────────────────────────────────────────────── */
const BellWrap = styled.div`
  position: relative; flex-shrink: 0;
`
const BellBtn = styled.button<{ $hasNew: boolean }>`
  position: relative; width: 38px; height: 38px; border-radius: 10px;
  background: ${p => p.$hasNew ? '#FEF3C7' : 'none'};
  border: ${p => p.$hasNew ? '1px solid #FCD34D' : 'none'};
  color: ${p => p.$hasNew ? '#D97706' : '#64748B'};
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: #F1F5F9; color: #4F46E5; border-color: transparent; }
`
const BellBadge = styled.span`
  position: absolute; top: 4px; right: 4px;
  min-width: 16px; height: 16px; border-radius: 8px;
  background: #EF4444; color: white; border: 2px solid white;
  font-size: 0.5rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center; padding: 0 3px;
  font-family: 'Poppins', 'Inter', sans-serif;
`
const NotifPanel = styled.div<{ $open: boolean }>`
  display: ${p => p.$open ? 'flex' : 'none'};
  flex-direction: column;
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 380px; max-height: 520px;
  background: white; border: 1px solid #E2E8F0;
  border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  z-index: 1000; overflow: hidden;
  animation: slideDown 0.18s ease-out;
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 480px) { width: calc(100vw - 32px); right: -16px; }
`
const NotifHeader = styled.div`
  padding: 16px 20px 12px;
  border-bottom: 1px solid #F1F5F9;
  display: flex; align-items: center; justify-content: space-between;
`
const NotifTitle = styled.h3`
  font-size: 0.9375rem; font-weight: 700; color: #0F172A; margin: 0;
  font-family: 'Poppins', 'Inter', sans-serif;
`
const MarkAllBtn = styled.button`
  font-size: 0.75rem; font-weight: 600; color: #4F46E5; border: none;
  background: none; cursor: pointer; display: flex; align-items: center; gap: 4px;
  font-family: 'Poppins', 'Inter', sans-serif;
  &:hover { color: #4338CA; }
`
const NotifList = styled.div`
  flex: 1; overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
`
const NotifItem = styled.div<{ $unread: boolean; $type: string }>`
  padding: 14px 20px; border-bottom: 1px solid #F8FAFC;
  display: flex; gap: 12px; cursor: default;
  background: ${p => p.$unread ? '#FFFBEB' : 'white'};
  transition: background 0.15s;
  &:hover { background: #F8FAFC; }
  &:last-child { border-bottom: none; }
`
const NotifIcon = styled.div<{ $type: string }>`
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1rem;
  background: ${p => ({
    AT_RISK: '#FEF2F2', ABSENT: '#FFF7ED', FEE_DUE: '#EFF6FF',
    PROMOTION: '#F0FDF4', SYSTEM: '#F8FAFC', LEAVE: '#FAF5FF'
  }[p.$type] || '#F8FAFC')};
  color: ${p => ({
    AT_RISK: '#EF4444', ABSENT: '#F59E0B', FEE_DUE: '#3B82F6',
    PROMOTION: '#10B981', SYSTEM: '#64748B', LEAVE: '#7C3AED'
  }[p.$type] || '#64748B')};
`
const NotifContent = styled.div`
  flex: 1; min-width: 0;
`
const NotifItemTitle = styled.div<{ $unread: boolean }>`
  font-size: 0.8125rem; font-weight: ${p => p.$unread ? 700 : 600};
  color: #1E293B; line-height: 1.3;
  font-family: 'Poppins', 'Inter', sans-serif;
`
const NotifMsg = styled.div`
  font-size: 0.75rem; color: #64748B; margin-top: 3px; line-height: 1.4;
  font-family: 'Poppins', 'Inter', sans-serif;
`
const NotifTime = styled.div`
  font-size: 0.6875rem; color: #94A3B8; margin-top: 5px; font-weight: 500;
  font-family: 'Poppins', 'Inter', sans-serif;
`
const NotifEmpty = styled.div`
  padding: 48px 20px; text-align: center; color: #94A3B8;
  font-size: 0.875rem; font-weight: 500;
  font-family: 'Poppins', 'Inter', sans-serif;
`

/* ── Download button ────────────────────────────────────────────────────────── */
const pulseRing = keyframes`0%{transform:scale(1);opacity:0.6}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}`
const bounceArrow = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}`
const shimmer = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`
const tooltipSlide = keyframes`from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}`

const PulseRing = styled.span`
  position:absolute;inset:-4px;border-radius:16px;border:2px solid #22c55e;
  animation:${pulseRing} 2.4s cubic-bezier(.215,.61,.355,1) infinite;pointer-events:none;
`
const TooltipCard = styled.div`
  position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);
  width:210px;background:#0F172A;border:1px solid rgba(34,197,94,.25);border-radius:14px;
  padding:14px 16px;box-shadow:0 20px 40px rgba(0,0,0,.35);pointer-events:none;
  opacity:0;z-index:9999;transition:opacity 0.2s;
  &::before{content:'';position:absolute;top:-7px;left:50%;transform:translateX(-50%) rotate(45deg);
    width:12px;height:12px;background:#0F172A;border-left:1px solid rgba(34,197,94,.25);
    border-top:1px solid rgba(34,197,94,.25);border-radius:2px 0 0 0;}
`
const DownloadCta = styled.div`
  margin-top:10px;background:linear-gradient(135deg,#22c55e,#16a34a);background-size:200% auto;
  color:white;border-radius:8px;padding:7px 10px;font-size:.75rem;font-weight:700;
  display:flex;align-items:center;justify-content:center;gap:6px;
  animation:${shimmer} 2.5s linear infinite;letter-spacing:.02em;
  svg{animation:${bounceArrow} 1s ease infinite;}
`
const DownloadBtnWrap = styled.div`
  position:relative;flex-shrink:0;
  &:hover ${TooltipCard}{opacity:1;animation:${tooltipSlide} .22s ease forwards;}
  @media(max-width:640px){display:none;}
`
const DownloadAppBtn = styled.a`
  position:relative;display:flex;align-items:center;justify-content:center;
  width:40px;height:40px;border-radius:12px;
  background:linear-gradient(135deg,#dcfce7 0%,#f0fdf4 100%);color:#16a34a;
  border:1.5px solid #bbf7d0;cursor:pointer;transition:all .3s cubic-bezier(.34,1.56,.64,1);
  text-decoration:none;overflow:visible;
  &:hover{background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:white;
    transform:translateY(-3px) scale(1.05);box-shadow:0 8px 24px rgba(22,163,74,.35);border-color:transparent;}
`

/* ── Profile ────────────────────────────────────────────────────────────────── */
const ProfileWrap = styled.div`position:relative;flex-shrink:0;`
const ProfileSection = styled.div`
  display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;
  cursor:pointer;transition:all .2s;background:#F8FAFC;border:1px solid transparent;user-select:none;
  &:hover{background:#F1F5F9;border-color:#E2E8F0;}
`
const ProfileLabel = styled.div`
  display:flex;flex-direction:column;align-items:flex-end;
  @media(max-width:1024px){display:none;}
`
const UserName = styled.span`font-size:.875rem;font-weight:700;color:#1E293B;white-space:nowrap;font-family:'Poppins','Inter',sans-serif;`
const UserRole = styled.span`font-size:.6875rem;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.05em;font-family:'Poppins','Inter',sans-serif;`
const ProfileAvatar = styled.div`
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);color:white;
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.875rem;
  box-shadow:0 4px 12px rgba(79,70,229,.2);flex-shrink:0;
  font-family:'Poppins','Inter',sans-serif;
`
const Dropdown = styled.div<{ $open: boolean }>`
  position:absolute;top:calc(100% + 8px);right:0;width:200px;background:white;
  border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 10px 25px rgba(0,0,0,.1);
  padding:8px;display:${p => p.$open ? 'flex' : 'none'};flex-direction:column;gap:4px;z-index:1000;
`
const DropdownItem = styled.button<{ $danger?: boolean }>`
  display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;
  font-size:.875rem;font-weight:500;color:${p => p.$danger ? '#EF4444' : '#475569'};
  cursor:pointer;transition:all .15s;background:none;border:none;width:100%;text-align:left;
  font-family:'Poppins','Inter',sans-serif;
  &:hover{background:${p => p.$danger ? '#FEF2F2' : '#F1F5F9'};color:${p => p.$danger ? '#DC2626' : '#4F46E5'};}
`

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  AT_RISK: <RiAlertLine />,
  ABSENT: <RiTimeLine />,
  FEE_DUE: <RiMoneyDollarCircleLine />,
  PROMOTION: <RiMedalLine />,
  LEAVE: <RiBellFill />,
  SYSTEM: <RiShieldCheckLine />,
};

/* ── Component ────────────────────────────────────────────────────────────── */
interface NavbarProps { onMenuToggle?: () => void; }

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [apkInfo, setApkInfo] = useState<{ available: boolean; size_mb?: number } | null>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Load APK info
  useEffect(() => {
    fetch('https://api.visio.school/download/app/info')
      .then(r => r.json())
      .then(d => setApkInfo(d))
      .catch(() => setApkInfo({ available: false }))
  }, [])

  // Poll unread count every 30s
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const data = await api.get<any>('/notifications/unread-count');
        setUnreadCount(data.count || 0);
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Load notifications when panel opens
  const openNotifications = async () => {
    setNotifOpen(v => !v);
    if (!notifOpen) {
      try {
        const data = await api.get<any[]>('/notifications');
        setNotifications(Array.isArray(data) ? data : []);
      } catch { setNotifications([]); }
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setNotifications(n => n.map(item => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const nameParts = user.full_name.trim().split(' ');
  const initials = (nameParts[0]?.[0] || 'U') + (nameParts[nameParts.length - 1]?.[0] || '');

  return (
    <NavbarContainer>
      <HamburgerBtn id="sidebar-hamburger" aria-label="Open navigation menu" onClick={onMenuToggle}>
        <RiMenuLine size={22} />
      </HamburgerBtn>

      <SearchSection>
        <SearchIconWrap><RiSearchLine size={16} /></SearchIconWrap>
        <SearchInput placeholder="Search students, teachers, records..." />
      </SearchSection>

      <ActionsSection>
        {/* ── Bell icon ── */}
        <BellWrap ref={notifRef}>
          <BellBtn $hasNew={unreadCount > 0} onClick={openNotifications} aria-label="Notifications">
            <RiNotification3Line size={20} />
            {unreadCount > 0 && (
              <BellBadge>{unreadCount > 99 ? '99+' : unreadCount}</BellBadge>
            )}
          </BellBtn>

          <NotifPanel $open={notifOpen}>
            <NotifHeader>
              <NotifTitle>Notifications {unreadCount > 0 && `(${unreadCount})`}</NotifTitle>
              {unreadCount > 0 && (
                <MarkAllBtn onClick={markAllRead}>
                  <RiCheckDoubleLine size={14} /> Mark all read
                </MarkAllBtn>
              )}
            </NotifHeader>
            <NotifList>
              {notifications.length === 0 ? (
                <NotifEmpty>
                  <RiBellFill size={32} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                  No notifications yet
                </NotifEmpty>
              ) : (
                notifications.map(n => (
                  <NotifItem key={n.id} $unread={!n.is_read} $type={n.type}>
                    <NotifIcon $type={n.type}>
                      {TYPE_ICON[n.type] || <RiBellFill />}
                    </NotifIcon>
                    <NotifContent>
                      <NotifItemTitle $unread={!n.is_read}>{n.title}</NotifItemTitle>
                      {n.message && <NotifMsg>{n.message}</NotifMsg>}
                      <NotifTime>{timeAgo(n.created_at)}</NotifTime>
                    </NotifContent>
                  </NotifItem>
                ))
              )}
            </NotifList>
          </NotifPanel>
        </BellWrap>

        {/* ── APK Download ── */}
        <DownloadBtnWrap>
          <DownloadAppBtn
            href={apkInfo?.available ? 'https://api.visio.school/download/app' : undefined}
            download={apkInfo?.available ? 'Visio-v1.0.apk' : undefined}
            aria-label="Download Visio App"
            style={!apkInfo?.available ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
          >
            <PulseRing />
            <RiDownloadCloud2Line size={20} />
          </DownloadAppBtn>
          <TooltipCard role="tooltip">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <RiAndroidLine size={14} />
              </div>
              <div>
                <div style={{ fontSize: '.8125rem', fontWeight: 700, color: '#F8FAFC' }}>Visio App</div>
                <div style={{ fontSize: '.6875rem', color: '#64748B' }}>Android APK</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '8px 0' }} />
            <div style={{ fontSize: '.6875rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
              <span><RiSmartphoneLine size={10} /> Version</span><span>v1.0.0</span>
            </div>
            <div style={{ fontSize: '.6875rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span><RiShieldCheckLine size={10} /> Size</span><span>{apkInfo?.size_mb ? `${apkInfo.size_mb} MB` : 'Checking…'}</span>
            </div>
            <DownloadCta style={!apkInfo?.available ? { background: '#334155', animation: 'none' } : {}}>
              <RiArrowDownSLine size={14} />
              {apkInfo?.available ? 'Tap to Download' : 'Coming Soon'}
            </DownloadCta>
          </TooltipCard>
        </DownloadBtnWrap>

        {/* ── Profile ── */}
        <ProfileWrap ref={profileRef}>
          <ProfileSection onClick={() => setProfileOpen(!profileOpen)}>
            <ProfileLabel>
              <UserName>{user.full_name}</UserName>
              <UserRole>{user.role}</UserRole>
            </ProfileLabel>
            <ProfileAvatar>{initials.toUpperCase()}</ProfileAvatar>
          </ProfileSection>
          <Dropdown $open={profileOpen}>
            <DropdownItem>
              <RiUserLine size={16} /> Profile Settings
            </DropdownItem>
            <div style={{ height: 1, background: '#F1F5F9', margin: '2px 0' }} />
            <DropdownItem $danger onClick={(e) => { e.stopPropagation(); logout(); }}>
              <RiLogoutBoxRLine size={16} /> Sign Out
            </DropdownItem>
          </Dropdown>
        </ProfileWrap>
      </ActionsSection>
    </NavbarContainer>
  )
}
