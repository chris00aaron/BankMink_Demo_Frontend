// Tipos de Roles de usuario
export type UserRole = 
  | 'admin' 
  | 'operario-morosidad' 
  | 'operario-anomalias' 
  | 'operario-demanda-efectivo' 
  | 'operario-fuga-demanda';

// Tipos de Servicios disponibles
export type ServiceType = 
  | 'morosidad-detalle' 
  | 'anomalias-transaccionales' 
  | 'demanda-efectivo' 
  | 'fuga-demanda'
  | 'auditoria'
  | 'gestion-usuarios';

/**
 * Interfaz que define el usuario autenticado
 * @property {string} username - Nombre de usuario
 * @property {UserRole} role - Rol del usuario
 * @property {string} name - Nombre del usuario
 */
export interface User {
  username: string;
  role: UserRole;
  name: string;
}

/**
 * Interfaz que define el contexto de autenticacion, el cual contiene:
 * @property {User | null} user - Usuario autenticado
 * @property {boolean} isAuthenticated - Indica si el usuario esta autenticado
 * @property {function} login - Funcion para iniciar session
 * @property {function} logout - Funcion para cerrar session
 * @property {function} hasAccessToService - Funcion para verificar si el usuario tiene acceso a un servicio
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string, rememberPassword: boolean) => boolean;
  logout: () => void;
  hasAccessToService: (service: ServiceType) => boolean;
}