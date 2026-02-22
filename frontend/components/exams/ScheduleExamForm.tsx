'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { FaCalendarAlt, FaClock } from 'react-icons/fa'
import { viewSizeCalculator } from '../../utils/responsive'

const FormContainer = styled.form`
  background: white;
  padding: ${viewSizeCalculator(12)};
  border-radius: ${viewSizeCalculator(16)};
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: ${viewSizeCalculator(16)};
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: ${viewSizeCalculator(16)};
  align-items:center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${viewSizeCalculator(8)};
`

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: ${viewSizeCalculator(12)};
  
  span {
      color: #EF4444;
  }
`

const Input = styled.input`
  padding: ${viewSizeCalculator(10)};
  border: 1px solid #D1D5DB;
  border-radius: ${viewSizeCalculator(8)};
  font-size: ${viewSizeCalculator(14)};
  width:100%;
  &:focus {
      outline: none;
      border-color: #4F46E5;
      ring: 2px solid #E0E7FF;
  }
`

const Select = styled.select`
  padding: ${viewSizeCalculator(12)};
  border: 1px solid #D1D5DB;
  border-radius: ${viewSizeCalculator(8)};
  font-size: ${viewSizeCalculator(16)};
  background-color: white;
`

const RadioGroup = styled.div`
  display: flex;
  gap: ${viewSizeCalculator(16)};
  align-items: center;
  height: 100%; /* Align with input height */
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${viewSizeCalculator(8)};
  cursor: pointer;
  font-size: ${viewSizeCalculator(16)};
`

const SubmitButton = styled.button`
  background-color: #10B981;
  color: white;
  padding: ${viewSizeCalculator(12)} ${viewSizeCalculator(24)};
  border: none;
  border-radius: ${viewSizeCalculator(8)};
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  align-self: flex-start;
  margin-top: ${viewSizeCalculator(16)};
  
  &:hover {
      background-color: #059669;
  }
`

export default function ScheduleExamForm() {
    const [formData, setFormData] = useState({
        name: '',
        date: new Date(),
        time: '',
        duration: 60,
        schedule_type: 'Fixed Schedule',
        exam_type: 'Objective question',
        proctor_base: false,
        instant_score: false,
        review_exam: false,
        description: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Format date/time for backend
        const formattedDate = formData.date.toISOString().split('T')[0]
        
        try {
            const response = await fetch('http://127.0.0.1:8000/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    date: formattedDate,
                    // Ensure time is in HH:MM format
                    time: formData.time || "10:00" 
                })
            })
            if (response.ok) {
                alert('Exam Scheduled Successfully!')
                // Reset or redirect
            } else {
                alert('Failed to schedule exam')
            }
        } catch (error) {
            console.error(error)
            alert('Error creating exam')
        }
    }

    return (
        <FormContainer onSubmit={handleSubmit}>
            <FormGrid>
                {/* Left Column */}
                
                    <FormGroup>
                        <Label>Exam Name <span>*</span></Label>
                        <Input 
                            type="text" 
                            placeholder="My Online Test" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                </FormGroup>
                <FormGroup>
                        <Label>Exam Date <span>*</span></Label>
                        <DatePicker
                            selected={formData.date}
                            onChange={(date:any) => date && setFormData({...formData, date})}
                            customInput={<Input />}
                            dateFormat="yyyy-MM-dd"
                        />
                    </FormGroup>
                    <FormGroup>
                         <Label>Allow Instant Score View <span>*</span></Label>
                         <RadioGroup>
                             <RadioLabel>
                                 <input 
                                     type="radio" 
                                     name="score" 
                                     checked={formData.instant_score} 
                                     onChange={() => setFormData({...formData, instant_score: true})}
                                 /> Yes
                             </RadioLabel>
                             <RadioLabel>
                                 <input 
                                     type="radio" 
                                     name="score" 
                                     checked={!formData.instant_score}
                                     onChange={() => setFormData({...formData, instant_score: false})}
                                 /> No
                             </RadioLabel>
                         </RadioGroup>
                    </FormGroup>
                    <FormGroup>
                         <Label>Allow candidates to review exam <span>*</span></Label>
                         <RadioGroup>
                             <RadioLabel>
                                 <input 
                                     type="radio" 
                                     name="review" 
                                     checked={formData.review_exam} 
                                     onChange={() => setFormData({...formData, review_exam: true})}
                                 /> Yes
                             </RadioLabel>
                             <RadioLabel>
                                 <input 
                                     type="radio" 
                                     name="review" 
                                     checked={!formData.review_exam}
                                     onChange={() => setFormData({...formData, review_exam: false})}
                                 /> No
                             </RadioLabel>
                         </RadioGroup>
                    </FormGroup>

                    
                    
                     <FormGroup>
                        <Label>Exam Time <span>*</span></Label>
                        <Input 
                            type="time" 
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Total Time (Minutes) <span>*</span></Label>
                        <Input 
                            type="number" 
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Exam Schedule Type <span>*</span></Label>
                        <Select 
                            value={formData.schedule_type}
                            onChange={(e) => setFormData({...formData, schedule_type: e.target.value})}
                        >
                            <option>Flexi Schedule</option>
                            <option>Fixed Schedule</option>
                            <option>Flexi Schedule with Fixed Exam Time</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>Select Exam Type <span>*</span></Label>
                        <Select 
                             value={formData.exam_type}
                             onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                        >
                            <option>Objective question</option>
                            <option>Subjective question</option>
                        </Select>
                    </FormGroup>
                    
                    <FormGroup>
                         <Label>Proctor Base <span>*</span></Label>
                         <RadioGroup>
                             <RadioLabel>
                                 <input 
                                     type="radio" 
                                     name="proctor" 
                                     checked={formData.proctor_base} 
                                     onChange={() => setFormData({...formData, proctor_base: true})}
                                 /> Yes
                             </RadioLabel>
                             <RadioLabel>
                                 <input 
                                     type="radio" 
                                     name="proctor" 
                                     checked={!formData.proctor_base}
                                     onChange={() => setFormData({...formData, proctor_base: false})}
                                 /> No
                             </RadioLabel>
                         </RadioGroup>
                    </FormGroup>

               
            </FormGrid>
            
            <SubmitButton type="submit">Custom Save</SubmitButton>
        </FormContainer>
    )
}
