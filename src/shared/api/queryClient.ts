/**
 * Configuración de TanStack Query (React Query)
 * Proporciona el QueryClient configurado con opciones optimizadas
 */

import { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import { isApiError, UnauthorizedError } from "./errors";

/**
 * Configuración por defecto del QueryClient
 */
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (5 minutos)
      staleTime: 5 * 60 * 1000,

      // Tiempo que los datos permanecen en caché (30 minutos)
      gcTime: 30 * 60 * 1000,

      // Número de reintentos en caso de error
      retry: (failureCount, error) => {
        // No reintentar en errores de autenticación
        if (error instanceof UnauthorizedError) {
          return false;
        }
        // No reintentar en errores 4xx (cliente)
        if (
          isApiError(error) &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }
        // Reintentar hasta 3 veces para otros errores
        return failureCount < 3;
      },

      // Delay entre reintentos (exponencial)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch cuando la ventana recupera el foco
      refetchOnWindowFocus: false,

      // Refetch cuando se reconecta a internet
      refetchOnReconnect: true,

      // No hacer refetch automático si está en background
      refetchOnMount: true,
    },

    mutations: {
      // Número de reintentos para mutaciones
      retry: (failureCount, error) => {
        // No reintentar en errores de autenticación o validación
        if (
          isApiError(error) &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
};

/**
 * Instancia del QueryClient para usar en toda la aplicación
 */
export const queryClient = new QueryClient(queryClientConfig);

/**
 * Helper para invalidar queries por prefijo
 * @example invalidateQueriesByPrefix('atm') // invalida ['atm', 'historico'], ['atm', 'prediction'], etc.
 */
export function invalidateQueriesByPrefix(prefix: string): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: [prefix] });
}

/**
 * Helper para limpiar todo el caché
 */
export function clearQueryCache(): void {
  queryClient.clear();
}

/**
 * Helper para resetear el estado de queries (útil en logout)
 */
export function resetQueries(): Promise<void> {
  return queryClient.resetQueries();
}

export default queryClient;
