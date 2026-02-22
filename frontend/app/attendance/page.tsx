'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import Webcam from 'react-webcam'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'

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

const PageTitle = styled.h1`
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
`

const SplitLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    height: 600px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        height: auto;
    }
`

const CameraSection = styled.div`
    background-color: #1F2937; /* Dark bg for camera */
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`

const StatusSection = styled.div`
    background-color: white;
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`

// Scan Animation
const scanAnimation = keyframes`
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`

const ScanOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #10B981; /* Green scan line */
        box-shadow: 0 0 10px #10B981;
        animation: ${scanAnimation} 2s linear infinite;
    }
`

const FrameOverlay = styled.div`
    position: absolute;
    width: 280px;
    height: 280px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    
    /* Corner accents */
    &::before, &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border-color: #10B981;
        border-style: solid;
        transition: all 0.3s;
    }
    
    /* Top Left */
    &::before {
        top: -2px; left: -2px;
        border-width: 4px 0 0 4px;
        border-radius: 4px 0 0 0;
    }
    
    /* Bottom Right (using secondary pseudo element approach or nested for all 4 corners would be better but keeping simple) */
    /* Only doing 2 corners for simplicity in CSS-in-JS without extra divs */
`

const StatusIcon = styled.div<{ $status: 'idle' | 'scanning' | 'verified' | 'failed' | 'already_marked' | 'on_hold' }>`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: ${(props) => {
        switch(props.$status) {
            case 'verified': return '#D1FAE5';
            case 'failed': return '#FEE2E2';
            case 'already_marked': return '#FEF3C7';
            case 'on_hold': return '#FEF2F2';
            default: return '#F3F4F6';
        }
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: ${(props) => {
        switch(props.$status) {
            case 'verified': return '#059669';
            case 'failed': return '#DC2626';
            case 'already_marked': return '#D97706';
            case 'on_hold': return '#B91C1C';
            default: return '#9CA3AF';
        }
    }};
    margin-bottom: 1.5rem;
`

const StatusTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111827;
`

const StatusMessage = styled.p`
    color: #6B7280;
    max-width: 300px;
`

const UserDetail = styled.div`
    margin-top: 2rem;
    text-align: center;
    
    img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 1rem;
        border: 4px solid #fff;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    span {
        display: inline-block;
        background-color: #E0E7FF;
        color: #4338CA;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.875rem;
        font-weight: 500;
    }
