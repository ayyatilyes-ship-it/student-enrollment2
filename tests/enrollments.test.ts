import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { db } from "../src/db/client.js";
import { students, subjects, enrollments } from "../src/db/schema.js";

describe("Enrollments API (Real PostgreSQL)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /students/:id/enroll", () => {
    it("should enroll a student in a subject (happy path)", async () => {
      const [student] = await db
        .insert(students)
        .values({ name: "Edward Norton" })
        .returning();

      const [subject] = await db
        .insert(subjects)
        .values({ name: "Chemistry" })
        .returning();

      const response = await app.inject({
        method: "POST",
        url: `/students/${student.id}/enroll`,
        payload: {
          subjectId: subject.id,
          year: 2024,
          grade: "A",
        },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.studentId).toBe(student.id);
      expect(data.subjectId).toBe(subject.id);
      expect(data.year).toBe(2024);
      expect(data.grade).toBe("A");

      // Verify in DB
      const [saved] = await db.select().from(enrollments);
      expect(saved).toBeDefined();
      expect(saved.grade).toBe("A");
    });

    it("should return 404 when student does not exist", async () => {
      const [subject] = await db
        .insert(subjects)
        .values({ name: "Art" })
        .returning();

      const nonExistentStudentId = "00000000-0000-0000-0000-000000000000";

      const response = await app.inject({
        method: "POST",
        url: `/students/${nonExistentStudentId}/enroll`,
        payload: {
          subjectId: subject.id,
          year: 2024,
          grade: "B",
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe("NotFoundError");
    });

    it("should return 404 when subject does not exist", async () => {
      const [student] = await db
        .insert(students)
        .values({ name: "Frank Miller" })
        .returning();

      const nonExistentSubjectId = "00000000-0000-0000-0000-000000000000";

      const response = await app.inject({
        method: "POST",
        url: `/students/${student.id}/enroll`,
        payload: {
          subjectId: nonExistentSubjectId,
          year: 2024,
          grade: "B",
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe("NotFoundError");
    });

    it("should return 400 when grade or year payload is invalid (validation error)", async () => {
      const [student] = await db
        .insert(students)
        .values({ name: "Grace Hopper" })
        .returning();

      const [subject] = await db
        .insert(subjects)
        .values({ name: "Algorithms" })
        .returning();

      // Invalid grade 'Z'
      const invalidGradeRes = await app.inject({
        method: "POST",
        url: `/students/${student.id}/enroll`,
        payload: {
          subjectId: subject.id,
          year: 2024,
          grade: "Z",
        },
      });

      expect(invalidGradeRes.statusCode).toBe(400);
      expect(invalidGradeRes.json().error).toBe("ValidationError");

      // Invalid year 1800 (out of allowed range)
      const invalidYearRes = await app.inject({
        method: "POST",
        url: `/students/${student.id}/enroll`,
        payload: {
          subjectId: subject.id,
          year: 1800,
          grade: "A",
        },
      });

      expect(invalidYearRes.statusCode).toBe(400);
      expect(invalidYearRes.json().error).toBe("ValidationError");
    });

    it("should return 409 Conflict when enrolling the same (student, subject, year) twice", async () => {
      const [student] = await db
        .insert(students)
        .values({ name: "Hannah Abbott" })
        .returning();

      const [subject] = await db
        .insert(subjects)
        .values({ name: "Herbology" })
        .returning();

      const payload = {
        subjectId: subject.id,
        year: 2024,
        grade: "B",
      };

      // First enrollment succeeds
      const firstRes = await app.inject({
        method: "POST",
        url: `/students/${student.id}/enroll`,
        payload,
      });
      expect(firstRes.statusCode).toBe(201);

      // Second enrollment for identical (studentId, subjectId, year) triggers 409 Conflict
      const secondRes = await app.inject({
        method: "POST",
        url: `/students/${student.id}/enroll`,
        payload: { ...payload, grade: "A" },
      });

      expect(secondRes.statusCode).toBe(409);
      const conflictBody = secondRes.json();
      expect(conflictBody.error).toBe("ConflictError");
      expect(conflictBody.message).toContain("already enrolled");
    });

    it("should safely handle concurrent enrollment requests (race-condition protection)", async () => {
      const [student] = await db
        .insert(students)
        .values({ name: "Ian Malcolm" })
        .returning();

      const [subject] = await db
        .insert(subjects)
        .values({ name: "Chaos Theory" })
        .returning();

      const payload = {
        subjectId: subject.id,
        year: 2024,
        grade: "A",
      };

      // Fire two concurrent requests for the exact same composite key (studentId, subjectId, year)
      const [res1, res2] = await Promise.all([
        app.inject({
          method: "POST",
          url: `/students/${student.id}/enroll`,
          payload,
        }),
        app.inject({
          method: "POST",
          url: `/students/${student.id}/enroll`,
          payload,
        }),
      ]);

      const statusCodes = [res1.statusCode, res2.statusCode].sort();

      // Exactly one must succeed (201) and one must be rejected with 409 Conflict
      expect(statusCodes).toEqual([201, 409]);

      // Exactly 1 record should exist in the database
      const rows = await db.select().from(enrollments);
      expect(rows).toHaveLength(1);
    });
  });
});
