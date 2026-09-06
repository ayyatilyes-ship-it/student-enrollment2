import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/pagination.js";

export const ALLOWED_GRADES = ["A", "B", "C", "D", "F"] as const;
export type Grade = (typeof ALLOWED_GRADES)[number];

export const createStudentSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name must not be empty")
    .max(100, "Name must be at most 100 characters"),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;

export const studentIdParamSchema = z.object({
  id: z.string().uuid("Invalid student ID format"),
});

export type StudentIdParam = z.infer<typeof studentIdParamSchema>;

export const studentFilterQuerySchema = paginationQuerySchema.extend({
  subject: z.string().trim().min(1).optional(),
  minGrade: z.enum(ALLOWED_GRADES).optional(),
});

export type StudentFilterQuery = z.infer<typeof studentFilterQuerySchema>;

export interface StudentEnrollmentItem {
  subjectId: string;
  subjectName: string;
  year: number;
  grade: string;
  createdAt: Date;
}

export interface StudentDetailDto {
  id: string;
  name: string;
  createdAt: Date;
  enrollments: StudentEnrollmentItem[];
}
