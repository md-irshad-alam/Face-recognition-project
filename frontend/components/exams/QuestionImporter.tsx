'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { FaUpload, FaCheck, FaTimes, FaSave, FaExclamationTriangle } from 'react-icons/fa'

const Container = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 1rem;
`

const UploadArea = styled.div`
  border: 2px dashed #D1D5DB;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
      border-color: #4F46E5;
      background-color: #EEF2FF;
  }
`

const TableContainer = styled.div`
  margin-top: 1.5rem;
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  
  th, td {
      padding: 0.75rem;
      border: 1px solid #E5E7EB;
      text-align: left;
  }
  
  th {
      background-color: #F9FAFB;
      font-weight: 600;
  }
  
  .error-row {
      background-color: #FEF2F2;
  }
`

const Button = styled.button`
  background-color: #4F46E5;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:disabled {
      background-color: #9CA3AF;
      cursor: not-allowed;
  }
`

const StatusBadge = styled.span<{ $type: 'success' | 'date' | 'error' }>`
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background-color: ${({ $type }) => $type === 'success' ? '#D1FAE5' : '#FEE2E2'};
    color: ${({ $type }) => $type === 'success' ? '#065F46' : '#991B1B'};
`

export default function QuestionImporter({ examId }: { examId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<{valid: any[], invalid: any[]} | null>(null)
    const [selectedRows, setSelectedRows] = useState<number[]>([]) // Indices of valid rows
    const [loading, setLoading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0]
            setFile(uploadedFile)
            setLoading(true)
            
            const formData = new FormData()
            formData.append('file', uploadedFile)
            
            try {
                const res = await fetch('http://127.0.0.1:8000/exams/parse-file', {
                    method: 'POST',
                    body: formData
                })
                
                if (!res.ok) throw new Error('Failed to parse file')
                
                const data = await res.json()
                setParsedData(data)
                // Select all valid rows by default
                setSelectedRows(data.valid.map((_: any, i: number) => i))
            } catch (err) {
                console.error(err)
                alert('Error parsing file')
            } finally {
                setLoading(false)
            }
        }
    }

    const handleSave = async () => {
        if (!parsedData) return
        
        const questionsToSave = selectedRows.map(i => parsedData.valid[i])
        setLoading(true)
        
        try {
            const res = await fetch(`http://127.0.0.1:8000/exams/${examId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionsToSave)
            })
            
            if (res.ok) {
                alert(`Successfully saved ${questionsToSave.length} questions!`)
                setParsedData(null)
                setFile(null)
            } else {
                alert('Failed to save questions')
            }
        } catch (err) {
            console.error(err)
            alert('Error saving questions')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <h2>Import Questions</h2>
            <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                Upload a CSV or Excel file. Required columns: question, option_a, option_b, option_c, option_d, correct_option.
            </p>
            
            {!parsedData ? (
                <UploadArea onClick={() => document.getElementById('file-upload')?.click()}>
                    <FaUpload size={24} color="#9CA3AF" />
                    <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>
                        {loading ? 'Parsing...' : 'Click to Upload or Drag & Drop'}
                    </p>
                    <input 
                        id="file-upload" 
                        type="file" 
                        accept=".csv, .xlsx" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload}
                    />
                </UploadArea>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                             <strong>Valid:</strong> {parsedData.valid.length} | <strong>Invalid:</strong> {parsedData.invalid.length}
                         </div>
                         <Button onClick={() => setParsedData(null)} style={{ background: 'grey', padding: '0.5rem 1rem' }}>
                             Cancel
                         </Button>
                    </div>

                    <TableContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Question</th>
                                    <th>Options</th>
                                    <th>Answer</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Valid Rows */}
                                {parsedData.valid.map((row: any, i: number) => (
                                    <tr key={`valid-${i}`}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedRows.includes(i)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedRows([...selectedRows, i])
                                                    else setSelectedRows(selectedRows.filter(idx => idx !== i))
                                                }}
                                            />
                                        </td>
                                        <td>{row.question}</td>
                                        <td>
                                            A: {row.option_a}<br/>
                                            B: {row.option_b}<br/>
                                            C: {row.option_c}<br/>
                                            D: {row.option_d}
                                        </td>
                                        <td>{row.correct_option}</td>
                                        <td><StatusBadge $type="success"><FaCheck /> Valid</StatusBadge></td>
                                    </tr>
                                ))}
                                
                                {/* Invalid Rows */}
                                {parsedData.invalid.map((row: any, i: number) => (
                                    <tr key={`invalid-${i}`} className="error-row">
                                        <td><FaTimes color="red" /></td>
                                        <td>row {row.row}</td>
                                        <td colSpan={2} style={{ color: '#B91C1C' }}>{row.error}</td>
                                        <td><StatusBadge $type="error"><FaExclamationTriangle /> Error</StatusBadge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableContainer>
                    
                    <Button onClick={handleSave} disabled={selectedRows.length === 0 || loading}>
                        <FaSave /> {loading ? 'Saving...' : `Save ${selectedRows.length} Questions`}
                    </Button>
                </>
            )}
        </Container>
    )
}
