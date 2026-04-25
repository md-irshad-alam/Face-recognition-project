'use client'

import React from 'react';
import styled from 'styled-components';
import { 
  RiDashboardLine, 
  RiArrowLeftLine, 
  RiBookLine, 
  RiCalendarLine, 
  RiQuestionLine 
} from 'react-icons/ri';
import Link from 'next/link';
import { Button } from '@/components/ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
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

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4F46E5;
  font-size: 1.25rem;
  font-weight: 800;

  svg {
    background: #4F46E5;
    color: white;
    padding: 6px;
    border-radius: 8px;
  }
`;

const ErrorImage = styled.div`
  width: 280px;
  height: 280px;
  background: #F8FAFC;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
  position: relative;
  
  &::after {
    content: '404';
    font-size: 120px;
    font-weight: 900;
    color: #4F46E5;
    opacity: 0.1;
    position: absolute;
  }
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 16px;
  letter-spacing: -0.04em;

  span {
    color: #4F46E5;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #64748B;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 48px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1000px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HelperCard = styled(Link)`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.04);
    border-color: #4F46E5;
  }
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #EEF2FF;
  color: #4F46E5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 800;
  color: #1E293B;
  margin: 0;
`;

const CardDesc = styled.p`
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
  text-align: left;
`;

export default function NotFound() {
  return (
    <Container>
      <Nav>
        <Logo>
          <RiCalendarLine />
          Lumina Academy
        </Logo>
        <div style={{ display: 'flex', gap: '32px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Support</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>System Status</span>
        </div>
      </Nav>

      <ErrorImage>
        <div style={{ zIndex: 1, display: 'flex', gap: '8px' }}>
          <RiDashboardLine size={32} color="#4F46E5" />
          <RiCalendarLine size={32} color="#4F46E5" />
        </div>
      </ErrorImage>

      <Title>Lost in the <span>Hallways?</span></Title>
      <Description>
        The page you're looking for doesn't exist or has been moved. Even the best scholars lose their way sometimes.
      </Description>

      <ActionGroup>
        <Button $variant="primary" onClick={() => window.location.href = '/'}>
          <RiDashboardLine /> Return to Dashboard
        </Button>
        <Button $variant="outline" onClick={() => window.history.back()}>
          <RiArrowLeftLine /> Go Back
        </Button>
      </ActionGroup>

      <CardsGrid>
        <HelperCard href="/curriculum">
          <IconBox><RiBookLine /></IconBox>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <CardTitle>Curriculum</CardTitle>
            <CardDesc>Access all your course materials and resources.</CardDesc>
          </div>
        </HelperCard>

        <HelperCard href="/schedule">
          <IconBox><RiCalendarLine /></IconBox>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <CardTitle>Schedule</CardTitle>
            <CardDesc>Check upcoming classes and academy events.</CardDesc>
          </div>
        </HelperCard>

        <HelperCard href="/support">
          <IconBox><RiQuestionLine /></IconBox>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <CardTitle>Help Center</CardTitle>
            <CardDesc>Reach out for technical assistance or guides.</CardDesc>
          </div>
        </HelperCard>
      </CardsGrid>

      <p style={{ marginTop: '80px', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600 }}>
        © 2024 LUMINA ACADEMY MANAGEMENT SYSTEM. ALL RIGHTS RESERVED.
      </p>
    </Container>
  );
}
