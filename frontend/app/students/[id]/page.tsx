'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaUserGraduate, FaCalendarCheck, FaDownload, FaQrcode } from 'react-icons/fa'
import { QRCodeCanvas } from 'qrcode.react'

import Sidebar from '../../../components/dashboard/Sidebar'
import Header from '../../../components/dashboard/Header'

// --- Styled Components ---
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F3F4F6;
  font-family: 'Inter', sans-serif;
  color: #1F2937;
`

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; 
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    
    &:hover {
        color: #1F2937;
    }
`

const ReportCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`

const HeaderSection = styled.div`
    display: flex;
    align-items: center;
    gap: 2rem;
    border-bottom: 1px solid #E5E7EB;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    
    img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
    }
`

const StudentInfo = styled.div`
    h1 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    p {
        color: #6B7280;
        margin-bottom: 0.25rem;
    }
`

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
`

const StatBox = styled.div`
    background-color: #F9FAFB;
    padding: 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
    
    h3 {
        font-size: 2rem;
        font-weight: 700;
        color: #4F46E5;
        margin-bottom: 0.5rem;
    }
    span {
        color: #6B7280;
        font-size: 0.9rem;
    }
`

const AttendanceHistory = styled.div`
    h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }
`

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 1rem;
    background-color: #F9FAFB;
    color: #6B7280;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid #E5E7EB;
  }
`

const QRCodeSection = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
    
    h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1F2937;
    }
    
    p {
        color: #6B7280;
        font-size: 0.9rem;
        max-width: 300px;
    }
`

const DownloadButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #4F46E5;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #4338CA;
    }
`

// Don't modify imports, just use React.use since React is imported
export default function StudentReport({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params) // Unwrap params
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = React.useState(true)
    const [student, setStudent] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true) // Restore loading state
    const [isUpdatingHold, setIsUpdatingHold] = useState(false)

    const toggleHoldStatus = async () => {
        if (!student) return
        setIsUpdatingHold(true)
        try {
            const newStatus = !student.is_on_hold;
            const res = await fetch(`http://127.0.0.1:8000/students/${id}/hold?hold_status=${newStatus}`, {
                method: 'PUT'
            });
            if (res.ok) {
                setStudent({ ...student, is_on_hold: newStatus })
            } else {
                alert('Failed to update hold status')
            }
        } catch (error) {
            console.error(error)
            alert('Error updating status')
        } finally {
            setIsUpdatingHold(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use 127.0.0.1 to avoid ipv6 resolution issues on localhost
                const response = await fetch(`http://127.0.0.1:8000/students/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setStudent(data.student)
                    setHistory(data.history)
                } else {
                    setError(`Failed to fetch: ${response.status} ${response.statusText}`)
                }
            } catch (error: any) {
                console.error("Error fetching student details:", error)
                setError(`Network error: ${error.message}`)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div>Loading...</div>
    if (error) return <div style={{padding: '2rem', color: 'red'}}>Error: {error}</div>
    if (!student) return <div>Student not found (ID: {id})</div>

    const totalDays = history.length
    const presentDays = history.filter(h => h.status === 'Present').length
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0



    const downloadQRCode = () => {
        const canvas = document.getElementById('qr-code') as HTMLCanvasElement
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.href = pngUrl
            downloadLink.download = `${student.name.replace(/\s+/g, '_')}_QR.png`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        }
    }

    const qrValue = typeof window !== 'undefined' ? window.location.href : ''

    return (
        <Container>
            <Sidebar isOpen={sidebarOpen} />
            <MainContent style={{ marginLeft: sidebarOpen ? '280px' : '0' }}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                 
                <BackButton onClick={() => router.back()}>
                    <FaArrowLeft /> Back to Dashboard
                </BackButton>

                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <ReportCard>
                        {student.is_on_hold && (
                            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#B91C1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>⚠️ Account On Hold</strong>
                                    <span>Your profile is temporarily on hold, contact your principal Principal's Name +91XXXXXXXXXX.</span>
                                </div>
                            </div>
                        )}
                        <HeaderSection>
                            {student.photo_url ? (
                                <img 
                                    src={`http://localhost:8000${student.photo_url}`} 
                                    alt={student.name} 
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        e.currentTarget.style.display='none';
                                        e.currentTarget.nextElementSibling?.removeAttribute('style');
                                    }}
                                />
                            ) : null}
                            <div 
                                style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '50%', 
                                    background: '#E0E7FF', 
                                    color: '#4F46E5', 
                                    display: student.photo_url ? 'none' : 'flex',
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '2.5rem', 
                                    fontWeight: 700 
                                }}
                            >
                                {student.name.substring(0, 2).toUpperCase()}
                            </div>
                            
                            <StudentInfo>
                                <h1>{student.name}</h1>
                                <p><FaUserGraduate style={{ marginRight: '0.5rem' }} /> Class {student.class_name} - Section {student.section}</p>
                                <p>Date of Birth: {student.dob || 'Not Provided'}</p>
                                <p>ID: {student.id}</p>
                            </StudentInfo>
                        </HeaderSection>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                            <button 
                                onClick={toggleHoldStatus}
                                disabled={isUpdatingHold}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: isUpdatingHold ? 'wait' : 'pointer',
                                    backgroundColor: student.is_on_hold ? '#10B981' : '#EF4444',
                                    color: 'white',
                                }}
                            >
                                {isUpdatingHold ? 'Updating...' : (student.is_on_hold ? 'Remove Hold' : 'Place On Hold')}
                            </button>
                        </div>
                        
                        <StatsGrid>
                            <StatBox>
                                <h3>{attendanceRate}%</h3>
                                <span>Attendance Rate</span>
                            </StatBox>
                            <StatBox>
                                <h3>{presentDays}</h3>
                                <span>Days Present</span>
                            </StatBox>
                            <StatBox>
                                <h3>{totalDays - presentDays}</h3>
                                <span>Days Absent / Other</span>
                            </StatBox>
                        </StatsGrid>

                        <AttendanceHistory>
                            <h2>Attendance History</h2>
                            <HistoryTable>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? history.map((record, i) => (
                                        <tr key={i}>
                                            <td>{record.date}</td>
                                            <td>{record.check_in_time}</td>
                                            <td style={{ color: '#10B981', fontWeight: 600 }}>{record.status}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center' }}>No attendance records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </HistoryTable>
                        </AttendanceHistory>
                    </ReportCard>
                    
                    <QRCodeSection>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
                            <QRCodeCanvas
                                id="qr-code"
                                value={qrValue}
                                size={200}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                        <div>
                            <h3>Student QR Code</h3>
                            <p>Scan this code to instantly access {student.name}'s profile and attendance record.</p>
                        </div>
                        <DownloadButton onClick={downloadQRCode}>
                            <FaDownload /> Download QR Code
                        </DownloadButton>
                    </QRCodeSection>
                 </div>
            </MainContent>
        </Container>
    )
}

