import { useQuery } from "@tanstack/react-query";
import { performanceMonitorService } from "../services/performanceMonitorService";

export const monitorKeys = {
  all: ["performance-monitors"] as const,
  list: (page: number, size: number) =>
    [...monitorKeys.all, { page, size }] as const,
  latest: () => [...monitorKeys.all, "latest"] as const,
};

/**
 * Devuelve { monitors, isLoading, isError, refetch }
 * donde monitors es el array de PerformanceMonitor de la página solicitada.
 */
export function usePerformanceMonitors() {
  return useQuery({
    queryKey: monitorKeys.latest(),
    queryFn: () => performanceMonitorService.getLatestMonitoring(),
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data ?? null,
  });
}

/**
 * Atajo para obtener sólo el monitor más reciente (el primero de la primera página).
 */
export function useLatestMonitor() {
  const query = usePerformanceMonitors();
  return {
    ...query,
    data: query.data,
  };
}