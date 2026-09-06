import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { db } from "../src/db/client.js";
import { students, subjects, enrollments } from "../src/db/schema.js";

describe("Students API (Real PostgreSQL)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /students", () => {
    it("should create a student with valid payload (happy path)", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/students",
        payload: { name: "Alice Wonderland" },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data).toHaveProperty("id");
      expect(data.name).toBe("Alice Wonderland");
      expect(data).toHaveProperty("createdAt");

      // Verify in DB
      const [saved] = await db.select().from(students);
      expect(saved).toBeDefined();
      expect(saved.name).toBe("Alice Wonderland");
    });

    it("should return 400 when name is missing or empty (validation error)", async () => {
      const emptyNameRes = await app.inject({
        method: "POST",
        url: "/students",
        payload: { name: "   " },
      });

      expect(emptyNameRes.statusCode).toBe(400);
      const emptyData = emptyNameRes.json();
      expect(emptyData.error).toBe("ValidationError");

      const missingNameRes = await app.inject({
        method: "POST",
        url: "/students",
        payload: {},
      });

      expect(missingNameRes.statusCode).toBe(400);
      const missingData = missingNameRes.json();
      expect(missingData.error).toBe("ValidationError");
    });
  });

  describe("GET /students with joined filters", () => {
    it("should filter students by subject and minGrade via a single joined query", async () => {
      // Seed subjects
      const [math] = await db
        .insert(subjects)
        .values({ name: "Mathematics" })
        .returning();
      const [physics] = await db
        .insert(subjects)
        .values({ name: "Physics" })
        .returning();

      // Seed 3 students
      const [studentAlice] = await db
        .insert(students)
        .values({ name: "Alice" })
        .returning();
      const [studentBob] = await db
        .insert(students)
        .values({ name: "Bob" })
        .returning();
      const [studentCharlie] = await db
        .insert(students)
        .values({ name: "Charlie" })
        .returning();

      // Enrollments:
      // Alice: Math grade 'A' (Qualifies for Math, minGrade 'B')
      // Bob: Math grade 'C' (Does NOT qualify for minGrade 'B')
      // Charlie: Physics grade 'A' (Does NOT match subject 'Math')
      await db.insert(enrollments).values([
        { studentId: studentAlice.id, subjectId: math.id, year: 2024, grade: "A" },
        { studentId: studentBob.id, subjectId: math.id, year: 2024, grade: "C" },
        { studentId: studentCharlie.id, subjectId: physics.id, year: 2024, grade: "A" },
      ]);

      // Query with ?subject=Math&minGrade=B
      const response = await app.inject({
        method: "GET",
        url: "/students?subject=Math&minGrade=B",
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(studentAlice.id);
      expect(result.data[0].name).toBe("Alice");
    });

    it("should return empty list when no students meet the filter criteria", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/students?subject=NonExistentSubject&minGrade=A",
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.meta.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("GET /students/:id (Zero N+1 query)", () => {
    it("should retrieve a student with nested enrollments and subject names", async () => {
      const [math] = await db
        .insert(subjects)
        .values({ name: "Mathematics" })
        .returning();
      const [history] = await db
        .insert(subjects)
        .values({ name: "History" })
        .returning();

      const [student] = await db
        .insert(students)
        .values({ name: "Diana Prince" })
        .returning();

      await db.insert(enrollments).values([
        { studentId: student.id, subjectId: math.id, year: 2024, grade: "A" },
        { studentId: student.id, subjectId: history.id, year: 2023, grade: "B" },
      ]);

      const response = await app.inject({
        method: "GET",
        url: `/students/${student.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.id).toBe(student.id);
      expect(body.name).toBe("Diana Prince");
      expect(body.enrollments).toHaveLength(2);

      const subjectNames = body.enrollments.map((e: any) => e.subjectName);
      expect(subjectNames).toContain("Mathematics");
      expect(subjectNames).toContain("History");
    });

    it("should return 404 when student ID is not found", async () => {
      const nonExistentUuid = "00000000-0000-0000-0000-000000000000";
      const response = await app.inject({
        method: "GET",
        url: `/students/${nonExistentUuid}`,
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.error).toBe("NotFoundError");
    });
  });

  describe("DELETE /students/:id", () => {
    it("should delete student and cascade-remove their enrollments", async () => {
      const [subject] = await db
        .insert(subjects)
        .values({ name: "Biology" })
        .returning();

      const [student] = await db
        .insert(students)
        .values({ name: "To Be Deleted" })
        .returning();

      await db.insert(enrollments).values({
        studentId: student.id,
        subjectId: subject.id,
        year: 2024,
        grade: "B",
      });

      const deleteRes = await app.inject({
        method: "DELETE",
        url: `/students/${student.id}`,
      });

      expect(deleteRes.statusCode).toBe(204);

      // Verify student is gone
      const studentInDb = await db.select().from(students);
      expect(studentInDb).toHaveLength(0);

      // Verify cascade: enrollments also deleted
      const enrollmentsInDb = await db.select().from(enrollments);
      expect(enrollmentsInDb).toHaveLength(0);
    });

    it("should return 404 when attempting to delete non-existent student", async () => {
      const nonExistentUuid = "00000000-0000-0000-0000-000000000000";
      const response = await app.inject({
        method: "DELETE",
        url: `/students/${nonExistentUuid}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe("NotFoundError");
    });
  });
});
