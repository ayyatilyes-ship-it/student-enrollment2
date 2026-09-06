import React from "react";
import { Student } from "../types/index.js";
import { Avatar } from "./Avatar.js";

interface StudentsTableProps {
  students: Student[];
  isLoading: boolean;
  onSelectStudent: (student: Student) => void;
  onEnrollStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  isLoading,
  onSelectStudent,
  onEnrollStudent,
  onDeleteStudent,
}) => {
  if (isLoading) {
    return (
      <div className="table-container" style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem", animation: "spin 1.5s linear infinite", display: "inline-block" }}>
          ⚡
        </div>
        <p style={{ fontWeight: 600 }}>Loading student directory...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="table-container" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</div>
        <h3 style={{ color: "#f8fafc", marginBottom: "0.25rem", fontSize: "1.1rem" }}>No matching students found</h3>
        <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
          Try resetting your subject or grade filters to see all enrolled students.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>ID & Identifiers</th>
            <th>Registration Date</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <div className="student-name-cell">
                  <Avatar name={student.name} size="sm" />
                  <div>
                    <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.92rem" }}>
                      {student.name}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                      Active Student
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <code
                  style={{
                    color: "#94a3b8",
                    background: "rgba(15, 23, 42, 0.6)",
                    fontSize: "0.75rem",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                  title={student.id}
                >
                  {student.id.slice(0, 8)}...{student.id.slice(-6)}
                </code>
              </td>
              <td style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
                {new Date(student.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onSelectStudent(student)}
                    title="View student profile & enrolled subjects"
                  >
                    <span>👁</span> Details
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onEnrollStudent(student)}
                    title="Enroll in a subject"
                  >
                    <span>+</span> Enroll
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeleteStudent(student)}
                    title="Delete student record"
                  >
                    <span>🗑</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
