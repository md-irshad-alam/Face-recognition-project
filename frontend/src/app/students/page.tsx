'use client'

import React, { useEffect, useState } from 'react'
import { 
  RiAddLine, RiSearchLine, RiFilterLine, RiUserAddLine, 
  RiArrowLeftLine, RiArrowRightLine, RiDeleteBinLine, RiEditLine,
  RiCheckLine, RiCloseLine,
  RiUploadCloud2Line,
  RiIdCardLine
} from 'react-icons/ri'
import { useRouter } from 'next/navigation'
import { useStudents, Student } from '@/hooks/useStudents'
import { toast } from 'react-hot-toast'

import OnboardStudent from './components/OnboardStudent'
import StudentProfile from './components/StudentProfile'
import BulkOnboard from './components/BulkOnboard'
import { Dropdown } from "@/components/ui";
import { useSearchParams } from 'next/navigation'
import * as SC from './students.sc'
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
const PAGE_SIZE = 6

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { students, studentMutation, loading, toggleMutation, toggleHold } =
    useStudents();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showOnboard, setShowOnboard] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedStudentId(id);
  }, [searchParams]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowOnboard(true);
  };

  const handleShowProfile = (id: string) => {
    setSelectedStudentId(id);
    // Update URL without reload to support back button/sharing
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.pushState({}, "", url.toString());
  };

  const handleBack = () => {
    setSelectedStudentId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url.toString());
  };

  const handleClear = () => {
    setShowOnboard(false);
    setEditingStudent(null);
  };

  if (showOnboard) {
    return (
      <OnboardStudent onClear={handleClear} initialData={editingStudent} />
    );
  }

  if (selectedStudentId) {
    return (
      <StudentProfile
        studentId={selectedStudentId}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    );
  }

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    const matchFilter =
      filter === "All" || (filter === "Active" ? !s.is_on_hold : s.is_on_hold);
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // const handleDelete = async (id: string) => {
  //   const success = await deleteStudent(id)
  //   if (success) {
  //     toast.success('Student record successfully purged.')
  //     fetchStudents()
  //   } else {
  //     toast.error('Deletion failed.')
  //   }
  // }

  const handleToggleHold = async (id: string, currentStatus: boolean) => {
    const success = await toggleHold(id, !currentStatus);
    if (success) {
      toast.success(
        currentStatus
          ? "Student reinstated."
          : "Student placed on administrative hold.",
      );
      // fetchStudents()
    }
  };

  return (
    <SC.PageContainer>
      <SC.PageHeaderWrapper>
        <SC.Header>
          <SC.HeaderLeft>
            <SC.Title>Student Enrollment</SC.Title>
            <SC.Subtitle>
              Manage all institutional student records and biometric data.
            </SC.Subtitle>
          </SC.HeaderLeft>
          <SC.HeaderRight>
            <SC.SecondaryButton onClick={() => setShowBulk(true)}>
              <RiUploadCloud2Line size={20} />
              <span>Bulk Onboard</span>
            </SC.SecondaryButton>
            <SC.PrimaryButton onClick={() => setShowOnboard(true)}>
              <RiAddLine size={20} />
              <span>Onboard Student</span>
            </SC.PrimaryButton>
          </SC.HeaderRight>
        </SC.Header>
      </SC.PageHeaderWrapper>

      {showBulk && (
        <BulkOnboard
          onClose={() => setShowBulk(false)}
          onSuccess={() => {
            setShowBulk(false);
          }}
        />
      )}

      <SC.ScrollableContent>
        <SC.StatsGrid>
          <SC.StatCard>
            <SC.StatIconBox $bg="#EEF2FF" $color="#4F46E5">
              <RiUserAddLine />
            </SC.StatIconBox>
            <SC.StatContent>
              <SC.StatValue>{students.length}</SC.StatValue>
              <SC.StatLabel>Total Enrolled</SC.StatLabel>
            </SC.StatContent>
          </SC.StatCard>
          <SC.StatCard>
            <SC.StatIconBox $bg="#F0FDF4" $color="#22C55E">
              <RiCheckLine />
            </SC.StatIconBox>
            <SC.StatContent>
              <SC.StatValue>
                {students.filter((s) => !s.is_on_hold).length}
              </SC.StatValue>
              <SC.StatLabel>Active Students</SC.StatLabel>
            </SC.StatContent>
          </SC.StatCard>
          <SC.StatCard>
            <SC.StatIconBox $bg="#FEF2F2" $color="#EF4444">
              <RiCloseLine />
            </SC.StatIconBox>
            <SC.StatContent>
              <SC.StatValue>
                {students.filter((s) => s.is_on_hold).length}
              </SC.StatValue>
              <SC.StatLabel>On Hold</SC.StatLabel>
            </SC.StatContent>
          </SC.StatCard>
          <SC.StatCard>
            <SC.StatIconBox $bg="#F5F3FF" $color="#8B5CF6">
              <RiIdCardLine />
            </SC.StatIconBox>
            <SC.StatContent>
              <SC.StatValue>
                {new Set(students.map((s) => s.class_name)).size}
              </SC.StatValue>
              <SC.StatLabel>Active Classes</SC.StatLabel>
            </SC.StatContent>
          </SC.StatCard>
        </SC.StatsGrid>

        <SC.TableCard>
          <SC.TableHeader>
            <SC.SearchContainer>
              <RiSearchLine />
              <SC.SearchInput
                placeholder="Search by name or student ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </SC.SearchContainer>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: "180px",
              }}
            >
              <RiFilterLine size={20} color="#64748B" />
              <Dropdown
                value={filter}
                onChange={(val) => {
                  setFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: "All Status" },
                  { value: "Active", label: "Active Only" },
                  { value: "On Hold", label: "On Hold Only" },
                ]}
              />
            </div>
          </SC.TableHeader>

          <SC.TableWrapper>
            <SC.Table>
              <thead>
                <tr>
                  <SC.Th>Institutional ID</SC.Th>
                  <SC.Th>Student</SC.Th>
                  <SC.Th>Grade Level</SC.Th>
                  <SC.Th>Section</SC.Th>
                  <SC.Th>Type</SC.Th>
                  <SC.Th>Status</SC.Th>
                  <SC.Th style={{ textAlign: "right" }}>Actions</SC.Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <SC.Td colSpan={6}>
                        <SC.SkeletonRow />
                      </SC.Td>
                    </tr>
                  ))
                ) : paged.length === 0 ? (
                  <tr>
                    <SC.Td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "48px",
                        color: "#64748B",
                      }}
                    >
                      No student records matched your search parameters.
                    </SC.Td>
                  </tr>
                ) : (
                  paged.map((student) => (
                    <tr
                      key={student.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleShowProfile(student.id)}
                    >
                      <SC.Td
                        style={{
                          fontWeight: 800,
                          color: "#4F46E5",
                          fontSize: "0.8125rem",
                        }}
                      >
                        #{student.id}
                      </SC.Td>
                      <SC.Td>
                        <SC.StudentInfo>
                          <div>
                            <SC.StudentName>{student.name}</SC.StudentName>
                            <SC.StudentEmail>
                              {student.email || "No email registered"}
                            </SC.StudentEmail>
                          </div>
                        </SC.StudentInfo>
                      </SC.Td>
                      <SC.Td>
                        <SC.GradePill>{student.class_name}</SC.GradePill>
                      </SC.Td>
                      <SC.Td style={{ fontWeight: 600, color: "#475569" }}>
                        Section {student.section}
                      </SC.Td>
                      <SC.Td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color:
                              student.student_type === "Hosteler"
                                ? "#7C3AED"
                                : student.student_type === "Fee"
                                  ? "#059669"
                                  : "#64748B",
                            background:
                              student.student_type === "Hosteler"
                                ? "#F5F3FF"
                                : student.student_type === "Fee"
                                  ? "#ECFDF5"
                                  : "#F1F5F9",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {student.student_type || "Regular"}
                        </span>
                      </SC.Td>
                      <SC.Td>
                        <SC.StatusBadge $onHold={student.is_on_hold}>
                          {student.is_on_hold ? "On Hold" : "Enrolled"}
                        </SC.StatusBadge>
                      </SC.Td>
                      <SC.Td onClick={(e) => e.stopPropagation()}>
                        <SC.ActionGroup>
                          <SC.ActionButton
                            title="Edit Record"
                            onClick={() => handleEdit(student)}
                          >
                            <RiEditLine />
                          </SC.ActionButton>
                          <SC.ActionButton
                            $variant={
                              student.is_on_hold ? "success" : "warning"
                            }
                            title="Toggle Hold"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: student.id,
                                status: !!student.is_on_hold,
                              })
                            }
                          >
                            {student.is_on_hold ? (
                              <RiCheckLine />
                            ) : (
                              <RiCloseLine />
                            )}
                          </SC.ActionButton>
                          <SC.ActionButton
                            $variant="danger"
                            title="Purge Record"
                            onClick={() => studentMutation(student.id)}
                          >
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
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} students
              </SC.PaginationInfo>
              <SC.PaginationControls>
                <SC.PageButton
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
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
                <SC.PageButton
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <RiArrowRightLine />
                </SC.PageButton>
              </SC.PaginationControls>
            </SC.Pagination>
          )}
        </SC.TableCard>
      </SC.ScrollableContent>
    </SC.PageContainer>
  );
}