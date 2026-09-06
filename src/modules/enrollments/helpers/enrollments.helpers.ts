/**
 * Academic year and enrollment pure utility functions.
 */

/**
 * Validates whether an academic year is within a reasonable operating range.
 */
export function isValidAcademicYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1990 && year <= 2100;
}

/**
 * Builds a readable enrollment summary string for logs or error messages.
 */
export function formatEnrollmentSummary(studentName: string, subjectName: string, year: number, grade: string): string {
  return `${studentName} enrolled in ${subjectName} (${year}) - Grade: ${grade}`;
}
