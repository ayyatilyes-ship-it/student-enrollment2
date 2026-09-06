import { eq } from "drizzle-orm";
import { db as defaultDb, Database } from "../../../db/client.js";
import { students, subjects, enrollments, Enrollment } from "../../../db/schema.js";
import { EnrollStudentDto } from "../dto/enrollments.dto.js";
import { ConflictError, NotFoundError } from "../../../shared/errors.js";

export class EnrollmentsService {
  constructor(private readonly db: Database = defaultDb) {}

  /**
   * Enrolls a student in a subject for a given academic year.
   * 
   * Defenses:
   * 1. 404 if student does not exist.
   * 2. 404 if subject does not exist.
   * 3. 409 Conflict if composite primary key (studentId, subjectId, year) is violated.
   *    Relying on DB-level unique constraint and catching error 23505 avoids race conditions
   *    under concurrent requests.
   */
  async enrollStudent(studentId: string, data: EnrollStudentDto): Promise<Enrollment> {
    // 1. Verify student existence
    const student = await this.db.query.students.findFirst({
      where: eq(students.id, studentId),
      columns: { id: true },
    });

    if (!student) {
      throw new NotFoundError(`Student with ID '${studentId}' not found`);
    }

    // 2. Verify subject existence
    const subject = await this.db.query.subjects.findFirst({
      where: eq(subjects.id, data.subjectId),
      columns: { id: true, name: true },
    });

    if (!subject) {
      throw new NotFoundError(`Subject with ID '${data.subjectId}' not found`);
    }

    // 3. Attempt insertion and catch DB constraint violation (race-condition safe)
    try {
      const [newEnrollment] = await this.db
        .insert(enrollments)
        .values({
          studentId,
          subjectId: data.subjectId,
          year: data.year,
          grade: data.grade,
        })
        .returning();

      return newEnrollment;
    } catch (error: any) {
      // PostgreSQL unique_violation error code
      if (error?.code === "23505") {
        throw new ConflictError(
          `Student is already enrolled in ${subject.name} for year ${data.year}`
        );
      }

      // Foreign key violation fallback
      if (error?.code === "23503") {
        throw new NotFoundError("Referenced student or subject does not exist");
      }

      throw error;
    }
  }
}

export const enrollmentsService = new EnrollmentsService();
