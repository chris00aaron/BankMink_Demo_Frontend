import { useQuery } from "@tanstack/react-query";
import { transactionService } from "../services/transactionService";
import { format, subDays } from "date-fns";

// ===== QUERY KEYS =====
export const transactionKeys = {
  all: ["transactions"] as const,
  summary: (desde: string, hasta: string) =>
    [...transactionKeys.all, "summary", { desde, hasta }] as const,
};

// ===== HELPERS =====
export function getDefaultDateRange() {
  const yesterday = subDays(new Date(), 1);
  const sevenDaysAgo = subDays(new Date(), 7);
  return {
    desde: format(sevenDaysAgo, "yyyy-MM-dd"),
    hasta: format(yesterday, "yyyy-MM-dd"),
  };
}

// ===== QUERIES =====

/**
 * Hook para obtener el resumen de transacciones diarias por rango de fechas.
 * Por defecto: desde hace 7 días hasta ayer.
 */
export function useTransactionSummary(
  desde?: string,
  hasta?: string,
) {
  const defaults = getDefaultDateRange();
  const resolvedDesde = desde ?? defaults.desde;
  const resolvedHasta = hasta ?? defaults.hasta;

  return useQuery({
    queryKey: transactionKeys.summary(resolvedDesde, resolvedHasta),
    queryFn: () =>
      transactionService.getTransactionSummary(resolvedDesde, resolvedHasta),
    select: (response) => response.data.resumen,
    enabled: !!resolvedDesde && !!resolvedHasta,
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 2,
  });
}
