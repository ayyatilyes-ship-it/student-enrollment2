import React, { useState } from "react";
import { useCreateStudent } from "../api/students.api.js";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createStudentMutation = useCreateStudent();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Student name is required and cannot be empty.");
      return;
    }

    try {
      await createStudentMutation.mutateAsync({ name: name.trim() });
      setName("");
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create student");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "1.5rem" }}>👤</div>
          <h2 className="modal-title" style={{ marginBottom: 0 }}>Register New Student</h2>
        </div>

        {errorMessage && (
          <div className="error-banner">
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="student-name">Student Full Name</label>
            <input
              id="student-name"
              className="input"
              style={{ width: "100%" }}
              type="text"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
              Must be a valid non-empty name (validated via Zod schema).
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={createStudentMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createStudentMutation.isPending}
            >
              {createStudentMutation.isPending ? "Creating..." : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
