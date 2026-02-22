'use client'

import React from 'react'
import styled from 'styled-components'


import { FaUserCircle } from 'react-icons/fa'
import { viewSizeCalculator } from '../../../utils/responsive'

const WidgetContainer = styled.div`
  background: white;
  border-radius: ${viewSizeCalculator(20)};
  padding: ${viewSizeCalculator(24)};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: ${viewSizeCalculator(300)};
  display: flex;
  flex-direction: column;
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
  
  select {
      border: 1px solid #E5E7EB;
      border-radius: ${viewSizeCalculator(10)};
      padding: ${viewSizeCalculator(4)};
      font-size: ${viewSizeCalculator(12)};
      color: #6B7280;
  }
`

const StudentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${viewSizeCalculator(15)};
    overflow-y: auto;
`

const StudentItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${viewSizeCalculator(15)};
    
    .avatar {
        width: ${viewSizeCalculator(40)};
        height: ${viewSizeCalculator(40)};
        border-radius: 50%;
        background: #E5E7EB;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9CA3AF;
        font-size: ${viewSizeCalculator(24)};
    }
    
    .info {
        flex: 1;
        h4 {
            font-size: ${viewSizeCalculator(14)};
            font-weight: 600;
            margin: 0;
        }
        p {
            font-size: ${viewSizeCalculator(12)};
            color: #F97316; /* Orange score */
            margin: 0;
        }
    }
`

export default function TopStudentsWidget() {
  const students = [
    { name: 'Lucas Jones', score: 'Allover score: 90%' },
    { name: 'Lucas Jones', score: 'Allover score: 90%' },
    { name: 'Lucas Jones', score: 'Allover score: 90%' },
  ]

  return (
    <WidgetContainer>
      <Header>
          <h3>Top Students</h3>
          <select><option>Class 6th</option></select>
      </Header>
      <StudentList>
          {students.map((s, i) => (
              <StudentItem key={i}>
                  <div className="avatar"><FaUserCircle /></div>
                  <div className="info">
                      <h4>{s.name}</h4>
                      <p>{s.score}</p>
                  </div>
              </StudentItem>
          ))}
      </StudentList>
    </WidgetContainer>
  )
}
