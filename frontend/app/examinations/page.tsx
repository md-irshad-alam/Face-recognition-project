'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import ScheduleExamForm from '../../components/exams/ScheduleExamForm'
import ExamList from '../../components/exams/ExamList'
import QuestionImporter from '../../components/exams/QuestionImporter'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import { viewSizeCalculator } from '../../utils/responsive'

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
    margin: 0 auto;
    width: 100%;
`

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    h1 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #111827;
    }
`

const Tabs = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #E5E7EB;
`

const Tab = styled.button<{ $active: boolean }>`
    padding: ${viewSizeCalculator(16)} ${viewSizeCalculator(24)};
    background: none;
    border: none;
    border-bottom: 3px solid ${({ $active }) => ($active ? '#4F46E5' : 'transparent')};
    color: ${({ $active }) => ($active ? '#4F46E5' : '#6B7280')};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        color: #4F46E5;
        background-color: #EEF2FF;
    }
`


export default function ExaminationsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'schedule' | 'list' | 'questions'>('schedule')
    const [exams, setExams] = useState<any[]>([])
    const [selectedExamId, setSelectedExamId] = useState<string>('')

    React.useEffect(() => {
        if (activeTab === 'questions') {
            fetch('http://127.0.0.1:8000/exams')
                .then(res => res.json())
                .then(data => setExams(data))
                .catch(err => console.error(err))
        }
    }, [activeTab])

    return (
        <Container>
            <Sidebar isOpen={sidebarOpen} />
            <MainContent $expand={sidebarOpen}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <ContentWrapper>
                    <Tabs>
                        <Tab 
                            $active={activeTab === 'schedule'} 
                            onClick={() => setActiveTab('schedule')}
                        >
                            Schedule Exam
                        </Tab>
                        <Tab 
                            $active={activeTab === 'list'} 
                            onClick={() => setActiveTab('list')}
                        >
                            Scheduled Exams
                        </Tab>
                         <Tab 
                            $active={activeTab === 'questions'} 
                            onClick={() => setActiveTab('questions')}
                        >
                            Manage Questions
                        </Tab>
                    </Tabs>

                    {activeTab === 'schedule' && <ScheduleExamForm />}
                    {activeTab === 'list' && <ExamList />}
                    {activeTab === 'questions' && (
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    Select Exam to Add Questions:
                                </label>
                                <select 
                                    value={selectedExamId}
                                    onChange={(e) => setSelectedExamId(e.target.value)}
                                    style={{ 
                                        padding: '0.75rem', 
                                        borderRadius: '0.5rem', 
                                        border: '1px solid #D1D5DB',
                                        width: '100%',
                                        maxWidth: '400px'
                                    }}
                                >
                                    <option value="">-- Select an Exam --</option>
                                    {exams.map((exam: any) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name} ({exam.date})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedExamId ? (
                                <QuestionImporter examId={selectedExamId} />
                            ) : (
                                <div style={{ 
                                    padding: '2rem', 
                                    background: 'white', 
                                    borderRadius: '0.5rem', 
                                    textAlign: 'center',
                                    color: '#6B7280'
                                }}>
                                    Please select an exam to proceed with question upload.
                                </div>
                            )}
                        </div>
                    )}
                    
                </ContentWrapper>
            </MainContent>
        </Container>
    )
}
