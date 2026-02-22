'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import ExamTakingUI from '../../../../components/exams/ExamTakingUI'
import { FaArrowLeft } from 'react-icons/fa'

const PageContainer = styled.div`
    background-color: #F3F4F6;
    min-height: 100vh;
    padding: 2rem;
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 800px;
    margin: 0 auto 2rem;
    
    h1 {
        font-size: 1.5rem;
        color: #111827;
    }
`

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #4B5563;
    font-weight: 500;
    cursor: pointer;
    font-size: 1rem;
    
    &:hover {
        color: #111827;
    }
`

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch questions for this exam
        fetch(`http://127.0.0.1:8000/exams/${id}/questions`)
            .then(res => res.json())
            .then(data => {
                setQuestions(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [id])

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Exam...</div>

    return (
        <PageContainer>
            <Header>
                <BackButton onClick={() => router.back()}>
                    <FaArrowLeft /> Back to Dashboard
                </BackButton>
                <h1>Exam Session</h1>
                <div style={{ width: '80px' }}></div> {/* Spacer for alignment */}
            </Header>
            
            <ExamTakingUI 
                questions={questions} 
                onComplete={() => {
                    alert('Exam Submitted!');
                    router.push('/examinations');
                }} 
            />
        </PageContainer>
    )
}
