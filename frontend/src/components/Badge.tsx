import React from "react";
import { Grade } from "../types/index.js";

interface BadgeProps {
  grade: Grade | string;
}

export const Badge: React.FC<BadgeProps> = ({ grade }) => {
  const safeGrade = ["A", "B", "C", "D", "F"].includes(grade) ? grade : "F";
  return <span className={`badge badge-grade-${safeGrade}`}>{grade}</span>;
};
