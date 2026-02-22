'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { FaBook, FaCheckCircle, FaTimesCircle, FaClock, FaCheck, FaTimes } from 'react-icons/fa'

const ExamContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
`

const Title = styled.h2`
    font-size: 1.8rem;
    color: #111827;
    margin-bottom: 1.5rem;
    font-weight: 700;
`

const InstructionList = styled.ul`
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
    
    li {
        margin-bottom: 1rem;
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        font-size: 1.05rem;
        color: #4B5563;
        
        svg {
            margin-top: 0.25rem;
            color: #4F46E5;
            flex-shrink: 0;
        }
    }
`

const QuestionText = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`

const Option = styled.div<{ $selected?: boolean; $correct?: boolean; $wrong?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: ${({ $selected, $correct, $wrong }) => 
      $correct ? '#ECFDF5' : 
      $wrong ? '#FEF2F2' : 
      $selected ? '#EEF2FF' : '#F9FAFB'};
  border: 1px solid ${({ $selected, $correct, $wrong }) => 
      $correct ? '#059669' : 
      $wrong ? '#DC2626' : 
      $selected ? '#4F46E5' : '#E5E7EB'};
  border-radius: 0.5rem;
  cursor: ${({ $correct, $wrong }) => ($correct || $wrong ? 'default' : 'pointer')};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ $selected, $correct, $wrong }) => 
        ($correct || $wrong) ? '' : ($selected ? '#EEF2FF' : '#F3F4F6')};
  }
`

const OptionLabel = styled.span<{ $correct?: boolean; $wrong?: boolean }>`
  background-color: ${({ $correct, $wrong }) => 
      $correct ? '#059669' : 
      $wrong ? '#DC2626' : '#E5E7EB'};
  color: ${({ $correct, $wrong }) => 
      ($correct || $wrong) ? 'white' : '#374151'};
  font-weight: 600;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  margin-right: 1rem;
  font-size: 0.9rem;
`

const Button = styled.button<{ $secondary?: boolean; $full?: boolean }>`
    background-color: ${({ $secondary }) => ($secondary ? '#6B7280' : '#4F46E5')};
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    width: ${({ $full }) => ($full ? '100%' : 'auto')};
    font-size: 1rem;
    
    &:hover {
        background-color: ${({ $secondary }) => ($secondary ? '#4B5563' : '#4338CA')};
    }
`

const ScoreCard = styled.div`
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    color: white;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    margin-bottom: 2rem;
    
    h2 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }
    p {
        opacity: 0.9;
        font-size: 1.1rem;
    }
