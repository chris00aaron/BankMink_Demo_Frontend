/**
 * Servicio de autenticación
 * Centraliza todas las llamadas a la API relacionadas con autenticación
 */

import { apiClient, setAuthToken } from "@shared/api";
import type { ApiResponse } from "@shared/api";

// ===== TIPOS =====

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    email?: string;
  };
  requiresPasswordChange?: boolean;
  tempToken?: string;
}

export interface ChangePasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

// ===== SERVICIO =====

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials,
    );

    // Guardar token si existe
    if (response.data.data?.token) {
      setAuthToken(response.data.data.token);
    }

    return response.data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Limpiar token incluso si hay error
      setAuthToken(null);
    }
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(
    data: ChangePasswordData,
    tempToken?: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const headers: Record<string, string> = {};

    if (tempToken) {
      headers["Authorization"] = `Bearer ${tempToken}`;
    }

    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      "/auth/change-password",
      data,
      { headers },
    );

    return response.data;
  },

  /**
   * Refrescar token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response =
      await apiClient.post<ApiResponse<{ token: string }>>("/auth/refresh");

    if (response.data.data?.token) {
      setAuthToken(response.data.data.token);
    }

    return response.data;
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response =
      await apiClient.get<ApiResponse<UserProfile>>("/auth/profile");
    return response.data;
  },

  /**
   * Registrar nuevo usuario (solo admin)
   */
  async register(data: RegisterData): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      "/auth/register",
      data,
    );
    return response.data;
  },

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(
    email: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      "/auth/request-password-reset",
      { email },
    );
    return response.data;
  },
};

export default authService;
