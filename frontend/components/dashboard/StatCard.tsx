'use client'

import React from 'react'
import styled from 'styled-components'

import { IconType } from 'react-icons'
import { viewSizeCalculator } from '../../utils/responsive'

interface StatCardProps {
  title: string
  value: string | number
  icon: IconType
  gradient: string
}

const CardContainer = styled.div<{ $gradient: string }>`
  background: ${(props) => props.$gradient};
  border-radius: ${viewSizeCalculator(20)};
  padding: ${viewSizeCalculator(24)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  height: ${viewSizeCalculator(120)};
  min-height: 120px; /* Fallback */
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${viewSizeCalculator(8)};
`

const Value = styled.h3`
  font-size: ${viewSizeCalculator(32)};
  font-weight: 700;
  margin: 0;
  line-height: 1;
`

const Title = styled.p`
  font-size: ${viewSizeCalculator(14)};
  opacity: 0.9;
  margin: 0;
`

const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  width: ${viewSizeCalculator(60)};
  height: ${viewSizeCalculator(60)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${viewSizeCalculator(28)};
`

export default function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <CardContainer $gradient={gradient}>
      <Content>
        <Value>{value}</Value>
        <Title>{title}</Title>
      </Content>
      <IconWrapper>
        <Icon />
      </IconWrapper>
    </CardContainer>
  )
}
