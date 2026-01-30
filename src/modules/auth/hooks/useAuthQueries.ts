/**
 * Custom hooks para el módulo Auth usando TanStack Query
 * Maneja autenticación, perfil y gestión de contraseñas
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { clearQueryCache } from "@shared/api";
import type {
  LoginCredentials,
  ChangePasswordData,
  RegisterData,
} from "../services/authService";

// ===== QUERY KEYS =====

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// ===== QUERIES =====

/**
 * Hook para obtener el perfil del usuario actual
 */
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authService.getProfile(),
    // El perfil se considera fresco por más tiempo
    staleTime: 10 * 60 * 1000, // 10 minutos
    // No hacer retry en errores de auth
    retry: false,
  });
}

// ===== MUTATIONS =====

/**
 * Hook para login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: () => {
      // Invalidar cualquier query anterior y obtener el perfil
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

/**
 * Hook para logout
 */
export function useLogout() {
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Limpiar todo el caché al hacer logout
      clearQueryCache();
    },
    onError: () => {
      // Limpiar caché incluso si hay error
      clearQueryCache();
    },
  });
}

/**
 * Hook para cambiar contraseña
 */
export function useChangePassword(tempToken?: string) {
  return useMutation({
    mutationFn: (data: ChangePasswordData) =>
      authService.changePassword(data, tempToken),
  });
}

/**
 * Hook para refrescar token
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: () => authService.refreshToken(),
  });
}

/**
 * Hook para registrar usuario (solo admin)
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
  });
}

/**
 * Hook para solicitar reset de contraseña
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });
}
