import React from "react";
import { Grade } from "../types/index.js";
import { useSubjects } from "../api/subjects.api.js";

interface FilterBarProps {
  subject: string;
  minGrade?: Grade;
  onSubjectChange: (value: string) => void;
  onMinGradeChange: (value?: Grade) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  subject,
  minGrade,
  onSubjectChange,
  onMinGradeChange,
  onReset,
}) => {
  const { data: subjectsList = [] } = useSubjects();

  const hasActiveFilters = Boolean(subject || minGrade);

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">
          <span>📚</span> Subject Curriculum
        </label>
        <select
          className="select"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        >
          <option value="">All Academic Subjects</option>
          {subjectsList.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">
          <span>🎯</span> Minimum Performance
        </label>
        <select
          className="select"
          value={minGrade || ""}
          onChange={(e) => onMinGradeChange(e.target.value ? (e.target.value as Grade) : undefined)}
        >
          <option value="">Any Grade (All)</option>
          <option value="A">Grade A only (Top Performers)</option>
          <option value="B">Grade B or higher (A, B)</option>
          <option value="C">Grade C or higher (Passing)</option>
          <option value="D">Grade D or higher</option>
          <option value="F">Grade F (Include failing)</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          className="btn btn-outline"
          onClick={onReset}
          style={{ alignSelf: "flex-end" }}
        >
          <span>✕</span> Reset Filters
        </button>
      )}
    </div>
  );
};
