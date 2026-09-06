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
        <label className="filter-label">Filter by Subject</label>
        <select
          className="select"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjectsList.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Minimum Grade</label>
        <select
          className="select"
          value={minGrade || ""}
          onChange={(e) => onMinGradeChange(e.target.value ? (e.target.value as Grade) : undefined)}
        >
          <option value="">Any Grade</option>
          <option value="A">A (Highest)</option>
          <option value="B">B or higher</option>
          <option value="C">C or higher</option>
          <option value="D">D or higher</option>
          <option value="F">F or higher</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="btn btn-outline" onClick={onReset} style={{ alignSelf: "flex-end" }}>
          Reset Filters
        </button>
      )}
    </div>
  );
};
