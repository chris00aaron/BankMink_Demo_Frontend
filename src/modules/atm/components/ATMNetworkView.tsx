import { useState } from "react";
import {
  MapPin, DollarSign, TrendingDown, TrendingUp, Calendar,
  Activity, AlertCircle, CheckCircle2, RefreshCw, WifiOff,
  Loader2, Cpu, Wifi, ListFilter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui-atm/card";
import { Badge } from "@shared/components/ui-atm/badge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@shared/components/ui-atm/dialog";
import { Progress } from "@shared/components/ui-atm/progress";
import { ATMWithStatus } from "../services/atmService";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAtmNetwork } from "../hooks/useAtmQueries";

// ─── Leaflet icon fix ─────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createColorMarker = (color: string) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;background:${color};
      border:3px solid white;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

// ─── Health helpers ───────────────────────────────────────────────────────────
const getHealthStatus = (atm: ATMWithStatus) => {
  const pct = (atm.currentBalance / (atm.atmData.maxCapacity ?? 1)) * 100;
  if (pct < 20) return { status: "CRÍTICO", color: "#EF4444", level: "critical" };
  if (pct < 40) return { status: "BAJO",    color: "#F59E0B", level: "warning"  };
  // NORMAL = azul → claramente distinto del verde ÓPTIMO
  if (pct < 70) return { status: "NORMAL",  color: "#3B82F6", level: "normal"   };
  return              { status: "ÓPTIMO",  color: "#10B981", level: "optimal"  };
};

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  warning:  { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  normal:   { bg: "#DBEAFE", text: "#1E3A5F", border: "#93C5FD" },
  optimal:  { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
};

const PIE_COLORS: Record<string, string> = {
  CRÍTICO: "#EF4444",
  BAJO:    "#F59E0B",
  NORMAL:  "#3B82F6",
  ÓPTIMO:  "#10B981",
};

// ─── Filter ───────────────────────────────────────────────────────────────────
type FilterOption = "all" | "active" | "inactive";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-300 ${className}`} />;
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <WifiOff className="mb-4 h-12 w-12 text-red-400" />
      <h3 className="mb-2 text-lg font-semibold text-red-700">Error al cargar la red de ATMs</h3>
      <p className="mb-6 max-w-sm text-sm text-red-500">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-red-700 active:scale-95"
      >
        <RefreshCw className="h-4 w-4" />Reintentar
      </button>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
function FilterBar({
  filter, onChange, total, active, inactive,
}: {
  filter: FilterOption; onChange: (f: FilterOption) => void;
  total: number; active: number; inactive: number;
}) {
  type Opt = { key: FilterOption; label: string; count: number; icon: React.ReactNode; activeStyle: string };
  const opts: Opt[] = [
    { key: "all",      label: "Todos",    count: total,    icon: <ListFilter className="h-4 w-4" />, activeStyle: "bg-gray-800 text-white shadow" },
    { key: "active",   label: "Activos",  count: active,   icon: <Wifi       className="h-4 w-4" />, activeStyle: "bg-emerald-600 text-white shadow shadow-emerald-200" },
    { key: "inactive", label: "Inactivos",count: inactive, icon: <WifiOff    className="h-4 w-4" />, activeStyle: "bg-rose-500 text-white shadow shadow-rose-200" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl border border-gray-400 bg-gray-200 p-1">
      {opts.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
            filter === o.key ? o.activeStyle : "text-gray-600 hover:bg-gray-300"
          }`}
        >
          {o.icon}
          {o.label}
          <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
            filter === o.key ? "bg-white/25" : "bg-gray-400/60 text-gray-700"
          }`}>{o.count}</span>
        </button>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, iconBg, accent, borderColor, extra,
}: {
  label: string; value: string | number; sub: string; icon: React.ReactNode;
  iconBg: string; accent: string; borderColor: string; extra?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${borderColor} bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}>
      <div className={`absolute -right-5 -top-5 h-24 w-24 rounded-full opacity-10 ${iconBg}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
          <p className={`mt-1 text-3xl font-black leading-none ${accent}`}>{value}</p>
          <p className="mt-1.5 text-sm text-gray-500 truncate">{sub}</p>
          {extra && <div className="mt-3">{extra}</div>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Pie legend ───────────────────────────────────────────────────────────────
function PieLegend({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {data.map(d => (
        <div key={d.name} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2">
          <span className="h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-700 truncate">{d.name}</p>
            <p className="text-xs text-gray-500">
              {d.value} ATM · {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ATM location map ─────────────────────────────────────────────────────────
function ATMLocationMap({ atm }: { atm: ATMWithStatus }) {
  const { latitude, longitude } = atm.atmData;
  const health = getHealthStatus(atm);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 px-4 py-2.5">
        <MapPin className="h-4 w-4 text-teal-600" />
        <span className="text-sm font-bold text-gray-700">Ubicación del ATM</span>
        <span className="ml-auto font-mono text-xs text-gray-500">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </span>
      </div>
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        style={{ height: "260px", width: "100%" }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={createColorMarker(health.color)}>
          <Popup>
            <div className="space-y-0.5 text-sm">
              <p className="font-bold text-gray-800">{atm.atmData.address || `ATM ${atm.idAtm}`}</p>
              <p className="text-gray-500">{atm.atmData.locationType}</p>
              <p style={{ color: health.color }} className="font-bold">{health.status}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export function ATMNetworkView() {
  const { data: all = [], isLoading, isError, error, refetch, isFetching } = useAtmNetwork();
  const [selectedATM, setSelectedATM] = useState<ATMWithStatus | null>(null);
  const [filter, setFilter] = useState<FilterOption>("all");

  const activeCount   = all.filter(a => a.atmData.active).length;
  const inactiveCount = all.length - activeCount;

  const atmsWithStatus =
    filter === "active"   ? all.filter(a =>  a.atmData.active) :
    filter === "inactive" ? all.filter(a => !a.atmData.active) :
    all;

  const totalBalance  = all.reduce((s, a) => s + a.currentBalance, 0);
  const totalCapacity = all.reduce((s, a) => s + (a.atmData.maxCapacity ?? 0), 0);
  const avgUsage      = totalCapacity > 0 ? (totalBalance / totalCapacity) * 100 : 0;
  const criticalATMs  = all.filter(a => getHealthStatus(a).level === "critical").length;

  const capacityData = all.map(a => ({
    name:     a.atmData.address?.split(",")[0] ?? `ATM ${a.id}`,
    balance:  a.currentBalance,
    capacity: a.atmData.maxCapacity ?? 0,
  }));

  const healthDistribution = ["CRÍTICO", "BAJO", "NORMAL", "ÓPTIMO"]
    .map(label => ({
      name:  label,
      value: all.filter(a => getHealthStatus(a).status === label).length,
      color: PIE_COLORS[label],
    }))
    .filter(d => d.value > 0);

  if (isLoading) return <LoadingState />;
  if (isError) return (
    <ErrorState
      message={(error as Error)?.message ?? "No se pudo conectar con el servidor. Verifica tu conexión."}
      onRetry={refetch}
    />
  );

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isFetching && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />Actualizando…
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="ATMs Activos"
          value={activeCount}
          sub={`de ${all.length} totales`}
          icon={<Cpu className="h-6 w-6 text-teal-700" />}
          iconBg="bg-teal-100"
          accent="text-teal-700"
          borderColor="border-teal-300"
        />
        <KpiCard
          label="Balance Total"
          value={`$${(totalBalance / 1000).toFixed(1)}K`}
          sub={`Capacidad: $${(totalCapacity / 1000).toFixed(0)}K`}
          icon={<DollarSign className="h-6 w-6 text-blue-700" />}
          iconBg="bg-blue-100"
          accent="text-blue-700"
          borderColor="border-blue-300"
        />
        <KpiCard
          label="Uso Promedio"
          value={`${avgUsage.toFixed(1)}%`}
          sub="de la capacidad total"
          icon={<Activity className="h-6 w-6 text-violet-700" />}
          iconBg="bg-violet-100"
          accent="text-violet-700"
          borderColor="border-violet-300"
          extra={<Progress value={avgUsage} className="h-2.5 rounded-full" />}
        />
        <KpiCard
          label="Estado de la Red"
          value={criticalATMs > 0 ? String(criticalATMs) : "OK"}
          sub={criticalATMs > 0 ? "ATMs en estado crítico" : "Todos los ATMs operativos"}
          icon={
            criticalATMs > 0
              ? <AlertCircle  className="h-6 w-6 text-red-700"     />
              : <CheckCircle2 className="h-6 w-6 text-emerald-700" />
          }
          iconBg={criticalATMs > 0 ? "bg-red-100" : "bg-emerald-100"}
          accent={criticalATMs > 0 ? "text-red-700" : "text-emerald-700"}
          borderColor={criticalATMs > 0 ? "border-red-400" : "border-emerald-300"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Donut — salud */}
        <Card className="border border-gray-300 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Activity className="h-5 w-5 text-teal-500" />
              Estado de Salud
            </CardTitle>
            <CardDescription className="text-gray-500">Distribución por nivel de criticidad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%" cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {healthDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff", border: "1px solid #d1d5db",
                    borderRadius: "8px", color: "#111827", fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={healthDistribution} />
          </CardContent>
        </Card>

        {/* Bar — efectivo */}
        <Card className="border border-gray-300 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Niveles de Efectivo
            </CardTitle>
            <CardDescription className="text-gray-500">Balance actual vs capacidad máxima</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={capacityData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 11 }} />
                <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff", border: "1px solid #d1d5db",
                    borderRadius: "8px", color: "#111827",
                  }}
                />
                <Legend wrapperStyle={{ color: "#4b5563" }} />
                <Bar dataKey="balance"  fill="#14B8A6" name="Balance"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" fill="#565656ff" name="Capacidad" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ATM grid */}
      <Card className="border border-gray-300 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MapPin className="h-5 w-5 text-teal-500" />
                Red de ATMs
              </CardTitle>
              <CardDescription className="mt-1 text-gray-500">
                Haz clic en un cajero para ver todos los detalles
              </CardDescription>
            </div>
            <FilterBar
              filter={filter}
              onChange={setFilter}
              total={all.length}
              active={activeCount}
              inactive={inactiveCount}
            />
          </div>
        </CardHeader>
        <CardContent>
          {atmsWithStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Cpu className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No hay ATMs en esta categoría</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {atmsWithStatus.map(atm => {
                const health   = getHealthStatus(atm);
                const pct      = (atm.currentBalance / (atm.atmData.maxCapacity ?? 1)) * 100;
                const badge    = BADGE_STYLES[health.level];
                const syncDays = atm.updatedAt
                  ? differenceInDays(new Date(), new Date(atm.updatedAt))
                  : null;

                return (
                  <div
                    key={atm.id}
                    onClick={() => setSelectedATM(atm)}
                    className={`cursor-pointer rounded-xl border-2 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      health.level === "critical" ? "border-red-300   hover:border-red-500   hover:shadow-red-100"
                      : health.level === "warning"  ? "border-amber-300 hover:border-amber-500 hover:shadow-amber-100"
                      : health.level === "normal"   ? "border-blue-200  hover:border-blue-400  hover:shadow-blue-50"
                      :                              "border-gray-300  hover:border-teal-400  hover:shadow-teal-50"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">
                          {atm.atmData.address || `ATM ${atm.id}`}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {atm.atmData.locationType} · ID: {atm.id}
                        </p>
                      </div>
                      <Badge
                        className="shrink-0 border text-xs font-bold px-2.5 py-1"
                        style={{
                          backgroundColor: badge.bg,
                          color:           badge.text,
                          borderColor:     badge.border,
                        }}
                      >
                        {health.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">Balance</span>
                          <span className="text-sm font-bold text-teal-700">
                            ${atm.currentBalance.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {pct.toFixed(1)}% de ${(atm.atmData.maxCapacity ?? 0).toLocaleString()}
                          </span>
                          {pct < 20 && (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                              <AlertCircle className="h-3 w-3" />Recarga urgente
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {atm.lastTransactionDate && (
                          <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                            <p className="text-gray-500">Última transacción</p>
                            <p className="font-bold text-blue-700">
                              {format(new Date(atm.lastTransactionDate), "dd/MM/yyyy", { locale: es })}
                            </p>
                          </div>
                        )}
                        {atm.lastReloadDate && (
                          <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                            <p className="text-gray-500">Última recarga</p>
                            <p className="font-bold text-emerald-700">
                              {format(new Date(atm.lastReloadDate), "dd/MM/yyyy", { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />Sync #{atm.lastSyncId}
                        </span>
                        {syncDays !== null && (
                          <span className={syncDays > 1 ? "font-bold text-amber-600" : "font-bold text-emerald-700"}>
                            {syncDays === 0 ? "Hoy" : `Hace ${syncDays}d`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      <Dialog open={selectedATM !== null} onOpenChange={() => setSelectedATM(null)}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 bg-white">

          {/* Header fijo */}
          <DialogHeader className="shrink-0 border-b border-gray-200 bg-gray-100 px-6 py-4">
            <DialogTitle className="flex items-center gap-2 font-black text-gray-900">
              <MapPin className="h-5 w-5 text-teal-500" />
              {selectedATM?.atmData.address || `ATM ${selectedATM?.id}`}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Información detallada del cajero automático
            </DialogDescription>
          </DialogHeader>

          {/* Scroll container */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {selectedATM && (() => {
              const health = getHealthStatus(selectedATM);
              const pct    = (selectedATM.currentBalance / (selectedATM.atmData.maxCapacity ?? 1)) * 100;

              return (
                <>
                  {/* Estado de salud */}
                  <div className={`rounded-xl border-2 p-4 ${
                    health.level === "critical" ? "border-red-300 bg-red-50"
                    : health.level === "warning"  ? "border-amber-300 bg-amber-50"
                    : health.level === "optimal"  ? "border-emerald-300 bg-emerald-50"
                    :                              "border-blue-300 bg-blue-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                          Estado de Salud
                        </p>
                        <p className="text-3xl font-black" style={{ color: health.color }}>
                          {health.status}
                        </p>
                      </div>
                      {health.level === "critical"
                        ? <AlertCircle  className="h-12 w-12 text-red-400"     />
                        : <CheckCircle2 className="h-12 w-12 text-emerald-400" />}
                    </div>
                  </div>

                  {/* Info general — String() garantiza que el número se renderiza */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-300 bg-gray-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">ID del ATM</p>
                      <p className="mt-1 text-2xl font-black text-teal-700">
                        #{String(selectedATM.id)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-300 bg-gray-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Tipo de Ubicación</p>
                      <p className="mt-1 text-2xl font-black text-blue-700">
                        {selectedATM.atmData.locationType}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-300 bg-gray-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Estado</p>
                      <p className={`mt-1 text-2xl font-black ${
                        selectedATM.atmData.active ? "text-emerald-700" : "text-red-600"
                      }`}>
                        {selectedATM.atmData.active ? "✓ Activo" : "✗ Inactivo"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-300 bg-gray-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Último Sync</p>
                      <p className="mt-1 text-2xl font-black text-violet-700">
                        #{String(selectedATM.lastSyncId ?? "—")}
                      </p>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-teal-800">Balance Actual</p>
                      <p className="text-3xl font-black text-teal-800">
                        ${selectedATM.currentBalance.toLocaleString()}
                      </p>
                    </div>
                    <Progress value={pct} className="h-3 rounded-full mb-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Capacidad máxima: ${(selectedATM.atmData.maxCapacity ?? 0).toLocaleString()}
                      </span>
                      <span className="font-black text-teal-800">{pct.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Actividad reciente */}
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Actividad Reciente
                    </h4>
                    <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-300">
                      {[
                        { label: "Última Transacción", icon: <Activity     className="h-4 w-4 text-blue-400"    />, date: selectedATM.lastTransactionDate, color: "text-blue-700"    },
                        { label: "Último Retiro",       icon: <TrendingDown className="h-4 w-4 text-red-400"     />, date: selectedATM.lastWithdrawalDate,  color: "text-red-700"    },
                        { label: "Último Depósito",     icon: <TrendingUp   className="h-4 w-4 text-emerald-500" />, date: selectedATM.lastDepositDate,     color: "text-emerald-700"},
                        { label: "Última Recarga",      icon: <RefreshCw    className="h-4 w-4 text-violet-500"  />, date: selectedATM.lastReloadDate,      color: "text-violet-700" },
                        { label: "Última Actualización",icon: <Calendar     className="h-4 w-4 text-gray-400"    />, date: selectedATM.updatedAt,           color: "text-gray-700",  fmt: "dd/MM/yyyy HH:mm:ss" },
                      ]
                        .filter(r => r.date)
                        .map(({ label, icon, date, color, fmt }) => (
                          <div key={label} className="flex items-center justify-between bg-white px-4 py-3">
                            <span className="flex items-center gap-2 text-sm text-gray-600">{icon}{label}</span>
                            <span className={`text-sm font-bold ${color}`}>
                              {format(new Date(date!), fmt ?? "dd 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Mapa */}
                  <ATMLocationMap atm={selectedATM} />
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}