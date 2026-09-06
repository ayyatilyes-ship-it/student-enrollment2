import { FastifyInstance } from "fastify";
import { studentsHandler } from "../handlers/students.handlers.js";

/**
 * Fastify route registration for Students endpoints.
 */
export async function studentsRoutes(fastify: FastifyInstance) {
  fastify.post("/students", studentsHandler.createStudent);
  fastify.get("/students", studentsHandler.listStudents);
  fastify.get("/students/:id", studentsHandler.getStudentById);
  fastify.delete("/students/:id", studentsHandler.deleteStudent);
}
