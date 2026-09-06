import React, { useState } from "react";
import { Grade, Student, StudentFilters } from "../types/index.js";
import { useStudents, useDeleteStudent } from "../api/students.api.js";
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
      `Are you sure you want to delete ${student.name}? Associated enrollments will be permanently removed.`
    );
    if (!confirmed) return;

    try {
      await deleteStudentMutation.mutateAsync(student.id);
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className="card-title" style={{ fontSize: "1.75rem" }}>Students Directory</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Browse enrolled students, filter by academic performance, and manage courses.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add New Student
        </button>
      </div>

      <FilterBar
        subject={filters.subject || ""}
        minGrade={filters.minGrade}
        onSubjectChange={handleSubjectChange}
        onMinGradeChange={handleMinGradeChange}
        onReset={handleResetFilters}
      />

      {error && (
        <div className="error-banner">
          Error loading students: {(error as any).message || "Unknown error"}
        </div>
      )}

      <StudentsTable
        students={studentsData?.data || []}
        isLoading={isLoading}
        onSelectStudent={onSelectStudent}
        onEnrollStudent={(student) => setEnrollingStudent(student)}
        onDeleteStudent={handleDeleteStudent}
      />

      <Pagination
        meta={studentsData?.meta}
        onPageChange={handlePageChange}
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EnrollModal
        isOpen={Boolean(enrollingStudent)}
        student={enrollingStudent}
        onClose={() => setEnrollingStudent(null)}
      />
    </div>
  );
};
