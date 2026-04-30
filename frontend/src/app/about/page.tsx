'use client'

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RiEyeFill, RiArrowLeftLine } from 'react-icons/ri';
import Link from 'next/link';

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  color: #1E293B;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 80px;
  border-bottom: 1px solid #F1F5F9;

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
  text-decoration: none;

  svg {
    color: #4F46E5;
  }
`;

const Content = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  margin-bottom: 40px;
  line-height: 1.1;
`;

const Section = styled.section`
  margin-bottom: 64px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 16px;
`;

const Text = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  color: #475569;
  margin-bottom: 24px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4F46E5;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 40px;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default function AboutPage() {
  return (
    <PageWrapper>
      <Navbar>
        <Logo href="/login">
          <RiEyeFill size={28} />
          VISIO
        </Logo>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 24px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}>
              Sign In to Portal
            </button>
          </Link>
        </motion.div>
      </Navbar>

      <Content>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title>The Story of Visio</Title>

          <Section>
            <SectionTitle>What We Are</SectionTitle>
            <Text>
              Visio is a biometric-first institutional management ecosystem. We are the 
              architects of clarity in a world of administrative noise. Our platform 
              is designed to be the "eyes" of your institution, providing real-time 
              oversight and instant data verification.
            </Text>
          </Section>

          <Section>
            <SectionTitle>What We Do</SectionTitle>
            <Text>
              We eliminate the burden of manual record-keeping. By leveraging advanced 
              computer vision and AI, we automate the most repetitive and error-prone 
              tasks in education management: attendance, student tracking, and secure 
              access control.
            </Text>
          </Section>

          <Section>
            <SectionTitle>How We Are Solving the Daily Grind</SectionTitle>
            <Text>
              Imagine a morning where "roll call" doesn't exist. Where a student walking 
              into a classroom is automatically logged, their records updated, and parents 
              notified—all without a single click or pen stroke. This is how we solve the 
              daily repetitive tasks that drain institutional energy.
            </Text>
            <Text>
              We are solving the "Visibility Gap." Most institutions operate on delayed data—reports 
              processed hours or days after an event. Visio closes that gap, making 
              every action visible and actionable the moment it happens.
            </Text>
          </Section>

          <Section style={{ marginBottom: '120px' }}>
            <SectionTitle>Why We Are</SectionTitle>
            <Text>
              We believe that educators and administrators are heroes who should be 
              focusing on student outcomes and institutional growth, not data entry. 
              We exist to give you back your time. We exist to bring clarity. 
              We exist to be Visio.
            </Text>
          </Section>
        </motion.div>
      </Content>
    </PageWrapper>
  );
}
