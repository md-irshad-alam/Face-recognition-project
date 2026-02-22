'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaClock } from 'react-icons/fa'
import Link from 'next/link'

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ExamCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`

const ExamInfo = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 0.25rem;
  }
  p {
    color: #6B7280;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const ActionButton = styled(Link)`
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #4F46E5;
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 0.5rem;
    
    &:hover {
        background-color: #4338CA;
    }
`

const CountdownBox = styled.div`
  background: #EFF6FF;
  color: #2563EB;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  min-width: 150px;
  
  .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.8;
  }
  
  .time {
      font-size: 1.25rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
  }
`

const StartButton = styled(Link)`
    display: inline-block;
    background-color: #EF4444;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 700;
    text-decoration: none;
    font-size: 0.9rem;
    
    &:hover {
        background-color: #DC2626;
    }
`

function CountdownTimer({ targetDate, examId }: { targetDate: string, examId: number }) {
    const [timeLeft, setTimeLeft] = useState<string>('Loading...')
    const [isStarted, setIsStarted] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime()
            const target = new Date(targetDate).getTime()
            const distance = target - now

            if (distance < 0) {
                setIsStarted(true)
                setTimeLeft("Started")
                clearInterval(interval)
                return
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    if (isStarted) {
        return (
            <StartButton href={`/examinations/${examId}/take`}>
                Start Exam
            </StartButton>
        )
    }

    return (
        <CountdownBox>
            <div className="label">Starts In</div>
            <div className="time">{timeLeft}</div>
        </CountdownBox>
    )
}

export default function ExamList() {
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://127.0.0.1:8000/exams')
            .then(res => res.json())
            .then(data => {
                setExams(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading exams...</div>
    if (exams.length === 0) return <div>No exams scheduled yet.</div>

    return (
        <ListContainer>
            {exams.map((exam) => (
                <ExamCard key={exam.id}>
                    <ExamInfo>
                        <h3>{exam.name}</h3>
                        <p><FaClock /> {exam.date} at {exam.time}</p>
                        <p>Duration: {exam.duration} mins | Type: {exam.exam_type}</p>
                        <ActionButton href={`/examinations/${exam.id}`}>
                            Manage Questions
                        </ActionButton>
                    </ExamInfo>
                    <CountdownTimer targetDate={`${exam.date}T${exam.time}`} examId={exam.id} />
                </ExamCard>
            ))}
        </ListContainer>
    )
}
