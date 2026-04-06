import {
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  RefreshCw,
  FileText,
  MapPin,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import clsx from "clsx";
import { ATMTable } from "@shared/components/ATMTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui-atm/card";
import { Badge } from "@shared/components/ui-atm/badge";
import { Progress } from "@shared/components/ui-atm/progress";
import { CustomTooltipDashboard } from "../components/CustomTooltip";
import { formatCompact, formatCurrency } from "../utils/format";
import { useAtmDashboard, useEstadosAtms } from "../hooks/useAtmQueries";

// Interfaces para componentes internos
export interface ChartDataPoint {
  atm: string;
  retiroHistorico: number;
  retiroPredicho: number;
}

export interface LocationDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyPredictionDataPoint {
  atm: string;
  predicho: number;
  rangoMin: number;
  rangoMax: number;
}

export interface InfluenceFactor {
  factor: string;
  impacto: number;
  tipo: string;
}

export interface KPIStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  baseColor: string;
  hoverClass: string;
  iconClass: string;
  textClass: string;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
}

export default function Dashboard() {
  // Obtener datos del backend
  const {
    data: dashboardResponse,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAtmDashboard();
  const { data: estadosResponse, isLoading: isLoadingEstados } = useEstadosAtms();

  const isLoading = isLoadingDashboard || isLoadingEstados;

  // Datos del dashboard
  const dashboardData = dashboardResponse || {
    resumenRetiroEfectivoAtm: {
      totalRetirosPrevisto: 0,
      totalRetirosPrevistoOptimista: 0,
      totalRetirosPrevistoPesimista: 0,
    },
    resumenOperativoAtms: {
      activos: 0,
      inactivos: 0,
    },
    atmsConPotencialDeFaltaStock: 0,
    retirosPredichos: [],
    retirosHistoricos: [],
    featuresImportancia: {},
    segmentacionRetiro: {
      ubicaciones: {},
    },
  };

  // Estados de ATMs para la tabla
  const estadosAtms = estadosResponse || [];

  // Calcular cambio porcentual
  const calcularCambio = () => {
    if (!dashboardData.retirosHistoricos.length) return "0.0";
    const historico = dashboardData.retirosHistoricos.reduce(
      (sum, item) => sum + item.retiroHistorico,
      0,
    );
    const previsto =
      dashboardData.resumenRetiroEfectivoAtm.totalRetirosPrevisto;
    if (historico === 0) return "0.0";
    return (((previsto - historico) / historico) * 100).toFixed(1);
  };

  const cambioPercentual = calcularCambio();

  // KPIs con datos reales
  const kpis: KPIStat[] = [
    {
      label: "Escenario Pesimista",
      value: formatCompact(
        dashboardData.resumenRetiroEfectivoAtm.totalRetirosPrevistoPesimista,
      ),
      icon: TrendingDown,
      baseColor: "orange",
      hoverClass: "hover:bg-orange-500 hover:border-orange-600",
      iconClass:
        "text-orange-600 bg-orange-50 group-hover:bg-white/20 group-hover:text-white",
      textClass: "group-hover:text-white",
    },
    {
      label: "Retiros Predichos Hoy",
      value: formatCompact(
        dashboardData.resumenRetiroEfectivoAtm.totalRetirosPrevisto,
      ),
      icon: DollarSign,
      baseColor: "blue",
      hoverClass: "hover:bg-blue-600 hover:border-blue-700",
      iconClass:
        "text-blue-600 bg-blue-50 group-hover:bg-white/20 group-hover:text-white",
      textClass: "group-hover:text-white",
      trend: `${cambioPercentual}%`,
      trendUp: parseFloat(cambioPercentual) > 0,
    },
    {
      label: "Escenario Optimista",
      value: formatCompact(
        dashboardData.resumenRetiroEfectivoAtm.totalRetirosPrevistoOptimista,
      ),
      icon: TrendingUp,
      baseColor: "green",
      hoverClass: "hover:bg-green-600 hover:border-green-700",
      iconClass:
        "text-green-600 bg-green-50 group-hover:bg-white/20 group-hover:text-white",
      textClass: "group-hover:text-white",
    },
    {
      label: "ATMs Operativos",
      value: `${dashboardData.resumenOperativoAtms.activos}/${dashboardData.resumenOperativoAtms.activos + dashboardData.resumenOperativoAtms.inactivos}`,
      icon: Users,
      baseColor: "emerald",
      hoverClass: "hover:bg-emerald-600 hover:border-emerald-700",
      iconClass:
        "text-emerald-600 bg-emerald-50 group-hover:bg-white/20 group-hover:text-white",
      textClass: "group-hover:text-white",
      sub:
        dashboardData.resumenOperativoAtms.inactivos > 0
          ? `${dashboardData.resumenOperativoAtms.inactivos} en mantenimiento`
          : "Todos operativos",
    },
    {
      label: "Alertas Críticas",
      value: dashboardData.atmsConPotencialDeFaltaStock.toString(),
      icon: AlertCircle,
      baseColor: "red",
      hoverClass: "hover:bg-red-600 hover:border-red-700",
      iconClass:
        "text-red-600 bg-red-50 group-hover:bg-white/20 group-hover:text-white",
      textClass: "group-hover:text-white",
      trend: "Requiere Atención",
      trendUp: false,
    },
  ];

  // Transformar datos históricos para el gráfico
  const historicalWithdrawalData = dashboardData.retirosHistoricos.map(
    (item) => ({
      atm: `ATM-${String(item.atm).padStart(3, "0")}`,
      retiroHistorico: item.retiroHistorico,
      retiroPredicho: Math.round(item.retiroPrevisto),
    }),
  );

  // Transformar datos de ubicación para el pie chart
  const locationData = Object.entries(
    dashboardData.segmentacionRetiro.ubicaciones,
  ).map(([name, value]) => ({
    name,
    value: Math.round(value),
    color: name === "Urbano" ? "#3b82f6" : "#10b981",
  }));

  // Transformar predicciones para el gráfico de barras
  const weeklyPrediction = dashboardData.retirosPredichos.map((item) => ({
    atm: `ATM-${String(item.idAtm).padStart(3, "0")}`,
    predicho: Math.round(item.retiroPrevisto),
    rangoMin: Math.round(item.lowerBound),
    rangoMax: Math.round(item.upperBound),
  }));

  // Transformar features de importancia
  const featureLabels: Record<string, string> = {
    ubicacion: "Ubicación",
    ambiente: "Ambiente",
    dia_semana: "Día de la Semana",
    lag_1: "Retiros Ayer",
    lag_5: "Retiros 5 días",
    lag_11: "Retiros 11 días",
    domingo_bajo: "Patrón Domingo",
    caida_reciente: "Caída Reciente",
    tendencia_lags: "Tendencia",
    ratio_finde_vs_semana: "Ratio Fin de Semana",
    retiros_finde_anterior: "Retiros Fin de Semana Anterior",
    retiros_domingo_anterior: "Retiros Domingo Anterior",
  };

  const featureTypes: Record<string, string> = {
    ubicacion: "geográfico",
    ambiente: "ambiental",
    diaSemana: "temporal",
    lag_1: "histórico",
    lag_5: "histórico",
    lag_11: "histórico",
    domingo_bajo: "patrón",
    caida_reciente: "patrón",
    tendencia_lags: "tendencia",
    ratio_finde_vs_semana: "patrón",
    retiros_finde_anterior: "histórico",
    retiros_domingo_anterior: "histórico",
  };

  const influenceFactors = Object.entries(dashboardData.featuresImportancia)
    .map(([key, value]) => ({
      factor: featureLabels[key] || key,
      impacto: Math.round(Number(value)),
      tipo: featureTypes[key] || "otro",
    }))
    .sort((a, b) => b.impacto - a.impacto)
    .slice(0, 6);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-red-600">
          <AlertCircle className="w-12 h-12" />
          <p>Error al cargar los datos del dashboard</p>
          <button
            onClick={() => refetchDashboard()}
            className="px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  Dashboard Inteligente de ATMs
                </h1>
              </div>
              <p className="text-slate-500 ml-4 lg:ml-5">
                Visión general del flujo de efectivo y estado de la red.
              </p>
            </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetchDashboard()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw size={16} /> Sincronizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
            <FileText size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((stat, i) => (
          <div
            key={i}
            className={clsx(
              "group bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 cursor-default",
              stat.hoverClass,
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={clsx(
                  "p-3 rounded-lg transition-colors",
                  stat.iconClass,
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <div
                  className={clsx(
                    "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                    stat.trendUp
                      ? "text-green-700 bg-green-100 group-hover:bg-green-500/20 group-hover:text-white"
                      : "text-red-700 bg-red-100 group-hover:bg-red-500/20 group-hover:text-white",
                  )}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight size={14} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={14} className="mr-1" />
                  )}
                  {stat.trend}
                </div>
              )}
            </div>
            <div>
              <p
                className={clsx(
                  "text-sm font-medium text-slate-500 transition-colors",
                  stat.textClass,
                )}
              >
                {stat.label}
              </p>
              <h3
                className={clsx(
                  "text-2xl font-bold text-slate-900 mt-1 transition-colors",
                  stat.textClass,
                )}
              >
                {stat.value}
              </h3>
              {stat.sub && (
                <p
                  className={clsx(
                    "text-xs text-slate-400 mt-1 transition-colors group-hover:text-white/80",
                    stat.textClass,
                  )}
                >
                  {stat.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Network Flow */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Flujo de Efectivo de la Red (Hoy)
              </h3>
              <p className="text-sm text-slate-500">
                Comparativa: Retiros Históricos vs. Predicción del Modelo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>{" "}
                Histórico
              </span>
              <span className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mr-1"></div>{" "}
                Predicho
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalWithdrawalData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPredicted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="atm"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltipDashboard />} />
                <Area
                  type="monotone"
                  dataKey="retiroPredicho"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Predicho"
                />
                <Area
                  type="monotone"
                  dataKey="retiroHistorico"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="Histórico"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Distribución por Ubicación
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Asignación de efectivo según zona.
          </p>

          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <span className="text-xs text-slate-400 font-medium">
                  Total:{" "}
                  {formatCompact(
                    dashboardData.resumenRetiroEfectivoAtm.totalRetirosPrevisto,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {locationData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCompact(item.value)}
                  </span>
                  <p className="text-xs text-slate-500">
                    {dashboardData.resumenRetiroEfectivoAtm
                      .totalRetirosPrevisto > 0
                      ? (
                          (item.value /
                            dashboardData.resumenRetiroEfectivoAtm
                              .totalRetirosPrevisto) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Predicción con Rangos de Confianza */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Predicción con Rangos de Confianza (95%)
            </CardTitle>
            <CardDescription>
              Retiros predichos con intervalos de confianza
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPrediction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="atm"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltipDashboard />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="rangoMin"
                  fill="#dbeafe"
                  name="Mínimo"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="predicho"
                  fill="#3b82f6"
                  name="Predicción"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="rangoMax"
                  fill="#1e40af"
                  name="Máximo"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Factores de Influencia */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Factores que Influyen en la Predicción
            </CardTitle>
            <CardDescription>
              Impacto de diferentes variables en el modelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {influenceFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {factor.factor}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {factor.tipo}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {factor.impacto}%
                    </span>
                  </div>
                  <Progress value={factor.impacto} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ATMs */}
      <ATMTable atms={estadosAtms} />
    </div>
  );
}
