'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { RiDashboardLine, RiShieldUserLine, RiSettings4Line, RiGroupLine } from 'react-icons/ri'

const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  margin-bottom: 48px;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
  letter-spacing: -0.04em;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748B;
  font-weight: 500;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const ModuleCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #4F46E5;
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.06);
    transform: translateY(-4px);
  }
`;

const IconBox = styled.div<{ $bg: string; $color: string }>`
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const ModuleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModuleTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: #1E293B;
`;

const ModuleDesc = styled.p`
  font-size: 0.9375rem;
  color: #64748B;
  line-height: 1.5;
`;

const SkeletonWrapper = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const SkeletonPulse = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${p => p.$width || '100%'};
  height: ${p => p.$height || '20px'};
  border-radius: ${p => p.$radius || '4px'};
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

import { useAuth } from '@/context/AuthContext'

export default function DashboardGate() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else {
        setShowContent(true)
      }
    }
  }, [user, authLoading, router])

  if (authLoading || !showContent) {
    return (
      <SkeletonWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonPulse $width="300px" $height="48px" $radius="12px" />
          <SkeletonPulse $width="500px" $height="24px" />
        </div>
        <ModulesGrid>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: '32px', border: '1px solid #E2E8F0', borderRadius: '24px' }}>
              <SkeletonPulse $width="54px" $height="54px" $radius="16px" style={{ marginBottom: '24px' }} />
              <SkeletonPulse $width="140px" $height="24px" style={{ marginBottom: '8px' }} />
              <SkeletonPulse $width="100%" $height="40px" />
            </div>
          ))}
        </ModulesGrid>
      </SkeletonWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <Header>
        <WelcomeTitle>Welcome, {user?.full_name}</WelcomeTitle>
        <WelcomeSubtitle>Orchestrate your academic environment from a single command center.</WelcomeSubtitle>
      </Header>

      <ModulesGrid>
        <ModuleCard onClick={() => router.push('/students')}>
          <IconBox $bg="#EEF2FF" $color="#4F46E5">
            <RiGroupLine />
          </IconBox>
          <ModuleInfo>
            <ModuleTitle>Student Directory</ModuleTitle>
            <ModuleDesc>Manage enrollment, biometric attendance, and academic histories.</ModuleDesc>
          </ModuleInfo>
        </ModuleCard>

        <ModuleCard onClick={() => router.push('/teachers')}>
          <IconBox $bg="#F0FDF4" $color="#10B981">
            <RiShieldUserLine />
          </IconBox>
          <ModuleInfo>
            <ModuleTitle>Faculty Portal</ModuleTitle>
            <ModuleDesc>Onboard teaching staff, manage qualifications, and course assignments.</ModuleDesc>
          </ModuleInfo>
        </ModuleCard>

        <ModuleCard>
          <IconBox $bg="#F5F3FF" $color="#8B5CF6">
            <RiSettings4Line />
          </IconBox>
          <ModuleInfo>
            <ModuleTitle>System Settings</ModuleTitle>
            <ModuleDesc>Configure institutional protocols, branding, and security access.</ModuleDesc>
          </ModuleInfo>
        </ModuleCard>
      </ModulesGrid>
    </ScreenWrapper>
  )
}
