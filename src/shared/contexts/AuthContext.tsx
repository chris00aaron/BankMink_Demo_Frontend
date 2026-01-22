import { useState, ReactNode, useMemo, useCallback } from 'react';
import { User, UserRole, ServiceType } from '../types/auth.types';
import { mockUsers } from '../constants/mockData';
import { AuthContext } from './AuthContextDefinition';

/**
 * AuthProvider {funcion} : proveedor de autenticación que envuelve toda la aplicación
 * children {propiedad} : componentes hijos que pueden acceder al contexto
*/
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

  // 1. Envolvemos las funciones en useCallback, para que no se re-rendericen innecesariamente 
  // las funciones login y logout no dependen de variables externas
  const login = useCallback((username: string, password: string, remember: boolean): boolean => {
    const foundUser = mockUsers[username];
    if (foundUser && foundUser.password === password) {
      setUser({ username, role: foundUser.role, name: foundUser.name });
      if (remember) localStorage.setItem('xrai-remember', 'true');
      return true;
    }

    return false;
  }, []); // Referencia estable, nunca cambia

  // useCallback {funcion} : crea una funcion que puede ser reutilizada
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('xrai-remember');
  }, []);

  // useCallback {funcion} : crea una funcion que puede ser reutilizada
  const hasAccessToService = useCallback((service: ServiceType): boolean => {
    if (!user) return false;

    if (user.role === 'admin') return true;
    
    const permissions: Record<ServiceType, UserRole[]> = {
      'morosidad-detalle': ['operario-morosidad'],
      'anomalias-transaccionales': ['operario-anomalias'],
      'demanda-efectivo': ['operario-demanda-efectivo'],
      'fuga-demanda': ['operario-fuga-demanda'],
      'auditoria': [],
      'gestion-usuarios': [],
    };
    
    /**
     * "Busca la lista de roles permitidos para este servicio. (permissions[service])
     * Si existe, verifica si el rol del usuario está en la lista. (includes(user.role))
     * Si no existe la lista o algo es undefined, devuelve false. (?? false)"
     */
      return permissions[service]?.includes(user.role) ?? false;

  }, [user]); // Se actualiza solo si el usuario cambia

  /**
   * useMemo {funcion} : evalua si el usuario tiene permiso para acceder al servicio, memoiza el resultado
   * "Agrupa el estado y las funciones en un solo objeto. (user, isAuthenticated, isAdmin, login, logout, hasAccessToService)"
   */
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    hasAccessToService
  }), [user, login, logout, hasAccessToService]);

  /**
   * "El AuthContext.Provider envuelve toda la aplicación y proporciona el contexto a los componentes hijos."
   * "value {propiedad} : datos que se van a pasar al contexto"
   */
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}