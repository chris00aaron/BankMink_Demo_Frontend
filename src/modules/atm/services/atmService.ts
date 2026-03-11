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

// ===== DTOs para Dashboard (DashboardATMController.java) =====

export interface RetiroEfectivoAtmPrediccionDTO {
  idAtm: number;
  retiroPrevisto: number;
  lowerBound: number;
  upperBound: number;
}

export interface RetiroEfectivoAtmPrediccionResumenDTO {
  totalRetirosPrevisto: number;
  totalRetirosPrevistoOptimista: number;
  totalRetirosPrevistoPesimista: number;
}

export interface ResumenOperativoAtmDTO {
  activos: number;
  inactivos: number;
}

export interface RetiroHistoricoDTO {
  atm: number;
  retiroHistorico: number;
  retiroPrevisto: number;
}

export interface SegmentacionRetiroDTO {
  ubicaciones: Record<string, number>;
}

export interface DashboardATMDTO {
  retirosPredichos: RetiroEfectivoAtmPrediccionDTO[];
  resumenRetiroEfectivoAtm: RetiroEfectivoAtmPrediccionResumenDTO;
  resumenOperativoAtms: ResumenOperativoAtmDTO;
  retirosHistoricos: RetiroHistoricoDTO[];
  segmentacionRetiro: SegmentacionRetiroDTO;
  atmsConPotencialDeFaltaStock: number;
  featuresImportancia: Record<string, number>;
}


export interface PrediccionDeRetirosDTO {
  predicciones: RetiroEfectivoAtmPrediccionDTO[];
  retirosHistoricos: RetiroHistoricoDTO[];
  resumen: RetiroEfectivoAtmPrediccionResumenDTO;
}

// ===== DTOs para Estados ATM (DailyWithdrawalPredictionController.java) =====
export interface EstadoAtmDTO {
  idAtm: number;
  direccion: string;
  tipoLugar: string;
  balanceActual: number;
  porcentaje: number;
  estado: string;
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

// ==== DTO para ver el ultimo estado de los atms (AtmController.java)
export interface AtmDetailsDTO {
  id: number;
  maxCapacity: number | null;
  address: string | null;
  locationType: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface ATMCurrentStatus {
  id: number;
  currentBalance: number;
  lastDepositDate: string | null;
  lastReloadDate: string | null;
  lastSyncId: number | null;
  lastTransactionDate: string | null;
  lastWithdrawalDate: string | null;
  updatedAt: string | null;
}

export interface ATMWithStatus extends ATMCurrentStatus {
  atmData: AtmDetailsDTO;
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

  /**
   * Obtener datos del dashboard ATM
   * Endpoint: GET /atm/dashboard (DashboardATMController.java)
   */
  async getDashboard(): Promise<DashboardATMDTO> {
    const response = await apiClient.get<ApiResponse<DashboardATMDTO>>("/atm/dashboard");
    return response.data.data;
  },

  /**
   * Obtener estados de ATMs considerando el nivel de efectivo y la demanda predicha
   * Endpoint: GET /atm/status (AtmController.java)
   */
  async getEstadosAtms(): Promise<EstadoAtmDTO[]> {
    const response =
      await apiClient.get<ApiResponse<EstadoAtmDTO[]>>("/atm/status");
    return response.data.data;
  },

  /**
   * Obtener último estado de los ATMs
   * Endpoint: GET /atm/status/last (AtmController.java)
   */
  async getLastStatus(): Promise<ATMWithStatus[]> {
    const response = await apiClient.get<ApiResponse<ATMWithStatus[]>>("/atm/status/last");
    return response.data.data;
  },
};

export default atmService;
