/**
 * Clases de error personalizadas para el manejo de errores de API
 * Permiten un manejo más granular de diferentes tipos de errores HTTP
 */

/**
 * Error base de la API
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;

    // Mantener el stack trace correcto en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Error de autenticación (401)
 * Se lanza cuando el usuario no está autenticado o el token ha expirado
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "No autorizado. Por favor, inicia sesión nuevamente.") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * Error de permisos (403)
 * Se lanza cuando el usuario no tiene permisos para acceder al recurso
 */
export class ForbiddenError extends ApiError {
  constructor(message = "No tienes permisos para acceder a este recurso.") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends ApiError {
  constructor(message = "El recurso solicitado no fue encontrado.") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * Error de validación (422)
 * Se lanza cuando los datos enviados no pasan las validaciones del servidor
 */
export class ValidationError extends ApiError {
  constructor(
    message = "Los datos proporcionados no son válidos.",
    errors?: Record<string, string[]>,
  ) {
    super(message, 422, "VALIDATION_ERROR", errors);
    this.name = "ValidationError";
  }
}

/**
 * Error del servidor (500+)
 */
export class ServerError extends ApiError {
  constructor(
    message = "Error interno del servidor. Por favor, intenta más tarde.",
  ) {
    super(message, 500, "SERVER_ERROR");
    this.name = "ServerError";
  }
}

/**
 * Error de red/conexión
 */
export class NetworkError extends ApiError {
  constructor(message = "Error de conexión. Verifica tu conexión a internet.") {
    super(message, 0, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

/**
 * Error de timeout
 */
export class TimeoutError extends ApiError {
  constructor(
    message = "La solicitud ha tardado demasiado. Por favor, intenta de nuevo.",
  ) {
    super(message, 408, "TIMEOUT");
    this.name = "TimeoutError";
  }
}

/**
 * Función helper para determinar si un error es un ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Función helper para obtener el mensaje de error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado.";
}
