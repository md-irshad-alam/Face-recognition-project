'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
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
  align-items: center;
  
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
  width: 100%;
  &:focus {
      outline: none;
      border-color: #4F46E5;
      ring: 2px solid #E0E7FF;
  }
`

const Select = styled.select`
  padding: ${viewSizeCalculator(10)};
  border: 1px solid #D1D5DB;
  border-radius: ${viewSizeCalculator(8)};
  font-size: ${viewSizeCalculator(14)};
  width: 100%;
  background-color: white;
`

const SubmitButton = styled.button`
  background-color: #4F46E5;
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
      background-color: #4338CA;
  }
`

import { useRef } from 'react'
import { FaCamera, FaUpload } from 'react-icons/fa'
import Image from 'next/image'

// ... existing styles ...

const PhotoUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`

const PhotoPreview = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #F3F4F6;
  border: 2px dashed #D1D5DB;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
      border-color: #4F46E5;
      background-color: #EEF2FF;
  }
  
  img {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }
`

const HiddenInput = styled.input`
  display: none;
`

export default function AddStudentForm() {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        email: '',
        phone: '',
        class_name: '',
        section: '',
        dob: '',
        admission_date: new Date().toISOString().split('T')[0]
    })
    const [photo, setPhoto] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            
            // Validate size (3MB = 3 * 1024 * 1024 bytes)
            if (file.size > 3 * 1024 * 1024) {
                alert("File size exceeds 3MB limit.")
                return
            }
            
            setPhoto(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const submitData = new FormData()
        submitData.append('name', formData.name)
        submitData.append('id', formData.id)
        submitData.append('email', formData.email)
        submitData.append('phone', formData.phone)
        submitData.append('class_name', formData.class_name)
        submitData.append('section', formData.section)
        submitData.append('dob', formData.dob)
        submitData.append('admission_date', formData.admission_date)
        if (photo) {
            submitData.append('photo', photo)
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/students', {
                method: 'POST',
                body: submitData // No Content-Type header, let browser set boundary
            })
            
            if (response.ok) {
                alert('Student Added Successfully!')
                setFormData({
                    name: '',
                    id: '',
                    email: '',
                    phone: '',
                    class_name: '',
                    section: '',
                    dob: '',
                    admission_date: new Date().toISOString().split('T')[0]
                })
                setPhoto(null)
                setPreviewUrl(null)
            } else {
                const errorData = await response.json()
                alert(`Failed to add student: ${errorData.detail || 'Unknown error'}`)
            }
        } catch (error) {
            console.error(error)
            alert('Error adding student')
        }
    }

    return (
        <FormContainer onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>Student Details</h2>
            
            <PhotoUploadContainer>
                <PhotoPreview onClick={() => fileInputRef.current?.click()}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" />
                    ) : (
                        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                            <FaCamera size={32} style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '0.8rem' }}>Upload Photo</div>
                        </div>
                    )}
                </PhotoPreview>
                <HiddenInput 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    Max size: 3MB. Formats: JPG, PNG.
                </div>
            </PhotoUploadContainer>

            <FormGrid>
                <FormGroup>
                    <Label>Full Name <span>*</span></Label>
                    <Input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Student ID <span>*</span></Label>
                    <Input 
                        type="text" 
                        placeholder="e.g. S12345"
                        value={formData.id}
                        onChange={(e) => setFormData({...formData, id: e.target.value})}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Email Address <span>*</span></Label>
                    <Input 
                        type="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Phone Number</Label>
                    <Input 
                        type="tel" 
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label>Admission Date <span>*</span></Label>
                    <Input 
                        type="date"
                        value={formData.admission_date}
                        onChange={(e) => setFormData({...formData, admission_date: e.target.value})}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Date of Birth</Label>
                    <Input 
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Class</Label>
                    <Select 
                        value={formData.class_name}
                        onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                        required
                    >
                        <option value="">Select Class</option>
                        <option value="Nursery">Nursery</option>
                        <option value="LKG">LKG</option>
                        <option value="UKG">UKG</option>
                        <option value="1st">1st</option>
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="4th">4th</option>
                        <option value="5th">5th</option>
                        <option value="6th">6th</option>
                        <option value="7th">7th</option>
                        <option value="8th">8th</option>
                        <option value="9th">9th</option>
                        <option value="10th">10th</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label>Section</Label>
                    <Select 
                        value={formData.section}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                    >
                        <option value="">Select Section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </Select>
                </FormGroup>
            </FormGrid>
            
            <SubmitButton type="submit">Add Student</SubmitButton>
        </FormContainer>
    )
}
