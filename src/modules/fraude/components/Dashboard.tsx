import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  BarChart3,
  Shield,
  Loader2,
  RefreshCw,
  DollarSign,
  CreditCard,
  Users,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  fraudStatsService,
  type DashboardStats,
  type HourlyTrend,
  type ShapGlobal,
  type CategoryStats,
  type DemographicStats,
  type TemporalStats,
} from "../services/fraudStatsService";
import { FraudClusterProfiles } from "./FraudClusterProfiles";

// ─── Paleta de colores ───────────────────────────────────────────────────────
const COLORS = {
  emerald: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  orange: "#f97316",
  yellow: "#eab308",
  slate: "#94a3b8",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const AGE_COLORS: Record<string, string> = {
  "18-30": COLORS.blue,
  "31-45": COLORS.orange,
  "46-60": COLORS.purple,
  "60+": COLORS.red,
};

const DAY_LABELS: Record<number, string> = {
  1: "Lun", 2: "Mar", 3: "Mié",
  4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom",
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, trend, trendUp, icon: Icon, color,
}: {
  title: string; value: string; trend: string; trendUp: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "red" | "amber" | "emerald";
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
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

// ─── Panel de Demografía ─────────────────────────────────────────────────────
function DemographicsPanel({ data }: { data: DemographicStats[] }) {
  // Totales por género para el donut
  const genderTotals = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.gender_label] = (acc[row.gender_label] ?? 0) + row.fraud_count;
    return acc;
  }, {});
  const genderData = Object.entries(genderTotals).map(([name, value]) => ({
    name,
    value,
    color: name === "Femenino" ? COLORS.pink : COLORS.blue,
  }));

  // Totales por rango de edad (ambos géneros sumados)
  const ageTotals = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.age_band] = (acc[row.age_band] ?? 0) + row.fraud_count;
    return acc;
  }, {});
  const ageData = ["18-30", "31-45", "46-60", "60+"]
    .filter((band) => ageTotals[band] !== undefined)
    .map((band) => ({ band, fraudes: ageTotals[band], fill: AGE_COLORS[band] }));

  const hasData = genderData.length > 0;

  return (
    <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Perfil del Defraudador</h2>
          <p className="text-sm text-gray-500">¿Quiénes cometen más fraudes?</p>
        </div>
        <Users className="text-purple-400 w-5 h-5" />
      </div>

      {hasData ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Donut género */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Por Género</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => [v ?? 0, "Fraudes"]} />
                  <Legend verticalAlign="bottom" height={28} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barras rango de edad */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Por Rango de Edad</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageData}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="band"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    formatter={(v: number | undefined) => [v ?? 0, "Fraudes"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="fraudes" radius={[4, 4, 0, 0]} barSize={28} name="Fraudes">
                    {ageData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-44 text-gray-400 text-sm">
          Sin datos demográficos aún
        </div>
      )}
    </div>
  );
}

