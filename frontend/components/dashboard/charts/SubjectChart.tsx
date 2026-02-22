'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import styled from 'styled-components'
import { viewSizeCalculator } from '../../../utils/responsive'


const ChartContainer = styled.div`
  background: white;
  border-radius: ${viewSizeCalculator(20)};
  padding: ${viewSizeCalculator(24)};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: ${viewSizeCalculator(300)};
`

const Header = styled.div`
    margin-bottom: ${viewSizeCalculator(10)};
    h3 {
        font-size: ${viewSizeCalculator(18)};
        font-weight: 600;
    }
`

export default function SubjectChart() {
  const data = {
    labels: ['Mathematics', 'English', 'Physics', 'English 02', 'Islam'],
    datasets: [
      {
        label: 'Task Completion',
        data: [80, 92, 75, 60, 96],
        backgroundColor: [
          '#F97316', // Orange
          '#8B5CF6', // Purple
          '#06B6D4', // Cyan
          '#3B82F6', // Blue
          '#10B981', // Green
        ],
        borderRadius: 5,
        barThickness: 15, // Fixed pixel for bar thickness
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        max: 100,
        grid: {
            display: false
        }
      },
      y: {
        grid: {
            display: false
        }
      }
    },
  }

  return (
    <ChartContainer>
      <Header><h3>Subject Task</h3></Header>
      <div style={{ height: '90%' }}>
            <Bar data={data} options={options} />
      </div>
    </ChartContainer>
  )
}
