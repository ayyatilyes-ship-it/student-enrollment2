import React from "react";
import { PaginationMeta } from "../types/index.js";

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  if (!meta) return null;

  return (
    <div className="pagination">
      <span className="pagination-info">
        Page <strong>{meta.page}</strong> of <strong>{meta.totalPages || 1}</strong> ({meta.total} total students)
      </span>
      <div className="pagination-actions">
        <button
          className="btn btn-outline btn-sm"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          ← Previous
        </button>
        <button
          className="btn btn-outline btn-sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
