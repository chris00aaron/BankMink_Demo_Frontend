/**
 * Barrel export para el módulo de API
 * Facilita la importación de todos los elementos del módulo
 *
 * @example
 * import { apiClient, ApiError, queryClient } from '@shared/api';
 */

// Cliente API
export { apiClient, setAuthToken, getAuthToken, hasAuthToken } from "./client";

// Errores
export {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ServerError,
  NetworkError,
  TimeoutError,
  isApiError,
  getErrorMessage,
} from "./errors";

// Tipos
export type {
  ApiResponse,
  ErrorResponse,
  PaginationParams,
  FilterParams,
  QueryParams,
  MutationState,
  SpringPage,
} from "./types";

// Query Client
export {
  queryClient,
  invalidateQueriesByPrefix,
  clearQueryCache,
  resetQueries,
} from "./queryClient";
