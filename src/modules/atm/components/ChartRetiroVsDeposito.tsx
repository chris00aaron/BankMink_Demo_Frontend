import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CalendarDays,
  RefreshCw,
  Activity,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/* ─────────────────────────────────────────
   UTILIDADES DE AGRUPACIÓN INTELIGENTE
───────────────────────────────────────── */

function daysBetween(a, b) {
  return Math.abs((new Date(b) - new Date(a)) / 86_400_000);
}

// Agrupa un array de puntos { date: "YYYY-MM-DD", Retiros, Depósitos }
// según el número de días del rango seleccionado.
function aggregateSeries(data, days) {
  if (!data || data.length === 0) return [];

  // ≤ 60 días → diario (sin agrupación)
  if (days <= 60) return data;

  // ≤ 180 días → semanal
  if (days <= 180) {
    const buckets = {};
    data.forEach((pt) => {
      const d = new Date(pt.date);
      // Obtener el lunes de esa semana
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const key = monday.toISOString().slice(0, 10);
      if (!buckets[key])
        buckets[key] = { date: key, Retiros: 0, Depósitos: 0, count: 0 };
      buckets[key].Retiros += pt.Retiros || 0;
      buckets[key].Depósitos += pt.Depósitos || 0;
      buckets[key].count++;
    });
    return Object.values(buckets).sort((a, b) =>
      a.date.localeCompare(b.date)
    ).map((b) => ({
      date: formatLabel(b.date, "week"),
      Retiros: b.Retiros,
      Depósitos: b.Depósitos,
    }));
  }

  // > 180 días → mensual
  const buckets = {};
  data.forEach((pt) => {
    const key = pt.date.slice(0, 7); // "YYYY-MM"
    if (!buckets[key])
      buckets[key] = { date: key, Retiros: 0, Depósitos: 0 };
    buckets[key].Retiros += pt.Retiros || 0;
    buckets[key].Depósitos += pt.Depósitos || 0;
  });
  return Object.values(buckets).sort((a, b) =>
    a.date.localeCompare(b.date)
  ).map((b) => ({
    date: formatLabel(b.date, "month"),
    Retiros: b.Retiros,
    Depósitos: b.Depósitos,
  }));
}

