export type Grade = "A" | "B" | "C" | "D" | "F";

export interface Student {
  id: string;
  name: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface StudentEnrollmentItem {
  subjectId: string;
  subjectName: string;
  year: number;
  grade: Grade;
  createdAt: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  createdAt: string;
  enrollments: StudentEnrollmentItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface StudentFilters {
  page: number;
  limit: number;
  subject?: string;
  minGrade?: Grade;
}

export interface CreateStudentPayload {
  name: string;
}

export interface EnrollStudentPayload {
  subjectId: string;
  year: number;
  grade: Grade;
}
