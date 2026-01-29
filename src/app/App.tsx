import { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';
import { AuthProvider, useAuth, ServiceType } from '@shared/contexts/AuthContext';
import {
  FraudeSidebar,
  FraudeLoginScreen,
  FraudeHomePage,
  Dashboard,
  BatchPrediction,
  IndividualPrediction,
  RiskAnalysis,
  ModelMonitoring
} from '@modules/fraude';
import { ServicePlaceholder } from '@shared/components/ServicePlaceholder';
import { AuditoriaModule } from '@admin/auditoria/AuditoriaModule';
import { GestionUsuariosModule } from '@admin/usuarios/GestionUsuariosModule';
import { OtpVerificationScreen } from '@shared/components/OtpVerificationScreen';
import { ForgotPasswordScreen } from '@shared/components/ForgotPasswordScreen';
import { ChangePasswordScreen } from '@shared/components/ChangePasswordScreen';

type AuthScreen = 'login' | 'otp' | 'forgot-password';

function AppContent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    mfaState,
    passwordChangeRequired,
    finalizePasswordChange,
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

  // Si se requiere cambio de contraseña
  if (passwordChangeRequired) {
    return (
      <ChangePasswordScreen
        onPasswordChanged={() => {
          finalizePasswordChange();
          setAuthScreen('login');
          setLoginError('');
        }}
      />
    );
  }

  const handleLogout = async () => {
    await logout();
    setCurrentView('home');
    setCurrentScreen('dashboard');
    setAuthScreen('login');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleNavigateToService = (service: ServiceType) => {
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

  // PANTALLAS DE AUTENTICACIÓN
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

  // PANTALLAS DE APLICACIÓN (Usuario autenticado)

  // Página Principal (HomePage) - Solo para admin
  if (currentView === 'home' && isAdmin()) {
    return <FraudeHomePage onNavigateToService={handleNavigateToService} onLogout={handleLogout} />;
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
        <FraudeSidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          onBackToHome={isAdmin() ? handleBackToHome : undefined}
        />
        <div className="flex-1 ml-64">
          <main className="p-8">
            {currentScreen === 'dashboard' && <Dashboard />}
            {currentScreen === 'batch' && <BatchPrediction />}
            {currentScreen === 'individual' && <IndividualPrediction />}
            {currentScreen === 'risk-analysis' && <RiskAnalysis />}
            {currentScreen === 'model-monitoring' && <ModelMonitoring />}
          </main>
        </div>
      </div>
    );
  }

  // Fallback a home
  return <FraudeHomePage onNavigateToService={handleNavigateToService} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}