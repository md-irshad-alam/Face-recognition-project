'use client'

import React from 'react'
import styled from 'styled-components'
import { viewSizeCalculator } from '../../../utils/responsive'

import { FaUserCircle } from 'react-icons/fa'

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
  
  button {
      background: #F3F4F6;
      border: none;
      border-radius: ${viewSizeCalculator(10)};
      padding: ${viewSizeCalculator(4)} ${viewSizeCalculator(8)};
      font-size: ${viewSizeCalculator(12)};
      color: #6B7280;
      cursor: pointer;
  }
`

const GroupList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${viewSizeCalculator(15)};
    overflow-y: auto;
`

const GroupItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${viewSizeCalculator(15)};
    
    .avatar {
        width: ${viewSizeCalculator(40)};
        height: ${viewSizeCalculator(40)};
        border-radius: ${viewSizeCalculator(10)};
        background: #E5E7EB; /* Placeholder for group image */
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9CA3AF;
        font-size: ${viewSizeCalculator(20)};
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
            color: #6B7280;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: ${viewSizeCalculator(120)};
        }
    }
`

export default function GroupsWidget() {
  const groups = [
    { name: "Teacher's Group", desc: "Wade Warren's I'm facing issue..." },
    { name: 'Class 10th', desc: 'These Formulae include...' },
    { name: 'Notice Board', desc: 'Pair of Linear Equations....' },
  ]

  return (
    <WidgetContainer>
        <Header>
            <h3>Groups</h3>
            <button>View All</button>
        </Header>
        <GroupList>
            {groups.map((g, i) => (
                <GroupItem key={i}>
                    <div className="avatar"><FaUserCircle /></div>
                    <div className="info">
                        <h4>{g.name}</h4>
                        <p>{g.desc}</p>
                    </div>
                </GroupItem>
            ))}
        </GroupList>
    </WidgetContainer>
  )
}