function formatLabel(dateStr, mode) {
  if (mode === "month") {
    const [y, m] = dateStr.split("-");
    const months = [
      "Ene","Feb","Mar","Abr","May","Jun",
      "Jul","Ago","Sep","Oct","Nov","Dic",
    ];
    return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
  }
  if (mode === "week") {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  return dateStr;
}

/* ─────────────────────────────────────────
   TOOLTIP PERSONALIZADO
───────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="font-medium text-slate-300">{p.dataKey}</span>
          <span className="ml-auto pl-4 font-bold" style={{ color: p.color }}>
            {p.value >= 1000
              ? `S/ ${(p.value / 1000).toFixed(1)}K`
              : `S/ ${p.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   BADGE DE MODO ACTUAL
───────────────────────────────────────── */
function GranularityBadge({ days }) {
  if (days <= 60)
    return (
      <span className="rounded-full border border-sky-700/40 bg-sky-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">
        Vista diaria
      </span>
    );
  if (days <= 180)
    return (
      <span className="rounded-full border border-violet-700/40 bg-violet-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-400">
        Vista semanal
      </span>
    );
  return (
    <span className="rounded-full border border-amber-700/40 bg-amber-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400">
      Vista mensual
    </span>
  );
}

/* ─────────────────────────────────────────
   INPUT DE FECHA MEJORADO
───────────────────────────────────────── */
function DateInput({ label, value, onChange, icon: Icon }) {
  return (
    <div className="group relative flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-amber-400">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <div className="flex items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800/80 transition-all duration-200 focus-within:border-amber-500/60 focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-amber-500/10">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-none bg-transparent px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none [color-scheme:dark]"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DATOS DE DEMO
───────────────────────────────────────── */
function generateDemoData(desde, hasta) {
  const data = [];
  let cur = new Date(desde + "T00:00:00");
  const end = new Date(hasta + "T00:00:00");
  while (cur <= end) {
    data.push({
      date: cur.toISOString().slice(0, 10),
      Retiros: Math.round(Math.random() * 8000 + 1000),
      Depósitos: Math.round(Math.random() * 12000 + 2000),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return data;
}

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
export default function ChartSection({
  // Props reales que recibirías de tu sistema:
  chartSeries: externalSeries,
  chartLoading,
  chartError,
  refetchChart,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const [desde, setDesde] = useState(thirtyAgo);
  const [hasta, setHasta] = useState(today);
  const [appliedDesde, setAppliedDesde] = useState(thirtyAgo);
  const [appliedHasta, setAppliedHasta] = useState(today);

  // En demo usamos datos generados; en producción usa externalSeries filtrado
  const rawSeries = useMemo(
    () => generateDemoData(appliedDesde, appliedHasta),
    [appliedDesde, appliedHasta]
  );

  const days = daysBetween(appliedDesde, appliedHasta);

  const series = useMemo(
    () => aggregateSeries(rawSeries, days),
    [rawSeries, days]
  );

  function applyDateFilter() {
    setAppliedDesde(desde);
    setAppliedHasta(hasta);
  }

  // Cuántos px por punto, con un mínimo razonable
  const minWidth = Math.min(Math.max(series.length * 52, 480), 2400);
  const needsScroll = minWidth > 600;

  // KPIs rápidos
  const totalDep = rawSeries.reduce((s, p) => s + p.Depósitos, 0);
  const totalRet = rawSeries.reduce((s, p) => s + p.Retiros, 0);
  const balance = totalDep - totalRet;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      {/* ── Cabecera ───────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
        {/* Título + KPIs */}
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold tracking-tight text-slate-100">
              Flujo de Caja
            </h2>
            <GranularityBadge days={days} />
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            <Kpi
              label="Depósitos"
              value={totalDep}
              icon={TrendingUp}
              color="text-emerald-400"
            />
            <Kpi
              label="Retiros"
              value={totalRet}
              icon={TrendingDown}
              color="text-rose-400"
            />
            <Kpi
              label="Balance"
              value={balance}
              icon={balance >= 0 ? TrendingUp : TrendingDown}
              color={balance >= 0 ? "text-sky-400" : "text-amber-400"}
            />
          </div>
        </div>

        {/* Controles de fecha */}
        <div className="flex flex-wrap items-end gap-3">
          <DateInput
            label="Desde"
            value={desde}
            onChange={setDesde}
            icon={CalendarDays}
          />
          <DateInput
            label="Hasta"
            value={hasta}
            onChange={setHasta}
            icon={CalendarDays}
          />
          <button
            onClick={applyDateFilter}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-amber-600/40 bg-amber-950/80 px-4 text-[11px] font-bold uppercase tracking-widest text-amber-400 transition-all duration-200 hover:border-amber-500/60 hover:bg-amber-900/60 hover:shadow-lg hover:shadow-amber-900/20 active:scale-95"
          >
            <RefreshCw className="h-3 w-3" />
            Aplicar
          </button>
        </div>
      </div>

      {/* ── Gráfico ───────────────────────── */}
      <div className="p-6">
        {chartError ? (
          <ErrorState refetch={refetchChart} />
        ) : chartLoading ? (
          <LoadingState />
        ) : (
          <ChartCanvas series={series} minWidth={minWidth} needsScroll={needsScroll} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SUB-COMPONENTES
───────────────────────────────────────── */

function Kpi({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-xs font-bold ${color}`}>
        {value >= 1_000_000
          ? `S/ ${(value / 1_000_000).toFixed(2)}M`
          : `S/ ${(value / 1000).toFixed(1)}K`}
      </span>
    </div>
  );
}

function ErrorState({ refetch }) {
  return (
    <div className="flex h-52 flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-800/40 bg-rose-950/40">
        <AlertCircle className="h-5 w-5 text-rose-500" />
      </div>
      <p className="text-sm text-slate-400">No se pudo cargar la gráfica.</p>
      <button
        onClick={() => refetch?.()}
        className="rounded-lg border border-amber-700/40 bg-amber-950/60 px-4 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-900/40"
      >
        Reintentar
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-52 flex-col items-center justify-center gap-2">
      <Activity className="h-6 w-6 animate-pulse text-amber-400" />
      <p className="text-xs text-slate-600">Cargando datos...</p>
    </div>
  );
}

function ChartCanvas({ series, minWidth, needsScroll }) {
  return (
    <div className="relative">
      {/* Indicador visual de scroll */}
      {needsScroll && (
        <div className="mb-3 flex items-center justify-end gap-1.5">
          <span className="text-[9px] font-medium text-slate-600">
            Desplaza para ver más
          </span>
          <span className="text-[9px] text-slate-700">→</span>
        </div>
      )}

      {/* Contenedor de scroll con fade en los bordes */}
      <div className="relative">
        {/* Gradientes que indican scroll posible */}
        {needsScroll && (
          <>
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-slate-900 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
          </>
        )}

        {/* Scroll con estilo personalizado via className */}
        <div
          className="overflow-x-auto pb-2"
          style={{
            /* Scrollbar delgada y con el tema oscuro */
            scrollbarWidth: "thin",
            scrollbarColor: "#334155 transparent",
          }}
        >
          <div style={{ minWidth, width: "100%" }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={series}
                margin={{ top: 8, right: 24, bottom: 0, left: 8 }}
              >
                <defs>
                  <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "#475569",
                    fontSize: 10,
                    fontFamily: "inherit",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{
                    fill: "#475569",
                    fontSize: 10,
                    fontFamily: "inherit",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${(v / 1000).toFixed(0)}K`
                  }
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 10, paddingTop: 12 }}
                  formatter={(value) => (
                    <span style={{ color: "#94a3b8", fontSize: 10 }}>
                      {value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="Retiros"
                  stroke="#F43F5E"
                  fill="url(#gW)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#F43F5E", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="Depósitos"
                  stroke="#10B981"
                  fill="url(#gD)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
