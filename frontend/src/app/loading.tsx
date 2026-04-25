'use client'

import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 9999;
  font-family: 'Inter', sans-serif;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const Emblem = styled.div`
  width: 48px;
  height: 48px;
  background: #4F46E5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
`;

const AcademyName = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1E293B;
  letter-spacing: -0.02em;
  margin: 0;
`;

const Loader = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #F1F5F9;
  border-top: 4px solid #4F46E5;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const StatusText = styled.p`
  margin-top: 24px;
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export default function Loading() {
  return (
    <Container>
      <LogoContainer>
        <Emblem>A</Emblem>
        <AcademyName>Academic Architect</AcademyName>
      </LogoContainer>
      <Loader />
      <StatusText>Hydrating Academic Core...</StatusText>
    </Container>
  );
}
