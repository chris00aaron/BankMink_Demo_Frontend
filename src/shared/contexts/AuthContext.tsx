import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { setTokens, clearTokens, AUTH_EVENTS } from '../services/apiClient';

// API Base URL - ajustar según tu entorno
const API_BASE_URL = 'http://localhost:8080/api';

export type UserRole =
  | 'admin'
  | 'operario-morosidad'
  | 'operario-anomalias'
  | 'operario-demanda-efectivo'
  | 'operario-fuga-demanda';

export type ServiceType =
  | 'morosidad-detalle'
  | 'anomalias-transaccionales'
  | 'demanda-efectivo'
  | 'fuga-demanda'
  | 'auditoria'
  | 'gestion-usuarios';

export interface User {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  firstName?: string;
  surname?: string;
  role: UserRole;
}

export interface MfaState {
  required: boolean;
  email: string;
  phoneHint: string;
  mfaToken: string;
  expiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaState: MfaState | null;
  passwordChangeRequired: boolean;
  tempToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: () => Promise<{ success: boolean; error?: string }>;
  cancelMfa: () => void;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  finalizePasswordChange: () => void;
  hasAccessToService: (service: ServiceType) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapeo de roles del backend a roles del frontend
const roleMapping: Record<string, UserRole> = {
  'ADMIN': 'admin',
  'OPERARIO_MOROSIDAD': 'operario-morosidad',
  'OPERARIO_ANOMALIAS': 'operario-anomalias',
  'OPERARIO_DEMANDA_EFECTIVO': 'operario-demanda-efectivo',
  'OPERARIO_FUGA_DEMANDA': 'operario-fuga-demanda',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaState, setMfaState] = useState<MfaState | null>(null);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [lastLoginCredentials, setLastLoginCredentials] = useState<{ email: string; password: string } | null>(null);

  // Escuchar evento de logout forzado desde apiClient
  useEffect(() => {
    const handleForcedLogout = () => {
      console.log('🚪 Logout forzado recibido desde apiClient');
      setUser(null);
      setMfaState(null);
      setLastLoginCredentials(null);
    };

    window.addEventListener(AUTH_EVENTS.LOGOUT_REQUIRED, handleForcedLogout);
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGOUT_REQUIRED, handleForcedLogout);
    };
  }, []);

  // Función helper para hacer requests a la API
  const apiRequest = useCallback(async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
    token?: string
  ) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }

    return data;
  }, []);

  // Paso 1: Login con email y contraseña
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/login', 'POST', { email, password });

      // Caso: Cambio de contraseña obligatorio
      if (response.success && response.data?.requiresPasswordChange) {
        setPasswordChangeRequired(true);
        if (response.data.accessToken) {
          setTempToken(response.data.accessToken);
        }
        return { success: true };
      }

      // Caso exitoso: MFA requerido
      if (response.success && response.data?.requiresMfa) {
        setMfaState({
          required: true,
          email: response.data.email || email,
          phoneHint: response.data.phoneHint || '***',
          mfaToken: response.data.mfaToken || '',
          expiresAt: response.data.otpExpiresAt,
        });
        setLastLoginCredentials({ email, password });
        return { success: true };
      }

      // Caso: Login directo sin MFA (si el backend lo permite)
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const mappedRole = roleMapping[userData.role?.toUpperCase()] || 'operario-morosidad';

        setUser({
          ...userData,
          role: mappedRole,
        });

        if (response.data.accessToken) {
          setTokens(response.data.accessToken, response.data.refreshToken);
        }

        return { success: true };
      }

      return { success: false, error: response.message || 'Credenciales incorrectas' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Paso 2: Verificar código OTP (MFA)
  const verifyOtp = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!mfaState) {
      return { success: false, error: 'No hay sesión MFA activa' };
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/verify-otp', 'POST', {
        mfaToken: mfaState.mfaToken,
        code: code,
      });

      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const mappedRole = roleMapping[userData.role?.toUpperCase()] || 'operario-morosidad';

        setUser({
          ...userData,
          role: mappedRole,
        });

        setMfaState(null);
        setLastLoginCredentials(null);

        if (response.data.accessToken) {
          setTokens(response.data.accessToken, response.data.refreshToken);
        }

        return { success: true };
      }

      return { success: false, error: response.message || 'Código incorrecto' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de verificación';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [mfaState, apiRequest]);

  // Reenviar código OTP
  const resendOtp = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!lastLoginCredentials) {
      return { success: false, error: 'No hay credenciales para reenviar' };
    }
    return login(lastLoginCredentials.email, lastLoginCredentials.password);
  }, [lastLoginCredentials, login]);

  // Cancelar flujo MFA
  const cancelMfa = useCallback(() => {
    setMfaState(null);
    setLastLoginCredentials(null);
  }, []);

  // Cerrar sesión
  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch {
      // Ignorar errores de logout
    } finally {
      setUser(null);
      setMfaState(null);
      setLastLoginCredentials(null);
      clearTokens();
    }
  }, [apiRequest]);

  // Solicitar cambio de contraseña
  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await apiRequest('/auth/forgot-password', 'POST', { email });
      return { success: true };
    } catch {
      return { success: true }; // Siempre retornar éxito para no revelar si el email existe
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Verificar si es admin
  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user]);

  // Verificar acceso a servicios
  const hasAccessToService = useCallback((service: ServiceType): boolean => {
    if (!user) return false;

    // Administradores tienen acceso a todo
    if (user.role === 'admin') return true;

    // Operarios solo tienen acceso a su servicio
    const serviceRoleMap: Record<ServiceType, UserRole[]> = {
      'morosidad-detalle': ['operario-morosidad'],
      'anomalias-transaccionales': ['operario-anomalias'],
      'demanda-efectivo': ['operario-demanda-efectivo'],
      'fuga-demanda': ['operario-fuga-demanda'],
      'auditoria': [],
      'gestion-usuarios': [],
    };

    return serviceRoleMap[service]?.includes(user.role) || false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        mfaState,
        passwordChangeRequired,
        tempToken,
        login,
        verifyOtp,
        resendOtp,
        cancelMfa,
        logout,
        forgotPassword,
        finalizePasswordChange: () => setPasswordChangeRequired(false),
        hasAccessToService,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}