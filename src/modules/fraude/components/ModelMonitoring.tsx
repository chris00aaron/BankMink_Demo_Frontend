import { useState, useEffect, useCallback } from 'react';
import {
    Brain, TrendingUp, Clock, Award, BarChart3,
    Activity, CheckCircle, AlertTriangle, ChevronRight, Cpu,
    RefreshCw, PlayCircle, Zap, ArrowUpRight, ArrowDownRight,
    ShieldAlert, ShieldCheck, Shield
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Legend
} from 'recharts';
import monitoringService, {
    ChampionModel, TrainingAudit, FeatureDrift, DriftModelOption
} from '../services/monitoringService';

// ==================== CIRCULAR GAUGE ====================

interface GaugeProps {
    value: number;   // 0–1
    label: string;
    color: 'blue' | 'emerald' | 'purple' | 'orange' | 'pink';
    size?: 'sm' | 'md';
    delta?: number | null;  // change vs previous
}

const GAUGE_GRADIENTS: Record<string, { start: string; end: string }> = {
    blue: { start: '#3b82f6', end: '#8b5cf6' },
    emerald: { start: '#10b981', end: '#34d399' },
    purple: { start: '#8b5cf6', end: '#c084fc' },
    orange: { start: '#f97316', end: '#fb923c' },
    pink: { start: '#ec4899', end: '#f472b6' },
};

