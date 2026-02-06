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
  cancelMfa: () => void;
  finalizePasswordChange: () => void;
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
   //Esto podra ser usado despues de implementar el backend

  /**
   * Inicializamos el estado directamente leyendo localStorage
   * "useState {funcion} : crea un estado que puede ser modificado"
   * "user {estado} : usuario autenticado"
   * "setUser {funcion} : modifica el estado del usuario"
   */
  /*const [user, setUser] = useState<User | null>(() => {
    const rememberMe = localStorage.getItem('xrai-remember');
    if (rememberMe === 'true') {
      const admin = mockUsers['admin'];
      return { username: 'admin', role: admin.role, name: admin.name };
    }
    return null;
  });*/

  const [user, setUser] = useState<User | null>(null);

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

  const hasAccessToService = (service: ServiceType): boolean => {
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