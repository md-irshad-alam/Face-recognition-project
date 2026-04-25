'use client'

import React, { useEffect, useState } from 'react'
import { 
  RiAddLine, RiSearchLine, RiFilterLine, RiUserAddLine, 
  RiArrowLeftLine, RiArrowRightLine, RiDeleteBinLine, RiEditLine,
  RiCheckLine, RiCloseLine
} from 'react-icons/ri'
import { useRouter } from 'next/navigation'
import { useStudents, Student } from '@/hooks/useStudents'
import { toast } from 'react-hot-toast'
import * as SC from './students.sc'
import OnboardStudent from './components/OnboardStudent'
import StudentProfile from './components/StudentProfile'
import { useSearchParams } from 'next/navigation'

const PAGE_SIZE = 6

export default function StudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { students, loading, fetchStudents, deleteStudent, toggleHold } = useStudents()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [showOnboard, setShowOnboard] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) setSelectedStudentId(id)
  }, [searchParams])

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setShowOnboard(true)
  }

  const handleShowProfile = (id: string) => {
    setSelectedStudentId(id)
    // Update URL without reload to support back button/sharing
    const url = new URL(window.location.href)
    url.searchParams.set('id', id)
    window.history.pushState({}, '', url.toString())
  }

  const handleBack = () => {
    setSelectedStudentId(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('id')
    window.history.pushState({}, '', url.toString())
  }

  const handleClear = () => {
    setShowOnboard(false)
    setEditingStudent(null)
    fetchStudents()
  }

  if (showOnboard) {
    return <OnboardStudent onClear={handleClear} initialData={editingStudent} />
  }

  if (selectedStudentId) {
    return <StudentProfile studentId={selectedStudentId} onBack={handleBack} onEdit={handleEdit} />
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    const matchFilter = filter === 'All' || (filter === 'Active' ? !s.is_on_hold : s.is_on_hold)
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async (id: string) => {
    const success = await deleteStudent(id)
    if (success) {
      toast.success('Student record successfully purged.')
      fetchStudents()
    } else {
      toast.error('Deletion failed.')
    }
  }

  const handleToggleHold = async (id: string, currentStatus: boolean) => {
    const success = await toggleHold(id)
    if (success) {
      toast.success(currentStatus ? 'Student reinstated.' : 'Student placed on administrative hold.')
      fetchStudents()
    }
  }

  return (
    <SC.PageContainer>
      <SC.Header>
        <SC.HeaderLeft>
          <SC.Title>Student Enrollment</SC.Title>
          <SC.Subtitle>Manage all institutional student records and biometric data.</SC.Subtitle>
        </SC.HeaderLeft>
        <SC.HeaderActions>
          <SC.PrimaryButton onClick={() => setShowOnboard(true)}>
            <RiAddLine size={20} />
            <span>Onboard Student</span>
          </SC.PrimaryButton>
        </SC.HeaderActions>
      </SC.Header>

      <SC.StatsGrid>
        <SC.StatCard>
          <SC.StatValue>{students.length}</SC.StatValue>
          <SC.StatLabel>Total Enrolled</SC.StatLabel>
        </SC.StatCard>
        <SC.StatCard>
          <SC.StatValue>{students.filter(s => !s.is_on_hold).length}</SC.StatValue>
          <SC.StatLabel>Active Students</SC.StatLabel>
        </SC.StatCard>
        <SC.StatCard>
          <SC.StatValue>{students.filter(s => s.is_on_hold).length}</SC.StatValue>
          <SC.StatLabel>On Hold</SC.StatLabel>
        </SC.StatCard>
        <SC.StatCard>
          <SC.StatValue>{new Set(students.map(s => s.class_name)).size}</SC.StatValue>
          <SC.StatLabel>Active Classes</SC.StatLabel>
        </SC.StatCard>
      </SC.StatsGrid>

      <SC.TableCard>
        <SC.TableHeader>
          <SC.SearchContainer>
            <RiSearchLine />
            <SC.SearchInput 
              placeholder="Search by name or student ID..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </SC.SearchContainer>
          <SC.FilterContainer>
            <RiFilterLine />
            <SC.FilterSelect value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}>
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="On Hold">On Hold Only</option>
            </SC.FilterSelect>
          </SC.FilterContainer>
        </SC.TableHeader>

        <SC.TableWrapper>
          <SC.Table>
            <thead>
              <tr>
                <SC.Th>Institutional ID</SC.Th>
                <SC.Th>Student</SC.Th>
                <SC.Th>Grade Level</SC.Th>
                <SC.Th>Section</SC.Th>
                <SC.Th>Status</SC.Th>
                <SC.Th style={{ textAlign: 'right' }}>Actions</SC.Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <SC.Td colSpan={6}><SC.SkeletonRow /></SC.Td>
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <SC.Td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No student records matched your search parameters.
                  </SC.Td>
                </tr>
              ) : (
                paged.map(student => (
                  <tr key={student.id} style={{ cursor: 'pointer' }} onClick={() => handleShowProfile(student.id)}>
                    <SC.Td style={{ fontWeight: 800, color: '#4F46E5', fontSize: '0.8125rem' }}>#{student.id}</SC.Td>
                    <SC.Td>
                      <SC.StudentInfo>
                        
                        <div>
                          <SC.StudentName>{student.name}</SC.StudentName>
                          <SC.StudentEmail>{student.email || 'No email registered'}</SC.StudentEmail>
                        </div>
                      </SC.StudentInfo>
                    </SC.Td>
                    <SC.Td>
                      <SC.GradePill>{student.class_name}</SC.GradePill>
                    </SC.Td>
                    <SC.Td style={{ fontWeight: 600, color: '#475569' }}>Section {student.section}</SC.Td>
                    <SC.Td>
                      <SC.StatusBadge $onHold={student.is_on_hold}>
                        {student.is_on_hold ? 'On Hold' : 'Enrolled'}
                      </SC.StatusBadge>
                    </SC.Td>
                    <SC.Td onClick={(e) => e.stopPropagation()}>
                      <SC.ActionGroup>
                        <SC.ActionButton title="Edit Record" onClick={() => handleEdit(student)}>
                          <RiEditLine />
                        </SC.ActionButton>
                        <SC.ActionButton 
                          $variant={student.is_on_hold ? 'success' : 'warning'} 
                          title="Toggle Hold"
                          onClick={() => handleToggleHold(student.id, student.is_on_hold)}
                        >
                          {student.is_on_hold ? <RiCheckLine /> : <RiCloseLine />}
                        </SC.ActionButton>
                        <SC.ActionButton $variant="danger" title="Purge Record" onClick={() => handleDelete(student.id)}>
                          <RiDeleteBinLine />
                        </SC.ActionButton>
                      </SC.ActionGroup>
                    </SC.Td>
                  </tr>
                ))
              )}
            </tbody>
          </SC.Table>
        </SC.TableWrapper>

        {totalPages > 1 && (
          <SC.Pagination>
            <SC.PaginationInfo>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
            </SC.PaginationInfo>
            <SC.PaginationControls>
              <SC.PageButton disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <RiArrowLeftLine />
              </SC.PageButton>
              {Array.from({ length: totalPages }).map((_, i) => (
                <SC.PageButton 
                  key={i} 
                  $active={page === i + 1} 
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </SC.PageButton>
              ))}
              <SC.PageButton disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <RiArrowRightLine />
              </SC.PageButton>
            </SC.PaginationControls>
          </SC.Pagination>
        )}
      </SC.TableCard>
    </SC.PageContainer>
  )
}