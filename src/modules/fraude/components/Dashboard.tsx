import { useState, useEffect } from 'react';
<<<<<<< Updated upstream
import { AlertTriangle, CheckCircle, TrendingUp, Activity, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function Dashboard() {
  const [riskRate, setRiskRate] = useState(3.2);
  const [fraudPoints, setFraudPoints] = useState<Array<{ id: number; lat: number; lng: number; severity: 'high' | 'medium' | 'low' }>>([]);

  // Simular datos de transacciones
  const transactionData = [
    { name: 'Legítimas', value: 12847, color: '#10b981' },
    { name: 'Fraudulentas', value: 432, color: '#ef4444' },
    { name: 'En Revisión', value: 189, color: '#f59e0b' },
  ];

  const totalTransactions = transactionData.reduce((acc, item) => acc + item.value, 0);

  // Generar puntos de fraude aleatorios para el mapa
  useEffect(() => {
    const generateFraudPoints = () => {
      const points = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        lat: Math.random() * 60 + 10, // 10-70% del alto
        lng: Math.random() * 80 + 10, // 10-90% del ancho
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      }));
      setFraudPoints(points);
    };

    generateFraudPoints();
    const interval = setInterval(generateFraudPoints, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animar la tasa de riesgo
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskRate((prev) => +(prev + (Math.random() - 0.5) * 0.3).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
=======
import {
  AlertTriangle, CheckCircle, TrendingUp, Activity,
  BarChart3, Shield, Loader2, RefreshCw, DollarSign
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  fraudStatsService,
  DashboardStats,
  HourlyTrend,
  ShapGlobal,
  CategoryStats
} from '../services/fraudStatsService';

// Colores para gráficas
const COLORS = {
  emerald: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  orange: '#f97316',
  yellow: '#eab308',
  slate: '#94a3b8',
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyTrend[]>([]);
  const [shapData, setShapData] = useState<ShapGlobal[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [summaryRes, hourlyRes, shapRes, categoryRes] = await Promise.all([
        fraudStatsService.getSummary(),
        fraudStatsService.getHourlyTrend(),
        fraudStatsService.getShapGlobal(),
        fraudStatsService.getCategoryStats(),
      ]);

      setStats(summaryRes);
      setHourlyData(hourlyRes);
      setShapData(shapRes);
      setCategoryData(categoryRes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
>>>>>>> Stashed changes
  }, []);

  // Datos para Pie Chart (distribución de alertas)
  const pieData = stats ? [
    { name: 'Legítimas', value: stats.legitimate, color: COLORS.emerald },
    { name: 'Fraudes Detectados', value: stats.frauds_detected, color: COLORS.red },
  ] : [];

  // Formatear hora para gráfica
  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  // Datos para tendencia horaria
  const trendData = hourlyData.map(h => ({
    time: formatHour(h.hour),
    total: h.total_transactions,
    fraude: h.fraud_count,
  }));

  // Datos para SHAP global
  const shapChartData = shapData.map((s, idx) => ({
    factor: s.display_name,
    impacto: s.avg_impact * 100, // Escalar para visualización
    color: [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.blue, COLORS.slate][idx] || COLORS.slate,
  }));

  // Datos para categorías (top 5)
  const categoryChartData = categoryData.slice(0, 5).map(c => ({
    category: c.category.length > 15 ? c.category.slice(0, 15) + '...' : c.category,
    fraudes: c.fraud_count,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="text-gray-600 mt-1">Monitoreo en tiempo real del sistema de detección</p>
        </div>
<<<<<<< Updated upstream
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-600">Sistema Activo</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Transactions */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
=======
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
            <Shield className="w-4 h-4" /> Modelo XAI Activo
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Sistema Online
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Predicciones"
          value={stats?.transactions_today?.toLocaleString() || '0'}
          trend={`${stats?.fraud_rate?.toFixed(1) || 0}% tasa fraude`}
          trendUp={false}
          icon={Activity}
          color="blue"
        />
        <KpiCard
          title="Fraudes Detectados"
          value={stats?.frauds_detected?.toLocaleString() || '0'}
          trend={`Score prom: ${((stats?.avg_fraud_score || 0) * 100).toFixed(1)}%`}
          trendUp={false}
          icon={AlertTriangle}
          color="red"
        />
        <KpiCard
          title="Transacciones Legítimas"
          value={stats?.legitimate?.toLocaleString() || '0'}
          trend="Verificadas por IA"
          trendUp={true}
          icon={CheckCircle}
          color="emerald"
        />
        <KpiCard
          title="Monto en Riesgo"
          value={`$${((stats?.total_amount_at_risk || 0) / 1000).toFixed(1)}K`}
          trend="Transacciones bloqueadas"
          trendUp={false}
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Sección Principal de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tendencia Horaria (Area Chart) - 2 columnas */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Volumen Transaccional vs Fraude</h2>
              <p className="text-sm text-gray-500">Detección de anomalías por franja horaria</p>
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
>>>>>>> Stashed changes
          </div>
          <p className="text-sm text-gray-600 mb-1">Transacciones Totales</p>
          <p className="text-3xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 mt-2">+12.5% vs ayer</p>
        </div>

<<<<<<< Updated upstream
        {/* Fraud Detected */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
=======
        {/* Distribución de Alertas (Pie Chart) - 1 columna */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Estado de Alertas</h2>
          <p className="text-sm text-gray-500 mb-6">Distribución actual del sistema</p>

          <div className="h-64">
            {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No hay datos de distribución
              </div>
            )}
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Tasa de Fraude</p>
              <p className="text-lg font-bold text-gray-900">{stats?.fraud_rate?.toFixed(1) || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Precisión Modelo</p>
              <p className="text-lg font-bold text-gray-900">99.8%</p>
>>>>>>> Stashed changes
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
              Alerta
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Fraudes Detectados</p>
          <p className="text-3xl font-bold text-gray-900">{transactionData[1].value}</p>
          <p className="text-xs text-red-600 mt-2">+8 en la última hora</p>
        </div>

        {/* Success Rate */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Óptimo
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Precisión del Modelo</p>
          <p className="text-3xl font-bold text-gray-900">98.7%</p>
          <p className="text-xs text-emerald-600 mt-2">+0.3% esta semana</p>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Main Content Grid */}
=======
      {/* Sección Secundaria */}
>>>>>>> Stashed changes
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Heatmap */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Mapa de Fraude en Tiempo Real</h2>
          </div>

<<<<<<< Updated upstream
          <div className="relative w-full h-80 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* World Map Overlay (simplified) */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10,50 Q30,30 50,50 T90,50" stroke="currentColor" fill="none" strokeWidth="0.5" className="text-gray-400" />
                <path d="M20,30 L80,30 L80,70 L20,70 Z" stroke="currentColor" fill="none" strokeWidth="0.5" className="text-gray-400" />
              </svg>
=======
        {/* SHAP Global (Barras Horizontales) */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Factores de Riesgo Dominantes</h2>
              <p className="text-sm text-gray-500">¿Qué está disparando las alertas? (SHAP Global)</p>
>>>>>>> Stashed changes
            </div>

            {/* Fraud Points */}
            {fraudPoints.map((point) => {
              const colors = {
                high: { bg: 'bg-red-500', glow: 'shadow-red-500/50' },
                medium: { bg: 'bg-orange-500', glow: 'shadow-orange-500/50' },
                low: { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50' },
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
                  <div className={`absolute inset-0 rounded-full ${colors[point.severity].bg} opacity-50 animate-ping`}></div>
                </div>
              );
            })}
          </div>

<<<<<<< Updated upstream
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Alto Riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600">Medio Riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">Bajo Riesgo</span>
            </div>
=======
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

        {/* Fraude por Categoría */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Fraude por Categoría</h2>
              <p className="text-sm text-gray-500">Categorías de comercio con más alertas</p>
            </div>
            <BarChart3 className="text-blue-500 w-5 h-5" />
          </div>

          <div className="flex-1 h-64">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="fraudes" radius={[4, 4, 0, 0]} barSize={35} fill={COLORS.red} name="Fraudes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No hay datos de categorías
              </div>
            )}
>>>>>>> Stashed changes
          </div>
        </div>

        {/* Transaction Distribution Chart */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transacciones: Legítimas vs. Fraude</h2>

<<<<<<< Updated upstream
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: '#6b7280' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
=======
// Componente auxiliar para KPI Cards
function KpiCard({ title, value, trend, trendUp, icon: Icon, color }: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'red' | 'amber' | 'emerald';
}) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {trend}
        </span>
>>>>>>> Stashed changes
      </div>

      {/* Risk Rate Indicator */}
      <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tasa de Riesgo Actual</h2>
            <p className="text-sm text-gray-600">Actualización en tiempo real cada 3 segundos</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-gray-900">{riskRate}%</p>
            <p className={`text-sm mt-1 ${riskRate > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
              {riskRate > 5 ? 'Alto' : 'Normal'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${riskRate > 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(riskRate * 10, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}