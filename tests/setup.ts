import * as dotenv from "dotenv";

dotenv.config();

// Force DATABASE_URL to use the real test database
process.env.DATABASE_URL =
  process.env.DATABASE_TEST_URL || "postgresql://postgres@localhost:5432/student_enrollment_test";

import { beforeEach, afterAll } from "vitest";
import { sql } from "drizzle-orm";
import { db, pool } from "../src/db/client.js";

beforeEach(async () => {
  // Reset database state between tests using TRUNCATE CASCADE
  await db.execute(
    sql`TRUNCATE TABLE "enrollments", "students", "subjects" CASCADE;`
  );
});

afterAll(async () => {
  // Clean up DB pool connection
  await pool.end();
});
