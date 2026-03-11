import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { syncService } from "../services/syncService";

// ===== QUERY KEYS =====
export const syncKeys = {
  all: ["syncLogs"] as const,
  list: (page: number, size: number) =>
    [...syncKeys.all, "list", { page, size }] as const,
};

// ===== QUERIES =====

/**
 * Hook para obtener logs de sincronización con paginación.
 * Expone helpers de navegación de página listos para usar en la UI.
 */
export function useSyncLogs(pageSize: number = 5) {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: syncKeys.list(page, pageSize),
    queryFn: () => syncService.getSyncLogs(page, pageSize),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 2, // 2 min
    placeholderData: (prev) => prev, // mantiene datos anteriores mientras carga
    retry: 2,
  });

  const totalPages = query.data?.page.totalPages ?? 0;
  const totalElements = query.data?.page.totalElements ?? 0;

  return {
    ...query,
    page,
    pageSize,
    totalPages,
    totalElements,
    canPreviousPage: page > 0,
    canNextPage: page < totalPages - 1,
    goToNextPage: () => setPage((p) => Math.min(p + 1, totalPages - 1)),
    goToPreviousPage: () => setPage((p) => Math.max(p - 1, 0)),
    goToPage: (p: number) => setPage(p),
  };
}
