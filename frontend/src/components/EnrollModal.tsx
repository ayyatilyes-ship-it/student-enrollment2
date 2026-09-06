import React, { useState } from "react";
import { Grade, Student } from "../types/index.js";
import { useSubjects } from "../api/subjects.api.js";
import { useEnrollStudent } from "../api/enrollments.api.js";

interface EnrollModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ isOpen, student, onClose }) => {
  const currentYear = new Date().getFullYear();
  const [subjectId, setSubjectId] = useState("");
  const [year, setYear] = useState(currentYear);
  const [grade, setGrade] = useState<Grade>("A");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: subjects = [] } = useSubjects();
  const enrollMutation = useEnrollStudent(student?.id || "");

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!subjectId) {
      setErrorMessage("Please select a subject from the curriculum.");
      return;
    }

    try {
      await enrollMutation.mutateAsync({
        subjectId,
        year: Number(year),
        grade,
      });
      onClose();
    } catch (err: any) {
      // Direct presentation of 409 Conflict or 400 validation error
      setErrorMessage(err.message || "Failed to enroll student");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "1.5rem" }}>📝</div>
          <div>
            <h2 className="modal-title" style={{ marginBottom: 0 }}>Enroll Student in Course</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Enrolling <strong style={{ color: "#f8fafc" }}>{student.name}</strong>
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="error-banner">
            <span>🛡️</span>
            <div>
              <strong>{errorMessage.includes("already enrolled") ? "409 Conflict Detected:" : "Error:"}</strong>
              <div style={{ fontSize: "0.82rem", marginTop: "2px" }}>{errorMessage}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="enroll-subject">Subject Curriculum</label>
            <select
              id="enroll-subject"
              className="select"
              style={{ width: "100%" }}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              <option value="">Choose a subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="enroll-year">Academic Year</label>
              <input
                id="enroll-year"
                className="input"
                style={{ width: "100%" }}
                type="number"
                min="1990"
                max="2100"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="enroll-grade">Letter Grade</label>
              <select
                id="enroll-grade"
                className="select"
                style={{ width: "100%" }}
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
              >
                <option value="A">Grade A (Excellent)</option>
                <option value="B">Grade B (Good)</option>
                <option value="C">Grade C (Satisfactory)</option>
                <option value="D">Grade D (Poor)</option>
                <option value="F">Grade F (Failing)</option>
              </select>
            </div>
          </div>

          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.5rem 0 1rem 0" }}>
            Protected by DB composite key <code>(student_id, subject_id, year)</code>. Duplicate enrollments trigger an atomic 409 Conflict.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? "Confirming..." : "Confirm Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
