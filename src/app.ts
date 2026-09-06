import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { errorHandler } from "./shared/error-handler.js";
import { studentsRoutes } from "./modules/students/routes/students.routes.js";
import { enrollmentsRoutes } from "./modules/enrollments/routes/enrollments.routes.js";
import { subjectsRoutes } from "./modules/subjects/routes/subjects.routes.js";

/**
 * Fastify application factory.
 * Configures CORS, global error handler, and domain routes.
 */
export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: false,
    ...options,
  });

  // 1. Enable Cross-Origin Resource Sharing
  app.register(cors, {
    origin: true, // Allow frontend dev server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // 2. Register Centralized Error Handler
  app.setErrorHandler(errorHandler);

  // 3. Health Check
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  // 4. Register Domain Route Modules
  app.register(studentsRoutes);
  app.register(enrollmentsRoutes);
  app.register(subjectsRoutes);

  return app;
}
