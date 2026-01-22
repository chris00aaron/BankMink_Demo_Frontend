import { useState} from 'react';
import { AuthProvider} from '@shared/contexts/AuthContext';
import { useAuth } from '@/shared/hook/useAuth';
import { ServiceType } from '@shared/types/index';
import {FraudeHomePage} from '@modules/fraude';
import { ProtectedRoute } from '@shared/components/ProtectedRoute';
import { LoginScreen } from '@modules/auth/pages/LoginScreen';
import { AuditoriaModule } from '@admin/auditoria/AuditoriaModule';

function AppContent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  // Estados básicos
  const [currentView, setCurrentView] = useState<'home' | ServiceType>('home');
  const [loginError, setLoginError] = useState('');

  /**
   * LÓGICA DE ENRUTAMIENTO (Estado Derivado)
   * Determinamos qué mostrar sin usar useEffect
   */
  let activeView: 'home' | ServiceType = currentView;

  // Redirección automática para operarios
  if (isAuthenticated && user && !isAdmin && currentView === 'home') {
    const serviceMap: Record<string, ServiceType> = {
      'operario-morosidad': 'morosidad-detalle',
      'operario-anomalias': 'anomalias-transaccionales',
      'operario-demanda-efectivo': 'demanda-efectivo',
      'operario-fuga-demanda': 'fuga-demanda',
    };
    activeView = serviceMap[user.role] || 'home';
  }

  // Manejador de Login
  const handleLogin = (username: string, password: string, remember: boolean) => {
    const success = login(username, password, remember);
    if (!success) {
      setLoginError('Usuario o contraseña incorrectos');
    } else {
      setLoginError('');
      // Al tener éxito, el componente se re-renderiza, isAuthenticated cambia,
      // y activeView se calcula solo.
    }
  };

  /**
   * RENDERIZADO
   */
  
  // 1. Capa de Seguridad: Si no hay sesión, fuera.
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} loginError={loginError} />;
  }

  // 2. Capa de Aplicación: Usuario autenticado
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* VISTA HOME (Solo Admin) */}
      {activeView === 'home' && (
        <ProtectedRoute>
          <FraudeHomePage 
            onNavigateToService={setCurrentView} 
            onLogout={logout} 
          />
        </ProtectedRoute>
      )}

      {/* MÓDULO AUDITORÍA */}
      {activeView === 'auditoria' && (
        <ProtectedRoute requiredService="auditoria">
          <AuditoriaModule onBack={() => setCurrentView('home')} />
        </ProtectedRoute>
      )}
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}