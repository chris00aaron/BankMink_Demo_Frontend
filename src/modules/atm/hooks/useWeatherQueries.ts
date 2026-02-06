/**
 * Custom hooks para el módulo ATM usando TanStack Query
 * Proporcionan una interfaz declarativa para las operaciones de ATM
 */

import { useQuery } from "@tanstack/react-query";
import { weatherService } from "../services/weatherService";

// ===== QUERY KEYS =====
// Centralizamos las claves de query para facilitar la invalidación

export const weatherKeys = {
  all: ["weather"] as const,
  list: () => [...weatherKeys.all] as const,
};

// ===== QUERIES =====

/**
 * Hook para obtener lista de clima
 */
export function useWeather() {
  return useQuery({
    queryKey: weatherKeys.list(), // Clave única para la query
    queryFn: () => weatherService.getWeather(), // Función que obtiene los datos
  });
}