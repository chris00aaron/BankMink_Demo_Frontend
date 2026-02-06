import { apiClient } from "@shared/api";
import type { ApiResponse } from "@shared/api";

// ===== TIPOS =====

export interface Weather {
  id: number;
  name: string;
}

// ===== SERVICIOS =====

export const weatherService = {
  /**
   * Obtener clima
   */
  async getWeather(): Promise<ApiResponse<Weather[]>> {
    const response = await apiClient.get<ApiResponse<Weather[]>>("/weather");
    return response.data;
  },
};
