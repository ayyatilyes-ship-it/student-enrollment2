import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import {
  Student,
  StudentDetail,
  StudentFilters,
  PaginatedResult,
  CreateStudentPayload,
} from "../types/index.js";

/**
 * Fetch paginated students list with optional filters.
 */
export function useStudents(filters: StudentFilters) {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(filters.page));
  queryParams.set("limit", String(filters.limit));
  if (filters.subject) queryParams.set("subject", filters.subject);
  if (filters.minGrade) queryParams.set("minGrade", filters.minGrade);

  return useQuery<PaginatedResult<Student>>({
    queryKey: ["students", filters],
    queryFn: () => apiClient<PaginatedResult<Student>>(`/students?${queryParams.toString()}`),
  });
}

/**
 * Fetch a single student by ID with their enrollments and subjects (zero N+1).
 */
export function useStudent(id: string | null) {
  return useQuery<StudentDetail>({
    queryKey: ["student", id],
    queryFn: () => apiClient<StudentDetail>(`/students/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Create a new student.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentPayload) =>
      apiClient<Student>("/students", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

/**
 * Delete a student by ID.
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) =>
      apiClient<void>(`/students/${studentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
