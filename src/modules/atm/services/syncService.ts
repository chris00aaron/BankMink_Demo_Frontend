import { apiClient } from "@shared/api";
import type { ApiResponse, SpringPage } from "@shared/api";

export interface ProcessLogStep {
  action: string;
  status: string;
  details: Record<string, string>;
  timestamp: string;
}

export interface SyncLog {
  idSync: number;
  recordsInserted: number | null;
  recordsProcessed: number | null;
  recordsUpdated: number | null;
  syncStart: string;
  syncEnd: string | null;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  sourceSystem: string;
  errorMessage: string | null;
  processLog: ProcessLogStep[] | null;
}

export const syncService = {
  /**
   * Obtener logs de sincronización
   */
  async getSyncLogs(
    page: number = 0,
    size: number = 5,
  ): Promise<ApiResponse<SpringPage<SyncLog>>> {
    const response = await apiClient.get<ApiResponse<SpringPage<SyncLog>>>(
      "/atm/sync",
      {
        params: { page, size },
      },
    );
    return response.data;
  },
};
