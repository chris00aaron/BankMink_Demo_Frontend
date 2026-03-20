// Tipos de Roles de usuario
export type UserRole =
  | 'admin'
  | 'operario-anomalias';

// Tipos de Servicios disponibles
export type ServiceType =
  | 'anomalias-transaccionales'
  | 'auditoria'
  | 'gestion-usuarios';

/**
 * Interfaz que define el usuario autenticado
 */
export interface User {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  firstName?: string;
  surname?: string;
  role: UserRole;
}

/**
 * Estado de autenticación multi-factor (MFA)
 */
export interface MfaState {
  required: boolean;
  email: string;
  emailHint: string;
  mfaToken: string;
  expiresAt?: string;
}

/**
 * Interfaz del contexto de autenticación
 */
export interface AuthContextType {
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