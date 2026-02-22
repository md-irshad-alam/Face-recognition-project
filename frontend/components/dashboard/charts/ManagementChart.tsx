'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'
import styled from 'styled-components'
import { viewSizeCalculator } from '../../../utils/responsive'


const ChartContainer = styled.div`
  background: white;
  border-radius: ${viewSizeCalculator(20)};
  padding: ${viewSizeCalculator(24)};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: ${viewSizeCalculator(300)};
  width: 100%;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${viewSizeCalculator(20)};

  h3 {
    font-size: ${viewSizeCalculator(18)};
    font-weight: 600;
  }
`

const Tabs = styled.div`
  display: flex;
  gap: ${viewSizeCalculator(10)};
`

const Tab = styled.button<{ active?: boolean }>`
  background: ${(props) => (props.active ? '#F3F4F6' : 'white')};
  color: ${(props) => (props.active ? '#111827' : '#9CA3AF')};
  border: 1px solid ${(props) => (props.active ? '#E5E7EB' : 'transparent')};
  padding: ${viewSizeCalculator(4)} ${viewSizeCalculator(12)};
  border-radius: ${viewSizeCalculator(20)};
  font-size: ${viewSizeCalculator(12)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F9FAFB;
  }
`

export default function ManagementChart() {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Absent',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Present',
        data: [88, 81, 97, 95, 98, 97],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
            color: '#F3F4F6'
        }
      },
      x: {
        grid: {
            display: false
        }
      }
    },
  }

  return (
    <ChartContainer>
      <Header>
        <h3>Management Value</h3>
        <Tabs>
          <Tab>Earning</Tab>
          <Tab active>Absent</Tab>
          <Tab>Present</Tab>
        </Tabs>
      </Header>
      <div style={{ height: '80%' }}>
        <Line data={data} options={options} />
      </div>
    </ChartContainer>
  )
}
