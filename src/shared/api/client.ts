/**
 * Cliente API centralizado usando Axios
 * Proporciona una instancia configurada con interceptores para:
 * - Manejo automático de tokens de autenticación
 * - Transformación de errores HTTP a clases de error tipadas
 * - Logging de requests en desarrollo
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ServerError,
  NetworkError,
  TimeoutError,
} from "./errors";
import type { ErrorResponse } from "./types";

// Configuración base
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

/**
 * Crea y configura una instancia de Axios
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true, // Para enviar cookies si es necesario
  });

  // ===== REQUEST INTERCEPTOR =====
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Obtener token del localStorage (o de donde lo almacenes)
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log en desarrollo
      if (import.meta.env.DEV) {
        console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  // ===== RESPONSE INTERCEPTOR =====
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log en desarrollo
      if (import.meta.env.DEV) {
        console.log(
          `✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
          {
            status: response.status,
            data: response.data,
          },
        );
      }

      return response;
    },
    (error: AxiosError<ErrorResponse>) => {
      // Log de error en desarrollo
      if (import.meta.env.DEV) {
        console.error(`❌ [API] Error:`, {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }

      // Si no hay respuesta del servidor (error de red)
      if (!error.response) {
        if (error.code === "ECONNABORTED") {
          throw new TimeoutError();
        }
        throw new NetworkError();
      }

      const { status, data } = error.response;
      const message = data?.message || error.message;
      const errors = data?.errors;

      // Transformar errores HTTP a clases de error tipadas
      switch (status) {
        case 401:
          // Limpiar token y redirigir a login si es necesario
          localStorage.removeItem("auth_token");
          throw new UnauthorizedError(message);

        case 403:
          throw new ForbiddenError(message);

        case 404:
          throw new NotFoundError(message);

        case 422:
          throw new ValidationError(message, errors);

        case 500:
        case 502:
        case 503:
        case 504:
          throw new ServerError(message);

        default:
          throw new ApiError(message, status, data?.code, errors);
      }
    },
  );

  return client;
}

/**
 * Instancia del cliente API para usar en toda la aplicación
 */
export const apiClient = createApiClient();

/**
 * Helper para establecer el token de autenticación
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.getItem('bankmind-token');
  } else {
    localStorage.removeItem('bankmind-token');
  }
}

/**
 * Helper para obtener el token actual
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('bankmind-token');
}

/**
 * Helper para verificar si hay un token válido
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken();
}

export default apiClient;
