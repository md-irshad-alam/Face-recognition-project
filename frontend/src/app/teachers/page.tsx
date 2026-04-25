'use client'

import React, { useEffect, useState } from 'react'
import {
  RiAddLine, RiSearchLine, RiEditLine, RiDeleteBinLine,
  RiGroupLine, RiUserStarLine, RiBuilding2Line, RiTimeLine,
  RiArrowLeftLine, RiArrowRightLine,
} from 'react-icons/ri'
import { useTeachers, Teacher } from '@/hooks/useTeachers'
import {
  StatsGrid, StatCard, StatIconBox, StatContent, StatLabel, StatValue,
  PageHeader, HeaderLeft, PageTitle, PageSubtitle, HeaderActions,
  TableCard, TableToolbar, SearchWrapper, SearchIconWrap, SearchInput,
  TabRow, TabButton, Table, Thead, Th, Td, Tr,
  ProfileCell, AvatarCircle, ProfileInfo, TeacherName, TeacherEmail,
  DeptText, RolePill, StatusPill, ActionGroup, IconBtn,
  TableFooter, FooterText, PageControls, PageBtn,
  EmptyCell, SkeletonRow, PrimaryBtn, OutlineBtn,
  TableContainer
} from './teachers.sc'
import OnboardTeacher from './components/OnboardTeacher'
import TeacherProfile from './components/TeacherProfile'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

/* ─── Helpers ─────────────────────────────────────────── */
function initials(t: Teacher) {
  return `${t.first_name?.[0] ?? ''}${t.last_name?.[0] ?? ''}`.toUpperCase()
}

const GRAD = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
]
function avatarGrad(name: string) {
  return GRAD[(name?.charCodeAt(0) ?? 0) % GRAD.length]
}

const ROLE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  teacher:  { label: 'Class Teacher',  color: '#4F46E5', bg: '#EEF2FF' },
  hod:      { label: 'HOD',            color: '#059669', bg: '#D1FAE5' },
  lecturer: { label: 'Lecturer',       color: '#D97706', bg: '#FEF3C7' },
  admin:    { label: 'Admin',          color: '#7C3AED', bg: '#EDE9FE' },
}

const PAGE_SIZE = 8

