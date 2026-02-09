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

export interface RetiroEfectivoAtmPrediccionDTO {
  idAtm: number;
  retiroPrevisto: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
}

export interface RetiroHistoricoDTO {
  atm: number;
  retiroHistorico: number;
  retiroPrevisto: number;
}

export interface RetiroEfectivoAtmPrediccionResumenDTO {
  totalRetirosPrevisto: number;
  totalRetirosPrevistoOptimista: number;
  totalRetirosPrevistoPesimista: number;
}

export interface PrediccionDeRetirosDTO {
  predicciones: RetiroEfectivoAtmPrediccionDTO[];
  retirosHistoricos: RetiroHistoricoDTO[];
  resumen: RetiroEfectivoAtmPrediccionResumenDTO;
}

export interface SimulationParams {
  fechaObjetivo: string;
  idWeather: number; // El id del clima
  nivelCarga: number;
}

export interface SimulationResult {
  atmId: string;
  demandaPredicha: number;
  limiteInferior: number;
  limiteSuperior: number;
  riesgo: "bajo" | "medio" | "alto";
  recomendacion: string;
}

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

export interface ATMFilters extends PaginationParams {
  estado?: "normal" | "alerta" | "critico";
  tipo?: string;
  ubicacion?: string;
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
   * Ejecutar simulación
   */
  async runSimulation(
    params: SimulationParams,
  ): Promise<PrediccionDeRetirosDTO> {
    const response = await apiClient.post<PrediccionDeRetirosDTO>(
      "/atm/simulador/retiro-efectivo-atm/historico",
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
};

export default atmService;
