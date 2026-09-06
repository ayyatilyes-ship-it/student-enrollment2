import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import { Subject } from "../types/index.js";

/**
 * Fetch subjects list for filter bar and enrollment dropdown selectors.
 */
export function useSubjects() {
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: () => apiClient<Subject[]>("/subjects"),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
