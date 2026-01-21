import { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { AuthProvider, useAuth, ServiceType } from '@shared/contexts/AuthContext';
import {
  FraudeSidebar,
  FraudeLoginScreen,
  Dashboard as FraudeDashboard,
  BatchPrediction,
  IndividualPrediction,
  RiskAnalysis
} from '@modules/fraude';
import { ClientPrediction, Dashboard as MorosidadDashboard, MorosidadSidebar, BatchPrediction as MorosidadBatchPrediction, EarlyWarnings } from '@modules/morosidad';
import { HomePage } from './pages/HomePage';
import { ServicePlaceholder } from '@shared/components/ServicePlaceholder';
import { AuditoriaModule } from '@admin/auditoria/AuditoriaModule';
import { GestionUsuariosModule } from '@admin/usuarios/GestionUsuariosModule';
import { OtpVerificationScreen } from '@shared/components/OtpVerificationScreen';
import { ForgotPasswordScreen } from '@shared/components/ForgotPasswordScreen';

type AuthScreen = 'login' | 'otp' | 'forgot-password';

function AppContent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    mfaState,
    login,
    verifyOtp,
    resendOtp,
    logout,
    forgotPassword,
    hasAccessToService,
    isAdmin,
    cancelMfa
  } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | ServiceType>('home');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [morosidadScreen, setMorosidadScreen] = useState('dashboard');
  const [loginError, setLoginError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  // Manejar cambio a pantalla OTP cuando se requiere MFA
  useEffect(() => {
    if (mfaState?.required) {
      setAuthScreen('otp');
      setLoginError('');
    }
  }, [mfaState]);

  const handleLogin = async (username: string, password: string, _rememberPassword: boolean) => {
    const result = await login(username, password);
    if (!result.success && result.error) {
      setLoginError(result.error);
    } else {
      setLoginError('');
    }
  };

  const handleVerifyOtp = async (code: string) => {
    const result = await verifyOtp(code);
    if (!result.success && result.error) {
      setOtpError(result.error);
    } else {
      setOtpError('');
      setAuthScreen('login');
    }
  };

  const handleResendOtp = async () => {
    const result = await resendOtp();
    if (!result.success && result.error) {
      setOtpError(result.error);
    } else {
      setOtpError('');
    }
  };

  const handleForgotPassword = async (email: string) => {
    await forgotPassword(email);
    // El componente ForgotPasswordScreen maneja su propio estado de éxito
  };

  const handleBackToLogin = () => {
    setAuthScreen('login');
    setLoginError('');
    setOtpError('');
    cancelMfa();
  };

  // Redirect operarios to their service after login
  useEffect(() => {
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

  const handleLogout = async () => {
    await logout();
    setCurrentView('home');
    setCurrentScreen('dashboard');
    setAuthScreen('login');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleMorosidadNavigate = (screen: string) => {
    setMorosidadScreen(screen);
  };

  const handleNavigateToService = (service: ServiceType) => {
    // Verificar si el usuario tiene acceso al servicio
    if (hasAccessToService(service)) {
      setCurrentView(service);
      if (service === 'anomalias-transaccionales') {
        setCurrentScreen('dashboard');
      }
      if (service === 'morosidad-detalle') {
        setMorosidadScreen('dashboard');
      }
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  // Pantalla de Login
  if (!isAuthenticated) {
    // Pantalla de verificación OTP
    if (authScreen === 'otp' && mfaState) {
      return (
        <OtpVerificationScreen
          phoneHint={mfaState.phoneHint}
          onVerify={handleVerifyOtp}
          onResendCode={handleResendOtp}
          onBack={handleBackToLogin}
          error={otpError}
          isLoading={isLoading}
        />
      );
    }

    // Pantalla de olvidé mi contraseña
    if (authScreen === 'forgot-password') {
      return (
        <ForgotPasswordScreen
          onSubmit={handleForgotPassword}
          onBack={handleBackToLogin}
        />
      );
    }

    // Pantalla de login principal
    return (
      <FraudeLoginScreen
        onLogin={handleLogin}
        onForgotPassword={() => setAuthScreen('forgot-password')}
        loginError={loginError}
        isLoading={isLoading}
      />
    );
  }

  // Página Principal (HomePage) - Solo para admin
  if (currentView === 'home' && isAdmin()) {
    return <HomePage onNavigateToService={handleNavigateToService} onLogout={handleLogout} />;
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
      <div className="min-h-screen bg-gray-50 flex">
        <MorosidadSidebar
          currentScreen={morosidadScreen}
          onNavigate={handleMorosidadNavigate}
          onBackToHome={handleBackToHome}
        />
        <div className="flex-1 ml-64">
          {/* Page Content */}
          <main className="p-8">
            {morosidadScreen === 'dashboard' && <MorosidadDashboard />}
            {morosidadScreen === 'individual' && <ClientPrediction />}
            {morosidadScreen === 'batch' && <MorosidadBatchPrediction />}
            {morosidadScreen === 'alerts' && <EarlyWarnings />}
          </main>
        </div>
      </div>
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
        <FraudeSidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          onBackToHome={isAdmin() ? handleBackToHome : undefined}
        />

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Page Content */}
          <main className="p-8">
            {currentScreen === 'dashboard' && <FraudeDashboard />}
            {currentScreen === 'batch' && <BatchPrediction />}
            {currentScreen === 'individual' && <IndividualPrediction />}
            {currentScreen === 'risk-analysis' && <RiskAnalysis />}
          </main>
        </div>
      </div>
    );
  }

  // Fallback a home
  return <HomePage onNavigateToService={handleNavigateToService} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}