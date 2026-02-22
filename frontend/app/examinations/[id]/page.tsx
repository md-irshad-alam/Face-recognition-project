'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

import { FaArrowLeft } from 'react-icons/fa'
import { viewSizeCalculator } from '../../../utils/responsive'
import Sidebar from '../../../components/dashboard/Sidebar'
import Header from '../../../components/dashboard/Header'
import QuestionImporter from '../../../components/exams/QuestionImporter'


const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #F3F4F6;
`

const MainContent = styled.div<{ $expand: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $expand }) => ($expand ? '280px' : '0')};
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`

const ContentWrapper = styled.div`
    padding: ${viewSizeCalculator(16)};
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
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

const Section = styled.div`
    margin-bottom: 2rem;
`

export default function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [questions, setQuestions] = useState<any[]>([])

    useEffect(() => {
        // Fetch existing questions
        fetch(`http://127.0.0.1:8000/exams/${id}/questions`)
            .then(res => res.json())
            .then(data => setQuestions(data))
            .catch(err => console.error(err))
    }, [id])

    return (
        <Container>
            <Sidebar isOpen={sidebarOpen} />
            <MainContent $expand={sidebarOpen}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <ContentWrapper>
                    <BackButton onClick={() => router.back()}>
                        <FaArrowLeft /> Back to Examinations
                    </BackButton>
                    
                    <h1>Manage Exam Questions (ID: {id})</h1>
                    
                    <Section>
                        <h3>Existing Questions ({questions.length})</h3>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                            {questions.slice(0, 5).map((q: any) => (
                                <li key={q.id}>{q.question}</li>
                            ))}
                            {questions.length > 5 && <li>...and {questions.length - 5} more</li>}
                        </ul>
                    </Section>

                    <QuestionImporter examId={id} />
                    
                </ContentWrapper>
            </MainContent>
        </Container>
    )
}
