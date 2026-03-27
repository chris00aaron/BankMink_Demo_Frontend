import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@shared/api";
import {
  AuthProvider,
  useAuth,
  ServiceType,
} from "@shared/contexts/AuthContext";
import { HomePage } from "./pages/HomePage";
import { AtmModule } from "@modules/atm/AtmModule";
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
  const [currentScreen, setCurrentScreen] = useState("dashboard");
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
        setCurrentView("demanda-efectivo");
      } else {
        if (
          currentView !== "home" &&
          currentView !== "auditoria" &&
          currentView !== "gestion-usuarios" &&
          currentView !== "demanda-efectivo"
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
    setCurrentScreen("dashboard");
    setAuthScreen("login");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleNavigateToService = (service: ServiceType) => {
    if (hasAccessToService(service)) {
      setCurrentView(service);
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

  // Servicio: Demanda Efectivo
  if (currentView === "demanda-efectivo") {
    return (
      <AtmModule
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onBackToHome={isAdmin() ? handleBackToHome : undefined}
        onLogout={handleLogout}
      />
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