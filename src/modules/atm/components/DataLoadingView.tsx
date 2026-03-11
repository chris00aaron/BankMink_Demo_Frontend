import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Clock,
  ArrowRight,
  XCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui-atm/dialog";
import { ScrollArea } from "@shared/components/ui-atm/scroll-area";
import { SyncLog, ProcessLogStep } from "../services/syncService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSyncLogs } from "../hooks/useSyncLogs";
import { useTransactionSummary, getDefaultDateRange } from "../hooks/useTransactions";
import ChartRetiroVsDeposito from "./ChartRetiroVsDeposito";

// ─────────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accentClass,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  accentClass: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-slate-900 p-5 transition-shadow hover:shadow-lg ${accentClass}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-100">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${accentClass.replace("border-", "bg-").replace("/30", "/10")}`}>
          <Icon className="h-5 w-5 opacity-80" />
        </div>
      </div>
    </div>
  );
}

// Tooltip personalizado para la gráfica
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 shadow-xl">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-100">
            S/ {Number(entry.value).toLocaleString("es-PE")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStatusIcon(status: string) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-rose-400" />;
    case "IN_PROGRESS":
      return <Activity className="h-4 w-4 animate-pulse text-amber-400" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-400" />;
  }
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    SUCCESS: "border-emerald-700/50 bg-emerald-950 text-emerald-400",
    FAILED: "border-rose-700/50 bg-rose-950 text-rose-400",
    IN_PROGRESS: "border-amber-700/50 bg-amber-950 text-amber-400 animate-pulse",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${map[status] ?? map.IN_PROGRESS}`}
    >
      {status}
    </span>
  );
}

function getStepColor(status: string) {
  switch (status) {
    case "OK":
      return "border-emerald-700/60 bg-emerald-950 text-emerald-400";
    case "ERROR":
      return "border-rose-700/60 bg-rose-950 text-rose-400";
    case "WARNING":
      return "border-amber-700/60 bg-amber-950 text-amber-400";
    default:
      return "border-slate-700/60 bg-slate-800 text-slate-400";
  }
}

function calculateDuration(start: string, end: string | null) {
  if (!end) return "En progreso…";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export function DataLoadingView() {
  const [selectedSync, setSelectedSync] = useState<SyncLog | null>(null);

  // Filtros de fecha para la gráfica
  const defaults = getDefaultDateRange();
  const [appliedDesde, setAppliedDesde] = useState(defaults.desde);
  const [appliedHasta, setAppliedHasta] = useState(defaults.hasta);

  // Hooks de datos
  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
    refetch: refetchChart,
  } = useTransactionSummary(appliedDesde, appliedHasta);

  const {
    data: pageData,
    isLoading: logsLoading,
    isError: logsError,
    isFetching: logsFetching,
    refetch: refetchLogs,
    page,
    totalPages,
    totalElements,
    canPreviousPage,
    canNextPage,
    goToNextPage,
    goToPreviousPage,
  } = useSyncLogs(5);

  const logs: SyncLog[] = pageData?.content ?? [];

  // Métricas de la página actual
  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;
  const totalProcessed = logs.reduce((s, l) => s + (l.recordsProcessed ?? 0), 0);
  const totalInserted = logs.reduce((s, l) => s + (l.recordsInserted ?? 0), 0);
  const totalUpdated = logs.reduce((s, l) => s + (l.recordsUpdated ?? 0), 0);

  // Normalizar chartData para recharts
  const chartSeries =
    chartData?.map((d) => ({
      date: d.date,
      Retiros: d.withdrawalTotal,
      Depósitos: d.depositTotal,
    })) ?? [];

  return (
    <div className="space-y-6 font-[system-ui]">
      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Tasa de Éxito"
          value={`${successRate.toFixed(1)}%`}
          sub={`${successCount} de ${logs.length} en esta página`}
          accentClass="border-emerald-800/30 text-emerald-400"
        />
        <StatCard
          icon={Layers}
          label="Registros Procesados"
          value={totalProcessed.toLocaleString()}
          sub="Total acumulado"
          accentClass="border-sky-800/30 text-sky-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Insertados"
          value={totalInserted.toLocaleString()}
          sub="Nuevos registros"
          accentClass="border-violet-800/30 text-violet-400"
        />
        <StatCard
          icon={RefreshCw}
          label="Actualizados"
          value={totalUpdated.toLocaleString()}
          sub="Modificaciones"
          accentClass="border-amber-800/30 text-amber-400"
        />
      </div>

      {/* ── Gráfica de transacciones ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <ChartRetiroVsDeposito
          data={chartSeries}
          loading={chartLoading}
          error={chartError}
          refetch={refetchChart}
        />
      </div>

      {/* ── Historial de sincronizaciones ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-2">
              <Database className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Historial de Sincronizaciones
              </h3>
              <p className="text-[11px] text-slate-500">
                {totalElements > 0
                  ? `${totalElements} registros totales`
                  : "Detalle de operaciones de carga"}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetchLogs()}
            disabled={logsFetching}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${logsFetching ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        <div className="p-6">
          {logsError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500/60" />
              <p className="text-sm text-slate-400">
                Error al cargar los registros de sincronización.
              </p>
              <button
                onClick={() => refetchLogs()}
                className="text-xs text-amber-400 underline underline-offset-2"
              >
                Reintentar
              </button>
            </div>
          ) : logsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-slate-800"
                />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Database className="h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-500">
                No hay sincronizaciones registradas
              </p>
            </div>
          ) : (
            <div
              className={`space-y-2.5 transition-opacity duration-200 ${logsFetching ? "opacity-50" : "opacity-100"}`}
            >
              {logs.map((log) => (
                <div
                  key={log.idSync}
                  onClick={() => setSelectedSync(log)}
                  className="group cursor-pointer rounded-lg border border-slate-800 bg-slate-800/40 p-4 transition-all hover:border-slate-700 hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">{getStatusIcon(log.status)}</div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-200">
                            Sync #{log.idSync}
                          </span>
                          {getStatusBadge(log.status)}
                          <span className="text-[11px] text-slate-500">
                            {log.sourceSystem}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-600" />
                            {calculateDuration(log.syncStart, log.syncEnd)}
                          </span>
                          <span>
                            <span className="text-slate-600">Procesados:</span>{" "}
                            <span className="text-slate-300">
                              {(log.recordsProcessed ?? 0).toLocaleString()}
                            </span>
                          </span>
                          <span>
                            <span className="text-slate-600">Ins/Act:</span>{" "}
                            <span className="text-emerald-400">
                              {log.recordsInserted ?? 0}
                            </span>
                            <span className="text-slate-600">/</span>
                            <span className="text-violet-400">
                              {log.recordsUpdated ?? 0}
                            </span>
                          </span>
                          <span>
                            {format(
                              new Date(log.syncStart),
                              "dd MMM yyyy, HH:mm",
                              { locale: es }
                            )}
                          </span>
                        </div>

                        {log.errorMessage && (
                          <div className="mt-2 flex items-start gap-1.5 rounded-md border border-rose-900/50 bg-rose-950/50 px-3 py-2 text-xs text-rose-400">
                            <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Paginación ── */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
              <p className="text-[11px] text-slate-500">
                Página{" "}
                <span className="font-semibold text-slate-300">{page + 1}</span>{" "}
                de{" "}
                <span className="font-semibold text-slate-300">{totalPages}</span>
                {" "}·{" "}
                <span className="font-semibold text-slate-300">{totalElements}</span>{" "}
                registros
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={goToPreviousPage}
                  disabled={!canPreviousPage || logsFetching}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, i) => {
                      const pageNum =
                        totalPages <= 5
                          ? i
                          : Math.max(
                              0,
                              Math.min(page - 2 + i, totalPages - 5 + i)
                            );
                      const isActive = pageNum === page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            !isActive &&
                            !logsFetching &&
                            (() => {
                              /* goToPage would be called here */
                            })()
                          }
                          className={`h-7 w-7 rounded-lg text-xs font-medium transition ${
                            isActive
                              ? "border border-amber-700/50 bg-amber-950 text-amber-400"
                              : "border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={!canNextPage || logsFetching}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de detalles ── */}
      <Dialog
        open={selectedSync !== null}
        onOpenChange={() => setSelectedSync(null)}
      >
        <DialogContent className="max-w-2xl border-slate-800 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <Database className="h-4 w-4 text-sky-400" />
              Sincronización #{selectedSync?.idSync}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Secuencia completa de pasos de la operación de carga
            </DialogDescription>
          </DialogHeader>

          {selectedSync && (
            <ScrollArea className="max-h-[520px] pr-3">
              <div className="space-y-4">
                {/* Info general */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Estado",
                      content: getStatusBadge(selectedSync.status),
                    },
                    {
                      label: "Duración",
                      content: (
                        <span className="font-semibold text-sky-400">
                          {calculateDuration(
                            selectedSync.syncStart,
                            selectedSync.syncEnd
                          )}
                        </span>
                      ),
                    },
                    {
                      label: "Registros Procesados",
                      content: (
                        <span className="text-2xl font-bold text-slate-100">
                          {(selectedSync.recordsProcessed ?? 0).toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      label: "Insertados / Actualizados",
                      content: (
                        <span className="text-xl font-bold">
                          <span className="text-emerald-400">
                            {selectedSync.recordsInserted ?? 0}
                          </span>
                          <span className="text-slate-600"> / </span>
                          <span className="text-violet-400">
                            {selectedSync.recordsUpdated ?? 0}
                          </span>
                        </span>
                      ),
                    },
                  ].map(({ label, content }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-slate-800 bg-slate-800/50 p-3"
                    >
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {label}
                      </p>
                      {content}
                    </div>
                  ))}
                </div>

                {/* Process Log */}
                {selectedSync.processLog && selectedSync.processLog.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Secuencia de Pasos
                    </p>
                    <div className="relative space-y-2.5">
                      <div className="absolute bottom-4 left-4 top-4 w-px bg-gradient-to-b from-sky-900 via-slate-700 to-emerald-900" />

                      {selectedSync.processLog.map(
                        (step: ProcessLogStep, i: number) => (
                          <div key={i} className="relative pl-11">
                            <div
                              className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${getStepColor(step.status)}`}
                            >
                              {i + 1}
                            </div>

                            <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-sm font-semibold text-slate-200">
                                  {step.action.replace(/_/g, " ")}
                                </h5>
                                <span
                                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStepColor(step.status)}`}
                                >
                                  {step.status}
                                </span>
                              </div>

                              {step.details &&
                                Object.keys(step.details).length > 0 && (
                                  <div className="mt-2 rounded-md bg-slate-900 p-2.5">
                                    {Object.entries(step.details).map(
                                      ([k, v]) => (
                                        <div
                                          key={k}
                                          className="flex items-center justify-between py-0.5 text-xs"
                                        >
                                          <span className="text-slate-500">
                                            {k.replace(/_/g, " ")}
                                          </span>
                                          <span className="font-medium text-slate-300">
                                            {String(v)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                              <p className="mt-2 text-[10px] text-slate-600">
                                {step.timestamp}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Error */}
                {selectedSync.errorMessage && (
                  <div className="flex items-start gap-3 rounded-lg border border-rose-900/50 bg-rose-950/50 p-4">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-rose-500">
                        Error Detectado
                      </p>
                      <p className="text-sm text-rose-300">
                        {selectedSync.errorMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}