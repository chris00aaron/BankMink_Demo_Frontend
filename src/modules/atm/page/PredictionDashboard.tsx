import { ATMTable } from "@/shared/components/ATMTable";
import { DemandChart } from "@/shared/components/DemandChart";
import { KPICard } from "@/shared/components/KPICard";
import { LocationAnalysis } from "@/shared/components/LocationAnalysis";
import { WeeklyDemandChart } from "@/shared/components/WeeklyDemandChart";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Button } from "@shared/components/ui-atm/button";
import { Select } from "@shared/components/ui-atm/select";
import { Banknote, Brain, Calculator, DollarSign, Download, LayoutDashboard, RefreshCw, TrendingUp } from "lucide-react";
import { Activity, useState } from "react";

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

  export function PredictionDashboard() {
    const [selectedDate, setSelectedDate] = useState("2026-01-05");
    const [activeView, setActiveView] = useState("general");

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-muted-foreground mt-1">
                  Monitoreo y predicción en tiempo real
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
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
                  <KPICard key={index} 
                  title={kpi.title}
                  value={kpi.value}
                  change={kpi.change}
                  trend={kpi.trend}
                  icon={kpi.icon}
                  />
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