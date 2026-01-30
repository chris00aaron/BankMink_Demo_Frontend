/**
 * Servicio de detección de fraude
 * Centraliza todas las llamadas a la API relacionadas con anomalías transaccionales
 */

import { apiClient } from "@shared/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@shared/api";

// ===== TIPOS =====

export interface Transaccion {
  id: string;
  clienteId: string;
  fecha: string;
  monto: number;
  tipo: string;
  canal: string;
  ubicacion: string;
  estado: "normal" | "sospechosa" | "fraudulenta";
  scoreRiesgo: number;
}

export interface Alerta {
  id: string;
  transaccionId: string;
  tipo: string;
  severidad: "baja" | "media" | "alta" | "critica";
  descripcion: string;
  estado: "pendiente" | "revisando" | "resuelta" | "descartada";
  creadaEn: string;
  asignadoA?: string;
}

export interface ClienteRiesgo {
  clienteId: string;
  nombre: string;
  scoreRiesgo: number;
  categoriasRiesgo: string[];
  transaccionesSospechosas: number;
  ultimaActividad: string;
}

export interface TransaccionFilters extends PaginationParams {
  clienteId?: string;
  estado?: "normal" | "sospechosa" | "fraudulenta";
  startDate?: string;
  endDate?: string;
  montoMin?: number;
  montoMax?: number;
}

export interface AlertaFilters extends PaginationParams {
  severidad?: "baja" | "media" | "alta" | "critica";
  estado?: "pendiente" | "revisando" | "resuelta" | "descartada";
  asignadoA?: string;
}

// ===== SERVICIO =====

export const fraudeService = {
  /**
   * Obtener transacciones con filtros
   */
  async getTransacciones(
    filters?: TransaccionFilters,
  ): Promise<PaginatedResponse<Transaccion>> {
    const response = await apiClient.get<PaginatedResponse<Transaccion>>(
      "/fraude/transacciones",
      { params: filters },
    );
    return response.data;
  },

  /**
   * Obtener detalles de una transacción
   */
  async getTransaccion(id: string): Promise<ApiResponse<Transaccion>> {
    const response = await apiClient.get<ApiResponse<Transaccion>>(
      `/fraude/transacciones/${id}`,
    );
    return response.data;
  },

  /**
   * Obtener alertas
   */
  async getAlertas(
    filters?: AlertaFilters,
  ): Promise<PaginatedResponse<Alerta>> {
    const response = await apiClient.get<PaginatedResponse<Alerta>>(
      "/fraude/alertas",
      { params: filters },
    );
    return response.data;
  },

  /**
   * Actualizar estado de una alerta
   */
  async updateAlertaEstado(
    id: string,
    estado: Alerta["estado"],
    comentario?: string,
  ): Promise<ApiResponse<Alerta>> {
    const response = await apiClient.patch<ApiResponse<Alerta>>(
      `/fraude/alertas/${id}`,
      { estado, comentario },
    );
    return response.data;
  },

  /**
   * Asignar alerta a un usuario
   */
  async asignarAlerta(
    id: string,
    userId: string,
  ): Promise<ApiResponse<Alerta>> {
    const response = await apiClient.patch<ApiResponse<Alerta>>(
      `/fraude/alertas/${id}/asignar`,
      { userId },
    );
    return response.data;
  },

  /**
   * Obtener clientes con alto riesgo
   */
  async getClientesRiesgo(
    limit?: number,
  ): Promise<ApiResponse<ClienteRiesgo[]>> {
    const response = await apiClient.get<ApiResponse<ClienteRiesgo[]>>(
      "/fraude/clientes-riesgo",
      { params: { limit } },
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de fraude
   */
  async getStats(): Promise<
    ApiResponse<{
      alertasPendientes: number;
      transaccionesSospechosas24h: number;
      montoEnRiesgo: number;
      tasaDeteccion: number;
    }>
  > {
    const response = await apiClient.get("/fraude/stats");
    return response.data;
  },

  /**
   * Reportar transacción como fraudulenta
   */
  async reportarFraude(
    transaccionId: string,
    data: {
      motivo: string;
      evidencia?: string;
    },
  ): Promise<ApiResponse<{ alertaId: string }>> {
    const response = await apiClient.post(
      `/fraude/transacciones/${transaccionId}/reportar`,
      data,
    );
    return response.data;
  },
};

export default fraudeService;