`

export default function AttendancePage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'mark' | 'list'>('mark')
    const [presentStudents, setPresentStudents] = useState<any[]>([])
    
    // Camera States
    const webcamRef = useRef<Webcam>(null)
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [verifyStatus, setVerifyStatus] = useState<'idle' | 'scanning' | 'verified' | 'failed' | 'already_marked' | 'on_hold'>('idle')
    const [studentData, setStudentData] = useState<any | null>(null)
    const [isScanning, setIsScanning] = useState(false)

    // Fetch Present Students
    const fetchPresentStudents = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/attendance/today')
            if (res.ok) {
                const data = await res.json()
                setPresentStudents(data)
            }
        } catch (error) {
            console.error("Failed to fetch attendance", error)
        }
    }

    useEffect(() => {
        if (activeTab === 'list') {
            fetchPresentStudents()
        }
    }, [activeTab])

    // Connect to WebSocket (Only when in 'mark' tab)
    useEffect(() => {
        if (activeTab !== 'mark') return

        const ws = new WebSocket('ws://localhost:8000/ws/face-recognition')
        
        ws.onopen = () => {
            console.log('Connected to Face Recognition WebSocket')
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.faces && data.faces.length > 0) {
                const face = data.faces[0]
                
                if (face.status === 'Verified') {
                    setVerifyStatus('verified')
                    setStudentData(face)
                    setIsScanning(false) // Stop scanning on success
                } else if (face.status === 'Already Marked') {
                    setVerifyStatus('already_marked')
                    setStudentData(face)
                    setIsScanning(false) // Stop scanning on already marked
                } else if (face.status === 'On Hold') {
                    setVerifyStatus('on_hold')
                    setStudentData(face)
                    setIsScanning(false) // Stop scanning
                } else {
                    // 'No Record Found' or 'Unverified'
                    setVerifyStatus('failed')
                    setStudentData(null)
                }
            }
        }

        setSocket(ws)

        return () => {
            ws.close()
        }
    }, [activeTab])

    // Send frames to backend
    const capture = useCallback(() => {
        if (activeTab === 'mark' && isScanning && webcamRef.current && socket && socket.readyState === WebSocket.OPEN) {
            const imageSrc = webcamRef.current.getScreenshot()
            if (imageSrc) {
                socket.send(imageSrc)
            }
        }
    }, [webcamRef, socket, isScanning, activeTab])

    // Interval for capturing frames
    useEffect(() => {
        const interval = setInterval(capture, 500)
        return () => clearInterval(interval)
    }, [capture])

    return (
        <Container>
            <Sidebar isOpen={sidebarOpen} />
            <MainContent style={{ marginLeft: sidebarOpen ? '280px' : '0' }}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <PageTitle>Attendance Manager</PageTitle>
                    <TabContainer>
                        <TabButton $active={activeTab === 'mark'} onClick={() => setActiveTab('mark')}>
                            📸 Mark Attendance
                        </TabButton>
                        <TabButton $active={activeTab === 'list'} onClick={() => setActiveTab('list')}>
                            📋 Present Students
                        </TabButton>
                    </TabContainer>
                </div>
                
                {activeTab === 'mark' ? (
                    <SplitLayout>
                        <CameraSection>
                            {isScanning ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ width: 720, height: 720, facingMode: "user" }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <ScanOverlay />
                                    <FrameOverlay />
                                    <button 
                                        onClick={() => setIsScanning(false)}
                                        style={{
                                            position: 'absolute',
                                            bottom: '20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#EF4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '9999px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            zIndex: 20
                                        }}
                                    >
                                        Stop Scanning
                                    </button>
                                </>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '100%', 
                                    color: '#9CA3AF' 
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                                    <button 
                                        onClick={() => {
                                            setIsScanning(true)
                                            setVerifyStatus('scanning')
                                            setStudentData(null)
                                        }}
                                        style={{
                                            padding: '0.75rem 2rem',
                                            backgroundColor: '#4F46E5',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            fontSize: '1.1rem',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Start Scanning
                                    </button>
                                </div>
                            )}
                        </CameraSection>
                        
                        <StatusSection>
                            <StatusIcon $status={verifyStatus}>
                                {(verifyStatus === 'scanning' || verifyStatus === 'idle') && '🔍'}
                                {verifyStatus === 'verified' && '✅'}
                                {verifyStatus === 'failed' && '❌'}
                                {verifyStatus === 'already_marked' && '⚠️'}
                                {verifyStatus === 'on_hold' && '🛑'}
                            </StatusIcon>
                            
                            <StatusTitle>
                                {verifyStatus === 'idle' && 'Ready to Scan'}
                                {verifyStatus === 'scanning' && 'Scanning...'}
                                {verifyStatus === 'verified' && 'Verified!'}
                                {verifyStatus === 'failed' && 'Not Recognized'}
                                {verifyStatus === 'already_marked' && 'Already Marked'}
                                {verifyStatus === 'on_hold' && 'Account On Hold'}
                            </StatusTitle>
                            
                            <StatusMessage>
                                {verifyStatus === 'idle' && 'Click "Start Scanning" to begin attendance marking.'}
                                {verifyStatus === 'scanning' && 'Please look directly at the camera. Ensure good lighting.'}
                                {verifyStatus === 'verified' && 'Attendance marked successfully.'}
                                {verifyStatus === 'failed' && 'Face not recognized. Please try again.'}
                                {verifyStatus === 'already_marked' && 'Attendance has already been recorded for today.'}
                                {verifyStatus === 'on_hold' && 'Your profile is temporarily on hold, contact your principal Principal\'s Name +91XXXXXXXXXX.'}
                            </StatusMessage>
                            
                            {(verifyStatus === 'verified' || verifyStatus === 'already_marked' || verifyStatus === 'on_hold') && studentData && (
                                <UserDetail>
                                    <img 
                                        src={studentData.photo_url ? `http://localhost:8000${studentData.photo_url}` : `https://i.pravatar.cc/150?u=${studentData.name}`} 
                                        alt="Student" 
                                        onError={(e) => {
                                            e.currentTarget.onerror = null; 
                                            e.currentTarget.src=`https://i.pravatar.cc/150?u=${studentData.name}`
                                        }}
                                    />
                                    <h3>{studentData.name}</h3>
                                    <span>{studentData.program || "Student"} {studentData.section ? `(${studentData.section})` : ""}</span>
                                </UserDetail>
                            )}
                        </StatusSection>
                    </SplitLayout>
                ) : (
                    <TableContainer>
                         <Table>
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Program</th>
                                    <th>Check-in Time</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {presentStudents.length > 0 ? (
                                    presentStudents.map((student) => (
                                        <tr key={student.student_id}>
                                            <td>{student.student_id}</td>
                                            <td>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                                    
                                                    {student.name}
                                                </div>
                                            </td>
                                            <td>{student.program} ({student.section})</td>
                                            <td>{student.check_in_time}</td>
                                            <td><span style={{color: 'green', fontWeight: 'bold'}}>Present</span></td>
                                            <td>
                                                <Badge $type={student.remarks === 'Late' ? 'warning' : 'success'}>
                                                    {student.remarks}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>No attendance marked today.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </TableContainer>
                )}
            </MainContent>
        </Container>
    )
}

// --- Additional Styled Components ---
const TabContainer = styled.div`
    display: flex;
    gap: 1rem;
    background: #fff;
    padding: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`

const TabButton = styled.button<{ $active: boolean }>`
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s;
    background: ${props => props.$active ? '#EEF2FF' : 'transparent'};
    color: ${props => props.$active ? '#4F46E5' : '#6B7280'};
    
    &:hover {
        background: ${props => props.$active ? '#EEF2FF' : '#F9FAFB'};
    }
`

const TableContainer = styled.div`
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    overflow: hidden;
`

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    th, td {
        padding: 1rem 1.5rem;
        text-align: left;
        border-bottom: 1px solid #E5E7EB;
    }
    
    th {
        background-color: #F9FAFB;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: #6B7280;
        letter-spacing: 0.05em;
    }
    
    tr:last-child td {
        border-bottom: none;
    }
`

const Badge = styled.span<{ $type: 'success' | 'warning' }>`
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    
    background-color: ${props => props.$type === 'success' ? '#DEF7EC' : '#FEECDC'};
    color: ${props => props.$type === 'success' ? '#03543F' : '#92400E'};
`
