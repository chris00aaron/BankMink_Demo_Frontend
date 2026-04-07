import { useState, useEffect, useCallback } from 'react';
import {
    Activity, Cpu, Database, TrendingUp, Clock, CheckCircle, AlertTriangle,
    Shield, History, BarChart3, Settings, Play, ChevronDown, ChevronUp,
    RefreshCw, Crown, XCircle, Plus, Gauge
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
    getProductionModel, getDriftLogs, getValidationLogs,
    getTrainingHistory, checkModelVersion, triggerSelfTraining,
    getMonitoringPolicies, getActiveMonitoringPolicy,
    createMonitoringPolicy, activateMonitoringPolicy,
    triggerDriftAnalysis
} from '../services/morosidadService';
import { UserHeader } from '../components/UserHeader';
import type {
    ProductionModel, DriftLog, ValidationLog,
    TrainingHistoryEntry, VersionCheck,
    MonitoringPolicy, MonitoringPolicyRequest
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
                <circle cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size === 'sm' ? 8 : 12} />
                <circle cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke={getColor()}
                    strokeWidth={size === 'sm' ? 8 : 12} strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    className="transition-all duration-1000" />
            </svg>
            <div className="absolute" style={{ marginTop: size === 'sm' ? '22px' : '34px' }}>
                <span className={`font-bold text-gray-900 ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>{percentage}%</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
            {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
        </div>
    );
}

function VersionBadge({ versionCheck }: { versionCheck: VersionCheck | null }) {
    if (!versionCheck) return null;
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${versionCheck.match
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-amber-50 text-amber-600 border border-amber-100'
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
    { id: 'policy', label: 'Política', icon: Gauge },
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
            <div className="text-center py-16 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
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
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{model.version || 'Desconocida'}</h2>
                            <p className="text-gray-500">Modelo de predicción de morosidad</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Estado</p>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                En Producción
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Desplegado</p>
                            <p className="text-gray-900 font-medium">{formatDate(model.deploymentDate)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Tiempo Activo</p>
                            <p className="text-gray-900 font-medium flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
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
                    <div key={m.label} className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm flex justify-center relative">
                        <MetricGauge value={parseFloat(m.val || '0')} label={m.label} sublabel={m.sub} />
                    </div>
                ))}
            </div>

            {/* Arquitectura */}
            {assembly && (
                <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-600" />
                        Arquitectura del Modelo
                    </h3>
                    <div className="text-center mb-6">
                        <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                            {assembly.architecture} • Votación {assembly.voting_strategy}
                        </span>
                    </div>
                    <div className="flex gap-4 justify-center flex-wrap">
                        {estimators.map((name, i) => (
                            <div key={name}
                                className="flex-1 min-w-[150px] max-w-[200px] p-4 rounded-xl border-2 transition-all hover:scale-105"
                                style={{ borderColor: colors[i], backgroundColor: `${colors[i]}08` }}>
                                <div className="text-center">
                                    <p className="font-bold text-gray-900 text-lg">{name.split('_')[0]}</p>
                                    <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium"
                                        style={{ backgroundColor: colors[i], color: 'white' }}>
                                        Peso: {weights[i]}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {totalWeight > 0 ? Math.round((weights[i] / totalWeight) * 100) : 0}% del voto
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="text-2xl">↓</span>
                            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
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

function DriftTab({ driftLogs, psiThreshold, trainingHistories = [], onTriggerDrift, onRefreshLogs }: {
    driftLogs: DriftLog[]; psiThreshold: number; trainingHistories?: TrainingHistoryEntry[];
    onTriggerDrift?: () => Promise<void>; onRefreshLogs?: () => void;
}) {
    const [isTriggering, setIsTriggering] = useState(false);
    const [triggerResult, setTriggerResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleTriggerDrift = async () => {
        if (!onTriggerDrift) return;
        setIsTriggering(true);
        setTriggerResult(null);
        try {
            await onTriggerDrift();
            setTriggerResult({ type: 'success', message: 'Análisis PSI ejecutado correctamente' });
            onRefreshLogs?.();
        } catch (err) {
            setTriggerResult({ type: 'error', message: err instanceof Error ? err.message : 'Error al ejecutar' });
        } finally {
            setIsTriggering(false);
            setTimeout(() => setTriggerResult(null), 5000);
        }
    };

    if (driftLogs.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Sin datos de drift</p>
                <p className="text-sm mt-1">El monitoreo diario generará datos aquí automáticamente</p>
                {onTriggerDrift && (
                    <button
                        onClick={handleTriggerDrift}
                        disabled={isTriggering}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                    >
                        {isTriggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isTriggering ? 'Ejecutando...' : 'Ejecutar Análisis PSI'}
                    </button>
                )}
            </div>
        );
    }

    // Obtener todas las features monitoreadas
    const allFeatures = new Set<string>();
    driftLogs.forEach(l => Object.keys(l.psiFeatures || {}).forEach(f => allFeatures.add(f)));
    const features = Array.from(allFeatures);
    const featureColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

    // Preparar datos para gráfica — dedup por día (último log del día gana)
    const logsMap = new Map<string, typeof driftLogs[0]>();
    driftLogs.forEach(l => {
        const dateKey = new Date(l.monitoringDate + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
        logsMap.set(dateKey, l); // último sobrescribe
    });
    const chartData = Array.from(logsMap.entries()).map(([date, l]) => ({
        date,
        rawDate: l.monitoringDate,
        ...l.psiFeatures,
        driftDetected: l.driftDetected,
    }));

    const lastLog = driftLogs[driftLogs.length - 1];

    // Botón PSI manual + resultado
    const psiHeader = (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Data Drift (PSI)</h3>
                <p className="text-sm text-gray-500">Estado del último análisis: {lastLog.driftDetected ? '⚠️ Drift detectado' : '✓ Estable'}</p>
            </div>
            <div className="flex items-center gap-3">
                {triggerResult && (
                    <span className={`text-sm px-3 py-1 rounded-full ${triggerResult.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {triggerResult.message}
                    </span>
                )}
                {onTriggerDrift && (
                    <button
                        onClick={handleTriggerDrift}
                        disabled={isTriggering}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                        {isTriggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isTriggering ? 'Ejecutando...' : 'Ejecutar Análisis PSI'}
                    </button>
                )}
            </div>
        </div>
    );

    // Resumen mensual de promociones (basado en entrenamientos no en inProduction flag)
    const monthlyPromotions: Record<string, number> = {};
    trainingHistories
        .forEach(th => {
            const monthKey = new Date(th.trainingDate + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
            monthlyPromotions[monthKey] = (monthlyPromotions[monthKey] || 0) + 1;
        });

    return (
        <div className="space-y-6">
            {psiHeader}
            {/* Alerta de drift */}
            {lastLog?.driftDetected && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                    <div>
                        <p className="text-red-300 font-medium">Drift detectado</p>
                        <p className="text-red-400/70 text-sm">
                            {lastLog.consecutiveDaysDrift} día(s) consecutivos. Umbral PSI: {psiThreshold}.
                        </p>
                    </div>
                </div>
            )}

            {/* Gráfica PSI */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Evolución del PSI por Variable (últimos {driftLogs.length} días)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(v) => v.toFixed(2)} domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '8px' }}
                                labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                formatter={(value, name) => [(typeof value === 'number' ? value.toFixed(4) : '0'), String(name ?? '')]}
                            />
                            <Legend />
                            <ReferenceLine y={psiThreshold} stroke="#ef4444" strokeDasharray="8 4" label={{
                                value: `Umbral (${psiThreshold})`, position: 'insideTopRight', fill: '#ef4444', fontSize: 11
                            }} />
                            {features.map((f, i) => (
                                <Line key={f} type="monotone" dataKey={f}
                                    stroke={featureColors[i % featureColors.length]}
                                    strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Resumen mensual de promociones */}
                {Object.keys(monthlyPromotions).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Promociones de Modelo</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(monthlyPromotions).map(([month, count]) => (
                                <span key={month} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                                    📦 {month}: {count} promoción{count > 1 ? 'es' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
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
            <div className="text-center py-16 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                        className={`bg-white rounded-xl border transition-all shadow-sm overflow-hidden ${th.inProduction ? 'border-emerald-500/30' : 'border-zinc-200'
                            }`}>
                        {/* Fila principal */}
                        <button
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : th.idTrainingHistory)}>
                            <div className="flex items-center gap-3">
                                {th.inProduction
                                    ? <Crown className="w-5 h-5 text-amber-500" />
                                    : <Database className="w-5 h-5 text-gray-400" />
                                }
                                <div>
                                    <p className="text-gray-900 font-medium">
                                        #{th.idTrainingHistory} — {th.bestCadidateModel || 'Ensemble'}
                                    </p>
                                    <p className="text-gray-500 text-xs">{formatDate(th.trainingDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex gap-4 text-sm">
                                    <span className="text-gray-600">AUC <span className="text-blue-600 font-mono font-semibold">{m?.auc_roc?.toFixed(4) ?? '—'}</span></span>
                                    <span className="text-gray-600">KS <span className="text-purple-600 font-mono font-semibold">{m?.ks_statistic?.toFixed(4) ?? '—'}</span></span>
                                    <span className="text-gray-600">Gini <span className="text-orange-600 font-mono font-semibold">{m?.gini_coefficient?.toFixed(4) ?? '—'}</span></span>
                                </div>
                                {th.inProduction && (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">
                                        Activo
                                    </span>
                                )}
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                        </button>

                        {/* Detalle expandido */}
                        {isExpanded && m && (
                            <div className="px-4 pb-4 border-t border-zinc-100 bg-zinc-50/50">
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
                                        <div key={label} className="bg-white rounded-lg p-3 border border-zinc-200 shadow-sm">
                                            <p className="text-gray-500 text-xs">{label}</p>
                                            <p className="text-gray-900 font-mono font-bold">{val?.toFixed(4) ?? '—'}</p>
                                        </div>
                                    ))}
                                </div>

                                {th.parametersOptuna && (
                                    <div className="mt-3 bg-white rounded-lg p-3 border border-zinc-200">
                                        <p className="text-gray-500 text-xs mb-1 font-semibold">Optuna — {th.parametersOptuna.n_trials} trials</p>
                                        <code className="text-xs text-gray-600 block whitespace-pre-wrap break-all bg-zinc-50 p-2 rounded border border-zinc-100">
                                            {JSON.stringify(th.parametersOptuna.best_params, null, 2)}
                                        </code>
                                    </div>
                                )}

                                {th.datasetInfo && (
                                    <div className="mt-3 flex gap-3 text-[10px] uppercase tracking-wider font-semibold">
                                        <span className="text-gray-400">Dataset: <span className="text-gray-700">{th.datasetInfo.dataAmount?.toLocaleString()} registros</span></span>
                                        <span className="text-gray-400">Train: <span className="text-blue-600">{th.datasetInfo.dataTraining?.toLocaleString()}</span></span>
                                        <span className="text-gray-400">Test: <span className="text-orange-600">{th.datasetInfo.dataTesting?.toLocaleString()}</span></span>
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

function ValidationTab({ validationLogs, daysActive }: { validationLogs: ValidationLog[], daysActive?: number }) {
    if (validationLogs.length === 0) {
        return (
            <div className="relative text-center py-16 bg-white rounded-xl border border-zinc-200 shadow-sm text-slate-400">
                {daysActive !== undefined && (
                    <div className="absolute top-4 right-4 text-left">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100 shadow-sm">
                            Modelo activo: {daysActive} días
                        </span>
                    </div>
                )}
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-lg font-medium text-gray-500">Sin validaciones históricas</p>
                <p className="text-sm mt-1">La validación se ejecuta progresivamente tras el despliegue del modelo</p>
            </div>
        );
    }

    const chartData = validationLogs.map(v => ({
        fecha: new Date(v.monitoringDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        'Tasa Real': +(v.actualDefaultRate * 100).toFixed(2),
        'Tasa Predicha': +(v.predictedDefaultRate * 100).toFixed(2),
        aucReal: v.aucRocReal,
        ksReal: v.ksReal,
    }));

    return (
        <div className="space-y-6">
            {/* Gráfica de tasas */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Tendencia Histórica — Predicción vs Realidad
                    </h3>
                    {daysActive !== undefined && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                            Modelo activo: {daysActive} días
                        </span>
                    )}
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="fecha" stroke="#64748b" tick={{ fill: '#64748b' }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '8px' }}
                                labelStyle={{ color: '#1e293b' }}
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
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                    <h3 className="text-lg font-semibold text-gray-900">Métricas Reales Históricas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 bg-zinc-50 border-b border-zinc-200 uppercase text-xs">
                                <th className="text-left py-3 px-4">Fecha</th>
                                <th className="text-right py-3 px-4">AUC Real</th>
                                <th className="text-right py-3 px-4">KS Real</th>
                                <th className="text-right py-3 px-4">Tasa Predicha</th>
                                <th className="text-right py-3 px-4">Tasa Real</th>
                                <th className="text-right py-3 px-4">Diferencia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {validationLogs.map((v, i) => {
                                const diff = Math.abs(v.predictedDefaultRate - v.actualDefaultRate) * 100;
                                return (
                                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-900 font-medium">{chartData[i].fecha}</td>
                                        <td className="py-3 px-4 text-right font-mono text-blue-600 font-semibold">{v.aucRocReal?.toFixed(4) ?? '—'}</td>
                                        <td className="py-3 px-4 text-right font-mono text-purple-600 font-semibold">{v.ksReal?.toFixed(4) ?? '—'}</td>
                                        <td className="py-3 px-4 text-right font-mono text-gray-700">{(v.predictedDefaultRate * 100).toFixed(2)}%</td>
                                        <td className="py-3 px-4 text-right font-mono text-gray-700">{(v.actualDefaultRate * 100).toFixed(2)}%</td>
                                        <td className={`py-3 px-4 text-right font-mono font-bold ${diff > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
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
            <div className="bg-white rounded-xl p-8 border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Play className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Auto-Entrenamiento Manual</h3>
                        <p className="text-gray-500 text-sm">Ejecuta el pipeline completo del modelo</p>
                    </div>
                </div>

                <p className="text-gray-500 text-sm mb-8 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    Este proceso incluye la extracción de datos, optimización de hiperparámetros con Optuna y comparación de métricas.
                    Puede tomar entre 5 y 15 minutos dependiendo del volumen de datos.
                </p>

                <div className="flex items-center justify-between gap-4 mb-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <label className="text-gray-700 font-medium">Trials de Optuna</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="number" min={5} max={100} value={trials}
                            onChange={(e) => setTrials(Number(e.target.value))}
                            disabled={step === 'running'}
                            className="w-20 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-gray-900 font-bold text-center
                                     focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50" />
                        <span className="text-gray-400 text-xs">(Sug: 30)</span>
                    </div>
                </div>

                {step === 'idle' && (
                    <button onClick={() => setStep('confirm')}
                        className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-xl
                                   hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                        <Play className="w-5 h-5" /> Lanzar Auto-Entrenamiento
                    </button>
                )}

                {step === 'confirm' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-amber-700">
                            <AlertTriangle className="w-6 h-6" />
                            <p className="font-bold">¿Deseas iniciar el entrenamiento?</p>
                        </div>
                        <p className="text-amber-800/70 text-sm">
                            Se utilizarán {trials} iteraciones para buscar el mejor modelo. Si el resultado es superior al campeón actual,
                            se desplegará automáticamente.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={handleTrigger}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold shadow-md shadow-red-100">
                                Sí, iniciar ahora
                            </button>
                            <button onClick={() => setStep('idle')}
                                className="flex-1 px-4 py-3 bg-white text-gray-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all font-medium">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {step === 'running' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-blue-900 font-bold text-lg">Entrenamiento en curso</p>
                        <p className="text-blue-700/60 text-sm mt-1">
                            Optuna está buscando la configuración óptima...
                        </p>
                    </div>
                )}

                {step === 'done' && result && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-700">
                            <CheckCircle className="w-6 h-6" />
                            <p className="font-bold text-lg">Proceso Completado</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white rounded-xl p-4 border border-emerald-100">
                                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-bold">Estado del Despliegue</p>
                                <p className={`font-bold text-lg ${result.deploymentStatus === 'NEW_CHAMPION' ? 'text-emerald-600'
                                    : result.deploymentStatus === 'UPLOAD_FAILED' ? 'text-red-600'
                                        : 'text-amber-600'
                                    }`}>
                                    {result.deploymentStatus === 'NEW_CHAMPION' ? '🏆 Nuevo Champion desplegado'
                                        : result.deploymentStatus === 'UPLOAD_FAILED' ? '❌ Falló la carga del modelo'
                                            : '📉 El modelo actual se mantiene'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { setStep('idle'); setResult(null); }}
                            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-bold shadow-lg">
                            Finalizar
                        </button>
                    </div>
                )}

                {step === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-700">
                            <AlertTriangle className="w-6 h-6" />
                            <p className="font-bold">Error en el Pipeline</p>
                        </div>
                        <p className="text-red-700/70 text-sm italic">{errorMsg}</p>
                        <button onClick={() => setStep('idle')}
                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold">
                            Reintentar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════
// TAB 6: POLÍTICA DE MONITOREO
// ═══════════════════════════════════════════

function PolicyTab({ activePolicy, allPolicies, onRefresh }: {
    activePolicy: MonitoringPolicy | null;
    allPolicies: MonitoringPolicy[];
    onRefresh: () => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activating, setActivating] = useState<number | null>(null);
    const [form, setForm] = useState<MonitoringPolicyRequest>({
        policyName: '',
        psiThreshold: 0.25,
        consecutiveDaysTrigger: 3,
        aucDropThreshold: 0.05,
        ksDropThreshold: 0.10,
        optunaTrialsDrift: 30,
        optunaTrialsValidation: 50,
        createdBy: '',
    });

    const handleCreate = async () => {
        if (!form.policyName || !form.createdBy) return;
        setSaving(true);
        try {
            await createMonitoringPolicy(form);
            setShowForm(false);
            setForm({
                policyName: '', psiThreshold: 0.25, consecutiveDaysTrigger: 3,
                aucDropThreshold: 0.05, ksDropThreshold: 0.10,
                optunaTrialsDrift: 30, optunaTrialsValidation: 50, createdBy: '',
            });
            onRefresh();
        } catch {
            // error silenciado
        } finally {
            setSaving(false);
        }
    };

    const handleActivate = async (id: number) => {
        setActivating(id);
        try {
            await activateMonitoringPolicy(id);
            onRefresh();
        } catch {
            // error silenciado
        } finally {
            setActivating(null);
        }
    };

    const thresholdCard = (label: string, value: string | number, color: string) => (
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm text-center">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Política Activa */}
            {activePolicy ? (
                <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Gauge className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{activePolicy.policyName}</h3>
                                <p className="text-gray-500 text-sm">
                                    Activa desde {new Date(activePolicy.activationDate).toLocaleDateString('es-PE')} · por {activePolicy.createdBy}
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">ACTIVA</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {thresholdCard('PSI Umbral', activePolicy.psiThreshold, 'text-blue-600')}
                        {thresholdCard('Días Consecutivos', activePolicy.consecutiveDaysTrigger, 'text-orange-600')}
                        {thresholdCard('Caída AUC', activePolicy.aucDropThreshold, 'text-purple-600')}
                        {thresholdCard('Caída KS', activePolicy.ksDropThreshold, 'text-pink-600')}
                        {thresholdCard('Trials Drift', activePolicy.optunaTrialsDrift, 'text-indigo-600')}
                        {thresholdCard('Trials Valid.', activePolicy.optunaTrialsValidation, 'text-emerald-600')}
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                        <p className="text-amber-700 font-medium">Sin política activa</p>
                        <p className="text-amber-600/70 text-sm">Se están usando valores por defecto (PSI=0.25, Días=3, AUC=0.05, KS=0.10).</p>
                    </div>
                </div>
            )}

            {/* Botón crear nueva */}
            <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium shadow-sm">
                <Plus className="w-4 h-4" />
                {showForm ? 'Cancelar' : 'Nueva Política'}
            </button>

            {/* Formulario */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
                    <h3 className="text-gray-900 font-bold text-lg">Crear Nueva Política de Monitoreo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Nombre</label>
                            <input type="text" value={form.policyName}
                                onChange={e => setForm({ ...form, policyName: e.target.value })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Ej: Política Conservadora" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Creado por</label>
                            <input type="text" value={form.createdBy}
                                onChange={e => setForm({ ...form, createdBy: e.target.value })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Ej: Analista 1" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Umbral PSI</label>
                            <input type="number" step="0.01" value={form.psiThreshold}
                                onChange={e => setForm({ ...form, psiThreshold: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Días consecutivos trigger</label>
                            <input type="number" value={form.consecutiveDaysTrigger}
                                onChange={e => setForm({ ...form, consecutiveDaysTrigger: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Caída máxima AUC</label>
                            <input type="number" step="0.01" value={form.aucDropThreshold}
                                onChange={e => setForm({ ...form, aucDropThreshold: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Caída máxima KS</label>
                            <input type="number" step="0.01" value={form.ksDropThreshold}
                                onChange={e => setForm({ ...form, ksDropThreshold: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Optuna Trials (Drift)</label>
                            <input type="number" value={form.optunaTrialsDrift}
                                onChange={e => setForm({ ...form, optunaTrialsDrift: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1 font-medium">Optuna Trials (Validación)</label>
                            <input type="number" value={form.optunaTrialsValidation}
                                onChange={e => setForm({ ...form, optunaTrialsValidation: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white text-gray-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                    </div>
                    <button onClick={handleCreate} disabled={saving || !form.policyName || !form.createdBy}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
                        {saving ? 'Creando...' : 'Crear Política'}
                    </button>
                </div>
            )}

            {/* Historial de políticas */}
            {allPolicies.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                        <h3 className="text-gray-900 font-semibold">Historial de Políticas</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase border-b border-zinc-100 bg-zinc-50">
                                    <th className="px-4 py-3 text-left">Nombre</th>
                                    <th className="px-4 py-3 text-center">PSI</th>
                                    <th className="px-4 py-3 text-center">Días</th>
                                    <th className="px-4 py-3 text-center">AUC</th>
                                    <th className="px-4 py-3 text-center">KS</th>
                                    <th className="px-4 py-3 text-center">Trials D.</th>
                                    <th className="px-4 py-3 text-center">Trials V.</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {allPolicies.map(p => (
                                    <tr key={p.idMonitoringPolicy} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 font-medium">
                                            {p.policyName}
                                            <span className="text-gray-500 text-xs block font-normal">{p.createdBy}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-blue-600 font-mono font-semibold">{p.psiThreshold}</td>
                                        <td className="px-4 py-3 text-center text-orange-600 font-mono font-semibold">{p.consecutiveDaysTrigger}</td>
                                        <td className="px-4 py-3 text-center text-purple-600 font-mono font-semibold">{p.aucDropThreshold}</td>
                                        <td className="px-4 py-3 text-center text-pink-600 font-mono font-semibold">{p.ksDropThreshold}</td>
                                        <td className="px-4 py-3 text-center text-indigo-600 font-mono font-semibold">{p.optunaTrialsDrift}</td>
                                        <td className="px-4 py-3 text-center text-emerald-600 font-mono font-semibold">{p.optunaTrialsValidation}</td>
                                        <td className="px-4 py-3 text-center">
                                            {p.isActive
                                                ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">Activa</span>
                                                : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs border border-gray-200">Inactiva</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {!p.isActive && (
                                                <button onClick={() => handleActivate(p.idMonitoringPolicy)}
                                                    disabled={activating === p.idMonitoringPolicy}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 transition-all font-medium">
                                                    {activating === p.idMonitoringPolicy ? '...' : 'Activar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
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
    const [monitoringPolicyActive, setMonitoringPolicyActive] = useState<MonitoringPolicy | null>(null);
    const [monitoringPolicies, setMonitoringPolicies] = useState<MonitoringPolicy[]>([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [prod, drift, validation, history, version, mPolicyActive, mPolicies] = await Promise.allSettled([
                getProductionModel(),
                getDriftLogs(30),
                getValidationLogs(),
                getTrainingHistory(),
                checkModelVersion(),
                getActiveMonitoringPolicy(),
                getMonitoringPolicies(),
            ]);

            if (prod.status === 'fulfilled') setProduction(prod.value);
            if (drift.status === 'fulfilled') setDriftLogs(drift.value);
            if (validation.status === 'fulfilled') setValidationLogs(validation.value);
            if (history.status === 'fulfilled') setHistories(history.value);
            if (version.status === 'fulfilled') setVersionCheck(version.value);
            if (mPolicyActive.status === 'fulfilled') setMonitoringPolicyActive(mPolicyActive.value);
            if (mPolicies.status === 'fulfilled') setMonitoringPolicies(mPolicies.value);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-gray-500">Cargando monitoreo del modelo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-red-500 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* User Header */}
                <UserHeader
                    userName="Administrador"
                    title="Monitoreo del Modelo"
                    subtitle="Estado, rendimiento y gestión del modelo en producción"
                />

                {/* Tabs */}
                <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 border border-zinc-200 overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                    ? 'bg-white text-gray-900 shadow-sm border border-zinc-200'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-zinc-200/50'
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
                        <DriftTab
                            driftLogs={driftLogs}
                            psiThreshold={monitoringPolicyActive?.psiThreshold ?? 0.25}
                            trainingHistories={histories}
                            onTriggerDrift={async () => { await triggerDriftAnalysis(); }}
                            onRefreshLogs={fetchAll}
                        />
                    )}
                    {activeTab === 'history' && (
                        <HistoryTab histories={histories} />
                    )}
                    {activeTab === 'validation' && (
                        <ValidationTab validationLogs={validationLogs} daysActive={production?.daysActive} />
                    )}
                    {activeTab === 'policy' && (
                        <PolicyTab activePolicy={monitoringPolicyActive} allPolicies={monitoringPolicies} onRefresh={fetchAll} />
                    )}
                    {activeTab === 'actions' && (
                        <ActionsTab />
                    )}
                </div>
            </div>
        </div>
    );
}