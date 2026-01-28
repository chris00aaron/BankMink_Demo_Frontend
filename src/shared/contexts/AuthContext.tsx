<<<<<<< Updated upstream
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 
  | 'admin' 
  | 'operario-morosidad' 
  | 'operario-anomalias' 
  | 'operario-demanda-efectivo' 
=======
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { setTokens, clearTokens, AUTH_EVENTS } from '../services/apiClient';

// API Base URL - ajustar según tu entorno
const API_BASE_URL = 'http://localhost:8080/api';

export type UserRole =
  | 'admin'
  | 'operario-morosidad'
  | 'operario-anomalias'
  | 'operario-demanda-efectivo'
>>>>>>> Stashed changes
  | 'operario-fuga-demanda';

export type ServiceType = 
  | 'morosidad-detalle' 
  | 'anomalias-transaccionales' 
  | 'demanda-efectivo' 
  | 'fuga-demanda'
  | 'auditoria'
  | 'gestion-usuarios';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberPassword: boolean) => boolean;
  logout: () => void;
  hasAccessToService: (service: ServiceType) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * CREDENCIALES DE ACCESO:
 * 
 * ADMINISTRADOR:
 * - Usuario: admin
 * - Contraseña: admin123
 * - Acceso: Todos los servicios + Auditoría + Gestión de Usuarios
 * 
 * OPERARIOS:
 * - Usuario: op-morosidad | Contraseña: mora123 | Servicio: Morosidad Detalle
 * - Usuario: op-anomalias | Contraseña: anom123 | Servicio: Anomalías Transaccionales
 * - Usuario: op-demanda | Contraseña: dema123 | Servicio: Demanda Efectivo
 * - Usuario: op-fuga | Contraseña: fuga123 | Servicio: Fuga Demanda
 */

// Usuarios de prueba
const mockUsers: Record<string, { password: string; role: UserRole; name: string }> = {
  'admin': { password: 'admin123', role: 'admin', name: 'Administrador' },
  'op-morosidad': { password: 'mora123', role: 'operario-morosidad', name: 'Operario Morosidad' },
  'op-anomalias': { password: 'anom123', role: 'operario-anomalias', name: 'Operario Anomalías' },
  'op-demanda': { password: 'dema123', role: 'operario-demanda-efectivo', name: 'Operario Demanda Efectivo' },
  'op-fuga': { password: 'fuga123', role: 'operario-fuga-demanda', name: 'Operario Fuga Demanda' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

<<<<<<< Updated upstream
  const login = (username: string, password: string, rememberPassword: boolean): boolean => {
    const mockUser = mockUsers[username];
    
    if (mockUser && mockUser.password === password) {
      const newUser: User = {
        username,
        role: mockUser.role,
        name: mockUser.name,
      };
      setUser(newUser);
      
      if (rememberPassword) {
        localStorage.setItem('xrai-remember', 'true');
=======
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
>>>>>>> Stashed changes
      }
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('xrai-remember');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

<<<<<<< Updated upstream
  const hasAccessToService = (service: ServiceType): boolean => {
=======
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

        // Guardar ambos tokens usando el apiClient centralizado
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
      clearTokens();
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
>>>>>>> Stashed changes
    if (!user) return false;
    
    // Administradores tienen acceso a todo
    if (user.role === 'admin') return true;
    
    // Operarios solo tienen acceso a su servicio
    const serviceRoleMap: Record<ServiceType, UserRole[]> = {
      'morosidad-detalle': ['operario-morosidad'],
      'anomalias-transaccionales': ['operario-anomalias'],
      'demanda-efectivo': ['operario-demanda-efectivo'],
      'fuga-demanda': ['operario-fuga-demanda'],
      'auditoria': [], // Solo admin
      'gestion-usuarios': [], // Solo admin
    };
    
    return serviceRoleMap[service]?.includes(user.role) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
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