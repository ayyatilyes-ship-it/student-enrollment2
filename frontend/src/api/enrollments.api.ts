import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import { EnrollStudentPayload } from "../types/index.js";

/**
 * Mutation hook to enroll a student in a subject.
 * Invalidates both the active student detail query and the students list query.
 */
export function useEnrollStudent(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrollStudentPayload) =>
      apiClient(`/students/${studentId}/enroll`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
