import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Info,
  ServerCrash,
  RefreshCw,
  Database,
  Eye,
  Gauge,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui-atm/card";
import { Badge } from "@shared/components/ui-atm/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui-atm/dialog";
import { ScrollArea } from "@shared/components/ui-atm/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shared/components/ui-atm/tabs";
import { useAllFeatures } from "../hooks/useFeatures";
import { useLatestMonitor } from "../hooks/usePerformanceMonitors";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Area,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de formato
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formato con máximo 3 dígitos significativos, sin notación científica.
 *   12345    → "12345"
 *   123.456  → "123.5"
 *   12.3456  → "12.35"
 *   1.23456  → "1.235"
 *   0.00123  → "0.001"
 */
function fmt(value: number | null | undefined, suffix = ""): string {
  if (value == null || isNaN(value)) return "N/A";
  if (value === 0) return "0" + suffix;
  const abs = Math.abs(value);
  let s: string;
  if (abs >= 1000) s = value.toFixed(0);
  else if (abs >= 100) s = value.toFixed(1);
  else if (abs >= 10) s = value.toFixed(2);
  else s = value.toFixed(3);
  return s + suffix;
}

function fmtPct(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "N/A";
  return fmt(Number(value) * 100, "%");
}

// ─────────────────────────────────────────────────────────────────────────────
// Paleta de colores — contraste seguro sobre fondo blanco
// ─────────────────────────────────────────────────────────────────────────────

const ALERT_HEX: Record<string, string> = {
  OK: "#059669",
  WARNING: "#D97706",
  CRITICAL: "#DC2626",
  SKIPPED: "#64748B",
};

const ALERT_CLASSES: Record<string, string> = {
  OK: "bg-emerald-100 border-emerald-300 text-emerald-800",
  WARNING: "bg-amber-100  border-amber-300  text-amber-800",
  CRITICAL: "bg-red-100    border-red-300    text-red-800",
  SKIPPED: "bg-slate-100  border-slate-300  text-slate-700",
};

const getAlertColor = (a: string) => ALERT_HEX[a] ?? ALERT_HEX.OK;
const getAlertClass = (a: string) => ALERT_CLASSES[a] ?? ALERT_CLASSES.OK;

