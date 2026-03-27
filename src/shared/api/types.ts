/**
 * Tipos comunes para respuestas de API
 * Estos tipos estandarizan la estructura de todas las respuestas del backend
 */

/**
 * Respuesta estándar de la API
 * @template T - Tipo de datos de la respuesta
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Estructura de respuesta de Paginación de Spring Boot
 */
export interface SpringPage<T> {
  content: T[];
  page: {
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  };
}

/**
 * Estructura de error de la API
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Opciones de paginación para consultas
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Opciones de filtrado genéricas
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Parámetros de consulta combinados
 */
export type QueryParams = PaginationParams & FilterParams;

/**
 * Tipos para estados de mutación
 */
export interface MutationState<T> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
}