`

export default function ExamTakingUI({ questions, onComplete }: { questions: any[], onComplete: () => void }) {
    const [view, setView] = useState<'instructions' | 'taking' | 'result'>('instructions')
    const [answers, setAnswers] = useState<{[key: number]: string}>({})
    const [score, setScore] = useState(0)

    const handleSelectOption = (questionIndex: number, option: string) => {
        if (view !== 'taking') return
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: option
        }))
    }

    const handleSubmit = () => {
        if (confirm("Are you sure you want to submit the exam?")) {
            let calculatedScore = 0
            questions.forEach((q, index) => {
                if (answers[index] === q.correct_option) {
                    calculatedScore += q.marks || 1
                }
            })
            setScore(calculatedScore)
            setView('result')
        }
    }

    if (!questions || questions.length === 0) {
        return <div>No questions available for this exam.</div>
    }

    // --- INSTRUCTIONS VIEW ---
    if (view === 'instructions') {
        const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0)
        return (
            <ExamContainer>
                <Card>
                    <Title>Exam Instructions</Title>
                    <p style={{ marginBottom: '1.5rem', color: '#6B7280' }}>
                        Please read the following instructions carefully before starting the exam.
                    </p>
                    
                    <InstructionList>
                        <li><FaBook /> Total Questions: <strong>{questions.length}</strong></li>
                        <li><FaCheckCircle /> Total Marks: <strong>{totalMarks}</strong></li>
                        <li><FaClock /> Keep an eye on the timer (if applicable).</li>
                        <li><FaTimesCircle /> <strong>Do not</strong> switch tabs or minimize the browser window.</li>
                        <li><FaCheckCircle /> Ensure you have a stable internet connection.</li>
                        <li><FaBook /> Each question carries specific marks indicated.</li>
                    </InstructionList>

                    <Button $full onClick={() => setView('taking')}>
                        I have read the instructions. Start Exam
                    </Button>
                </Card>
            </ExamContainer>
        )
    }

    // --- RESULT VIEW ---
    if (view === 'result') {
        const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0)
        return (
            <ExamContainer>
                <ScoreCard>
                    <p>Your Score</p>
                    <h2>{score} / {totalMarks}</h2>
                    <p>{score >= totalMarks * 0.4 ? 'Congratulations! You Passed.' : 'Keep Practicing!'}</p>
                </ScoreCard>
                
                <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>Detailed Review</h3>
                
                {questions.map((q, index) => {
                    const userAnswer = answers[index]
                    const isCorrect = userAnswer === q.correct_option
                    const isSkipped = !userAnswer
                    
                    return (
                        <Card key={index} style={{ borderLeft: `5px solid ${isCorrect ? '#10B981' : isSkipped ? '#F59E0B' : '#EF4444'}` }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <QuestionText style={{ marginBottom: 0 }}>
                                    {index + 1}. {q.question}
                                </QuestionText>
                                <span style={{ 
                                    color: isCorrect ? '#10B981' : isSkipped ? '#F59E0B' : '#EF4444', 
                                    fontWeight: 700 
                                }}>
                                    {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}
                                </span>
                             </div>

                             {['A', 'B', 'C', 'D'].map((opt) => {
                                 const isSelected = userAnswer === opt
                                 const isAnswer = q.correct_option === opt
                                 
                                 return (
                                    <Option 
                                        key={opt}
                                        $correct={isAnswer} // Always highlight correct answer in green
                                        $wrong={isSelected && !isCorrect} // Highlight wrong selection in red
                                        $selected={false} // Disable normal selection style
                                    >
                                        <OptionLabel $correct={isAnswer} $wrong={isSelected && !isCorrect}>
                                            {isAnswer ? <FaCheck /> : (isSelected ? <FaTimes /> : opt)}
                                        </OptionLabel>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#374151', fontWeight: 500 }}>{q[`option_${opt.toLowerCase()}`]}</div>
                                        </div>
                                    </Option>
                                 )
                             })}
                             
                             <div style={{ marginTop: '1rem', padding: '1rem', background: '#F3F4F6', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#4B5563' }}>
                                 <strong>Explanation: </strong> {q.explanation || 'No explanation provided.'}
                             </div>
                        </Card>
                    )
                })}
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button $secondary onClick={onComplete} $full>Back to Dashboard</Button>
                </div>
            </ExamContainer>
        )
    }

    // --- TAKING VIEW ---
    return (
        <ExamContainer>
            {questions.map((q, index) => (
                <Card key={index}>
                    <QuestionText>{index + 1}. {q.question}</QuestionText>
                    
                    {['A', 'B', 'C', 'D'].map((opt) => (
                        <Option 
                            key={opt} 
                            $selected={answers[index] === opt}
                            onClick={() => handleSelectOption(index, opt)}
                        >
                            <OptionLabel>{opt}</OptionLabel>
                            <span style={{ color: '#374151' }}>{q[`option_${opt.toLowerCase()}`]}</span>
                        </Option>
                    ))}
                </Card>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <Button $secondary onClick={() => {
                    if(confirm("Exit exam? Progress will be lost.")) window.history.back()
                }}>Exit</Button>
                <Button onClick={handleSubmit}>Submit Exam</Button>
            </div>
        </ExamContainer>
    )
}
