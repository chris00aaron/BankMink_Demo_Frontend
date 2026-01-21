import { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { AuthProvider, useAuth, ServiceType } from '@shared/contexts/AuthContext';
import {
  FraudeSidebar,
  FraudeLoginScreen,
  FraudeHomePage,
  Dashboard,
  BatchPrediction,
  IndividualPrediction,
  RiskAnalysis
} from '@modules/fraude';
import { ServicePlaceholder } from '@shared/components/ServicePlaceholder';
import { AuditoriaModule } from '@admin/auditoria/AuditoriaModule';
import { GestionUsuariosModule } from '@admin/usuarios/GestionUsuariosModule';

//Importaciones de Atm 
import { KPICard } from "@shared/components/KPICard";
import { DemandChart } from "@shared/components/DemandChart";
import { WeeklyDemandChart } from "@shared/components/WeeklyDemandChart";
import { ATMTable } from "@shared/components/ATMTable";
import { LocationAnalysis } from "@shared/components/LocationAnalysis";
import { PredictionDashboard } from "@modules/atm/components/PredictionDashboard";
import { Simulator } from "@modules/atm/components/Simulator";

import { 
  TrendingUp,
  Activity, 
  Banknote,
  RefreshCw,
  Download,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Brain,
  Calculator
} from "lucide-react";

import { Button } from "@shared/components/ui-atm/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@shared/components/ui-atm/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui-atm/tabs";

function AppContent() {
  const { user, isAuthenticated, login, logout, hasAccessToService, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | ServiceType>('home');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [loginError, setLoginError] = useState('');

  //Estado de la vista de atm
  const [currentUser, setCurrentUser] = useState({ username: "", role: "" });
  const [selectedDate, setSelectedDate] = useState("2026-01-05");
  const [activeView, setActiveView] = useState("general");


  const handleLogin = (username: string, password: string, rememberPassword: boolean) => {
    const success = login(username, password, rememberPassword);
    if (success) {
      setLoginError('');
      setCurrentView('home'); // Temporarily set to home, will be updated by useEffect
      setCurrentUser({ username, role: "admin" });
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
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

  const handleLogout = () => {
    logout();
    setCurrentView('home');
    setCurrentScreen('dashboard');
    setCurrentUser({ username: "", role: "" });
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
    return <FraudeLoginScreen onLogin={handleLogin} loginError={loginError} />;
  }

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

  //Data de la Demanda Efectivo 
  // Datos mock para KPIs
  const kpis = [
    {
      title: "Demanda Total Hoy",
      value: "$2.4M",
      change: 12.5,
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "Retiros Totales",
      value: "$1.8M",
      change: 8.3,
      icon: TrendingUp,
      trend: "up" as const
    },
    {
      title: "Depósitos Totales",
      value: "$620K",
      change: -3.2,
      icon: Banknote,
      trend: "down" as const
    },
    {
      title: "Transacciones",
      value: "3,247",
      change: 15.8,
      icon: Activity,
      trend: "up" as const
    }
  ];

  // Datos para el gráfico de demanda por hora
  const hourlyData = [
    { hour: "00:00", retiros: 12000, depositos: 5000, prediccion: 13000 },
    { hour: "03:00", retiros: 8000, depositos: 3000, prediccion: 8500 },
    { hour: "06:00", retiros: 25000, depositos: 8000, prediccion: 27000 },
    { hour: "09:00", retiros: 85000, depositos: 32000, prediccion: 88000 },
    { hour: "12:00", retiros: 125000, depositos: 45000, prediccion: 130000 },
    { hour: "15:00", retiros: 95000, depositos: 38000, prediccion: 98000 },
    { hour: "18:00", retiros: 110000, depositos: 42000, prediccion: 115000 },
    { hour: "21:00", retiros: 65000, depositos: 28000, prediccion: 67000 },
  ];

  // Datos para el gráfico semanal
  const weeklyData = [
    { dia: "Lun", demanda: 320000, promedio: 310000 },
    { dia: "Mar", demanda: 285000, promedio: 295000 },
    { dia: "Mié", demanda: 340000, promedio: 325000 },
    { dia: "Jue", demanda: 315000, promedio: 320000 },
    { dia: "Vie", demanda: 425000, promedio: 405000 },
    { dia: "Sáb", demanda: 380000, promedio: 375000 },
    { dia: "Dom", demanda: 195000, promedio: 210000 },
  ];

  // Datos de cajeros automáticos
  const atmData = [
    {
      id: "ATM-001",
      ubicacion: "Centro Comercial Plaza Norte",
      tipo: "Centro Comercial",
      nivelEfectivo: 18,
      demandaProximoDia: 145000,
      estado: "critico" as const,
      ultimaRecarga: "Hace 2 días"
    },
    {
      id: "ATM-002",
      ubicacion: "Banco Central - Sucursal Principal",
      tipo: "Banco",
      nivelEfectivo: 72,
      demandaProximoDia: 98000,
      estado: "normal" as const,
      ultimaRecarga: "Hace 5 horas"
    },
    {
      id: "ATM-003",
      ubicacion: "Aeropuerto Internacional",
      tipo: "Aeropuerto",
      nivelEfectivo: 35,
      demandaProximoDia: 186000,
      estado: "alerta" as const,
      ultimaRecarga: "Hace 1 día"
    },
    {
      id: "ATM-004",
      ubicacion: "Universidad Nacional",
      tipo: "Universidad",
      nivelEfectivo: 88,
      demandaProximoDia: 52000,
      estado: "normal" as const,
      ultimaRecarga: "Hace 3 horas"
    },
    {
      id: "ATM-005",
      ubicacion: "Estación de Tren Central",
      tipo: "Transporte",
      nivelEfectivo: 22,
      demandaProximoDia: 127000,
      estado: "critico" as const,
      ultimaRecarga: "Hace 2 días"
    },
    {
      id: "ATM-006",
      ubicacion: "Centro Comercial Mega Plaza",
      tipo: "Centro Comercial",
      nivelEfectivo: 58,
      demandaProximoDia: 132000,
      estado: "normal" as const,
      ultimaRecarga: "Hace 8 horas"
    }
  ];

  // Datos por tipo de ubicación
  const locationData = [
    { tipo: "Centro Comercial", demanda: 425000, cajeros: 8 },
    { tipo: "Banco", demanda: 380000, cajeros: 12 },
    { tipo: "Aeropuerto", demanda: 285000, cajeros: 4 },
    { tipo: "Universidad", demanda: 165000, cajeros: 5 },
    { tipo: "Transporte", demanda: 220000, cajeros: 6 },
    { tipo: "Otros", demanda: 125000, cajeros: 3 }
  ];


  // Servicio: Demanda Efectivo
  if (currentView === 'demanda-efectivo') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1>Sistema de Gestión de Demanda de Efectivo</h1>
                <p className="text-muted-foreground mt-1">
                  Monitoreo y predicción en tiempo real
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
                  <UserIcon className="h-4 w-4 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium">{currentUser.username}</div>
                    <div className="text-xs text-muted-foreground">{currentUser.role}</div>
                  </div>
                </div>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-01-05">5 Enero 2026</SelectItem>
                    <SelectItem value="2026-01-04">4 Enero 2026</SelectItem>
                    <SelectItem value="2026-01-03">3 Enero 2026</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleLogout} title="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard General
              </TabsTrigger>
              <TabsTrigger value="prediction" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Predicción de Retiros
              </TabsTrigger>
              <TabsTrigger value="simulator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Simulador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                  <KPICard key={index} {...kpi} />
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <DemandChart data={hourlyData} />
                <WeeklyDemandChart data={weeklyData} />
              </div>

              {/* ATM Table */}
              <ATMTable atms={atmData} />

              {/* Location Analysis */}
              <LocationAnalysis data={locationData} />
            </TabsContent>

            <TabsContent value="prediction">
              <PredictionDashboard />
            </TabsContent>

            <TabsContent value="simulator">
              <Simulator />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-6 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Dashboard de Gestión de Cajeros Automáticos © 2026 - Actualizado en tiempo real
            </p>
          </div>
        </footer>
      </div>
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
            {currentScreen === 'dashboard' && <Dashboard />}
            {currentScreen === 'batch' && <BatchPrediction />}
            {currentScreen === 'individual' && <IndividualPrediction />}
            {currentScreen === 'risk-analysis' && <RiskAnalysis />}
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