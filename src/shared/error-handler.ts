import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./errors.js";

/**
 * Centralized Fastify error handler.
 * Maps domain AppError subclasses, Zod validation errors, and PostgreSQL error codes to HTTP responses.
 */
export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 1. Domain AppError (NotFoundError, ConflictError, ValidationError, etc.)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      ...(error instanceof Error && "details" in error ? { details: (error as any).details } : {}),
    });
  }

  // 2. Zod Schema Validation Error
  if (error instanceof ZodError) {
    const formattedIssues = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return reply.status(400).send({
      statusCode: 400,
      error: "ValidationError",
      message: "Request validation failed",
      issues: formattedIssues,
    });
  }

  // 3. PostgreSQL Database Error Codes
  const pgError = error as { code?: string; detail?: string };
  if (pgError.code === "23505") {
    // Unique violation
    return reply.status(409).send({
      statusCode: 409,
      error: "ConflictError",
      message: "Duplicate record: unique constraint violated",
      detail: pgError.detail,
    });
  }

  if (pgError.code === "23503") {
    // Foreign key violation
    return reply.status(404).send({
      statusCode: 404,
      error: "NotFoundError",
      message: "Referenced resource does not exist",
      detail: pgError.detail,
    });
  }

  // 4. Fastify Built-in Request / Client Errors (e.g. 400 Bad Request, Content-Type errors)
  if ("statusCode" in error && typeof error.statusCode === "number" && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || "ClientError",
      message: error.message,
    });
  }

  // 5. Fallback unhandled 500 error
  request.log.error(error, "Unhandled Exception");

  return reply.status(500).send({
    statusCode: 500,
    error: "InternalServerError",
    message: "An unexpected internal server error occurred",
  });
}
