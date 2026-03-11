import { apiClient } from "@shared/api";
import type { ApiResponse } from "@shared/api";

export interface PSIFeatureResult {
  psi: number;
  alert: "OK" | "SKIPPED" | "WARNING" | "CRITICAL";
  actualPct: number[];
  expectedPct: number[];
  prodSamples: number;
  prodNullPct: number;
}

export interface PSIResults {
  [feature: string]: PSIFeatureResult;
}

export interface PSIDetail {
  OK: Record<string, number>;
  SKIPPED: Record<string, number>;
  WARNING: Record<string, number>;
  CRITICAL: Record<string, number>;
}

export interface PSISummary {
  n_ok: number;
  n_skipped: number;
  n_warning: number;
  n_critical: number;
  worst_psi: number;
  worst_feature: string;
  evaluated_at: string;
  pct_critical: number;
  pct_warning_plus: number;
  total_features: number;
}

export interface PerformanceMonitor {
  id: number;
  action: string;
  createdAt: string;
  decision: string;
  detail: PSIDetail;
  mae: number;
  mape: number;
  message: string;
  psiResults: PSIResults;
  rmse: number;
  summary: PSISummary;
  idWithdrawalModel: number;
}

export const performanceMonitorService = {
  /**
   * Obtener ultimo monitoreo
   */
  async getLatestMonitoring(): Promise<ApiResponse<PerformanceMonitor>> {
    const response = await apiClient.get<ApiResponse<PerformanceMonitor>>(
      "/atm/monitoring/last",
    );
    return response.data;
  },
};
