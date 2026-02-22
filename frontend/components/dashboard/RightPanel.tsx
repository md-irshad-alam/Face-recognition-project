'use client'

import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { FaBell, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaPlay, FaRedo, FaUserGraduate } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// --- Styled Components ---

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Card = styled.div`
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`

const WidgetTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const WebcamSection = styled.div`
  background-color: #000;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  margin-bottom: 2rem;
  height: 240px; /* Fixed height for camera */
  
  video {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }
`

const Overlay = styled.div<{ $status: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  
  border-top: 4px solid ${({ $status }) => 
      $status === 'Verified' ? '#10B981' : 
      $status === 'Already Marked' ? '#F59E0B' : 
      $status === 'No Record Found' ? '#EF4444' : 'transparent'};
`

const StartOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: white;
  gap: 1rem;
`

const StartButton = styled.button`
  background-color: #4F46E5;
  color: white;
  border: none;
  border-radius: 9999px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  
  &:hover {
      transform: scale(1.1);
      background-color: #4338CA;
  }
`

const CalendarWrapper = styled.div`
    .react-datepicker {
        font-family: 'Inter', sans-serif;
        border: none;
        box-shadow: none;
        width: 100%;
    }
    .react-datepicker__header {
        background-color: white;
        border-bottom: none;
    }
    .react-datepicker__current-month {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1F2937;
    }
    .react-datepicker__day-name {
        color: #9CA3AF;
        font-weight: 600;
        width: 2rem;
    }
    .react-datepicker__day {
        width: 2rem;
        line-height: 2rem;
        border-radius: 50%;
        color: #1F2937;
        &:hover {
            background-color: #F3F4F6;
        }
    }
    .react-datepicker__day--selected {
        background-color: #10B981 !important;
        color: white !important;
    }
    .react-datepicker__day--keyboard-selected {
        background-color: #D1FAE5;
        color: #1F2937;
    }
    .react-datepicker__month-container {
      width: 100%;
    }
`

const StatCard = styled.div<{ $color: string }>`
  background-color: ${(props) => props.$color};
  padding: 1.5rem;
  border-radius: 1rem;
  color: ${props => props.$color === '#FFF' ? '#1F2937' : 'white'};
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);

  .icon {
    background-color: rgba(255,255,255,0.2);
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .info {
    h4 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    span {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
`

export default function RightPanel() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [scanResult, setScanResult] = useState<{name: string, status: string} | null>(null)
    const [isScanning, setIsScanning] = useState(true) // State for scanning control
    const ws = useRef<WebSocket | null>(null)
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
    const [startDate, setStartDate] = useState(new Date());

    // Audio refs
    const audioSuccess = useRef<HTMLAudioElement | null>(null)
    const audioWarning = useRef<HTMLAudioElement | null>(null)
    const audioError = useRef<HTMLAudioElement | null>(null)

    // Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/stats')
                const data = await response.json()
                setStats(data)
            } catch (error) {
                console.error("Error fetching stats:", error)
            }
        }
        fetchStats()
        
        // Optional: Poll every minute
        const interval = setInterval(fetchStats, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        // Init Audio
        if (typeof window !== 'undefined') {
            audioSuccess.current = new Audio('/sounds/success.mp3')
            audioWarning.current = new Audio('/sounds/warning.mp3') 
            audioError.current = new Audio('/sounds/error.mp3')
        }

        // Start Camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
             navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                })
                .catch(err => console.error("Camera Error:", err))
        }

        // Connect WS
        ws.current = new WebSocket('ws://localhost:8000/ws/face-recognition')
        
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.faces && data.faces.length > 0) {
                const face = data.faces[0]
                setScanResult(face)
            
                // Play sounds logic
                 if (face.status === 'Verified') {
                    audioSuccess.current?.play().catch(e => console.log('Audio play failed', e))
                } else if (face.status === 'Already Marked') {
                    audioWarning.current?.play().catch(e => console.log('Audio play failed', e))
                } else if (face.status === 'No Record Found') {
                    // STOP SCANNING
                    audioWarning.current?.play().catch(e => console.log('Audio play failed', e))
                    setIsScanning(false)
                }
            } else {
                 setScanResult(null)
            }
        }

        return () => {
             ws.current?.close()
             if(videoRef.current && videoRef.current.srcObject) {
                 const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                 tracks.forEach(track => track.stop());
             }
        }
    }, [])

    // Send frames loop
    useEffect(() => {
        const interval = setInterval(() => {
            // Only send if isScanning is true
            if (isScanning && ws.current?.readyState === WebSocket.OPEN && videoRef.current) {
                const canvas = document.createElement('canvas')
                canvas.width = videoRef.current.videoWidth
                canvas.height = videoRef.current.videoHeight
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0)
                    const base64 = canvas.toDataURL('image/jpeg', 0.5)
                    ws.current.send(base64)
                }
            }
        }, 1000) 
        return () => clearInterval(interval)
    }, [isScanning]) // Depend on isScanning

  return (
    <RightColumn>
         {/* Webcam Section */}
         <Card>
            <WidgetTitle>Live Attendance</WidgetTitle> 
            <WebcamSection>
                <video ref={videoRef} autoPlay playsInline muted />
                
                {/* Overlay for Status */}
                {scanResult && isScanning && (
                    <Overlay $status={scanResult.status}>
                        {scanResult.status === 'Verified' && <FaCheckCircle />}
                        {scanResult.status === 'Already Marked' && <FaExclamationCircle />}
                        
                        <span>{scanResult.status === 'Verified' ? `Welcome, ${scanResult.name}` : 
                              scanResult.status === 'Already Marked' ? `Marked: ${scanResult.name}` : 
                              scanResult.name}</span>
                    </Overlay>
                )}

                {/* Overlay for Stopped/Start */}
                {!isScanning && (
                    <StartOverlay>
                        <FaExclamationCircle size={32} color="#EF4444" />
                        <div style={{fontWeight: 600}}>Face Not Found</div>
                        <StartButton onClick={() => {
                            setScanResult(null)
                            setIsScanning(true)
                        }}>
                            <FaRedo />
                        </StartButton>
                        <div style={{fontSize: '0.8rem', opacity: 0.8}}>Tap to Restart Scanner</div>
                    </StartOverlay>
                )}
            </WebcamSection>
         </Card>

         {/* Calendar Widget */}
         <Card>
          <CalendarWrapper>
            <DatePicker 
                selected={startDate} 
                onChange={(date:any) => {
                    if (date) setStartDate(date)
                }} 
                inline
            />
          </CalendarWrapper>
         </Card>

         {/* Stat Cards */}
         <StatCard $color="#FFF1B8">
            <div className="icon" style={{ color: '#D97706' }}>
                <FaUserGraduate />
            </div>
            <div className="info" style={{ color: '#92400E' }}>
                <h4>{stats.total}</h4>
                <span>Total Students</span>
            </div>
         </StatCard>
         
         <StatCard $color="#D1FAE5">
            <div className="icon" style={{ color: '#059669' }}>
                <FaCheckCircle />
            </div>
            <div className="info" style={{ color: '#065F46' }}>
                <h4>{stats.present}</h4>
                <span>Present Today</span>
            </div>
         </StatCard>
         
         <StatCard $color="#FFE4E6">
            <div className="icon" style={{ color: '#BE123C' }}>
                <FaTimesCircle />
            </div>
            <div className="info" style={{ color: '#881337' }}>
                <h4>{stats.absent}</h4>
                <span>Absent Today</span>
            </div>
         </StatCard>

      </RightColumn>
  )
}
