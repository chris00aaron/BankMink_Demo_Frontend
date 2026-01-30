/**
 * Servicio de ATM (Cajeros Automáticos)
 * Centraliza todas las llamadas a la API relacionadas con cajeros y predicciones
 */

import { apiClient } from "@shared/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@shared/api";

// ===== TIPOS =====

export interface ATM {
  id: string;
  atmId: string;
  ubicacion: string;
  tipo: string;
  nivelEfectivo: number;
  estado: "normal" | "alerta" | "critico";
  ultimaRecarga: string;
  latitud?: number;
  longitud?: number;
}

export interface ATMPrediction {
  atmId: string;
  fecha: string;
  demandaPredicha: number;
  limiteInferior: number;
  limiteSuperior: number;
  confianza: number;
  factoresInfluencia?: {
    factor: string;
    impacto: number;
  }[];
}

export interface HistoricoRetiro {
  id: string;
  atmId: string;
  fecha: string;
  monto: number;
  tipoTransaccion: string;
  timestamp: string;
}

export interface SimulationParams {
  fecha: string;
  clima: number; // 1: Soleado, 2: Lluvia, 3: Evento
  nivelCarga: number;
  atmIds?: string[];
}

export interface SimulationResult {
  atmId: string;
  demandaPredicha: number;
  limiteInferior: number;
  limiteSuperior: number;
  riesgo: "bajo" | "medio" | "alto";
  recomendacion: string;
}

export interface ATMFilters extends PaginationParams {
  estado?: "normal" | "alerta" | "critico";
  tipo?: string;
  ubicacion?: string;
}

export interface HistoricoFilters extends PaginationParams {
  atmId?: string;
  startDate?: string;
  endDate?: string;
}

// ===== SERVICIO =====

export const atmService = {
  /**
   * Obtener lista de ATMs
   */
  async getATMs(filters?: ATMFilters): Promise<PaginatedResponse<ATM>> {
    const response = await apiClient.get<PaginatedResponse<ATM>>("/atm", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtener un ATM por ID
   */
  async getATMById(atmId: string): Promise<ApiResponse<ATM>> {
    const response = await apiClient.get<ApiResponse<ATM>>(`/atm/${atmId}`);
    return response.data;
  },

  /**
   * Obtener predicción de un ATM
   */
  async getPrediction(
    atmId: string,
    fecha?: string,
  ): Promise<ApiResponse<ATMPrediction>> {
    const response = await apiClient.get<ApiResponse<ATMPrediction>>(
      `/atm/${atmId}/prediction`,
      { params: { fecha } },
    );
    return response.data;
  },

  /**
   * Obtener predicciones de múltiples ATMs
   */
  async getPredictions(fecha?: string): Promise<ApiResponse<ATMPrediction[]>> {
    const response = await apiClient.get<ApiResponse<ATMPrediction[]>>(
      "/atm/predictions",
      { params: { fecha } },
    );
    return response.data;
  },

  /**
   * Obtener histórico de retiros
   */
  async getHistorico(
    filters?: HistoricoFilters,
  ): Promise<PaginatedResponse<HistoricoRetiro>> {
    const response = await apiClient.get<PaginatedResponse<HistoricoRetiro>>(
      "/simulador/retiro-efectivo-atm/historico",
      { params: filters },
    );
    return response.data;
  },

  /**
   * Ejecutar simulación
   */
  async runSimulation(
    params: SimulationParams,
  ): Promise<ApiResponse<SimulationResult[]>> {
    const response = await apiClient.post<ApiResponse<SimulationResult[]>>(
      "/atm/simulation",
      params,
    );
    return response.data;
  },

  /**
   * Obtener estadísticas resumen
   */
  async getStats(): Promise<
    ApiResponse<{
      totalATMs: number;
      atmsCriticos: number;
      atmsAlerta: number;
      demandaTotalHoy: number;
      retirosHoy: number;
      depositosHoy: number;
    }>
  > {
    const response = await apiClient.get("/atm/stats");
    return response.data;
  },

  /**
   * Obtener métricas del modelo predictivo
   */
  async getModelMetrics(): Promise<
    ApiResponse<{
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      lastUpdated: string;
    }>
  > {
    const response = await apiClient.get("/atm/model-metrics");
    return response.data;
  },

  /**
   * Programar recarga de ATM
   */
  async scheduleRefill(
    atmId: string,
    data: {
      fecha: string;
      monto: number;
      prioridad: "alta" | "media" | "baja";
    },
  ): Promise<ApiResponse<{ success: boolean; ticketId: string }>> {
    const response = await apiClient.post(`/atm/${atmId}/refill`, data);
    return response.data;
  },
};

export default atmService;
