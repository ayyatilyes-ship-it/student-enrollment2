import { pgTable, text, varchar, integer, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Students Table
 * Represents enrolled individuals.
 */
export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Subjects Table
 * Represents academic courses/subjects with unique names.
 */
export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

/**
 * Enrollments Table
 * Composite primary key: (studentId, subjectId, year)
 * 
 * Concurrency & Integrity:
 * - Composite PK prevents duplicate enrollments for the same (student, subject, year)
 * - onDelete: 'cascade' on studentId removes enrollments when a student is deleted
 * - onDelete: 'restrict' on subjectId prevents subject deletion if active enrollments exist
 */
export const enrollments = pgTable(
  "enrollments",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "restrict" }),
    year: integer("year").notNull(),
    grade: varchar("grade", { length: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.studentId, table.subjectId, table.year] }),
  ]
);

/**
 * Drizzle Relational Definitions
 * Enables single-query relational loading (zero N+1)
 */
export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [enrollments.subjectId],
    references: [subjects.id],
  }),
}));

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
