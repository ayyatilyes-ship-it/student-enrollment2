import { db, pool } from "./client.js";
import { students, subjects, enrollments } from "./schema.js";

async function inspect() {
  console.log("\n================ 📚 SUBJECTS ================");
  const allSubjects = await db.select().from(subjects);
  console.table(allSubjects);

  console.log("\n================ 👥 STUDENTS ================");
  const allStudents = await db.select().from(students);
  console.table(allStudents);

  console.log("\n================ 📝 ENROLLMENTS ================");
  const allEnrollments = await db.query.enrollments.findMany({
    with: {
      student: true,
      subject: true,
    },
  });

  const formattedEnrollments = allEnrollments.map((e) => ({
    Student: e.student.name,
    Subject: e.subject.name,
    Year: e.year,
    Grade: e.grade,
  }));
  console.table(formattedEnrollments);

  await pool.end();
}

inspect().catch((err) => {
  console.error("Error inspecting database:", err);
  pool.end();
});
