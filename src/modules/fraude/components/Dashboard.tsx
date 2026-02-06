import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { fraudeService, type DashboardDTO } from "../services/fraudeService";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fraudPoints, setFraudPoints] = useState<
    Array<{
      id: number;
      lat: number;
      lng: number;
      severity: "high" | "medium" | "low";
    }>
  >([]);

  // Cargar datos del dashboard desde la API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fraudeService.getDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Generar puntos de fraude aleatorios para el mapa (simulación visual)
  useEffect(() => {
    const generateFraudPoints = () => {
      const points = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        lat: Math.random() * 60 + 10,
        lng: Math.random() * 80 + 10,
        severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as
          | "high"
          | "medium"
          | "low",
      }));
      setFraudPoints(points);
    };

    generateFraudPoints();
    const interval = setInterval(generateFraudPoints, 5000);
    return () => clearInterval(interval);
  }, []);

  // Preparar datos del gráfico de pie basado en segmentación del backend
  const transactionData = dashboardData?.segmentacionRetiro?.ubicaciones
    ? Object.entries(dashboardData.segmentacionRetiro.ubicaciones).map(
        ([name, value], index) => {
          const colors = [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
          ];
          return {
            name,
            value: Number(value),
            color: colors[index % colors.length],
          };
        },
      )
    : [];

  const totalRetiros = dashboardData?.resumenRetiroEfectivoAtm?.totalRetirosPrevisto || 0;
  const atmsActivos = dashboardData?.resumenOperativoAtms?.activos || 0;
  const atmsInactivos = dashboardData?.resumenOperativoAtms?.inactivos || 0;
  const atmsConRiesgo = dashboardData?.atmsConPotencialDeFaltaStock || 0;

  // Calcular tasa de riesgo basada en ATMs con potencial falta de stock
  const totalAtms = atmsActivos + atmsInactivos;
  const riskRate =
    totalAtms > 0 ? ((atmsConRiesgo / totalAtms) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-red-600">
          <AlertTriangle className="w-12 h-12" />
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Principal
          </h1>
          <p className="text-gray-600 mt-1">
            Monitoreo en tiempo real del sistema de predicción
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-600">
            Sistema Activo
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Retiros Previstos */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="text-gray-400 w-5 h-5" />
          </div>
          <div className="h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFraude" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="total" stroke={COLORS.blue} strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Tráfico Total" />
                  <Area type="monotone" dataKey="fraude" stroke={COLORS.red} strokeWidth={2} fillOpacity={1} fill="url(#colorFraude)" name="Fraudes" />
                  <Legend verticalAlign="top" height={36} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No hay datos de tendencia horaria
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Retiros Previstos</p>
          <p className="text-2xl font-bold text-gray-900">
            S/{" "}
            {Number(totalRetiros).toLocaleString("es-PE", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Predicción del modelo</p>
        </div>

        {/* ATMs Activos */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Operativos
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">ATMs Activos</p>
          <p className="text-3xl font-bold text-gray-900">{atmsActivos}</p>
          <p className="text-xs text-gray-500 mt-2">
            {atmsInactivos} inactivos
          </p>
        </div>

        {/* ATMs con Riesgo */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
              Alerta
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">ATMs en Riesgo</p>
          <p className="text-3xl font-bold text-gray-900">{atmsConRiesgo}</p>
          <p className="text-xs text-red-600 mt-2">Potencial falta de stock</p>
        </div>

        {/* Predicciones Realizadas */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Predicciones</p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardData?.retirosPredichos?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">ATMs analizados</p>
        </div>
      </div>

      {/* Sección Secundaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Heatmap */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Mapa de Riesgo en Tiempo Real
            </h2>
          </div>

          <div className="relative w-full h-80 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* World Map Overlay (simplified) */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  d="M10,50 Q30,30 50,50 T90,50"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="0.5"
                  className="text-gray-400"
                />
                <path
                  d="M20,30 L80,30 L80,70 L20,70 Z"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="0.5"
                  className="text-gray-400"
                />
              </svg>
            </div>

            {/* Fraud Points */}
            {fraudPoints.map((point) => {
              const colors = {
                high: { bg: "bg-red-500", glow: "shadow-red-500/50" },
                medium: { bg: "bg-orange-500", glow: "shadow-orange-500/50" },
                low: { bg: "bg-yellow-500", glow: "shadow-yellow-500/50" },
              };

              return (
                <div
                  key={point.id}
                  className={`absolute w-3 h-3 rounded-full ${colors[point.severity].bg} ${colors[point.severity].glow} shadow-lg animate-pulse`}
                  style={{
                    left: `${point.lng}%`,
                    top: `${point.lat}%`,
                    animationDelay: `${point.id * 0.1}s`,
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-full ${colors[point.severity].bg} opacity-50 animate-ping`}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="h-64">
            {shapChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapChartData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="factor" type="category" width={110} tick={{ fontSize: 12, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="impacto" radius={[0, 4, 4, 0]} barSize={24} name="Impacto Promedio">
                    {shapChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No hay datos SHAP disponibles
              </div>
            )}
          </div>
        </div>

        {/* Transaction Distribution Chart - Segmentación por Ubicación */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Retiros por Tipo de Ubicación
          </h2>

          {transactionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#1f2937",
                  }}
                  formatter={(value: number) => [
                    `S/ ${value.toLocaleString("es-PE")}`,
                    "Monto",
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#6b7280" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos de segmentación disponibles
            </div>
          )}
        </div>
      </div>

      {/* Risk Rate Indicator */}
      <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tasa de Riesgo de Stock
            </h2>
            <p className="text-sm text-gray-600">
              Porcentaje de ATMs con potencial falta de efectivo
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-gray-900">{riskRate}%</p>
            <p
              className={`text-sm mt-1 ${Number(riskRate) > 20 ? "text-red-600" : "text-emerald-600"}`}
            >
              {Number(riskRate) > 20 ? "Requiere Atención" : "Normal"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${Number(riskRate) > 20 ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(Number(riskRate), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Rango de Predicción */}
      {dashboardData?.resumenRetiroEfectivoAtm && (
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Rango de Predicción de Retiros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700 mb-1">
                Escenario Pesimista
              </p>
              <p className="text-2xl font-bold text-yellow-800">
                S/{" "}
                {Number(
                  dashboardData.resumenRetiroEfectivoAtm
                    .totalRetirosPrevistoPesimista,
                ).toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Predicción Base</p>
              <p className="text-2xl font-bold text-blue-800">
                S/{" "}
                {Number(
                  dashboardData.resumenRetiroEfectivoAtm.totalRetirosPrevisto,
                ).toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Escenario Optimista</p>
              <p className="text-2xl font-bold text-green-800">
                S/{" "}
                {Number(
                  dashboardData.resumenRetiroEfectivoAtm
                    .totalRetirosPrevistoOptimista,
                ).toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
