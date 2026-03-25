import React from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import { ServiceType } from '../types/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredService?: ServiceType; // Opcional: para validar permisos específicos
}

export const ProtectedRoute = ({ children, requiredService }: ProtectedRouteProps) => {
  const { isAuthenticated, hasAccessToService} = useAuth();

  // 1. Si no está autenticado, no mostramos nada (la lógica de redirección va en el AppContent)
  if (!isAuthenticated) {
    return null; 
  }

  // 2. Si se requiere un servicio específico y el usuario NO tiene acceso
  if (requiredService && !hasAccessToService(requiredService)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600">No tienes permisos para acceder a este módulo bancario.</p>
      </div>
    );
  }
  
  // 3. Si todo está bien, renderizamos el contenido
  return <>{children}</>;
};