'use client'

import React from 'react';
import styled from 'styled-components';
import { 
  RiRefreshLine, 
  RiArrowLeftLine, 
  RiShieldLine, 
  RiAlarmWarningLine, 
  RiCustomerServiceLine,
  RiQuestionMark
} from 'react-icons/ri';
import { Button } from '@/components/ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #FFFFFF 0%, #F8FAFC 100%);
  padding: 40px 24px;
  font-family: 'Inter', sans-serif;
  text-align: center;
`;

const Nav = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 32px 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #0F172A;
  font-size: 1.125rem;
  font-weight: 800;

  span {
    color: #4F46E5;
  }
`;

const IconCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin-bottom: 40px;
  color: #C2410C;
  font-size: 40px;
`;

const ErrorBadge = styled.span`
  background: #FEE2E2;
  color: #DC2626;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 20px;
  letter-spacing: -0.04em;
  line-height: 1;

  span {
    color: #4F46E5;
    font-style: italic;
  }
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: #64748B;
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 48px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
`;

const SupportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 900px;
`;

const SupportCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
`;

const MiniIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F1F5F9;
  color: #4F46E5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: #1E293B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardValue = styled.p`
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;

  span {
    color: #10B981;
    font-weight: 700;
  }
  
  a {
    color: #1E293B;
    text-decoration: underline;
    font-weight: 700;
  }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container>
      <Nav>
        <Logo>
          The <span>Academic Architect</span>
        </Logo>
        <RiQuestionMark size={24} color="#64748B" />
      </Nav>

      <IconCircle>
        <RiAlarmWarningLine />
      </IconCircle>

      <ErrorBadge>Internal Server Error 500</ErrorBadge>

      <Title>An intellectual <span>interruption.</span></Title>
      
      <Description>
        Something went wrong on our end. Our technical team has been notified and is currently analyzing the structural discrepancy.
      </Description>

      <ActionGroup>
        <Button $variant="primary" onClick={() => reset()} style={{ background: '#4338CA' }}>
          <RiRefreshLine /> Refresh Page
        </Button>
        <Button $variant="outline" onClick={() => window.history.back()}>
          <RiArrowLeftLine /> Go Back
        </Button>
      </ActionGroup>

      <SupportGrid>
        <SupportCard>
          <MiniIcon><RiShieldLine /></MiniIcon>
          <CardLabel>System Health</CardLabel>
          <CardValue><span style={{ color: '#10B981', marginRight: '8px' }}>●</span>Core Services Online</CardValue>
        </SupportCard>

        <SupportCard>
          <MiniIcon><RiAlarmWarningLine /></MiniIcon>
          <CardLabel>Incident Report</CardLabel>
          <CardValue>Auto-generated & Assigned</CardValue>
        </SupportCard>

        <SupportCard>
          <MiniIcon><RiCustomerServiceLine /></MiniIcon>
          <CardLabel>Assistance</CardLabel>
          <CardValue><a href="#">Contact IT Desk</a></CardValue>
        </SupportCard>
      </SupportGrid>

      <footer style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '900px' }}>
        <p style={{ color: '#94A3B8', fontSize: '0.75rem' }}>© 2024 Lumina Academy. All systems operational except this one.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Privacy Architecture</span>
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Service Protocols</span>
        </div>
      </footer>
    </Container>
  );
}
