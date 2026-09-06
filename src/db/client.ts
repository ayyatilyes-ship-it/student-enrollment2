import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/student_enrollment";

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;

/**
 * Creates an isolated Drizzle instance for testing or alternative connections.
 */
export function createDbClient(customConnectionString: string): { db: Database; pool: pg.Pool } {
  const customPool = new Pool({
    connectionString: customConnectionString,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  const customDb = drizzle(customPool, { schema });
  return { db: customDb, pool: customPool };
}