// ─── Panel Temporal ───────────────────────────────────────────────────────────
function TemporalPanel({ data }: { data: TemporalStats[] }) {
  // Fraudes por día de semana (agregado de todos los meses)
  const byDay = Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    const total = data
      .filter((r) => r.day_of_week === day)
      .reduce((s, r) => s + r.fraud_count, 0);
    return { day: DAY_LABELS[day], fraudes: total };
  });

  // Fraudes por mes (serie temporal)
  const byMonth = Array.from(
    data.reduce<Map<string, number>>((map, r) => {
      map.set(r.month_label, (map.get(r.month_label) ?? 0) + r.fraud_count);
      return map;
    }, new Map()),
    ([month, fraudes]) => ({ month, fraudes })
  ).sort((a, b) => a.month.localeCompare(b.month));

  const hasData = data.length > 0;

  return (
    <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">¿Cuándo Ocurre el Fraude?</h2>
          <p className="text-sm text-gray-500">Días de semana y evolución mensual</p>
        </div>
        <Calendar className="text-orange-400 w-5 h-5" />
      </div>

      {hasData ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Barras por día de semana */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Día de la Semana</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip
                    cursor={{ fill: "#fff7ed" }}
                    formatter={(v: number | undefined) => [v ?? 0, "Fraudes"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="fraudes" fill={COLORS.orange} radius={[4, 4, 0, 0]} barSize={22} name="Fraudes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Línea por mes */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Evolución Mensual</p>
            <div className="h-44">
              {byMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byMonth} margin={{ top: 4, right: 12, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      angle={-20} textAnchor="end" height={36}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip
                      formatter={(v: number | undefined) => [v ?? 0, "Fraudes"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fraudes"
                      stroke={COLORS.red}
                      strokeWidth={2}
                      dot={{ r: 3, fill: COLORS.red }}
                      activeDot={{ r: 5 }}
                      name="Fraudes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Sin historial mensual
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-44 text-gray-400 text-sm">
          Sin datos temporales aún
        </div>
      )}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyTrend[]>([]);
  const [shapData, setShapData] = useState<ShapGlobal[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [demoData, setDemoData] = useState<DemographicStats[]>([]);
  const [temporalData, setTemporalData] = useState<TemporalStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [summaryRes, hourlyRes, shapRes, categoryRes, demoRes, temporalRes] =
        await Promise.all([
          fraudStatsService.getSummary(),
          fraudStatsService.getHourlyTrend(),
          fraudStatsService.getShapGlobal(),
          fraudStatsService.getCategoryStats(),
          fraudStatsService.getDemographics(),
          fraudStatsService.getTemporalStats(),
        ]);

      setStats(summaryRes);
      setHourlyData(hourlyRes);
      setShapData(shapRes);
      setCategoryData(categoryRes);
      setDemoData(demoRes);
      setTemporalData(temporalRes);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Datos derivados ────────────────────────────────────────────────────────────
  const pieData = stats
    ? [
      { name: "Aprobadas", value: stats.approved_count ?? 0, color: COLORS.emerald },
      { name: "Pendientes", value: stats.pending_count ?? 0, color: COLORS.yellow },
      { name: "Rechazadas", value: stats.rejected_count ?? 0, color: COLORS.red },
    ]
    : [];

  const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;

  const trendData = hourlyData.map((h) => ({
    time: formatHour(h.hour),
    total: h.total_transactions,
    fraude: h.fraud_count,
  }));

  const shapChartData = shapData.map((s, idx) => ({
    factor: s.display_name,
    impacto: s.avg_impact * 100,
    color: [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.blue, COLORS.slate][idx] ?? COLORS.slate,
  }));

  const categoryChartData = categoryData.slice(0, 5).map((c) => ({
    category: c.category.length > 15 ? c.category.slice(0, 15) + "…" : c.category,
    fraudes: c.fraud_count,
  }));

  // ────────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-500">Cargando métricas de fraude...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control de Fraude</h1>
          <p className="text-gray-600 mt-1">Monitoreo de IA y métricas de negocio en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
            <Shield className="w-4 h-4" /> Modelo XAI Activo
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Sistema Online
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => loadData()} className="text-sm underline hover:text-red-800 ml-2">
            Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Predicciones"
          value={stats?.transactions_today?.toLocaleString() ?? "0"}
          trend={`${stats?.fraud_rate?.toFixed(1) ?? 0}% tasa fraude`}
          trendUp={false} icon={Activity} color="blue"
        />
        <KpiCard
          title="Fraudes Detectados"
          value={stats?.frauds_detected?.toLocaleString() ?? "0"}
          trend={`Score prom: ${((stats?.avg_fraud_score ?? 0) * 100).toFixed(1)}%`}
          trendUp={false} icon={AlertTriangle} color="red"
        />
        <KpiCard
          title="Transacciones Legítimas"
          value={stats?.legitimate?.toLocaleString() ?? "0"}
          trend="Verificadas por IA"
          trendUp={true} icon={CheckCircle} color="emerald"
        />
        <KpiCard
          title="Monto en Riesgo"
          value={`$${((stats?.total_amount_at_risk ?? 0) / 1000).toFixed(1)}K`}
          trend="Transacciones bloqueadas"
          trendUp={false} icon={DollarSign} color="amber"
        />
      </div>

      {/* Fila 1: Tendencia horaria + Estados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — 2 cols */}
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
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
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
        </div>

        {/* Pie estados — 1 col */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Estados de Transacciones</h2>
          <p className="text-sm text-gray-500 mb-6">Flujo PENDING → APPROVED/REJECTED</p>
          <div className="h-64">
            {pieData.length > 0 && pieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Tarjetas Bloqueadas</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats?.cards_blocked_today ?? 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Por fraude confirmado</p>
          </div>
        </div>
      </div>

      {/* Fila 2: SHAP + Por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Global */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Factores de Riesgo Dominantes</h2>
              <p className="text-sm text-gray-500">¿Qué está disparando las alertas? (SHAP Global)</p>
            </div>
            <BarChart3 className="text-gray-400 w-5 h-5" />
          </div>
          <div className="h-64">
            {shapChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={shapChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="factor" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    formatter={(value: number | undefined) => [`${value?.toFixed(1)}%`, "Impacto"]}
                  />
                  <Bar dataKey="impacto" fill="#8884d8" radius={[0, 4, 4, 0]} name="Impacto Promedio">
                    {shapChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Esperando datos de explicabilidad...
              </div>
            )}
          </div>
        </div>

        {/* Por categoría */}
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
                    dataKey="category" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    interval={0} angle={-15} textAnchor="end" height={50}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip cursor={{ fill: "#f9fafb" }} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="fraudes" radius={[4, 4, 0, 0]} barSize={35} fill={COLORS.red} name="Fraudes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No hay datos de categorías
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: Demografía + Temporal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemographicsPanel data={demoData} />
        <TemporalPanel data={temporalData} />
      </div>

      {/* Fila 4: Perfiles de Clustering (K-Means) */}
      <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
        <FraudClusterProfiles />
      </div>
    </div>
  );
}
