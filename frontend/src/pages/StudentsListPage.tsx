import React, { useState } from "react";
import { Grade, Student, StudentFilters } from "../types/index.js";
import { useStudents, useDeleteStudent } from "../api/students.api.js";
import { useSubjects } from "../api/subjects.api.js";
import { FilterBar } from "../components/FilterBar.js";
import { StudentsTable } from "../components/StudentsTable.js";
import { Pagination } from "../components/Pagination.js";
import { AddStudentModal } from "../components/AddStudentModal.js";
import { EnrollModal } from "../components/EnrollModal.js";

interface StudentsListPageProps {
  onSelectStudent: (student: Student) => void;
}

export const StudentsListPage: React.FC<StudentsListPageProps> = ({ onSelectStudent }) => {
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10,
    subject: "",
    minGrade: undefined,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(null);

  const { data: studentsData, isLoading, error } = useStudents(filters);
  const { data: subjects = [] } = useSubjects();
  const deleteStudentMutation = useDeleteStudent();

  const handleSubjectChange = (subject: string) => {
    setFilters((prev) => ({ ...prev, subject, page: 1 }));
  };

  const handleMinGradeChange = (minGrade?: Grade) => {
    setFilters((prev) => ({ ...prev, minGrade, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      subject: "",
      minGrade: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDeleteStudent = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}? Associated enrollments will be permanently removed (cascade delete).`
    );
    if (!confirmed) return;

    try {
      await deleteStudentMutation.mutateAsync(student.id);
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
    }
  };

  const totalStudents = studentsData?.meta?.total ?? 0;

  return (
    <div>
      {/* Top Stats Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">👥</div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Enrolled Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">📚</div>
          <div className="stat-info">
            <h3>{subjects.length}</h3>
            <p>Active Subjects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">⚡</div>
          <div className="stat-info">
            <h3 style={{ color: "#34d399", fontSize: "1.2rem" }}>Fastify + Drizzle</h3>
            <p>Zero N+1 Engine</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">🛡️</div>
          <div className="stat-info">
            <h3 style={{ color: "#fbbf24", fontSize: "1.2rem" }}>ACID Safe</h3>
            <p>Composite PK Defense</p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="card-header">
        <div>
          <h1 className="card-title" style={{ fontSize: "1.85rem" }}>
            Students <span className="gradient-text">Directory</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.35rem" }}>
            Manage student registrations, academic course tracking, and grade reports.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <span>+</span> Add New Student
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        subject={filters.subject || ""}
        minGrade={filters.minGrade}
        onSubjectChange={handleSubjectChange}
        onMinGradeChange={handleMinGradeChange}
        onReset={handleResetFilters}
      />

      {error && (
        <div className="error-banner">
          <span>⚠️</span> Error loading students: {(error as any).message || "Unknown error"}
        </div>
      )}

      {/* Table */}
      <StudentsTable
        students={studentsData?.data || []}
        isLoading={isLoading}
        onSelectStudent={onSelectStudent}
        onEnrollStudent={(student) => setEnrollingStudent(student)}
        onDeleteStudent={handleDeleteStudent}
      />

      {/* Pagination */}
      <Pagination
        meta={studentsData?.meta}
        onPageChange={handlePageChange}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Enroll Modal */}
      <EnrollModal
        isOpen={Boolean(enrollingStudent)}
        student={enrollingStudent}
        onClose={() => setEnrollingStudent(null)}
      />
    </div>
  );
};
