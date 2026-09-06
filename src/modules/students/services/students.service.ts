import { eq, and, inArray, ilike, sql, desc } from "drizzle-orm";
import { db as defaultDb, Database } from "../../../db/client.js";
import { students, subjects, enrollments } from "../../../db/schema.js";
import {
  CreateStudentDto,
  StudentFilterQuery,
  StudentDetailDto,
} from "../dto/students.dto.js";
import { getGradesMeetingMinimum } from "../helpers/students.helpers.js";
import { NotFoundError } from "../../../shared/errors.js";
import {
  buildPaginationMeta,
  getPaginationOffset,
  PaginatedResult,
} from "../../../shared/pagination.js";

export class StudentsService {
  constructor(private readonly db: Database = defaultDb) {}

  /**
   * Creates a new student record.
   */
  async createStudent(data: CreateStudentDto) {
    const [student] = await this.db
      .insert(students)
      .values({
        name: data.name.trim(),
      })
      .returning();

    return student;
  }

  /**
   * Retrieves a student by ID including all enrollments and subject names.
   * Uses a single relational query (zero N+1 queries).
   */
  async getStudentById(id: string): Promise<StudentDetailDto> {
    const student = await this.db.query.students.findFirst({
      where: eq(students.id, id),
      with: {
        enrollments: {
          with: {
            subject: true,
          },
          orderBy: [desc(enrollments.year)],
        },
      },
    });

    if (!student) {
      throw new NotFoundError(`Student with ID '${id}' not found`);
    }

    return {
      id: student.id,
      name: student.name,
      createdAt: student.createdAt,
      enrollments: student.enrollments.map((e) => ({
        subjectId: e.subjectId,
        subjectName: e.subject.name,
        year: e.year,
        grade: e.grade,
        createdAt: e.createdAt,
      })),
    };
  }

  /**
   * Deletes a student by ID.
   * Cascade rule: associated enrollments are automatically removed via DB cascade foreign key.
   */
  async deleteStudent(id: string): Promise<void> {
    const [deleted] = await this.db
      .delete(students)
      .where(eq(students.id, id))
      .returning({ id: students.id });

    if (!deleted) {
      throw new NotFoundError(`Student with ID '${id}' not found`);
    }
  }

  /**
   * Lists students with pagination and optional subject / minGrade filters.
   * When filtering by subject or minGrade, uses a single joined query (students ⋈ enrollments ⋈ subjects).
   */
  async listStudents(
    query: StudentFilterQuery
  ): Promise<PaginatedResult<{ id: string; name: string; createdAt: Date; enrollmentsCount?: number }>> {
    const { page, limit, subject, minGrade } = query;
    const offset = getPaginationOffset(page, limit);

    const hasFilters = Boolean(subject || minGrade);

    if (hasFilters) {
      const filterConditions = [];

      if (subject) {
        filterConditions.push(ilike(subjects.name, `%${subject.trim()}%`));
      }

      if (minGrade) {
        const matchingGrades = getGradesMeetingMinimum(minGrade);
        filterConditions.push(inArray(enrollments.grade, matchingGrades));
      }

      // 1. Single joined query for total count of distinct students matching filter
      const [countResult] = await this.db
        .select({
          total: sql<number>`count(distinct ${students.id})::int`,
        })
        .from(students)
        .innerJoin(enrollments, eq(students.id, enrollments.studentId))
        .innerJoin(subjects, eq(enrollments.subjectId, subjects.id))
        .where(and(...filterConditions));

      const total = Number(countResult?.total ?? 0);

      // 2. Single joined query returning distinct matching students
      const rows = await this.db
        .selectDistinctOn([students.id], {
          id: students.id,
          name: students.name,
          createdAt: students.createdAt,
        })
        .from(students)
        .innerJoin(enrollments, eq(students.id, enrollments.studentId))
        .innerJoin(subjects, eq(enrollments.subjectId, subjects.id))
        .where(and(...filterConditions))
        .orderBy(students.id)
        .limit(limit)
        .offset(offset);

      return {
        data: rows,
        meta: buildPaginationMeta(page, limit, total),
      };
    }

    // Default unfiltered paginated query: single count + single paginated select
    const [countResult] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(students);

    const total = Number(countResult?.total ?? 0);

    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        createdAt: students.createdAt,
      })
      .from(students)
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: rows,
      meta: buildPaginationMeta(page, limit, total),
    };
  }
}

export const studentsService = new StudentsService();
