/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict Error (e.g. duplicate constraint violations)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists or conflicts with existing state") {
    super(message, 409);
  }
}

/**
 * 400 Validation Error (e.g. invalid input format or business constraint)
 */
export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message: string = "Validation failed", details?: unknown) {
    super(message, 400);
    this.details = details;
  }
}
