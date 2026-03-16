import { apiClient } from "@shared/api";
import type { ApiResponse } from "@shared/api";

// ===== DTOs para Resumen de Transacciones Diarias (DailyAtmTransactionController.java) =====
export interface TransactionSummaryDTO {
  date: string;
  withdrawalTotal: number;
  depositTotal: number;
}

export interface ResumenTransaccionDTO {
  resumen: TransactionSummaryDTO[];
}

export const transactionService = {
  /**
   * Obtener resumen de transacciones diarias
   */
  async getTransactionSummary(
    desde: string,
    hasta: string,
  ): Promise<ApiResponse<ResumenTransaccionDTO>> {
    const response = await apiClient.get<ApiResponse<ResumenTransaccionDTO>>(
      "/atm/transaction/summary",
      {
        params: { desde, hasta },
      },
    );
    return response.data;
  },
};
