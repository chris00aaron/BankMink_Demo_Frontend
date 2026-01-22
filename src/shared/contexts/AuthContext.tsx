import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// API Base URL - ajustar según tu entorno
const API_BASE_URL = 'http://localhost:8000/api';

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
  id: number;
  email: string;
  fullName: string;
  dni?: string;
  phone?: string;
  role: string;
  roleName?: string;
}

interface MfaState {
  required: boolean;
  token: string;
  phoneHint: string;
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
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  hasAccessToService: (service: ServiceType) => boolean;
  isAdmin: () => boolean;
  cancelMfa: () => void;
  finalizePasswordChange: () => void;
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
      credentials: 'include', // Importante para cookies httpOnly
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

      // Caso: MFA requerido
      if (response.success && response.data?.requiresMfa) {
        // Guardar credenciales para poder reenviar OTP
        setLastLoginCredentials({ email, password });

        // MFA requerido - mostrar pantalla de OTP
        setMfaState({
          required: true,
          token: response.data.mfaToken,
          phoneHint: response.data.phoneHint,
        });
        return { success: true };
      }

      return { success: false, error: response.message || 'Error inesperado' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Paso 2: Verificar código OTP
  const verifyOtp = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!mfaState?.token) {
      return { success: false, error: 'Sesión de MFA no válida' };
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/verify-otp', 'POST', {
        mfaToken: mfaState.token,
        code,
      });

      if (response.success && response.data?.user) {
        const userData = response.data.user;

        // Mapear rol del backend al frontend
        const mappedRole = roleMapping[userData.role?.toUpperCase()] || 'operario-morosidad';

        setUser({
          ...userData,
          role: mappedRole,
        });

        // Limpiar estado MFA
        setMfaState(null);
        setLastLoginCredentials(null);

        // Guardar token en localStorage para refresh (backup)
        if (response.data.accessToken) {
          localStorage.setItem('bankmind-token', response.data.accessToken);
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

    // Volver a hacer login para generar nuevo OTP
    return login(lastLoginCredentials.email, lastLoginCredentials.password);
  }, [lastLoginCredentials, login]);

  // Cancelar flujo MFA y volver al login
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
      localStorage.removeItem('bankmind-token');
    }
  }, [apiRequest]);

  // Solicitar cambio de contraseña
  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await apiRequest('/auth/forgot-password', 'POST', { email });
      return { success: true };
    } catch (error) {
      // Siempre retornar éxito para no revelar si el email existe
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Verificar si es admin
  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin' || user?.role?.toLowerCase() === 'admin';
  }, [user]);

  // Verificar acceso a servicios
  const hasAccessToService = useCallback((service: ServiceType): boolean => {
    if (!user) return false;

    // Administradores tienen acceso a todo
    if (isAdmin()) return true;

    // Operarios solo tienen acceso a su servicio
    const serviceRoleMap: Record<ServiceType, UserRole[]> = {
      'morosidad-detalle': ['operario-morosidad'],
      'anomalias-transaccionales': ['operario-anomalias'],
      'demanda-efectivo': ['operario-demanda-efectivo'],
      'fuga-demanda': ['operario-fuga-demanda'],
      'auditoria': [], // Solo admin
      'gestion-usuarios': [], // Solo admin
    };

    return serviceRoleMap[service]?.includes(user.role as UserRole) || false;
  }, [user, isAdmin]);

  const finalizePasswordChange = useCallback(() => {
    setPasswordChangeRequired(false);
    // Redirigir a login ya será automático al cambiar el estado
  }, []);

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
        logout,
        forgotPassword,
        hasAccessToService,
        isAdmin,
        cancelMfa,
        finalizePasswordChange,
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