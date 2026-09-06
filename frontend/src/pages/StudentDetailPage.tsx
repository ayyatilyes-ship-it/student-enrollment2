import React, { useState } from "react";
import { Student } from "../types/index.js";
import { useStudent } from "../api/students.api.js";
import { Badge } from "../components/Badge.js";
import { Avatar } from "../components/Avatar.js";
import { EnrollModal } from "../components/EnrollModal.js";

interface StudentDetailPageProps {
  student: Student;
  onBack: () => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ student, onBack }) => {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const { data: detail, isLoading, error } = useStudent(student.id);

  const enrollmentsCount = detail?.enrollments?.length ?? 0;

  return (
    <div>
      <button className="btn btn-outline btn-sm" onClick={onBack} style={{ marginBottom: "1.5rem" }}>
        <span>←</span> Back to Directory
      </button>

      {/* Student Profile Hero Card */}
      <div className="card" style={{ marginBottom: "1.75rem" }}>
        <div className="detail-hero">
          <Avatar name={student.name} size="lg" />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {student.name}
              </h1>
              <span className="brand-tag">Verified Student</span>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.4rem" }}>
              Student ID:{" "}
              <code style={{ color: "#f8fafc", background: "rgba(15, 23, 42, 0.6)", padding: "2px 6px" }}>
                {student.id}
              </code>{" "}
              · Registered on{" "}
              <span style={{ color: "#cbd5e1" }}>
                {new Date(student.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => setIsEnrollModalOpen(true)}>
            <span>+</span> Enroll in Subject
          </button>
        </div>
      </div>

      {/* Enrolled Subjects Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Enrolled Courses & Academic Transcript</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Retrieved using a single relational query (Zero N+1)
            </p>
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "9999px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            {enrollmentsCount} Active Enrollment{enrollmentsCount === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading && (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
            Loading course transcript...
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span>⚠️</span> Error loading transcript: {(error as any).message || "Unknown error"}
          </div>
        )}

        {detail && detail.enrollments.length === 0 && (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎓</div>
            <h3 style={{ color: "#f8fafc", marginBottom: "0.25rem" }}>No course enrollments yet</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto 1.25rem auto" }}>
              This student has not yet enrolled in any academic subjects. Click below to add their first course.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setIsEnrollModalOpen(true)}>
              + Enroll Now
            </button>
          </div>
        )}

        {detail && detail.enrollments.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject Curriculum</th>
                  <th>Academic Year</th>
                  <th>Final Grade</th>
                  <th>Enrolled On</th>
                </tr>
              </thead>
              <tbody>
                {detail.enrollments.map((item) => (
                  <tr key={`${item.subjectId}-${item.year}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>📖</span>
                        <strong style={{ color: "#f8fafc" }}>{item.subjectName}</strong>
                      </div>
                    </td>
                    <td style={{ color: "#cbd5e1", fontWeight: 600 }}>{item.year}</td>
                    <td>
                      <Badge grade={item.grade} />
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
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
