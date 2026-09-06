import { FastifyInstance } from "fastify";
import { subjectsHandler } from "../handlers/subjects.handlers.js";

/**
 * Fastify route registration for Subjects endpoints.
 */
export async function subjectsRoutes(fastify: FastifyInstance) {
  fastify.get("/subjects", subjectsHandler.listSubjects);
}
