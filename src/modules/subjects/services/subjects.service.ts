import { asc } from "drizzle-orm";
import { db as defaultDb, Database } from "../../../db/client.js";
import { subjects, Subject } from "../../../db/schema.js";

export class SubjectsService {
  constructor(private readonly db: Database = defaultDb) {}

  /**
   * Retrieves all subjects ordered alphabetically.
   */
  async listSubjects(): Promise<Subject[]> {
    return this.db.select().from(subjects).orderBy(asc(subjects.name));
  }
}

export const subjectsService = new SubjectsService();
