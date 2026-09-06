import { z } from "zod";

export const subjectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type SubjectResponseDto = z.infer<typeof subjectResponseSchema>;
