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
      setErrorMessage("Please select a subject");
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
      // Highlights 409 Conflict or validation error directly to user
      setErrorMessage(err.message || "Failed to enroll student");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Enroll {student.name}</h2>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="enroll-subject">Subject</label>
            <select
              id="enroll-subject"
              className="select"
              style={{ width: "100%" }}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              <option value="">Select a subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

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
            <label htmlFor="enroll-grade">Grade</label>
            <select
              id="enroll-grade"
              className="select"
              style={{ width: "100%" }}
              value={grade}
              onChange={(e) => setGrade(e.target.value as Grade)}
            >
              <option value="A">A - Excellent</option>
              <option value="B">B - Good</option>
              <option value="C">C - Satisfactory</option>
              <option value="D">D - Poor</option>
              <option value="F">F - Failing</option>
            </select>
          </div>

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
              {enrollMutation.isPending ? "Enrolling..." : "Confirm Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