const tooltipStyle = {
  backgroundColor: "#f8fafc",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton de carga
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-slate-200" />
      <div className="h-96 rounded-xl bg-slate-200" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estado de error
// ─────────────────────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-2 border-red-200 bg-red-50 shadow-md">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <ServerCrash className="h-12 w-12 text-red-400" />
        <div className="text-center">
          <p className="text-lg font-semibold text-red-700">{message}</p>
          <p className="mt-1 text-sm text-red-600">
            No fue posible conectar con el servidor. Verifica tu conexión e
            intenta de nuevo.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estado vacío
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Card className="border-2 border-slate-200 bg-slate-50 shadow-md">
      <CardContent className="flex flex-col items-center gap-3 py-12">
        <Database className="h-10 w-10 text-slate-400" />
        <p className="text-base font-medium text-slate-600">
          No hay datos de features disponibles todavía.
        </p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal — sin props, todo cargado internamente
// ─────────────────────────────────────────────────────────────────────────────

export function DataStabilityView() {
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<string | null>(
    null,
  );

  // ── Hooks de datos ─────────────────────────────────────────────────────────
  const {
    data: featuresData,
    isLoading: featuresLoading,
    isError: featuresError,
    refetch: refetchFeatures,
  } = useAllFeatures();

  const {
    data: latestMonitor,
    isLoading: monitorLoading,
    isError: monitorError,
    refetch: refetchMonitor,
  } = useLatestMonitor();

  // Extraer del resultado del select
  const atmFeatures = featuresData?.features ?? [];
  const totalElements = featuresData?.totalElements ?? 0;

  // ── Estados de UI ──────────────────────────────────────────────────────────
  const isLoading = featuresLoading || monitorLoading;
  const isError = featuresError || monitorError;

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <ErrorState
        message="Error al cargar los datos de estabilidad"
        onRetry={() => {
          refetchFeatures();
          refetchMonitor();
        }}
      />
    );
  }

  if (!atmFeatures.length) return <EmptyState />;

  // ── Derivaciones ───────────────────────────────────────────────────────────

  // Solo features con dynamicFeatures, ordenados por fecha asc para los gráficos
  const featureHistory = [...atmFeatures]
    .filter((f) => f.dynamicFeatures?.dynamicFeatures != null)
    .sort(
      (a, b) =>
        new Date(a.referenceDate).getTime() -
        new Date(b.referenceDate).getTime(),
    );

  // Datos para gráficos de tendencia
  const featureTrendData = featureHistory.map((f) => ({
    date: format(new Date(f.referenceDate), "dd/MM"),
    lag1: f.dynamicFeatures!.dynamicFeatures.lag1 ?? 0,
    lag5: f.dynamicFeatures!.dynamicFeatures.lag5 ?? 0,
    lag11: f.dynamicFeatures!.dynamicFeatures.lag11 ?? 0,
    tendencia_lags: f.dynamicFeatures!.dynamicFeatures.tendencia_lags ?? 0,
    ratio_finde_vs_semana:
      f.dynamicFeatures!.dynamicFeatures.ratio_finde_vs_semana ?? 0,
    retiros_finde_anterior:
      f.dynamicFeatures!.dynamicFeatures.retiros_finde_anterior ?? 0,
    retiros_domingo_anterior:
      f.dynamicFeatures!.dynamicFeatures.retiros_domingo_anterior ?? 0,
    withdrawal_amount: f.withdrawalAmountDay ?? 0,
  }));

  // Estadísticas por nombre de feature
  type DynKey = keyof NonNullable<
    NonNullable<
      (typeof featureHistory)[0]["dynamicFeatures"]
    >["dynamicFeatures"]
  >;

  function calculateStats(featureName: DynKey) {
    const values = featureHistory
      .map((f) => f.dynamicFeatures?.dynamicFeatures[featureName])
      .filter((v): v is number => v != null);

    if (!values.length) return { mean: 0, min: 0, max: 0, std: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const std = Math.sqrt(
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length,
    );
    return { mean, min, max, std };
  }

  // Datos PSI aplanados
  const psiData = latestMonitor?.psiResults
    ? Object.entries(latestMonitor.psiResults).map(([feature, result]) => ({
        feature: feature.replace(/_/g, " "),
        featureKey: feature,
        psi: result.psi,
        alert: result.alert,
        samples: result.prodSamples,
        ...calculateStats(feature as DynKey),
      }))
    : [];

  const criticalFeatures = psiData.filter((f) => f.alert === "CRITICAL");
  const warningFeatures = psiData.filter((f) => f.alert === "WARNING");

  // PSI del feature seleccionado en el modal
  const selectedFeaturePSI =
    selectedFeatureKey && latestMonitor?.psiResults
      ? (latestMonitor.psiResults[selectedFeatureKey] ?? null)
      : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-teal-300 bg-gradient-to-br from-teal-100 to-white shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-teal-700">
              Features Monitoreados
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-teal-700">
              {latestMonitor?.summary.total_features ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-teal-600">
              {latestMonitor?.summary.n_ok ?? 0} estables
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-violet-300 bg-gradient-to-br from-violet-100 to-white shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-violet-700">
              PSI Máximo
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-violet-700">
              {latestMonitor ? fmt(latestMonitor.summary.worst_psi) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-sm font-medium text-violet-600">
              {latestMonitor?.summary.worst_feature.replace(/_/g, " ") ?? "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-2 shadow-md ${
            criticalFeatures.length > 0
              ? "border-red-300 bg-gradient-to-br from-red-100 to-white"
              : "border-emerald-300 bg-gradient-to-br from-emerald-100 to-white"
          }`}
        >
          <CardHeader className="pb-2">
            <CardDescription
              className={`font-medium ${
                criticalFeatures.length > 0
                  ? "text-red-700"
                  : "text-emerald-700"
              }`}
            >
              Features Críticos
            </CardDescription>
            <CardTitle
              className={`text-3xl font-bold ${
                criticalFeatures.length > 0
                  ? "text-red-700"
                  : "text-emerald-700"
              }`}
            >
              {criticalFeatures.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-600">
              {warningFeatures.length} en advertencia
            </p>
          </CardContent>
        </Card>

        {/* totalElements viene del SpringPage del backend */}
        <Card className="border-2 border-cyan-300 bg-gradient-to-br from-cyan-100 to-white shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-cyan-700">
              Registros Históricos
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-cyan-700">
              {totalElements.toLocaleString("es-PE")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-cyan-600">
              {featureHistory.length} cargados en vista
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Alerta de deriva crítica ──────────────────────────────────────── */}
      {latestMonitor && criticalFeatures.length > 0 && (
        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  Alerta de Deriva de Datos Detectada
                </CardTitle>
                <CardDescription className="mt-1 text-red-600">
                  {format(
                    new Date(latestMonitor.createdAt),
                    "dd 'de' MMMM 'de' yyyy, HH:mm",
                    { locale: es },
                  )}
                </CardDescription>
              </div>
              <Badge className="border border-red-300 bg-red-100 text-red-800 px-3 py-1 text-sm whitespace-nowrap">
                {latestMonitor.decision.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="mb-1 font-semibold text-red-800">
                    Acción Requerida
                  </p>
                  <p className="text-red-700">{latestMonitor.action}</p>
                  <p className="mt-2 text-sm text-red-600">
                    {latestMonitor.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {(
                [
                  { key: "mae", label: "MAE" },
                  { key: "mape", label: "MAPE" },
                  { key: "rmse", label: "RMSE" },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="rounded-lg border border-red-200 bg-white p-4 shadow-sm"
                >
                  <p className="mb-1 text-sm font-medium text-slate-600">
                    {label} Actual
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {key === "mape"
                      ? fmtPct(Number(latestMonitor.mape))
                      : fmt(latestMonitor[key])}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PSI Detallado ─────────────────────────────────────────────────── */}
      <Card className="border border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Gauge className="h-5 w-5 text-teal-600" />
            Análisis de Population Stability Index (PSI)
          </CardTitle>
          <CardDescription>
            Monitoreo de deriva de datos por feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!latestMonitor ? (
            <p className="py-8 text-center text-slate-500">
              Sin datos de monitoreo disponibles.
            </p>
          ) : (
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100">
                <TabsTrigger value="chart">Gráfico PSI</TabsTrigger>
                <TabsTrigger value="table">Tabla Detallada</TabsTrigger>
              </TabsList>

              {/* Gráfico horizontal */}
              <TabsContent value="chart" className="space-y-4 pt-2">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={psiData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis
                      type="number"
                      stroke="#475569"
                      tick={{ fill: "#475569", fontSize: 12 }}
                      tickFormatter={(v) => fmt(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke="#475569"
                      tick={{ fill: "#475569", fontSize: 12 }}
                      width={160}
                    />
                    <Tooltip
                      formatter={(v: number | undefined) => [fmt(v), "PSI"]}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="psi" radius={[0, 4, 4, 0]}>
                      {psiData.map((entry, i) => (
                        <Cell key={i} fill={getAlertColor(entry.alert)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid gap-2 md:grid-cols-4">
                  {[
                    {
                      range: "PSI < 0.1",
                      label: "Sin cambio significativo",
                      cls: "border-emerald-300 bg-emerald-50 text-emerald-800",
                    },
                    {
                      range: "0.1 ≤ PSI < 0.2",
                      label: "Cambio moderado",
                      cls: "border-amber-300  bg-amber-50  text-amber-800",
                    },
                    {
                      range: "PSI ≥ 0.2",
                      label: "Cambio significativo",
                      cls: "border-red-300    bg-red-50    text-red-800",
                    },
                    {
                      range: "Sin datos",
                      label: "Omitido",
                      cls: "border-slate-300  bg-slate-50  text-slate-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.range}
                      className={`rounded-lg border p-3 ${item.cls}`}
                    >
                      <p className="text-xs font-semibold">{item.range}</p>
                      <p className="mt-0.5 text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tabla detallada */}
              <TabsContent value="table" className="space-y-3 pt-2">
                {psiData.map((feature) => (
                  <div
                    key={feature.featureKey}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      feature.alert === "CRITICAL"
                        ? "border-red-300 bg-red-50"
                        : feature.alert === "WARNING"
                          ? "border-amber-300 bg-amber-50"
                          : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                    onClick={() => setSelectedFeatureKey(feature.featureKey)}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {feature.feature}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Muestras: {feature.samples}
                        </p>
                      </div>
                      <Badge
                        className={`border whitespace-nowrap ${getAlertClass(feature.alert)}`}
                      >
                        {feature.alert} — PSI: {fmt(feature.psi)}
                      </Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-4">
                      {[
                        {
                          label: "Media",
                          val: feature.mean,
                          cls: "text-teal-700",
                        },
                        {
                          label: "Mín",
                          val: feature.min,
                          cls: "text-cyan-700",
                        },
                        {
                          label: "Máx",
                          val: feature.max,
                          cls: "text-violet-700",
                        },
                        {
                          label: "Std",
                          val: feature.std,
                          cls: "text-purple-700",
                        },
                      ].map(({ label, val, cls }) => (
                        <div key={label} className="text-sm">
                          <span className="text-slate-500">{label}:</span>
                          <span className={`ml-2 font-semibold ${cls}`}>
                            {fmt(val)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeatureKey(feature.featureKey);
                      }}
                      className="mt-3 flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Ver tendencia histórica
                    </button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* ── Tendencias históricas ─────────────────────────────────────────── */}
      <Card className="border border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Activity className="h-5 w-5 text-cyan-600" />
            Tendencias Históricas de Features
          </CardTitle>
          <CardDescription>
            Evolución temporal de las características del modelo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lags" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-slate-100">
              <TabsTrigger value="lags">Lags</TabsTrigger>
              <TabsTrigger value="ratios">Ratios</TabsTrigger>
              <TabsTrigger value="retiros">Retiros</TabsTrigger>
              <TabsTrigger value="withdrawal">Montos</TabsTrigger>
            </TabsList>

            <TabsContent value="lags" className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={featureTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickFormatter={(v) => fmt(v)}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [fmt(v)]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="lag1"
                    stroke="#0D9488"
                    strokeWidth={2}
                    dot={false}
                    name="Lag 1"
                  />
                  <Line
                    type="monotone"
                    dataKey="lag5"
                    stroke="#0891B2"
                    strokeWidth={2}
                    dot={false}
                    name="Lag 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="lag11"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={false}
                    name="Lag 11"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="ratios" className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={featureTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickFormatter={(v) => fmt(v)}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [fmt(v)]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend />
                  <Bar
                    dataKey="ratio_finde_vs_semana"
                    fill="#0D9488"
                    name="Ratio Fin de Semana vs Semana"
                  />
                  <Line
                    type="monotone"
                    dataKey="tendencia_lags"
                    stroke="#DC2626"
                    strokeWidth={2}
                    dot={false}
                    name="Tendencia Lags"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="retiros" className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={featureTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickFormatter={(v) => fmt(v)}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [fmt(v)]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend />
                  <Bar
                    dataKey="retiros_finde_anterior"
                    fill="#0891B2"
                    name="Retiros Fin de Semana Anterior"
                  />
                  <Bar
                    dataKey="retiros_domingo_anterior"
                    fill="#7C3AED"
                    name="Retiros Domingo Anterior"
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="withdrawal" className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={featureTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickFormatter={(v) => fmt(v)}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [fmt(v)]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="withdrawal_amount"
                    fill="#0D9488"
                    stroke="#0D9488"
                    fillOpacity={0.25}
                    name="Monto de Retiros Diario"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Modal: tendencia del feature seleccionado ─────────────────────── */}
      <Dialog
        open={selectedFeatureKey !== null}
        onOpenChange={() => setSelectedFeatureKey(null)}
      >
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Info className="h-5 w-5 text-teal-600" />
              {selectedFeatureKey?.replace(/_/g, " ")}
            </DialogTitle>
            <DialogDescription>
              Análisis detallado del feature
            </DialogDescription>
          </DialogHeader>

          {selectedFeatureKey && selectedFeaturePSI && (
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-4">
                {/* PSI Score */}
                <div
                  className={`rounded-lg border-2 p-4 ${getAlertClass(selectedFeaturePSI.alert)}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold">PSI Score</h4>
                    <Badge className="px-3 py-1 text-lg">
                      {fmt(selectedFeaturePSI.psi)}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    Estado: <strong>{selectedFeaturePSI.alert}</strong>
                  </p>
                  <p className="text-sm">
                    Muestras en producción:{" "}
                    <strong>{selectedFeaturePSI.prodSamples}</strong>
                  </p>
                </div>

                {/* Gráfico de tendencia */}
                <div>
                  <h4 className="mb-3 font-semibold text-slate-800">
                    Tendencia Histórica
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={featureTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        tick={{ fill: "#475569", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fill: "#475569", fontSize: 12 }}
                        tickFormatter={(v) => fmt(v)}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => [fmt(v)]}
                        contentStyle={tooltipStyle}
                      />
                      <Line
                        type="monotone"
                        dataKey={selectedFeatureKey}
                        stroke="#0D9488"
                        strokeWidth={3}
                        dot={false}
                        name={selectedFeatureKey.replace(/_/g, " ")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
