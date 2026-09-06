import { FastifyInstance } from "fastify";
import { enrollmentsHandler } from "../handlers/enrollments.handlers.js";

/**
 * Fastify route registration for Enrollments endpoints.
 */
export async function enrollmentsRoutes(fastify: FastifyInstance) {
  fastify.post("/students/:id/enroll", enrollmentsHandler.enrollStudent);
}
