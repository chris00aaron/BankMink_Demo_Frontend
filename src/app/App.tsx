import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, ServiceType } from './contexts/AuthContext';
import { XRAISidebar } from './components/XRAISidebar';
import { XRAILoginScreen } from './components/XRAILoginScreen';
import { XRAIHomePage } from './components/XRAIHomePage';
import { XRAIDashboard } from './components/XRAIDashboard';
import { XRAIBatchPrediction } from './components/XRAIBatchPrediction';
import { XRAIIndividualPrediction } from './components/XRAIIndividualPrediction';
import { XRAIRiskAnalysis } from './components/XRAIRiskAnalysis';
import { ServicePlaceholder } from './components/ServicePlaceholder';
import { AuditoriaModule } from './components/AuditoriaModule';
import { GestionUsuariosModule } from './components/GestionUsuariosModule';
import { TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, login, logout, hasAccessToService, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | ServiceType>('home');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (username: string, password: string, rememberPassword: boolean) => {
    const success = login(username, password, rememberPassword);
    if (success) {
      setLoginError('');
      setCurrentView('home'); // Temporarily set to home, will be updated by useEffect
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  // Redirect operarios to their service after login
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (!isAdmin()) {
        // Map user role to service
        const serviceMap: Record<string, ServiceType> = {
          'operario-morosidad': 'morosidad-detalle',
          'operario-anomalias': 'anomalias-transaccionales',
          'operario-demanda-efectivo': 'demanda-efectivo',
          'operario-fuga-demanda': 'fuga-demanda',
        };
        const targetService = serviceMap[user.role];
        if (targetService) {
          setCurrentView(targetService);
        }
      } else {
        // Admin goes to home
        if (currentView !== 'home' && 
            currentView !== 'auditoria' && 
            currentView !== 'gestion-usuarios' &&
            currentView !== 'morosidad-detalle' &&
            currentView !== 'anomalias-transaccionales' &&
            currentView !== 'demanda-efectivo' &&
            currentView !== 'fuga-demanda') {
          setCurrentView('home');
        }
      }
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    setCurrentView('home');
    setCurrentScreen('dashboard');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleNavigateToService = (service: ServiceType) => {
    // Verificar si el usuario tiene acceso al servicio
    if (hasAccessToService(service)) {
      setCurrentView(service);
      if (service === 'anomalias-transaccionales') {
        setCurrentScreen('dashboard');
      }
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  // Pantalla de Login
  if (!isAuthenticated) {
    return <XRAILoginScreen onLogin={handleLogin} loginError={loginError} />;
  }

  // Página Principal (HomePage) - Solo para admin
  if (currentView === 'home' && isAdmin()) {
    return <XRAIHomePage onNavigateToService={handleNavigateToService} onLogout={handleLogout} />;
  }

  // Módulo de Auditoría - Solo admin
  if (currentView === 'auditoria') {
    return <AuditoriaModule onBack={handleBackToHome} />;
  }

  // Módulo de Gestión de Usuarios - Solo admin
  if (currentView === 'gestion-usuarios') {
    return <GestionUsuariosModule onBack={handleBackToHome} />;
  }

  // Servicio: Morosidad Detalle
  if (currentView === 'morosidad-detalle') {
    return (
      <ServicePlaceholder
        serviceName="Morosidad Detalle"
        icon={TrendingDown}
        description="Análisis detallado de patrones de morosidad y predicción de incumplimiento de pagos"
        onBack={handleBackToHome}
      />
    );
  }

  // Servicio: Demanda Efectivo
  if (currentView === 'demanda-efectivo') {
    return (
      <ServicePlaceholder
        serviceName="Demanda Efectivo"
        icon={DollarSign}
        description="Predicción de demanda de efectivo en cajeros automáticos y sucursales bancarias"
        onBack={handleBackToHome}
      />
    );
  }

  // Servicio: Fuga Demanda
  if (currentView === 'fuga-demanda') {
    return (
      <ServicePlaceholder
        serviceName="Fuga Demanda"
        icon={AlertTriangle}
        description="Detección temprana de clientes con riesgo de abandonar productos o servicios bancarios"
        onBack={handleBackToHome}
      />
    );
  }

  // Servicio: Anomalías Transaccionales (Detección de Fraude)
  if (currentView === 'anomalias-transaccionales') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <XRAISidebar 
          currentScreen={currentScreen} 
          onNavigate={handleNavigate}
          onBackToHome={isAdmin() ? handleBackToHome : undefined}
        />

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Page Content */}
          <main className="p-8">
            {currentScreen === 'dashboard' && <XRAIDashboard />}
            {currentScreen === 'batch' && <XRAIBatchPrediction />}
            {currentScreen === 'individual' && <XRAIIndividualPrediction />}
            {currentScreen === 'risk-analysis' && <XRAIRiskAnalysis />}
          </main>
        </div>
      </div>
    );
  }

  // Fallback a home
  return <XRAIHomePage onNavigateToService={handleNavigateToService} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}