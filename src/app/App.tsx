import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@shared/api";
import {
  AuthProvider,
  useAuth,
  ServiceType,
} from "@shared/contexts/AuthContext";
import {
  ClientPrediction,
  Dashboard as MorosidadDashboard,
  MorosidadSidebar,
  BatchPrediction as MorosidadBatchPrediction,
  Strategy,
  Simulation,
  ModelHealth,
  DashboardProvider,
} from "@modules/morosidad";
import { HomePage } from "./pages/HomePage";
import { AuditoriaModule } from "@admin/auditoria/AuditoriaModule";
import { GestionUsuariosModule } from "@admin/usuarios/GestionUsuariosModule";
import { OtpVerificationScreen } from "@shared/components/OtpVerificationScreen";
import { ForgotPasswordScreen } from "@shared/components/ForgotPasswordScreen";
import { ChangePasswordScreen } from "@shared/components/ChangePasswordScreen";
import { LoginScreen } from "@modules/auth/pages/LoginScreen";

type AuthScreen = "login" | "otp" | "forgot-password";

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
    cancelMfa,
  } = useAuth();

  const [currentView, setCurrentView] = useState<"home" | ServiceType>("home");
  const [morosidadScreen, setMorosidadScreen] = useState("dashboard");
  const [selectedMorosidadRecordId, setSelectedMorosidadRecordId] = useState<number | null>(null);
  const [loginError, setLoginError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");

  // Manejar cambio a pantalla OTP cuando se requiere MFA
  useEffect(() => {
    if (mfaState?.required) {
      setAuthScreen("otp");
      setLoginError("");
    }
  }, [mfaState]);

  const handleLogin = async (
    username: string,
    password: string,
  ) => {
    const result = await login(username, password);
    if (!result.success && result.error) {
      setLoginError(result.error);
    } else {
      setLoginError("");
    }
  };

  const handleVerifyOtp = async (code: string) => {
    const result = await verifyOtp(code);
    if (!result.success && result.error) {
      setOtpError(result.error);
    } else {
      setOtpError("");
      setAuthScreen("login");
    }
  };

  const handleResendOtp = async () => {
    const result = await resendOtp();
    if (!result.success && result.error) {
      setOtpError(result.error);
    } else {
      setOtpError("");
    }
  };

  const handleForgotPassword = async (email: string) => {
    await forgotPassword(email);
  };

  const handleBackToLogin = () => {
    setAuthScreen("login");
    setLoginError("");
    setOtpError("");
    cancelMfa();
  };

  // Redirect operarios to their service after login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!isAdmin()) {
        // Operario de morosidad va directo al módulo
        setCurrentView("morosidad-detalle");
      } else {
        if (
          currentView !== "home" &&
          currentView !== "auditoria" &&
          currentView !== "gestion-usuarios" &&
          currentView !== "morosidad-detalle"
        ) {
          setCurrentView("home");
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
          setAuthScreen("login");
          setLoginError("");
        }}
      />
    );
  }

  const handleLogout = async () => {
    await logout();
    setCurrentView("home");
    setAuthScreen("login");
  };

  const handleMorosidadNavigate = (screen: string) => {
    setMorosidadScreen(screen);
    // Reiniciar recordId si no estamos en individual
    if (screen !== "individual") {
      setSelectedMorosidadRecordId(null);
    }
  };

  const handleNavigateToMorosidadPrediction = (recordId: number) => {
    setSelectedMorosidadRecordId(recordId);
    setMorosidadScreen("individual");
  };

  const handleNavigateToService = (service: ServiceType) => {
    if (hasAccessToService(service)) {
      setCurrentView(service);
      if (service === "morosidad-detalle") {
        setMorosidadScreen("dashboard");
      }
    }
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  // PANTALLAS DE AUTENTICACIÓN
  if (!isAuthenticated) {
    // Pantalla de verificación OTP
    if (authScreen === "otp" && mfaState) {
      return (
        <OtpVerificationScreen
          emailHint={mfaState.emailHint}
          onVerify={handleVerifyOtp}
          onResendCode={handleResendOtp}
          onBack={handleBackToLogin}
          error={otpError}
          isLoading={isLoading}
        />
      );
    }

    // Pantalla de olvidé mi contraseña
    if (authScreen === "forgot-password") {
      return (
        <ForgotPasswordScreen
          onSubmit={handleForgotPassword}
          onBack={handleBackToLogin}
        />
      );
    }

    // Pantalla de login principal
    return (
      <LoginScreen
        onLogin={handleLogin}
        onForgotPassword={() => setAuthScreen("forgot-password")}
        loginError={loginError}
        isLoading={isLoading}
      />
    );
  }

  // PANTALLAS DE APLICACIÓN (Usuario autenticado)

  // Página Principal (HomePage) - Solo para admin
  if (currentView === "home" && isAdmin()) {
    return (
      <HomePage
        onNavigateToService={handleNavigateToService}
        onLogout={handleLogout}
      />
    );
  }

  // Módulo de Auditoría - Solo admin
  if (currentView === "auditoria") {
    return <AuditoriaModule onBack={handleBackToHome} />;
  }

  // Módulo de Gestión de Usuarios - Solo admin
  if (currentView === "gestion-usuarios") {
    return <GestionUsuariosModule onBack={handleBackToHome} />;
  }

  // Servicio: Morosidad Detalle
  if (currentView === "morosidad-detalle") {
    return (
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <MorosidadSidebar
            currentScreen={morosidadScreen}
            onNavigate={handleMorosidadNavigate}
            onBackToHome={isAdmin() ? handleBackToHome : undefined}
            onLogout={handleLogout}
          />
          <div className="flex-1 ml-64">
            {/* Page Content */}
            <main className="p-8">
              {morosidadScreen === "dashboard" && <MorosidadDashboard onNavigateToPrediction={handleNavigateToMorosidadPrediction} />}
              {morosidadScreen === "individual" && <ClientPrediction initialRecordId={selectedMorosidadRecordId} />}
              {morosidadScreen === "batch" && <MorosidadBatchPrediction />}
              {morosidadScreen === "strategy" && <Strategy />}
              {morosidadScreen === "simulation" && <Simulation />}
              {morosidadScreen === "model-health" && <ModelHealth />}
            </main>
          </div>
        </div>
      </DashboardProvider>
    );
  }

  // Fallback a home
  return (
    <HomePage
      onNavigateToService={handleNavigateToService}
      onLogout={handleLogout}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
