import { useAuth } from '@/shared/hook/useAuth';
import { AuditoriaModule } from '@admin/auditoria/AuditoriaModule';
import { AtmModule } from '@modules/atm/page/AtmModule';
import { LoginScreen } from '@modules/auth/pages/LoginScreen';
import { ProtectedRoute } from '@shared/components/ProtectedRoute';
import { AuthProvider } from '@shared/contexts/AuthContext';
import { HomePage } from '@shared/pages/HomePage';
import { ServiceType } from '@shared/types/index';
import { useState } from 'react';

function AppContent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  // Estados básicos
  const [currentView, setCurrentView] = useState<'home' | ServiceType>('home');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [loginError, setLoginError] = useState('');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * LÓGICA DE ENRUTAMIENTO (Estado Derivado)
   * Determinamos qué mostrar sin usar useEffect
   */
  let activeView: 'home' | ServiceType = currentView;

  if (isAuthenticated && user) {
      if (!isAdmin) {
        // --- Lógica para Operarios ---
        const serviceMap: Record<string, ServiceType> = {
          'operario-morosidad': 'morosidad-detalle',
          'operario-anomalias': 'anomalias-transaccionales',
          'operario-demanda-efectivo': 'demanda-efectivo',
          'operario-fuga-demanda': 'fuga-demanda',
        };

        // Si el operario intenta estar en 'home', lo derivamos a su servicio
        if (currentView === 'home') {
          activeView = serviceMap[user.role] || 'home';
        }
      } else {
        // --- Lógica para Admins ---
        // Lista de vistas a las que un Admin tiene permitido entrar
        const adminViews: string[] = [
          'home', 'auditoria', 'gestion-usuarios', 'morosidad-detalle', 
          'anomalias-transaccionales', 'demanda-efectivo', 'fuga-demanda'
        ];

        // Si la vista actual no está en la lista permitida, lo mandamos a home
        if (!adminViews.includes(currentView)) {
          activeView = 'home';
        }
      }
    }

  // Manejador de Login
  const handleLogin = (username: string, password: string, remember: boolean) => {
    const success = login(username, password, remember);
    if (!success) {
      setLoginError('Usuario o contraseña incorrectos');
    } else {
      setLoginError('');
      // Al tener éxito, el componente se re-renderiza, isAuthenticated cambia y activeView se calcula solo.
    }
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleNavigateToService = (service: ServiceType) => {
    setCurrentView(service);
    setCurrentScreen('dashboard'); // Resetear pantalla interna
  };

  {/* Renderizado */}
  // 1. Capa de Seguridad: Si no hay sesión, fuera.
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} loginError={loginError} />;
  }

  // 2. Capa de Aplicación: Usuario autenticado
  return (
    <div className="min-h-screen bg-gray-50">
      {/* VISTA HOME (Solo Admin) */}
      {activeView === "home" && (
        <ProtectedRoute>
          <HomePage
            onNavigateToService={handleNavigateToService}
            onLogout={logout}
          />
        </ProtectedRoute>
      )}
      
      {/* MÓDULO AUDITORÍA */}
      {activeView === "auditoria" && (
        <ProtectedRoute requiredService="auditoria">
          <AuditoriaModule onBack={() => setCurrentView("home")} />
        </ProtectedRoute>
      )}

      {/* MÓDULO DEMANDA EFECTIVO ATM */}
      {activeView === "demanda-efectivo" && (
        <ProtectedRoute requiredService="demanda-efectivo">
          <AtmModule
            title="Gestión de Demanda de Efectivo de ATM"
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            onBack={ isAdmin? handleBackToHome : undefined}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
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