/* ─── Page ────────────────────────────────────────────── */
export default function TeachersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { teachers, loading, fetchTeachers, deleteTeacher } = useTeachers()

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All Staff')
  const [page, setPage] = useState(1)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [showOnboard, setShowOnboard] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setShowOnboard(true)
  }

  const handleClear = () => {
    setShowOnboard(false)
    setEditingTeacher(null)
    fetchTeachers()
  }

  if (showOnboard) {
    return <OnboardTeacher onClear={handleClear} initialData={editingTeacher} />
  }

  if (selectedTeacher) {
    return <TeacherProfile teacher={selectedTeacher} onBack={() => setSelectedTeacher(null)} />
  }

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${t.first_name} ${t.last_name} ${t.email} ${t.id}`
      .toLowerCase().includes(q)
    const matchTab = activeTab === 'On Leave'
      ? t.status === 'on_leave'
      : true
    return matchSearch && matchTab
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async (id: string) => {
    const success = await deleteTeacher(id)
    if (success) {
      toast.success('Faculty record successfully purged.')
      fetchTeachers()
    } else {
      toast.error('Purge operation failed.')
    }
  }

  /* Stats */
  const activeCount = teachers.filter(t => t.status !== 'on_leave' && t.status !== 'inactive').length
  const deptCount = new Set(teachers.map(t => t.department).filter(Boolean)).size

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────── */}
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Faculty Directory</PageTitle>
          <PageSubtitle>Manage academic staff, roles, and departmental assignments.</PageSubtitle>
        </HeaderLeft>
        <HeaderActions>
          <OutlineBtn onClick={() => toast.success('Exporting Faculty Ledger...')}>Export</OutlineBtn>
          <PrimaryBtn onClick={() => setShowOnboard(true)}>
            <RiAddLine size={18} /> Onboard Teacher
          </PrimaryBtn>
        </HeaderActions>
      </PageHeader>

      {/* ── Stats Cards ─────────────────────────────────── */}
      <StatsGrid>
        <StatCard>
          <StatIconBox $bg="#EEF2FF" $color="#4F46E5"><RiGroupLine /></StatIconBox>
          <StatContent>
            <StatLabel>Total Faculty</StatLabel>
            <StatValue>{teachers.length}</StatValue>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIconBox $bg="#D1FAE5" $color="#059669"><RiUserStarLine /></StatIconBox>
          <StatContent>
            <StatLabel>Active Staff</StatLabel>
            <StatValue>{activeCount}</StatValue>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIconBox $bg="#FEF3C7" $color="#D97706"><RiBuilding2Line /></StatIconBox>
          <StatContent>
            <StatLabel>Departments</StatLabel>
            <StatValue>{deptCount}</StatValue>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIconBox $bg="#EDE9FE" $color="#7C3AED"><RiTimeLine /></StatIconBox>
          <StatContent>
            <StatLabel>Avg. Experience</StatLabel>
            <StatValue>
              {teachers.length
                ? `${Math.round(teachers.reduce((s, t) => s + (t.years_of_experience ?? 0), 0) / teachers.length)}Y`
                : '—'}
            </StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* ── Table Card ──────────────────────────────────── */}
      <TableCard>
        <TableToolbar>
          <TabRow>
            {['All Staff', 'On Leave'].map(tab => (
              <TabButton
                key={tab}
                $active={activeTab === tab}
                onClick={() => { setActiveTab(tab); setPage(1) }}
              >
                {tab}
              </TabButton>
            ))}
          </TabRow>

          <SearchWrapper>
            <SearchIconWrap><RiSearchLine size={16} /></SearchIconWrap>
            <SearchInput
              placeholder="Search by name, ID, or department…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </SearchWrapper>
        </TableToolbar>

        <TableContainer>
          <Table>
            <Thead>
              <tr>
                <Th>Institutional ID</Th>
                <Th>Faculty Member</Th>
                <Th>Department</Th>
                <Th>Specialization</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Tr key={i}>
                      <Td colSpan={7}>
                        <SkeletonRow style={{ opacity: 1 - i * 0.15 }} />
                      </Td>
                    </Tr>
                  ))
                : paged.length === 0
                ? <tr><EmptyCell colSpan={7}>No faculty members found.</EmptyCell></tr>
                : paged.map(teacher => {
                    const role = ROLE_MAP[teacher.role ?? 'teacher'] ?? ROLE_MAP.teacher
                    return (
                      <Tr key={teacher.id} onClick={() => setSelectedTeacher(teacher)} style={{ cursor: 'pointer' }}>
                        <Td style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 700 }}>#{teacher.id}</Td>
                        <Td>
                          <ProfileCell>
                            <AvatarCircle $gradient={avatarGrad(teacher.first_name)}>
                              {initials(teacher)}
                            </AvatarCircle>
                            <ProfileInfo>
                              <TeacherName>{teacher.first_name} {teacher.last_name}</TeacherName>
                              <TeacherEmail>{teacher.email}</TeacherEmail>
                            </ProfileInfo>
                          </ProfileCell>
                        </Td>
                        <Td><DeptText>{teacher.department || '—'}</DeptText></Td>
                        <Td style={{ color: '#64748B', fontWeight: 600 }}>{teacher.specialization || '—'}</Td>
                        <Td>
                          <RolePill $color={role.color} $bg={role.bg}>{role.label}</RolePill>
                        </Td>
                        <Td>
                          <StatusPill $active={teacher.status !== 'on_leave' && teacher.status !== 'inactive'}>
                            {teacher.status === 'on_leave' ? 'On Leave' : teacher.status === 'inactive' ? 'Inactive' : 'Active'}
                          </StatusPill>
                        </Td>
                        <Td>
                          <ActionGroup onClick={e => e.stopPropagation()}>
                            <IconBtn title="Edit Profile" onClick={() => handleEdit(teacher)}><RiEditLine size={15} /></IconBtn>
                            <IconBtn title="Purge Record" onClick={() => handleDelete(teacher.id)}>
                              <RiDeleteBinLine size={15} />
                            </IconBtn>
                          </ActionGroup>
                        </Td>
                      </Tr>
                    )
                  })
              }
            </tbody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <TableFooter>
            <FooterText>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </FooterText>
            <PageControls>
              <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <RiArrowLeftLine size={16} />
              </PageBtn>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PageBtn key={i} $active={page === i + 1} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </PageBtn>
              ))}
              <PageBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <RiArrowRightLine size={16} />
              </PageBtn>
            </PageControls>
          </TableFooter>
        )}
      </TableCard>
    </div>
  )
}
