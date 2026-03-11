import { useQuery } from "@tanstack/react-query";
import { featuresService } from "../services/featuresService";

export const featureKeys = {
  all: ["atm-features"] as const,
  list: (page: number, size: number) =>
    [...featureKeys.all, { page, size }] as const,
};

/**
 * Retorna { features, totalElements, totalPages, isLoading, isError, refetch }
 * Accede al SpringPage completo para poder exponer tanto el contenido
 * como el total real de elementos que existe en el backend.
 */
export function useFeatures(page: number = 0, size: number = 50) {
  return useQuery({
    queryKey: featureKeys.list(page, size),
    queryFn: () => featuresService.getFeatures(page, size),
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const springPage = response?.data;
      return {
        features:      springPage?.content             ?? [],
        totalElements: springPage?.page?.totalElements ?? 0,
        totalPages:    springPage?.page?.totalPages    ?? 0,
      };
    },
  });
}

/**
 * Atajo para la vista principal: carga una página amplia para los gráficos
 * y expone el totalElements del servidor para el KPI.
 */
export function useAllFeatures() {
  return useFeatures(0, 100);
}