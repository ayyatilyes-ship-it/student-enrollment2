import React from "react";
import { Student } from "../types/index.js";

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
      <div className="table-container" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
        Loading students...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="table-container" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
        No students found matching your criteria.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
            <th>Registered</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td style={{ fontWeight: 600 }}>{student.name}</td>
              <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
                {student.id}
              </td>
              <td>{new Date(student.createdAt).toLocaleDateString()}</td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onSelectStudent(student)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onEnrollStudent(student)}
                  >
                    + Enroll
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeleteStudent(student)}
                  >
                    Delete
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
