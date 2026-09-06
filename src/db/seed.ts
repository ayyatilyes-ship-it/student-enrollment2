import { db, pool } from "./client.js";
import { students, subjects, enrollments } from "./schema.js";

async function seed() {
  console.log("🌱 Starting database seed...");

  // 1. Clear existing data
  await db.delete(enrollments);
  await db.delete(students);
  await db.delete(subjects);

  // 2. Insert Subjects
  console.log("📚 Seeding subjects...");
  const initialSubjects = [
    { name: "Mathematics" },
    { name: "Computer Science" },
    { name: "Physics" },
    { name: "Literature" },
    { name: "Chemistry" },
  ];

  const createdSubjects = await db
    .insert(subjects)
    .values(initialSubjects)
    .returning();

  const math = createdSubjects.find((s) => s.name === "Mathematics")!;
  const cs = createdSubjects.find((s) => s.name === "Computer Science")!;
  const physics = createdSubjects.find((s) => s.name === "Physics")!;
  const lit = createdSubjects.find((s) => s.name === "Literature")!;

  // 3. Insert Students
  console.log("👥 Seeding students...");
  const initialStudents = [
    { name: "Alice Johnson" },
    { name: "Bob Smith" },
    { name: "Charlie Brown" },
    { name: "Diana Prince" },
    { name: "Evan Wright" },
  ];

  const createdStudents = await db
    .insert(students)
    .values(initialStudents)
    .returning();

  const [alice, bob, charlie, diana] = createdStudents;

  // 4. Insert Enrollments
  console.log("📝 Seeding enrollments...");
  await db.insert(enrollments).values([
    {
      studentId: alice.id,
      subjectId: math.id,
      year: 2024,
      grade: "A",
    },
    {
      studentId: alice.id,
      subjectId: cs.id,
      year: 2024,
      grade: "A",
    },
    {
      studentId: bob.id,
      subjectId: math.id,
      year: 2024,
      grade: "B",
    },
    {
      studentId: bob.id,
      subjectId: physics.id,
      year: 2023,
      grade: "C",
    },
    {
      studentId: charlie.id,
      subjectId: lit.id,
      year: 2024,
      grade: "A",
    },
    {
      studentId: diana.id,
      subjectId: math.id,
      year: 2024,
      grade: "C",
    },
  ]);

  console.log("✅ Database seeded successfully!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  pool.end();
  process.exit(1);
});
