/**
 * Custom hooks para el módulo ATM usando TanStack Query
 * Proporcionan una interfaz declarativa para las operaciones de ATM
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atmService } from "../services/atmService";
import type {
  ATMFilters,
  HistoricoFilters,
  SimulationParams,
} from "../services/atmService";

// ===== QUERY KEYS =====
// Centralizamos las claves de query para facilitar la invalidación

export const atmKeys = {
  all: ["atm"] as const,
  lists: () => [...atmKeys.all, "list"] as const,
  list: (filters: ATMFilters) => [...atmKeys.lists(), filters] as const,
  details: () => [...atmKeys.all, "detail"] as const,
  detail: (id: string) => [...atmKeys.details(), id] as const,
  predictions: () => [...atmKeys.all, "predictions"] as const,
  prediction: (atmId: string, fecha?: string) =>
    [...atmKeys.predictions(), atmId, fecha] as const,
  historico: (filters?: HistoricoFilters) =>
    [...atmKeys.all, "historico", filters] as const,
  stats: () => [...atmKeys.all, "stats"] as const,
  modelMetrics: () => [...atmKeys.all, "model-metrics"] as const,
};

// ===== QUERIES =====

/**
 * Hook para obtener lista de ATMs
 */
export function useATMs(filters?: ATMFilters) {
  return useQuery({
    queryKey: atmKeys.list(filters || {}),
    queryFn: () => atmService.getATMs(filters),
  });
}

/**
 * Hook para obtener un ATM específico
 */
export function useATM(atmId: string) {
  return useQuery({
    queryKey: atmKeys.detail(atmId),
    queryFn: () => atmService.getATMById(atmId),
    enabled: !!atmId,
  });
}

/**
 * Hook para obtener predicción de un ATM
 */
export function useATMPrediction(atmId: string, fecha?: string) {
  return useQuery({
    queryKey: atmKeys.prediction(atmId, fecha),
    queryFn: () => atmService.getPrediction(atmId, fecha),
    enabled: !!atmId,
  });
}

/**
 * Hook para obtener predicciones de todos los ATMs
 */
export function useATMPredictions(fecha?: string) {
  return useQuery({
    queryKey: atmKeys.predictions(),
    queryFn: () => atmService.getPredictions(fecha),
  });
}

/**
 * Hook para obtener histórico de retiros
 */
export function useHistoricoRetiros(filters?: HistoricoFilters) {
  return useQuery({
    queryKey: atmKeys.historico(filters),
    queryFn: () => atmService.getHistorico(filters),
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useATMStats() {
  return useQuery({
    queryKey: atmKeys.stats(),
    queryFn: () => atmService.getStats(),
    // Refrescar cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener métricas del modelo
 */
export function useModelMetrics() {
  return useQuery({
    queryKey: atmKeys.modelMetrics(),
    queryFn: () => atmService.getModelMetrics(),
    // Las métricas del modelo no cambian frecuentemente
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

// ===== MUTATIONS =====

/**
 * Hook para ejecutar simulación
 */
export function useSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SimulationParams) => atmService.runSimulation(params),
    onSuccess: () => {
      // Invalidar predicciones después de una simulación
      queryClient.invalidateQueries({ queryKey: atmKeys.predictions() });
    },
  });
}

/**
 * Hook para programar recarga de ATM
 */
export function useScheduleRefill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      atmId,
      data,
    }: {
      atmId: string;
      data: Parameters<typeof atmService.scheduleRefill>[1];
    }) => atmService.scheduleRefill(atmId, data),
    onSuccess: (_, variables) => {
      // Invalidar el detalle del ATM
      queryClient.invalidateQueries({
        queryKey: atmKeys.detail(variables.atmId),
      });
      // Invalidar la lista de ATMs
      queryClient.invalidateQueries({ queryKey: atmKeys.lists() });
    },
  });
}

// ===== PREFETCHING =====

/**
 * Hook para prefetch de datos del ATM
 * Útil para mejorar la UX al hacer hover sobre un ATM
 */
export function usePrefetchATM() {
  const queryClient = useQueryClient();

  return (atmId: string) => {
    queryClient.prefetchQuery({
      queryKey: atmKeys.detail(atmId),
      queryFn: () => atmService.getATMById(atmId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
