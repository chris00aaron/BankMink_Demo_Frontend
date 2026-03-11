import { apiClient } from "@shared/api";
import type { ApiResponse, SpringPage } from "@shared/api";

export interface DynamicFeatures {
  lag1: number;
  lag5: number;
  lag11: number;
  domingo_bajo: number;
  caida_reciente: number;
  tendencia_lags: number;
  ratio_finde_vs_semana: number;
  retiros_finde_anterior: number;
  retiros_domingo_anterior: number;
}

export interface ATMFeature {
  idFeatureStore: number;
  idTransaction: number;
  referenceDate: string;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  month: number | null;
  withdrawalAmountDay: number | null;
  createdAt: string | null;
  dynamicFeatures: { dynamicFeatures: DynamicFeatures } | null;
}

export const featuresService = {
  /**
   * Obtener ultimo monitoreo
   */
  async getFeatures(
    page: number = 0,
    size: number = 7,
  ): Promise<ApiResponse<SpringPage<ATMFeature>>> {
    const response = await apiClient.get<ApiResponse<SpringPage<ATMFeature>>>(
      "/atm/feature",
      {
        params: { page, size },
      },
    );
    return response.data;
  },
};
