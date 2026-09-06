import { ALLOWED_GRADES, Grade } from "../dto/students.dto.js";

const GRADE_RANK_MAP: Record<Grade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
};

/**
 * Returns the numerical rank of a letter grade (5 for A down to 1 for F).
 */
export function getGradeRank(grade: Grade): number {
  return GRADE_RANK_MAP[grade] ?? 0;
}

/**
 * Returns an array of all letter grades that satisfy or exceed the minimum grade threshold.
 * For example, minGrade = 'B' yields ['A', 'B'].
 */
export function getGradesMeetingMinimum(minGrade: Grade): Grade[] {
  const minRank = getGradeRank(minGrade);
  return ALLOWED_GRADES.filter((g) => getGradeRank(g) >= minRank);
}

/**
 * Compares two grades. Returns > 0 if a is higher, < 0 if b is higher, 0 if equal.
 */
export function compareGrades(a: Grade, b: Grade): number {
  return getGradeRank(a) - getGradeRank(b);
}
