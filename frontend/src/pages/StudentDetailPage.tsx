import React, { useState } from "react";
import { Student } from "../types/index.js";
import { useStudent } from "../api/students.api.js";
import { Badge } from "../components/Badge.js";
import { EnrollModal } from "../components/EnrollModal.js";

interface StudentDetailPageProps {
  student: Student;
  onBack: () => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ student, onBack }) => {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const { data: detail, isLoading, error } = useStudent(student.id);

  return (
    <div>
      <button className="btn btn-outline btn-sm" onClick={onBack} style={{ marginBottom: "1.25rem" }}>
        ← Back to Students
      </button>

      <div className="card">
        <div className="detail-header">
          <div className="detail-avatar">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{student.name}</h1>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.15rem" }}>
              Student ID: <code style={{ color: "#0f172a" }}>{student.id}</code> · Enrolled on{" "}
              {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsEnrollModalOpen(true)}>
            + Enroll in Subject
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Enrolled Subjects & Grades</h2>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {detail?.enrollments?.length ?? 0} active enrollment(s)
          </span>
        </div>

        {isLoading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            Loading course enrollments...
          </div>
        )}

        {error && (
          <div className="error-banner">
            Error loading enrollments: {(error as any).message || "Unknown error"}
          </div>
        )}

        {detail && detail.enrollments.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            This student is not enrolled in any subjects yet. Click <strong>+ Enroll in Subject</strong> above to add courses.
          </div>
        )}

        {detail && detail.enrollments.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Academic Year</th>
                  <th>Grade</th>
                  <th>Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {detail.enrollments.map((item) => (
                  <tr key={`${item.subjectId}-${item.year}`}>
                    <td style={{ fontWeight: 600 }}>{item.subjectName}</td>
                    <td>{item.year}</td>
                    <td>
                      <Badge grade={item.grade} />
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EnrollModal
        isOpen={isEnrollModalOpen}
        student={student}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </div>
  );
};
