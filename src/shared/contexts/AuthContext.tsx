import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { setTokens, clearTokens, getAccessToken, AUTH_EVENTS } from '../services/apiClient';

// URL base de la API
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

/**
 * Mapea roles del backend a roles del frontend
 */
const mapRole = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'ADMIN': 'admin',
    'OPERARIO_MOROSIDAD': 'operario-morosidad',
    'OPERARIO_ANOMALIAS': 'operario-anomalias',
    'OPERARIO_DEMANDA_EFECTIVO': 'operario-demanda-efectivo',
    'OPERARIO_FUGA_DEMANDA': 'operario-fuga-demanda',
  };
  return roleMap[backendRole] || 'operario-morosidad';
};

/**
 * CREDENCIALES DE ACCESO (Base de Datos):
 * 
 * ADMINISTRADOR:
 * - Email: admin@bankmind.com
 * - Contraseña: admin123
 * - Acceso: Todos los servicios + Auditoría + Gestión de Usuarios
 * 
 * OPERARIOS:
 * - Email: morosidad@bankmind.com | Contraseña: 123456 | Servicio: Morosidad Detalle
 * - Email: anomalias@bankmind.com | Contraseña: 123456 | Servicio: Anomalías Transaccionales
 * - Email: demanda@bankmind.com | Contraseña: 123456 | Servicio: Demanda Efectivo
 * - Email: fuga@bankmind.com | Contraseña: 123456 | Servicio: Fuga Demanda
 */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaState, setMfaState] = useState<MfaState | null>(null);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Escuchar eventos de logout forzado (cuando el token expira)
  useEffect(() => {
    const handleLogoutRequired = () => {
      setUser(null);
      setMfaState(null);
      setPasswordChangeRequired(false);
      setTempToken(null);
    };

    window.addEventListener(AUTH_EVENTS.LOGOUT_REQUIRED, handleLogoutRequired);
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGOUT_REQUIRED, handleLogoutRequired);
    };
  }, []);

  /**
   * Paso 1: Login con email y contraseña
   * Envía las credenciales al backend y recibe estado MFA
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const data = response.data;

      if (data.success && data.data) {
        const loginData = data.data;

        // Si requiere cambio de contraseña
        if (loginData.requiresPasswordChange) {
          setPasswordChangeRequired(true);
          setTempToken(loginData.accessToken);
          return { success: true };
        }

        // Si requiere MFA (flujo normal)
        if (loginData.requiresMfa) {
          setMfaState({
            required: true,
            email: email,
            phoneHint: loginData.phoneHint || '****',
            mfaToken: loginData.mfaToken,
          });
          return { success: true };
        }

        return { success: true };
      }

      return { success: false, error: data.message || 'Error en el login' };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Credenciales inválidas';
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Error de conexión con el servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Paso 2: Verificar código OTP y obtener tokens
   */
  const verifyOtp = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!mfaState?.mfaToken) {
      return { success: false, error: 'No hay sesión MFA activa' };
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        mfaToken: mfaState.mfaToken,
        code: code
      });

      const data = response.data;

      if (data.success && data.data) {
        const authData = data.data;

        // Guardar tokens
        setTokens(authData.accessToken, authData.refreshToken);

        // Mapear usuario
        const userData = authData.user;
        const newUser: User = {
          id: userData.id,
          email: userData.email,
          name: userData.fullName,
          role: mapRole(userData.role),
        };

        setUser(newUser);
        setMfaState(null);
        return { success: true };
      }

      return { success: false, error: data.message || 'Código incorrecto' };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Código OTP incorrecto';
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Error de conexión con el servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reenviar código OTP
   */
  const resendOtp = async (): Promise<{ success: boolean; error?: string }> => {
    if (!mfaState?.email) {
      return { success: false, error: 'No hay sesión MFA activa' };
    }

    setIsLoading(true);
    try {
      // Reenviar haciendo un nuevo login
      // En el backend actual no hay endpoint específico de resend
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancelar flujo MFA
   */
  const cancelMfa = () => {
    setMfaState(null);
  };

  /**
   * Solicitar recuperación de contraseña
   */
  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      const data = response.data;
      return { success: data.success, error: data.message };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return { success: true }; // Siempre devolver éxito por seguridad
      }
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Finalizar cambio de contraseña
   */
  const finalizePasswordChange = () => {
    setPasswordChangeRequired(false);
    setTempToken(null);
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, null, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
      }
    } catch (error) {
      // Ignorar errores de logout
    } finally {
      clearTokens();
      setUser(null);
      setMfaState(null);
      setPasswordChangeRequired(false);
      setTempToken(null);
    }
  };

  /**
   * Verificar si el usuario es administrador
   */
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  /**
   * Verificar si el usuario tiene acceso a un servicio
   */
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
        finalizePasswordChange,
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