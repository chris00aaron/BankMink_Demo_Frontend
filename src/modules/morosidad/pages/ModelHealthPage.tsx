import { useState, useEffect, useCallback } from 'react';
import {
    Activity, Cpu, Database, TrendingUp, Clock, CheckCircle, AlertTriangle,
    Shield, History, BarChart3, Settings, Play, ChevronDown, ChevronUp,
    RefreshCw, Crown, XCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
    getProductionModel, getDriftLogs, getValidationLogs,
    getTrainingHistory, checkModelVersion, triggerSelfTraining
} from '../services/morosidadService';
import type {
    ProductionModel, DriftLog, ValidationLog,
    TrainingHistoryEntry, VersionCheck
} from '../types/morosidad.types';

// ═══════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════

function MetricGauge({ value, label, sublabel, size = 'md' }: {
    value: number; label: string; sublabel?: string; size?: 'sm' | 'md'
}) {
    const percentage = Math.round(value * 100);
    const r = size === 'sm' ? 30 : 45;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const svgSize = size === 'sm' ? 90 : 140;

    const getColor = () => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col items-center">
            <svg width={svgSize} height={svgSize} className="rotate-[-90deg]">
                <circle cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke="#334155" strokeWidth={size === 'sm' ? 8 : 12} />
                <circle cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke={getColor()}
                    strokeWidth={size === 'sm' ? 8 : 12} strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    className="transition-all duration-1000" />
            </svg>
            <div className="absolute" style={{ marginTop: size === 'sm' ? '22px' : '34px' }}>
                <span className={`font-bold text-white ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>{percentage}%</span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
            {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
        </div>
    );
}

function VersionBadge({ versionCheck }: { versionCheck: VersionCheck | null }) {
    if (!versionCheck) return null;
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${versionCheck.match
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
            {versionCheck.match
                ? <><CheckCircle className="w-4 h-4" /> Modelo sincronizado (BD ↔ API)</>
                : <><AlertTriangle className="w-4 h-4" /> Discrepancia: BD={versionCheck.bdVersion} | API={versionCheck.apiVersion}</>
            }
        </div>
    );
}

// ═══════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════

const TABS = [
    { id: 'status', label: 'Estado Actual', icon: Shield },
    { id: 'drift', label: 'Drift (PSI)', icon: BarChart3 },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'validation', label: 'Pred. vs Realidad', icon: TrendingUp },
    { id: 'actions', label: 'Acciones', icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

// ═══════════════════════════════════════════
// TAB 1: ESTADO ACTUAL
// ═══════════════════════════════════════════

function StatusTab({ model, versionCheck }: { model: ProductionModel; versionCheck: VersionCheck | null }) {
    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    if (!model.active) {
        return (
            <div className="text-center py-16 text-slate-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <p className="text-lg">No hay modelo en producción</p>
                <p className="text-sm mt-1">{model.message}</p>
            </div>
        );
    }

    const assembly = model.assemblyConfiguration;
    const estimators = assembly?.order_estimators || [];
    const weights = assembly?.weights_assigned || [];
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];
    const totalWeight = weights.reduce((s, w) => s + w, 0);

    return (
        <div className="space-y-6">
            {/* Version badge */}
            <VersionBadge versionCheck={versionCheck} />

            {/* Info del modelo */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{model.version || 'Desconocida'}</h2>
                            <p className="text-slate-400">Modelo de predicción de morosidad</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Estado</p>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                En Producción
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Desplegado</p>
                            <p className="text-white font-medium">{formatDate(model.deploymentDate)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Tiempo Activo</p>
                            <p className="text-white font-medium flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {model.daysActive ?? 0} días
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { val: model.aucRoc, label: 'AUC-ROC', sub: 'Discriminación' },
                    { val: model.giniCoefficient, label: 'Gini', sub: 'Desigualdad' },
                    { val: model.ksStatistic, label: 'KS', sub: 'Separación' },
                ].map(m => (
                    <div key={m.label} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 flex justify-center relative">
                        <MetricGauge value={parseFloat(m.val || '0')} label={m.label} sublabel={m.sub} />
                    </div>
                ))}
            </div>

            {/* Arquitectura */}
            {assembly && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-400" />
                        Arquitectura del Modelo
                    </h3>
                    <div className="text-center mb-6">
                        <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                            {assembly.architecture} • Votación {assembly.voting_strategy}
                        </span>
                    </div>
                    <div className="flex gap-4 justify-center flex-wrap">
                        {estimators.map((name, i) => (
                            <div key={name}
                                className="flex-1 min-w-[150px] max-w-[200px] p-4 rounded-xl border-2 transition-all hover:scale-105"
                                style={{ borderColor: colors[i], backgroundColor: `${colors[i]}15` }}>
                                <div className="text-center">
                                    <p className="font-bold text-white text-lg">{name.split('_')[0]}</p>
                                    <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium"
                                        style={{ backgroundColor: colors[i], color: 'white' }}>
                                        Peso: {weights[i]}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {totalWeight > 0 ? Math.round((weights[i] / totalWeight) * 100) : 0}% del voto
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-2xl">↓</span>
                            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg font-medium">
                                Predicción Final
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════
// TAB 2: DRIFT (PSI)
// ═══════════════════════════════════════════

function DriftTab({ driftLogs }: { driftLogs: DriftLog[] }) {
    if (driftLogs.length === 0) {
        return (
            <div className="text-center py-16 text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-lg">Sin datos de drift</p>
                <p className="text-sm mt-1">El monitoreo diario generará datos aquí automáticamente</p>
            </div>
        );
    }

    // Obtener todas las features monitoreadas
    const allFeatures = new Set<string>();
    driftLogs.forEach(l => Object.keys(l.psiFeatures || {}).forEach(f => allFeatures.add(f)));
    const features = Array.from(allFeatures);
    const featureColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

    // Preparar datos para gráfica
    const chartData = driftLogs.map(l => ({
        date: new Date(l.monitoringDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        ...l.psiFeatures,
        driftDetected: l.driftDetected,
    }));

    const lastLog = driftLogs[driftLogs.length - 1];

    return (
        <div className="space-y-6">
            {/* Alerta de drift */}
            {lastLog?.driftDetected && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                    <div>
                        <p className="text-red-300 font-medium">Drift detectado</p>
                        <p className="text-red-400/70 text-sm">
                            {lastLog.consecutiveDaysDrift} día(s) consecutivos. A los 3 días se disparará auto-reentrenamiento.
                        </p>
                    </div>
                </div>
            )}

            {/* Gráfica PSI */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Evolución del PSI por Variable (últimos {driftLogs.length} días)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }}
                                tickFormatter={(v) => v.toFixed(2)} domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                                formatter={(value, name) => [(typeof value === 'number' ? value.toFixed(4) : '0'), String(name ?? '')]}
                            />
                            <Legend />
                            <ReferenceLine y={0.25} stroke="#ef4444" strokeDasharray="8 4" label={{
                                value: 'Umbral (0.25)', position: 'insideTopRight', fill: '#ef4444', fontSize: 11
                            }} />
                            {features.map((f, i) => (
                                <Line key={f} type="monotone" dataKey={f}
                                    stroke={featureColors[i % featureColors.length]}
                                    strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════
// TAB 3: HISTORIAL DE ENTRENAMIENTOS
// ═══════════════════════════════════════════

function HistoryTab({ histories }: { histories: TrainingHistoryEntry[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    if (histories.length === 0) {
        return (
            <div className="text-center py-16 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-lg">Sin historial de entrenamientos</p>
                <p className="text-sm mt-1">Ejecuta un auto-entrenamiento para empezar a registrar</p>
            </div>
        );
    }

    const formatDate = (d: string) => new Date(d).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="space-y-3">
            {histories.map(th => {
                const m = th.metricsResults;
                const isExpanded = expandedId === th.idTrainingHistory;

                return (
                    <div key={th.idTrainingHistory}
                        className={`bg-slate-800/50 rounded-xl border transition-all ${th.inProduction ? 'border-emerald-500/50' : 'border-slate-700/50'
                            }`}>
                        {/* Fila principal */}
                        <button
                            className="w-full p-4 flex items-center justify-between text-left"
                            onClick={() => setExpandedId(isExpanded ? null : th.idTrainingHistory)}>
                            <div className="flex items-center gap-3">
                                {th.inProduction
                                    ? <Crown className="w-5 h-5 text-amber-400" />
                                    : <Database className="w-5 h-5 text-slate-500" />
                                }
                                <div>
                                    <p className="text-white font-medium">
                                        #{th.idTrainingHistory} — {th.bestCadidateModel || 'Ensemble'}
                                    </p>
                                    <p className="text-slate-500 text-xs">{formatDate(th.trainingDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex gap-4 text-sm">
                                    <span className="text-slate-300">AUC <span className="text-cyan-400 font-mono">{m?.auc_roc?.toFixed(4) ?? '—'}</span></span>
                                    <span className="text-slate-300">KS <span className="text-purple-400 font-mono">{m?.ks_statistic?.toFixed(4) ?? '—'}</span></span>
                                    <span className="text-slate-300">Gini <span className="text-amber-400 font-mono">{m?.gini_coefficient?.toFixed(4) ?? '—'}</span></span>
                                </div>
                                {th.inProduction && (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                                        Activo
                                    </span>
                                )}
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                        </button>

                        {/* Detalle expandido */}
                        {isExpanded && m && (
                            <div className="px-4 pb-4 border-t border-slate-700/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                    {[
                                        { label: 'AUC-ROC', val: m.auc_roc },
                                        { label: 'KS', val: m.ks_statistic },
                                        { label: 'Gini', val: m.gini_coefficient },
                                        { label: 'Accuracy', val: m.accuracy },
                                        { label: 'Precision', val: m.precision },
                                        { label: 'Recall', val: m.recall },
                                        { label: 'F1-Score', val: m.f1_score },
                                        { label: 'Tiempo (seg)', val: m.training_time_sec },
                                    ].map(({ label, val }) => (
                                        <div key={label} className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-slate-500 text-xs">{label}</p>
                                            <p className="text-white font-mono">{val?.toFixed(4) ?? '—'}</p>
                                        </div>
                                    ))}
                                </div>

                                {th.parametersOptuna && (
                                    <div className="mt-3 bg-slate-900/50 rounded-lg p-3">
                                        <p className="text-slate-500 text-xs mb-1">Optuna — {th.parametersOptuna.n_trials} trials</p>
                                        <code className="text-xs text-slate-300 block whitespace-pre-wrap break-all">
                                            {JSON.stringify(th.parametersOptuna.best_params, null, 2)}
                                        </code>
                                    </div>
                                )}

                                {th.datasetInfo && (
                                    <div className="mt-3 flex gap-3 text-xs">
                                        <span className="text-slate-400">Dataset: <span className="text-white">{th.datasetInfo.dataAmount?.toLocaleString()} registros</span></span>
                                        <span className="text-slate-400">Train: <span className="text-cyan-400">{th.datasetInfo.dataTraining?.toLocaleString()}</span></span>
                                        <span className="text-slate-400">Test: <span className="text-amber-400">{th.datasetInfo.dataTesting?.toLocaleString()}</span></span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ═══════════════════════════════════════════
// TAB 4: PREDICCIÓN VS REALIDAD
// ═══════════════════════════════════════════

function ValidationTab({ validationLogs }: { validationLogs: ValidationLog[] }) {
    if (validationLogs.length === 0) {
        return (
            <div className="text-center py-16 text-slate-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-lg">Sin validaciones mensuales</p>
                <p className="text-sm mt-1">La validación se ejecuta el 1ro de cada mes automáticamente</p>
            </div>
        );
    }

    const chartData = validationLogs.map(v => ({
        mes: new Date(v.monitoringDate).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }),
        'Tasa Real': +(v.actualDefaultRate * 100).toFixed(2),
        'Tasa Predicha': +(v.predictedDefaultRate * 100).toFixed(2),
        aucReal: v.aucRocReal,
        ksReal: v.ksReal,
    }));

    return (
        <div className="space-y-6">
            {/* Gráfica de tasas */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Tendencia Mensual — Predicción vs Realidad
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                                formatter={(val, name) => [`${(typeof val === 'number' ? val.toFixed(2) : '0')}%`, String(name ?? '')]}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Tasa Real" stroke="#ef4444" strokeWidth={3}
                                dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Tasa Predicha" stroke="#3b82f6" strokeWidth={3}
                                strokeDasharray="5 5" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabla de métricas reales */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Métricas Reales por Mes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-700">
                                <th className="text-left py-2 px-3">Mes</th>
                                <th className="text-right py-2 px-3">AUC Real</th>
                                <th className="text-right py-2 px-3">KS Real</th>
                                <th className="text-right py-2 px-3">Tasa Predicha</th>
                                <th className="text-right py-2 px-3">Tasa Real</th>
                                <th className="text-right py-2 px-3">Diferencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {validationLogs.map((v, i) => {
                                const diff = Math.abs(v.predictedDefaultRate - v.actualDefaultRate) * 100;
                                return (
                                    <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                                        <td className="py-2 px-3 text-white">{chartData[i].mes}</td>
                                        <td className="py-2 px-3 text-right font-mono text-cyan-400">{v.aucRocReal?.toFixed(4) ?? '—'}</td>
                                        <td className="py-2 px-3 text-right font-mono text-purple-400">{v.ksReal?.toFixed(4) ?? '—'}</td>
                                        <td className="py-2 px-3 text-right font-mono text-blue-400">{(v.predictedDefaultRate * 100).toFixed(2)}%</td>
                                        <td className="py-2 px-3 text-right font-mono text-red-400">{(v.actualDefaultRate * 100).toFixed(2)}%</td>
                                        <td className={`py-2 px-3 text-right font-mono ${diff > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {diff.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════
// TAB 5: ACCIONES
// ═══════════════════════════════════════════

function ActionsTab() {
    const [trials, setTrials] = useState(30);
    const [step, setStep] = useState<'idle' | 'confirm' | 'running' | 'done' | 'error'>('idle');
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleTrigger = async () => {
        setStep('running');
        setResult(null);
        setErrorMsg('');
        try {
            const res = await triggerSelfTraining(trials);
            setResult(res);
            setStep('done');
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Error desconocido');
            setStep('error');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Botón de entrenamiento */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-blue-400" />
                    Auto-Entrenamiento Manual
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    Ejecuta el pipeline completo: extracción de datos → entrenamiento → comparación → decisión de promoción.
                    Este proceso puede tomar entre 5 y 15 minutos.
                </p>

                <div className="flex items-center gap-4 mb-6">
                    <label className="text-slate-300 text-sm whitespace-nowrap">Trials de Optuna:</label>
                    <input type="number" min={5} max={100} value={trials}
                        onChange={(e) => setTrials(Number(e.target.value))}
                        disabled={step === 'running'}
                        className="w-24 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-center
                                   focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                    <span className="text-slate-500 text-xs">(5-100)</span>
                </div>

                {step === 'idle' && (
                    <button onClick={() => setStep('confirm')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl
                                   hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" /> Lanzar Auto-Entrenamiento
                    </button>
                )}

                {step === 'confirm' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
                        <p className="text-amber-300 font-medium flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> ¿Estás seguro?
                        </p>
                        <p className="text-amber-400/70 text-sm">
                            Esto iniciará un entrenamiento completo con {trials} trials. El proceso puede durar varios minutos
                            y si el nuevo modelo supera al actual, se desplegará automáticamente.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={handleTrigger}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all font-medium">
                                Sí, iniciar entrenamiento
                            </button>
                            <button onClick={() => setStep('idle')}
                                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {step === 'running' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
                        <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
                        <p className="text-blue-300 font-medium text-lg">Entrenamiento en curso...</p>
                        <p className="text-blue-400/70 text-sm mt-1">
                            Optuna optimizando con {trials} trials. No cierres esta ventana.
                        </p>
                    </div>
                )}

                {step === 'done' && result && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                        <p className="text-emerald-300 font-medium flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Entrenamiento completado
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-slate-900/50 rounded-lg p-2">
                                <p className="text-slate-500 text-xs">Estado</p>
                                <p className={`font-medium ${result.deploymentStatus === 'NEW_CHAMPION' ? 'text-emerald-400'
                                        : result.deploymentStatus === 'UPLOAD_FAILED' ? 'text-red-400'
                                            : 'text-amber-400'
                                    }`}>
                                    {result.deploymentStatus === 'NEW_CHAMPION' ? '🏆 Nuevo Champion desplegado'
                                        : result.deploymentStatus === 'UPLOAD_FAILED' ? '❌ Falló el upload'
                                            : '📉 Se mantiene actual'}
                                </p>
                            </div>
                            {(result.metrics as Record<string, number>)?.auc_roc != null && (
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                    <p className="text-slate-500 text-xs">AUC Challenger</p>
                                    <p className="text-white font-mono">{(result.metrics as Record<string, number>).auc_roc?.toFixed(4)}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => { setStep('idle'); setResult(null); }}
                            className="w-full px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all text-sm">
                            Listo
                        </button>
                    </div>
                )}

                {step === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                        <p className="text-red-300 font-medium flex items-center gap-2">
                            <XCircle className="w-5 h-5" /> Error en el entrenamiento
                        </p>
                        <p className="text-red-400/70 text-sm">{errorMsg}</p>
                        <button onClick={() => setStep('idle')}
                            className="w-full px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all text-sm">
                            Reintentar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════

export default function ModelHealthPage() {
    const [activeTab, setActiveTab] = useState<TabId>('status');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data
    const [production, setProduction] = useState<ProductionModel | null>(null);
    const [versionCheck, setVersionCheck] = useState<VersionCheck | null>(null);
    const [driftLogs, setDriftLogs] = useState<DriftLog[]>([]);
    const [validationLogs, setValidationLogs] = useState<ValidationLog[]>([]);
    const [histories, setHistories] = useState<TrainingHistoryEntry[]>([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [prod, drift, validation, history, version] = await Promise.allSettled([
                getProductionModel(),
                getDriftLogs(30),
                getValidationLogs(),
                getTrainingHistory(),
                checkModelVersion(),
            ]);

            if (prod.status === 'fulfilled') setProduction(prod.value);
            if (drift.status === 'fulfilled') setDriftLogs(drift.value);
            if (validation.status === 'fulfilled') setValidationLogs(validation.value);
            if (history.status === 'fulfilled') setHistories(history.value);
            if (version.status === 'fulfilled') setVersionCheck(version.value);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    <p className="text-slate-400">Cargando monitoreo del modelo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Monitoreo del Modelo</h1>
                            <p className="text-slate-400 text-sm">Estado, rendimiento y gestión del modelo en producción</p>
                        </div>
                    </div>
                    <button onClick={fetchAll}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Actualizar datos">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                    ? 'bg-slate-700 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'status' && production && (
                        <StatusTab model={production} versionCheck={versionCheck} />
                    )}
                    {activeTab === 'drift' && (
                        <DriftTab driftLogs={driftLogs} />
                    )}
                    {activeTab === 'history' && (
                        <HistoryTab histories={histories} />
                    )}
                    {activeTab === 'validation' && (
                        <ValidationTab validationLogs={validationLogs} />
                    )}
                    {activeTab === 'actions' && (
                        <ActionsTab />
                    )}
                </div>
            </div>
        </div>
    );
}
