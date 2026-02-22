'use client'

import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import styled from 'styled-components'
import { viewSizeCalculator } from '../../../utils/responsive'


const ChartContainer = styled.div`
  background: white;
  border-radius: ${viewSizeCalculator(20)};
  padding: ${viewSizeCalculator(24)};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: ${viewSizeCalculator(300)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Legend = styled.div`
  display: flex;
  gap: ${viewSizeCalculator(20)};
  margin-top: ${viewSizeCalculator(20)};
  width: 100%;
  justify-content: center;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${viewSizeCalculator(8)};
  font-size: ${viewSizeCalculator(12)};
  color: #6B7280;

  span {
    width: ${viewSizeCalculator(8)};
    height: ${viewSizeCalculator(8)};
    border-radius: 50%;
  }
`

export default function GenderChart() {
  const data = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [60, 35],
        backgroundColor: ['#F97316', '#3B82F6'], // Orange, Blue
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <ChartContainer>
      <div style={{ position: 'relative', width: '100%', height: '70%' }}>
         <Doughnut data={data} options={options} />
         <div style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             textAlign: 'center'
         }}>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>60%</h3>
             <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Male</p>
         </div>
      </div>
      
      <Legend>
        <LegendItem><span style={{ background: '#F97316' }}></span> Male 60%</LegendItem>
        <LegendItem><span style={{ background: '#3B82F6' }}></span> Female 35%</LegendItem>
        <LegendItem><span style={{ background: '#E5E7EB' }}></span> Out 5%</LegendItem>
      </Legend>
    </ChartContainer>
  )
}
