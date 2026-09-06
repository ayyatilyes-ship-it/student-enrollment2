import { z } from "zod";
import { ALLOWED_GRADES } from "../../../modules/students/dto/students.dto.js";

export const enrollParamSchema = z.object({
  id: z.string().uuid("Invalid student ID format"),
});

export type EnrollParamDto = z.infer<typeof enrollParamSchema>;

export const enrollStudentSchema = z.object({
  subjectId: z.string({ required_error: "subjectId is required" }).uuid("Invalid subject ID format"),
  year: z.coerce
    .number({ required_error: "year is required" })
    .int("Year must be an integer")
    .min(1990, "Year must be at least 1990")
    .max(2100, "Year must not exceed 2100"),
  grade: z.enum(ALLOWED_GRADES, {
    errorMap: () => ({ message: "Grade must be one of: A, B, C, D, F" }),
  }),
});

export type EnrollStudentDto = z.infer<typeof enrollStudentSchema>;

export interface EnrollmentResponseDto {
  studentId: string;
  subjectId: string;
  year: number;
  grade: string;
  createdAt: Date;
}