function CircularGauge({ value, label, color, size = 'md', delta }: GaugeProps) {
    const percent = Math.min(Math.max(value * 100, 0), 100);
    const dim = size === 'sm' ? 84 : 104;
    const stroke = size === 'sm' ? 6 : 8;
    const r = (dim - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    const gradId = `g-${color}-${size}`;
    const g = GAUGE_GRADIENTS[color];

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: dim, height: dim }}>
                <svg className="-rotate-90" width={dim} height={dim}>
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={g.start} />
                            <stop offset="100%" stopColor={g.end} />
                        </linearGradient>
                    </defs>
                    <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                    <circle cx={dim / 2} cy={dim / 2} r={r} fill="none"
                        stroke={`url(#${gradId})`} strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`${size === 'sm' ? 'text-base' : 'text-xl'} font-bold text-gray-900 leading-none`}>
                        {percent.toFixed(1)}%
                    </span>
                    {delta !== null && delta !== undefined && (
                        <span className={`text-[9px] font-semibold flex items-center gap-0.5 mt-0.5 ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {delta >= 0
                                ? <ArrowUpRight className="w-2.5 h-2.5" />
                                : <ArrowDownRight className="w-2.5 h-2.5" />}
                            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
    );
}

// ==================== PSI LINE CHART (Recharts) ====================

const PSI_COLORS: Record<string, string> = {
    amt: '#3b82f6',
    city_pop: '#10b981',
    age: '#8b5cf6',
    distance_km: '#f97316',
    hour: '#ec4899',
};

/** Pivota los datos planos a un array de objetos con { date, feat1, feat2, ... } */
function pivotDrift(data: FeatureDrift[]): Record<string, string | number>[] {
    const byDate: Record<string, Record<string, number>> = {};
    data.forEach(d => {
        const key = d.measured_at;
        if (!byDate[key]) byDate[key] = {};
        byDate[key][d.feature_name] = d.psi_value;
    });
    return Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, feats]) => ({ date, ...feats }));
}

function fmtDate(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PsiTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs min-w-[140px]">
            <p className="text-gray-500 mb-2 font-semibold">{fmtDate(label)}</p>
            {payload.map((entry: any) => (
                <div key={entry.dataKey} className="flex justify-between gap-4 mb-1">
                    <span style={{ color: entry.color }} className="font-medium">{entry.dataKey}</span>
                    <span className={`font-bold ${entry.value > 0.25 ? 'text-red-600' : 'text-gray-800'}`}>
                        {Number(entry.value).toFixed(4)}
                        {entry.value > 0.25 && ' ⚠️'}
                    </span>
                </div>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-red-400">Umbral: 0.25</div>
        </div>
    );
}

function PsiLineChart({ data }: { data: FeatureDrift[] }) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400 gap-2">
                <BarChart3 className="w-10 h-10 opacity-30" />
                <p className="text-sm">Sin datos de drift aún</p>
                <p className="text-xs text-gray-400">Los datos aparecerán tras el primer cálculo PSI</p>
            </div>
        );
    }

    const features = [...new Set(data.map(d => d.feature_name))];
    const chartData = pivotDrift(data);
    const maxPsi = Math.max(0.35, ...data.map(d => d.psi_value));
    const yMax = Math.ceil(maxPsi * 10 + 1) / 10;  // headroom de ~0.1

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                    {/* Zona roja: PSI peligroso (> 0.25) */}
                    <ReferenceArea y1={0.25} y2={yMax} fill="#fee2e2" fillOpacity={0.4} />

                    <XAxis
                        dataKey="date"
                        tickFormatter={fmtDate}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        domain={[0, yMax]}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => v.toFixed(2)}
                        width={44}
                    />

                    <Tooltip content={<PsiTooltip />} />

                    {/* Línea de alerta en 0.25 */}
                    <ReferenceLine
                        y={0.25}
                        stroke="#ef4444"
                        strokeDasharray="5 3"
                        strokeWidth={1.5}
                        label={{ value: 'ALERTA 0.25', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }}
                    />

                    {/* Una línea por feature */}
                    {features.map(feat => (
                        <Line
                            key={feat}
                            type="monotone"
                            dataKey={feat}
                            stroke={PSI_COLORS[feat] || '#6b7280'}
                            strokeWidth={2}
                            dot={{ r: 3, fill: PSI_COLORS[feat] || '#6b7280', strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                            connectNulls
                        />
                    ))}

                    <Legend
                        iconType="plainline"
                        iconSize={16}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                        formatter={(value) => (
                            <span style={{ color: '#4b5563' }}>{value}</span>
                        )}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// ==================== HELPERS ====================

const pctFmt = (v: number | null | undefined) =>
    v != null ? `${(v * 100).toFixed(2)}%` : '—';

const durFmt = (s: number | null | undefined) => {
    if (!s) return '—';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const dateFmt = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const timeFmt = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

function StatusBadge({ status }: { status: string | null | undefined }) {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s === 'PROMOTED') return (
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1">
            <Award className="w-2.5 h-2.5" /> PROMOVIDO
        </span>
    );
    if (s === 'REJECTED') return (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">RECHAZADO</span>
    );
    return (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">{status}</span>
    );
}

function DriftBadge({ category }: { category: string }) {
    if (category === 'HIGH') return <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><ShieldAlert className="w-3.5 h-3.5" />ALTO</span>;
    if (category === 'MODERATE') return <span className="flex items-center gap-1 text-amber-500 text-xs font-bold"><Shield className="w-3.5 h-3.5" />MODERADO</span>;
    return <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><ShieldCheck className="w-3.5 h-3.5" />BAJO</span>;
}

// ==================== MAIN COMPONENT ====================

// Demo date range for [DEMO] mode — matches the historical dataset in DB
const DEMO_START = '2019-07-01';
const DEMO_END = '2019-09-30';

export function ModelMonitoring() {
    const [champion, setChampion] = useState<ChampionModel | null>(null);
    const [history, setHistory] = useState<TrainingAudit[]>([]);
    const [driftHistory, setDriftHistory] = useState<FeatureDrift[]>([]);
    const [latestDrift, setLatestDrift] = useState<FeatureDrift[]>([]);
    const [driftModelOptions, setDriftModelOptions] = useState<DriftModelOption[]>([]);
    const [selected, setSelected] = useState<TrainingAudit | null>(null);
    const [loading, setLoading] = useState(true);
    const [driftDays, setDriftDays] = useState(30);
    // undefined = cross-model (todos), number = filtro por modelo específico
    const [driftModelId, setDriftModelId] = useState<number | undefined>(undefined);

    // Manual training state
    const [training, setTraining] = useState(false);
    const [trainMsg, setTrainMsg] = useState<{ ok: boolean; text: string } | null>(null);

    // Carga principal: champion, historial y datos de drift
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [champ, hist, drift, latest] = await Promise.allSettled([
                monitoringService.getChampion(),
                monitoringService.getHistory(10),
                monitoringService.getDriftHistory(driftDays, driftModelId),
                monitoringService.getLatestDrift(driftModelId),
            ]);

            if (champ.status === 'fulfilled') setChampion(champ.value);
            if (hist.status === 'fulfilled') {
                setHistory(hist.value);
                if (hist.value.length > 0 && !selected) setSelected(hist.value[0]);
            }
            if (drift.status === 'fulfilled') setDriftHistory(drift.value);
            if (latest.status === 'fulfilled') setLatestDrift(latest.value);
        } finally {
            setLoading(false);
        }
    }, [driftDays, driftModelId]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // Opciones del selector de modelo: se cargan una sola vez al montar.
    // Son independientes del rango de días, no se refrescan con cada cambio de selector.
    useEffect(() => {
        monitoringService.getDriftModelOptions()
            .then(setDriftModelOptions)
            .catch(() => setDriftModelOptions([]));
    }, []);

    const handleManualTrain = async () => {
        setTraining(true);
        setTrainMsg(null);
        try {
            const res = await monitoringService.triggerManualTraining({
                start_date: DEMO_START,
                end_date: DEMO_END,
            });
            const status = (res.promotion_status as string) || 'COMPLETADO';
            setTrainMsg({ ok: true, text: `✅ Entrenamiento completado — Estado: ${status}` });
            await loadAll();      // Refresh data after training
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error desconocido';
            setTrainMsg({ ok: false, text: `❌ ${msg}` });
        } finally {
            setTraining(false);
        }
    };

    // Derive delta metrics (champion vs previous audit if available)
    const prev = history[1] ?? null;
    const curr = history[0] ?? null;
    const delta = (key: keyof TrainingAudit) => {
        if (!curr || !prev) return null;
        const a = curr[key] as number | null;
        const b = prev[key] as number | null;
        if (a == null || b == null || b === 0) return null;
        return ((a - b) / b) * 100;
    };

    const metricsConfig = [
        { key: 'accuracy', label: 'Accuracy', color: 'blue' as const },
        { key: 'precision_score', label: 'Precision', color: 'emerald' as const },
        { key: 'recall_score', label: 'Recall', color: 'purple' as const },
        { key: 'f1_score', label: 'F1-Score', color: 'orange' as const },
        { key: 'auc_roc', label: 'AUC-ROC', color: 'pink' as const },
    ];

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monitoreo del Modelo</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Rendimiento en tiempo real, drift de features y gestión del ciclo de vida del modelo
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {champion && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                            <CheckCircle className="w-4 h-4" />
                            Champion: {champion.model_version}
                        </span>
                    )}
                    <button
                        onClick={loadAll}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                    <button
                        id="btn-manual-train"
                        onClick={handleManualTrain}
                        disabled={training}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full text-sm font-semibold shadow-md transition-all disabled:opacity-60"
                    >
                        {training
                            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Entrenando…</>
                            : <><PlayCircle className="w-4 h-4" /> Entrenar Ahora</>}
                    </button>
                </div>
            </div>

            {/* Training feedback message */}
            {trainMsg && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${trainMsg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {trainMsg.text}
                </div>
            )}

            {loading && history.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando datos...
                </div>
            ) : (
                <>
                    {/* ── ROW 1: GAUGES DEL CHAMPION ── */}
                    {(champion || curr) && (
                        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Métricas del Modelo Champion
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {champion?.model_version ?? '—'} · Umbral:{' '}
                                        {champion?.threshold != null
                                            ? `${(champion.threshold * 100).toFixed(0)}%`
                                            : '—'}
                                        {prev && <span className="ml-2 text-gray-400">▸ Cambio vs ciclo anterior</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-8 lg:gap-14">
                                {metricsConfig.map(m => {
                                    const val = (champion?.[m.key as keyof ChampionModel] as number | null)
                                        ?? (curr?.[m.key as keyof TrainingAudit] as number | null)
                                        ?? 0;
                                    return (
                                        <CircularGauge
                                            key={m.key}
                                            value={val}
                                            label={m.label}
                                            color={m.color}
                                            size="md"
                                            delta={delta(m.key as keyof TrainingAudit)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── ROW 2: CHAMPION INFO + LATEST DRIFT BADGES ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Card: Modelo en Producción */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Modelo en Producción</h3>
                                    <p className="text-xs text-gray-500">
                                        {champion?.algorithm ?? 'XGBoost + IsolationForest'}
                                    </p>
                                </div>
                            </div>
                            {champion ? (
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Versión', val: champion.model_version },
                                        { label: 'ID Modelo', val: `#${champion.id_model}` },
                                        { label: 'Umbral Decisión', val: champion.threshold != null ? `${(champion.threshold * 100).toFixed(0)}%` : '—' },
                                        { label: 'Desplegado', val: dateFmt(champion.created_at) },
                                        { label: 'Último Promovido', val: timeFmt(champion.promoted_at) },
                                        { label: 'Estado', val: champion.promotion_status },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-500">{row.label}</span>
                                            <span className="text-sm font-bold text-gray-900">{row.val ?? '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-6">Sin modelo activo</p>
                            )}
                        </div>

                        {/* Card: Estado actual de Drift */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <Activity className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Estado de Drift (Última Medición)</h3>
                                    <p className="text-xs text-gray-500">PSI por feature · umbral crítico: 0.25</p>
                                </div>
                            </div>
                            {latestDrift.length > 0 ? (
                                <div className="space-y-2.5">
                                    {latestDrift
                                        .sort((a, b) => b.psi_value - a.psi_value)
                                        .map(d => (
                                            <div key={d.feature_name}
                                                className={`flex items-center justify-between p-3 rounded-lg ${d.drift_category === 'HIGH' ? 'bg-red-50 border border-red-200' : d.drift_category === 'MODERATE' ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-800 capitalize">{d.feature_name.replace('_', ' ')}</span>
                                                    <p className="text-[10px] text-gray-400">{timeFmt(d.measured_at)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-gray-800">{d.psi_value.toFixed(4)}</span>
                                                    <DriftBadge category={d.drift_category} />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                                    <ShieldCheck className="w-10 h-10 opacity-30" />
                                    <p className="text-sm">Sin mediciones de PSI aún</p>
                                    <p className="text-xs">El scheduler calculará el PSI diariamente a las 6AM</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── ROW 3: PSI EVOLUTION LINE CHART ── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Zap className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Evolución del PSI por Feature</h3>
                                    <p className="text-xs text-gray-500">
                                        {driftModelId == null
                                            ? <span className="text-blue-600 font-semibold">Vista cross-model</span>
                                            : <span className="text-purple-600 font-semibold">Modelo #{driftModelId}</span>}
                                        {' · '}
                                        La zona roja (PSI &gt; 0.25) activa reentrenamiento.
                                    </p>
                                </div>
                            </div>
                            {/* Controles: selector de modelo + rango de días */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Selector de modelo */}
                                <select
                                    value={driftModelId ?? ''}
                                    onChange={e => setDriftModelId(e.target.value === '' ? undefined : Number(e.target.value))}
                                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white"
                                    title="Filtrar drift por modelo"
                                >
                                    <option value="">Todos los modelos</option>
                                    {/* Lista curada del backend: champion + últimos 5 PROMOTED */}
                                    {driftModelOptions.map(opt => (
                                        <option key={opt.id_model} value={opt.id_model}>
                                            {opt.is_champion ? '★ ' : ''}
                                            {opt.model_version}
                                        </option>
                                    ))}
                                </select>
                                {/* Selector de rango de días */}
                                <select
                                    value={driftDays}
                                    onChange={e => setDriftDays(Number(e.target.value))}
                                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white"
                                >
                                    <option value={7}>Últimos 7 días</option>
                                    <option value={30}>Últimos 30 días</option>
                                    <option value={90}>Últimos 90 días</option>
                                    <option value={365}>Último año</option>
                                </select>
                            </div>
                        </div>
                        <PsiLineChart data={driftHistory} />
                    </div>

                    {/* ── ROW 4: TRAINING HISTORY ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

                        {/* Historial (list) */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <h3 className="font-bold text-gray-900">Historial de Entrenamientos</h3>
                            </div>
                            {history.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">Sin entrenamientos registrados</p>
                            ) : (
                                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                    {history.map(t => (
                                        <button key={t.id_audit}
                                            onClick={() => setSelected(t)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selected?.id_audit === t.id_audit ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${t.promotion_status === 'PROMOTED' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                        <Cpu className={`w-4 h-4 ${t.promotion_status === 'PROMOTED' ? 'text-emerald-600' : 'text-gray-500'}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-bold text-gray-900">#{t.id_audit}</span>
                                                            <StatusBadge status={t.promotion_status} />
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 truncate">
                                                            {timeFmt(t.end_training)} · {t.triggered_by ?? '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {t.auc_roc != null && (
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-gray-900">{pctFmt(t.auc_roc)}</p>
                                                            <p className="text-[9px] text-gray-400">AUC</p>
                                                        </div>
                                                    )}
                                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Detalle del ciclo seleccionado */}
                        {selected ? (
                            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Activity className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Detalle — Ciclo #{selected.id_audit}</h3>
                                            <p className="text-xs text-gray-500">
                                                {timeFmt(selected.start_training)} → {timeFmt(selected.end_training)}
                                                <span className="ml-2 text-gray-400">({durFmt(selected.training_duration_seconds)})</span>
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={selected.promotion_status} />
                                </div>

                                {/* Gauges pequeños del challenger */}
                                <div className="flex flex-wrap justify-center gap-5 p-4 bg-gray-50 rounded-xl mb-5">
                                    {metricsConfig.map(m => (
                                        <CircularGauge
                                            key={m.key}
                                            value={(selected[m.key as keyof TrainingAudit] as number | null) ?? 0}
                                            label={m.label}
                                            color={m.color}
                                            size="sm"
                                        />
                                    ))}
                                </div>

                                {/* Tabla comparativa challenger vs champion */}
                                {(selected.champion_f1_score != null || selected.champion_recall != null) && (
                                    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Métrica</th>
                                                    <th className="px-4 py-2 text-right">Challenger</th>
                                                    <th className="px-4 py-2 text-right">Champion ref.</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {[
                                                    { label: 'F1-Score', ch: selected.f1_score, ref: selected.champion_f1_score },
                                                    { label: 'Recall', ch: selected.recall_score, ref: selected.champion_recall },
                                                    { label: 'AUC-ROC', ch: selected.auc_roc, ref: selected.champion_auc_roc },
                                                ].map(row => {
                                                    const better = row.ch != null && row.ref != null && row.ch > row.ref;
                                                    return (
                                                        <tr key={row.label}>
                                                            <td className="px-4 py-2 text-gray-700">{row.label}</td>
                                                            <td className={`px-4 py-2 text-right font-bold ${better ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                                {pctFmt(row.ch)}
                                                            </td>
                                                            <td className="px-4 py-2 text-right text-gray-400">{pctFmt(row.ref)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Promotion reason + Optuna */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selected.promotion_reason && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-[10px] text-blue-500 uppercase font-semibold mb-1">Razón de Decisión</p>
                                            <p className="text-xs text-blue-800">{selected.promotion_reason}</p>
                                        </div>
                                    )}
                                    {selected.optuna_best_f1 != null && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <p className="text-[10px] text-purple-500 uppercase font-semibold mb-1">Optuna Mejor F1</p>
                                            <p className="text-sm font-bold text-purple-800">{pctFmt(selected.optuna_best_f1)}</p>
                                        </div>
                                    )}
                                    {selected.optimal_threshold != null && (
                                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                            <p className="text-[10px] text-orange-500 uppercase font-semibold mb-1">Umbral Óptimo</p>
                                            <p className="text-sm font-bold text-orange-800">{pctFmt(selected.optimal_threshold)}</p>
                                        </div>
                                    )}
                                    {selected.triggered_by && (
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Disparado por</p>
                                            <p className="text-xs font-bold text-gray-700">{selected.triggered_by}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Dataset del entrenamiento */}
                                {selected.dataset_id != null && (
                                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <p className="text-[10px] text-indigo-500 uppercase font-semibold mb-3 flex items-center gap-1">
                                            <BarChart3 className="w-3 h-3" /> Dataset de Entrenamiento #{selected.dataset_id}
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {/* Rango temporal */}
                                            <div className="bg-white rounded-lg p-3 border border-indigo-100 col-span-2">
                                                <p className="text-[9px] text-indigo-400 uppercase font-semibold mb-1">Período</p>
                                                <p className="text-xs font-bold text-indigo-900">
                                                    {dateFmt(selected.dataset_start_date)} → {dateFmt(selected.dataset_end_date)}
                                                </p>
                                            </div>
                                            {/* Total muestras */}
                                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                                                <p className="text-[9px] text-indigo-400 uppercase font-semibold mb-1">Total</p>
                                                <p className="text-sm font-bold text-indigo-900">
                                                    {selected.dataset_total_samples?.toLocaleString() ?? '—'}
                                                </p>
                                                <p className="text-[9px] text-indigo-400">muestras</p>
                                            </div>
                                            {/* Train / Test */}
                                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                                                <p className="text-[9px] text-indigo-400 uppercase font-semibold mb-1">Train / Test</p>
                                                <p className="text-xs font-bold text-indigo-900">
                                                    {selected.dataset_count_train?.toLocaleString() ?? '—'}
                                                    {' / '}
                                                    {selected.dataset_count_test?.toLocaleString() ?? '—'}
                                                </p>
                                            </div>
                                            {/* Fraud ratio */}
                                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                                                <p className="text-[9px] text-indigo-400 uppercase font-semibold mb-1">Ratio Fraude</p>
                                                <p className="text-sm font-bold text-indigo-900">
                                                    {selected.dataset_fraud_ratio != null
                                                        ? `${(selected.dataset_fraud_ratio * 100).toFixed(1)}%`
                                                        : '—'}
                                                </p>
                                            </div>
                                            {/* Undersampling */}
                                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                                                <p className="text-[9px] text-indigo-400 uppercase font-semibold mb-1">Undersampling</p>
                                                <p className="text-sm font-bold text-indigo-900">
                                                    {selected.dataset_undersampling_ratio != null
                                                        ? `${selected.dataset_undersampling_ratio}:1`
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        ) : (
                            <div className="lg:col-span-3 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                Selecciona un ciclo de entrenamiento para ver el detalle
                            </div>
                        )}
                    </div>

                    {/* ── INFO FOOTER ── */}
                    {latestDrift.some(d => d.drift_category === 'HIGH') && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-800">⚠️ Drift Severo Detectado</p>
                                <p className="text-xs text-red-700 mt-0.5">
                                    Los features{' '}
                                    <span className="font-semibold">
                                        {latestDrift.filter(d => d.drift_category === 'HIGH').map(d => d.feature_name).join(', ')}
                                    </span>{' '}
                                    superan PSI 0.25. El scheduler disparará reentrenamiento automáticamente,
                                    o puedes usar el botón <strong>"Entrenar Ahora"</strong>.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
