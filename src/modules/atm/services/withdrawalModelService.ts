/**
 * Servicio de Modelo de Predicción de Retiros
 * Centraliza todas las llamadas a la API relacionadas con el modelo de predicción de retiros
 */

import { apiClient } from "@shared/api";
import type { ApiResponse, SpringPage } from "@shared/api";

export interface ModelProductionDTO {
  nombreModelo: string;
  mape: number;
  mae: number;
  rmse: number;
  desde: string; // LocalDate
}

export interface RegistroAutoentrenamientoDTO {
  id: number;
  nombreModelo: string;
  startTraining: string; // LocalDateTime
  endTraining: string; // LocalDateTime
  trainingDurationMinutes: number;
  mae: number;
  mape: number;
  rmse: number;
  isProduction: boolean;
}

export interface DatasetDetailsDTO {
  total: number;
  train: number;
  test: number;
  fechaInicial: string; // LocalDate
  fechaFinal: string; // LocalDate
}

export interface RegistroAutoentrenamientoDetailsDTO {
  codigo: number;
  nombreModelo: string;
  fechaInicioEntrenamiento: string; // LocalDateTime
  fechaFinEntrenamiento: string; // LocalDateTime
  duracionEntrenamientoMinutos: number;
  mae: number;
  mape: number;
  rmse: number;
  hyperparameters: Record<string, string>;
  isProduction: boolean; // Note: using 'isProduction' to match Java boolean getter convention if simplified, or 'production' if field name
  datasetDetails: DatasetDetailsDTO;
}

export const withdrawalModelService = {
  /**
   * Obtiene la información del modelo actual en producción
   */
  async getProductionModel(): Promise<ApiResponse<ModelProductionDTO>> {
    const response =
      await apiClient.get<ApiResponse<ModelProductionDTO>>("/atm/model/production");
    return response.data;
  },

  /**
   * Obtiene el historial de auditoría de autoentrenamiento con paginación
   */
  async getTrainingHistory(
    page: number = 0,
    size: number = 5,
  ): Promise<ApiResponse<SpringPage<RegistroAutoentrenamientoDTO>>> {
    const response = await apiClient.get<
      ApiResponse<SpringPage<RegistroAutoentrenamientoDTO>>
    >("/atm/self-training/history", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Obtiene los detalles de un registro de autoentrenamiento específico
   */
  async getTrainingDetails(
    id: number,
  ): Promise<ApiResponse<RegistroAutoentrenamientoDetailsDTO>> {
    const response = await apiClient.get<
      ApiResponse<RegistroAutoentrenamientoDetailsDTO>
    >(`/atm/self-training/${id}`);
    return response.data;
  },
};
