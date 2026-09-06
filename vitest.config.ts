import { defineConfig } from "vitest/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      // Vitest injects this into the worker process BEFORE any source files or setupFiles are imported
      DATABASE_URL:
        process.env.DATABASE_TEST_URL ||
        "postgresql://postgres@localhost:5432/student_enrollment_test",
    },
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 15000,
  },
});
