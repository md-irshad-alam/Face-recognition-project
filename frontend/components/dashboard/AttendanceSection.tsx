'use client'

import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { FaSearch, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useTableSearch } from '../../hooks/useTableSearch'
import { usePagination } from '../../hooks/usePagination'


// --- Styled Components ---
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

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  background-color: #FFFFFF;
  color: #1F2937;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #4F46E5;
    ring: 2px solid #4F46E5;
  }
`

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  width: 100%;
  gap: 0.5rem;
  color: #6B7280;

  input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 0.95rem;
    color: #1F2937;
    
    &::placeholder {
      color: #9CA3AF;
    }
  }
  
  &:focus-within {
    border-color: #4F46E5;
     ring: 2px solid #4F46E5;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 1rem;
    color: #6B7280;
    font-weight: 600;
    font-size: 0.9rem;
    border-bottom: 1px solid #E5E7EB;
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid #E5E7EB;
    vertical-align: middle;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tbody tr {
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
          background-color: #F9FAFB;
      }
  }
`

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
  
  button {
      background: white;
      border: 1px solid #E5E7EB;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      font-weight: 500;
      
      &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
      }
      &:hover:not(:disabled) {
          background-color: #F3F4F6;
      }
  }
  
  span {
      font-size: 0.9rem;
      color: #6B7280;
  }
`

// ... imports
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

// ... existing styles ...

const StatusBadge = styled.span<{ $status: string }>`
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ $status }) => 
        $status === 'On Time' ? '#059669' : 
        $status === 'Late' ? '#D97706' : '#6B7280'};
    background-color: ${({ $status }) => 
        $status === 'On Time' ? '#D1FAE5' : 
        $status === 'Late' ? '#FEF3C7' : '#F3F4F6'};
`

const Avatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #E0E7FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    position: relative;
    border: 2px solid #FFFFFF;
    box-shadow: 0 0 0 1px #E5E7EB;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`

export default function AttendanceSection() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'present' | 'all'>('present') // Default to 'present'

  // Audio refs
  const audioSuccess = useRef<HTMLAudioElement | null>(null)
  const audioWarning = useRef<HTMLAudioElement | null>(null)
  

  useEffect(() => {
      // Initialize audio
      audioSuccess.current = new Audio('/sounds/beep-success.mp3') // You'll need to add these files or use online URLs
      audioWarning.current = new Audio('/sounds/beep-warning.mp3')
      
      
      // Fallback to browser beep if files missing (mock implementation)
  }, [])

  // Create refined fetch function
  const fetchData = async () => {
      setLoading(true)
      try {
          // If view is 'present', fetch today's attendance
          // If view is 'all', fetch all students (or whatever logic you prefer for 'all')
          // The user specifically asked for "Present Student Tab" as default inside attendance
          
          const endpoint = view === 'present' ? 'http://localhost:8000/attendance/today' : 'http://localhost:8000/students'
          const res = await fetch(endpoint)
          const data = await res.json()
          setStudents(data)
      } catch (err) {
          console.error(err)
      } finally {
          setLoading(false)
      }
  }

  useEffect(() => {
      fetchData()
      // Polling for realtime updates?
      const interval = setInterval(fetchData, 5000) 
      return () => clearInterval(interval)
  }, [view])

  
  // 1. Search Hook
  const { searchTerm, setSearchTerm, filteredData } = useTableSearch(students, ['name', 'student_id', 'id']) // 'id' for student list, 'student_id' for attendance list
  
  // 2. Pagination Hook
  const { currentData, currentPage, totalPages, nextPage, prevPage } = usePagination(filteredData, 8)

  return (
    <Card>
      <WidgetTitle>
          Attendance Monitor
          <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setView('present')}
                style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.5rem', 
                    background: view === 'present' ? '#4F46E5' : 'transparent',
                    color: view === 'present' ? 'white' : '#6B7280',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                }}
              >
                  Present Students
              </button>
              <button 
                onClick={() => setView('all')}
                style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.5rem', 
                    background: view === 'all' ? '#4F46E5' : 'transparent',
                    color: view === 'all' ? 'white' : '#6B7280',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                }}
              >
                  All Students
              </button>
          </div>
      </WidgetTitle>
      
      <FilterGrid>
         <SearchInput>
            <FaSearch />
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </SearchInput>
      </FilterGrid>
      
      <Table>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Photo</th>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Section</th>
            {view === 'present' && <th>Time In</th>}
            {view === 'present' && <th>Status</th>}
            {view === 'all' && <th>Email</th>}
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? currentData.map((s) => {
             // Handle different API response structures (student list vs attendance list)
             const id = s.id || s.student_id
             const initials = s.name ? s.name.substring(0, 2).toUpperCase() : '??'
             
             return (
                <tr key={id} onClick={() => router.push(`/students/${id}`)}>
                  <td>
                      <Avatar>
                          {s.photo_url ? (
                              <img src={`http://localhost:8000${s.photo_url}`} alt={s.name} onError={(e) => e.currentTarget.style.display = 'none'} />
                          ) : (
                              <span>{initials}</span>
                          )}
                      </Avatar>
                  </td>
                  <td>{id}</td>
                  <td>{s.name}</td>
                  <td>{s.program}</td>
                  <td>{s.section}</td>
                  {view === 'present' && (
                      <>
                        <td>{s.check_in_time}</td>
                        <td><StatusBadge $status={s.remarks}>{s.remarks}</StatusBadge></td>
                      </>
                  )}
                  {view === 'all' && (
                      <td>{s.email}</td>
                  )}
                </tr>
             )
          }) : (
              <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                      No records found
                  </td>
              </tr>
          )}
        </tbody>
      </Table>

      <PaginationControls>
          {/* ... existing controls ... */}
          <button onClick={prevPage} disabled={currentPage === 1}>
              <FaChevronLeft /> Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>
              Next <FaChevronRight />
          </button>
      </PaginationControls>
    </Card>
  )
}
