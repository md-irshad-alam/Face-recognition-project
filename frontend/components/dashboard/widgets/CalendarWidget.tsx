'use client'

import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import styled from 'styled-components'
import { viewSizeCalculator } from '../../../utils/responsive'


const CalendarContainer = styled.div`
  background: #1F2937; /* Dark Blue */
  color: white;
  border-radius: ${viewSizeCalculator(20)};
  padding: ${viewSizeCalculator(20)};
  height: ${viewSizeCalculator(300)};
  display: flex;
  flex-direction: column;
  
  .react-datepicker {
    font-family: inherit;
    background-color: transparent;
    border: none;
    width: 100%;
  }

  .react-datepicker__header {
    background-color: transparent;
    border-bottom: none;
  }

  .react-datepicker__current-month {
    color: white;
    font-size: ${viewSizeCalculator(16)};
    margin-bottom: ${viewSizeCalculator(10)};
  }

  .react-datepicker__day-name {
    color: #9CA3AF;
    width: ${viewSizeCalculator(30)};
  }

  .react-datepicker__day {
    color: white;
    width: ${viewSizeCalculator(30)};
    &:hover {
        background-color: rgba(255,255,255,0.1);
        border-radius: 50%;
    }
  }

  .react-datepicker__day--selected {
    background-color: #3B82F6;
    border-radius: 50%;
  }
  
  .react-datepicker__day--keyboard-selected {
     background-color: rgba(59, 130, 246, 0.5);
     border-radius: 50%;
  }
`

export default function CalendarWidget() {
  const [startDate, setStartDate] = useState(new Date())
  return (
    <CalendarContainer>
      <DatePicker
        selected={startDate}
        onChange={(date: Date | null) => date && setStartDate(date)}
        inline
      />
    </CalendarContainer>
  )
}
