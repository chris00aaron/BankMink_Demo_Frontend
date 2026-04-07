import React, { useState, useEffect, useRef } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';
import {
    Activity,
    Database,
    GitBranch,
    RefreshCw,
    Download,
    CheckCircle2,
    Zap,
    AlertTriangle,
    Loader2,
    Server,
    RotateCcw,
    Brain
} from 'lucide-react';
import { ChurnService } from '../churn.service';
import type { TrainResult, MLOpsMetrics, PerformanceStatus, TrainingHistoryPoint, PredictionBucket, ChurnModelInfo } from '../types';

// Colores por nivel de probabilidad para el histograma de distribución
const bucketColor = (bucket: string): string => {
    const start = parseInt(bucket.split('-')[0]);
    if (start >= 70) return '#EF4444'; // Alto riesgo — rojo
    if (start >= 45) return '#F59E0B'; // Riesgo medio — ámbar
    return '#10B981';                  // Bajo riesgo — verde
};

const triggerLabel: Record<string, { label: string; color: string }> = {
    manual_training:    { label: 'Manual',          color: 'bg-slate-100 text-slate-700'    },
    performance_decay:  { label: 'Auto (Decay)',     color: 'bg-red-100 text-red-700'        },
    scheduled_check:    { label: 'Check Prog.',      color: 'bg-emerald-100 text-emerald-700'},
    initial_training:   { label: 'Inicial',          color: 'bg-blue-100 text-blue-700'      },
    auto_training:      { label: 'Automático',       color: 'bg-purple-100 text-purple-700'  },
    drift_detected:     { label: 'Drift Detectado',  color: 'bg-orange-100 text-orange-700'  },
    manual_evaluation:  { label: 'Evaluación Man.',  color: 'bg-slate-100 text-slate-700'    },
};

// Circular progress ring component
const MetricRing: React.FC<{
    value: number;
    label: string;
    color: string;
    size?: number;
}> = ({ value, label, color, size = 100 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#E2E8F0"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{value.toFixed(1)}%</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-slate-600">{label}</span>
        </div>
    );
};

const MLOpsPage: React.FC = () => {
    const [metrics, setMetrics] = useState<MLOpsMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Training states
    const [isTraining, setIsTraining] = useState(false);
    const [trainResult, setTrainResult] = useState<TrainResult | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Chart data states
    const [trainingEvolution, setTrainingEvolution] = useState<TrainingHistoryPoint[]>([]);
    const [predictionDistribution, setPredictionDistribution] = useState<PredictionBucket[]>([]);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [chartsError, setChartsError] = useState<string | null>(null);

    // Ref to track the reload polling interval — allows cleanup on unmount
    const reloadPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Clear the polling interval when the component unmounts
    useEffect(() => {
        return () => {
            if (reloadPollRef.current) clearInterval(reloadPollRef.current);
        };
    }, []);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const data = await ChurnService.getMLOpsMetrics();
            setMetrics(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching MLOps metrics:", err);
            setError("No se pudieron cargar las métricas MLOps.");
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        setChartsLoading(true);
        setChartsError(null);
        try {
            const [evolution, distribution] = await Promise.all([
                ChurnService.getTrainingEvolution(),
                ChurnService.getPredictionDistribution(),
            ]);
            setTrainingEvolution(evolution);
            setPredictionDistribution(distribution);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setChartsError('No se pudieron cargar los datos de gráficos. Verifique la conexión con el servidor.');
        } finally {
            setChartsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        fetchChartData();
    }, []);

    // ============================================================
    // PERFORMANCE MONITOR STATE
    // ============================================================
    const [monitorStatus, setMonitorStatus] = useState<PerformanceStatus | null>(null);
    const [monitorLoading, setMonitorLoading] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const fetchMonitorStatus = async () => {
        try {
            setMonitorLoading(true);
            const data = await ChurnService.getMonitorStatus();
            setMonitorStatus(data);
        } catch (err) {
            console.error('Error fetching monitor status:', err);
        } finally {
            setMonitorLoading(false);
        }
    };

    const handleEvaluateNow = async () => {
        setIsEvaluating(true);
        try {
            const result = await ChurnService.triggerEvaluation();
            if (result.autoTrainingTriggered) {
                await fetchMetrics();
            }
            await fetchMonitorStatus();
        } catch (err) {
            console.error('Error evaluating performance:', err);
            setMonitorStatus({ status: 'error', message: 'Error al ejecutar la evaluación. Verifique que la API Python esté disponible.' });
        } finally {
            setIsEvaluating(false);
        }
    };

    useEffect(() => {
        fetchMonitorStatus();
    }, []);

    // ============================================================
    // LIVE MODEL STATUS STATE
    // ============================================================
    const [modelInfo, setModelInfo] = useState<ChurnModelInfo | null>(null);
    const [modelInfoLoading, setModelInfoLoading] = useState(false);
    const [isReloading, setIsReloading] = useState(false);

    const fetchModelInfo = async () => {
        try {
            setModelInfoLoading(true);
            const data = await ChurnService.getModelInfo();
            setModelInfo(data);
        } catch (err) {
            console.error('Error fetching model info:', err);
        } finally {
            setModelInfoLoading(false);
        }
    };

    const handleReloadModel = async () => {
        setIsReloading(true);
        // Clear any previous poll before starting a new one
        if (reloadPollRef.current) clearInterval(reloadPollRef.current);
        try {
            await ChurnService.reloadModel();
            // Poll until status changes from 'updating' back to 'ready'
            reloadPollRef.current = setInterval(async () => {
                const info = await ChurnService.getModelInfo();
                setModelInfo(info);
                if (info.status !== 'updating') {
                    if (reloadPollRef.current) clearInterval(reloadPollRef.current);
                    reloadPollRef.current = null;
                    setIsReloading(false);
                    await fetchMetrics();
                }
            }, 2000);
        } catch (err) {
            console.error('Error reloading model:', err);
            setModelInfo(prev => prev
                ? { ...prev, status: 'error', message: 'No se pudo iniciar la recarga. Verifique que la API Python esté disponible.' }
                : null
            );
            setIsReloading(false);
        }
    };

    useEffect(() => {
        fetchModelInfo();
    }, []);

    // Auto-refresh: 30s when healthy, 2min when error (avoids log spam on ECONNREFUSED)
    useEffect(() => {
        const delay = modelInfo?.status === 'error' ? 120000 : 30000;
        const interval = setInterval(fetchModelInfo, delay);
        return () => clearInterval(interval);
    }, [modelInfo?.status]);

    // Handle metrics export
    const handleExportMetrics = () => {
        if (!metrics) return;
        const exportData = {
            exportedAt: new Date().toISOString(),
            model: {
                status: metrics.modelStatus,
                version: metrics.modelVersion,
                lastTrainingDate: metrics.lastTrainingDate,
                totalPredictions: metrics.totalPredictions,
            },
            performance: {
                precision: metrics.precision,
                recall: metrics.recall,
                f1Score: metrics.f1Score,
                aucRoc: metrics.aucRoc,
            },
            monitor: monitorStatus ?? null,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `churn_mlops_metrics_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    // Handle training trigger
    const handleTrainClick = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmTrain = async () => {
        setShowConfirmDialog(false);
        setIsTraining(true);
        setTrainResult(null);

        try {
            const result = await ChurnService.trainModel();
            setTrainResult(result);

            // If training succeeded, refresh metrics and charts
            if (result.status === 'success') {
                await Promise.all([fetchMetrics(), fetchChartData()]);
            }
        } catch (err: any) {
            setTrainResult({
                status: 'error',
                error: err.message || 'Error inesperado durante el entrenamiento.'
            });
        } finally {
            setIsTraining(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
                    <span className="mt-4 block text-slate-600">Conectando a Consola MLOps...</span>
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                    <Activity className="text-red-600 w-6 h-6" />
                    <p className="text-red-700 font-medium">{error || "Error desconocido"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen">
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Confirmar Re-entrenamiento</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            ¿Está seguro de iniciar el re-entrenamiento del modelo? Este proceso:
                        </p>
                        <ul className="text-sm text-slate-500 mb-6 space-y-1 ml-4">
                            <li>• Extraerá datos actuales de la base de datos</li>
                            <li>• Entrenará un nuevo modelo XGBoost</li>
                            <li>• Registrará métricas en MLflow/DagsHub</li>
                            <li>• Actualizará el modelo en producción</li>
                        </ul>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2.5 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmTrain}
                                className="px-6 py-2.5 bg-[#0F172A] text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm shadow-lg"
                            >
                                Iniciar Entrenamiento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Training Result Banner */}
            {trainResult && (() => {
                const isError    = trainResult.status === 'error';
                const isPromoted = trainResult.status === 'success' && trainResult.promoted === true;
                const isRejected = trainResult.status === 'success' && !isPromoted;

                const bannerCls = isError    ? 'bg-red-50 border-red-200'
                                : isRejected ? 'bg-amber-50 border-amber-200'
                                :              'bg-emerald-50 border-emerald-200';
                const iconCls   = isError    ? 'bg-red-100'
                                : isRejected ? 'bg-amber-100'
                                :              'bg-emerald-100';
                const textCls   = isError    ? 'text-red-800'
                                : isRejected ? 'text-amber-800'
                                :              'text-emerald-800';
                const subCls    = isError    ? 'text-red-600'
                                : isRejected ? 'text-amber-600'
                                :              'text-emerald-600';

                const title = isError    ? 'Error en Entrenamiento'
                            : isRejected ? 'Modelo Entrenado — Sin Promoción'
                            :              'Nuevo Modelo Promovido a Producción';

                const challengerVals = trainResult.metrics ? [
                    trainResult.metrics.accuracy,
                    trainResult.metrics.f1Score,
                    trainResult.metrics.precision,
                    trainResult.metrics.recall,
                    trainResult.metrics.aucRoc,
                ] : [];

                const championVals = trainResult.championMetrics ? [
                    trainResult.championMetrics.accuracy,
                    trainResult.championMetrics.f1Score,
                    trainResult.championMetrics.precisionScore,
                    trainResult.championMetrics.recallScore,
                    trainResult.championMetrics.aucRoc,
                ] : [];

                const fmt = (v: number | null | undefined) =>
                    v != null ? (v * 100).toFixed(1) + '%' : '—';

                const delta = (nv: number | null | undefined, cv: number | null | undefined) => {
                    if (nv == null || cv == null) return null;
                    const d = (nv - cv) * 100;
                    if (Math.abs(d) < 0.05) return null;
                    return d;
                };

                return (
                    <div className={`mb-6 rounded-xl border overflow-hidden ${bannerCls}`}>
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-current/10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                                {isError    ? <AlertTriangle className="w-4 h-4 text-red-600" />
                               : isRejected ? <AlertTriangle className="w-4 h-4 text-amber-600" />
                               :              <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-semibold text-sm ${textCls}`}>{title}</h4>
                                {(trainResult.promotionReason || trainResult.message || trainResult.error) && (
                                    <p className={`text-xs mt-0.5 ${subCls}`}>
                                        {trainResult.promotionReason || trainResult.message || trainResult.error}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setTrainResult(null)} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                                <span className="text-lg leading-none">&times;</span>
                            </button>
                        </div>

                        {/* Metrics comparison table */}
                        {trainResult.status === 'success' && trainResult.metrics && (
                            <div className="px-5 py-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            <th className="text-left pb-2 font-medium">Modelo</th>
                                            <th className="text-center pb-2 font-medium">Accuracy</th>
                                            <th className="text-center pb-2 font-medium">F1</th>
                                            <th className="text-center pb-2 font-medium">Precision</th>
                                            <th className="text-center pb-2 font-medium">Recall</th>
                                            <th className="text-center pb-2 font-medium">AUC-ROC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/60">
                                        {/* Challenger row */}
                                        <tr className="bg-white/50">
                                            <td className="py-2.5 pr-3">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded ${isPromoted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isPromoted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {isPromoted ? 'Nuevo Modelo' : 'Challenger'}
                                                </span>
                                                {trainResult.versionTag && (
                                                    <span className="block text-slate-400 mt-0.5" style={{fontSize:'10px'}}>{trainResult.versionTag}</span>
                                                )}
                                            </td>
                                            {challengerVals.map((v, i) => (
                                                <td key={i} className="text-center py-2.5">
                                                    <span className="font-bold text-slate-800">{fmt(v)}</span>
                                                    {(() => {
                                                        const d = delta(v, championVals[i]);
                                                        if (d == null) return null;
                                                        return (
                                                            <span className={`block text-xs font-medium ${d > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {d > 0 ? '+' : ''}{d.toFixed(1)}pp
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Champion row */}
                                        {trainResult.championMetrics ? (
                                            <tr>
                                                <td className="py-2.5 pr-3">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        En Producción
                                                    </span>
                                                    {trainResult.championMetrics.modelVersion && (
                                                        <span className="block text-slate-400 mt-0.5" style={{fontSize:'10px'}}>{trainResult.championMetrics.modelVersion}</span>
                                                    )}
                                                </td>
                                                {championVals.map((v, i) => (
                                                    <td key={i} className="text-center py-2.5">
                                                        <span className="font-medium text-slate-500">{fmt(v)}</span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="py-2.5 text-xs text-slate-400 italic">
                                                    Sin modelo previo en producción — este es el primer entrenamiento registrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {trainResult.runId && (
                                    <p className="mt-3 text-xs text-slate-400 font-mono">
                                        MLflow Run ID: {trainResult.runId}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })()}


            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Consola Técnica MLOps</h1>
                    <p className="text-slate-500 mt-1">Monitoreo de métricas del modelo de predicción de fuga (Backend: {metrics.modelStatus})</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleTrainClick}
                        disabled={isTraining}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm shadow-lg ${isTraining
                            ? 'bg-slate-400 text-white cursor-not-allowed shadow-none'
                            : 'bg-[#0F172A] text-white hover:bg-slate-800 shadow-slate-900/10'
                            }`}
                    >
                        {isTraining ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Entrenando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Re-entrenar Modelo
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleExportMetrics}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm border border-slate-200"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Métricas
                    </button>
                </div>
            </div>

            {/* Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Estado</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${isTraining ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                            <span className={`text-lg font-bold ${isTraining ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {isTraining ? 'Entrenando...' : metrics.modelStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Predicciones Totales</p>
                        <span className="text-lg font-bold text-slate-800">{metrics.totalPredictions.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <GitBranch className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Versión Modelo</p>
                        <span className="text-lg font-bold text-slate-800">{metrics.modelVersion}</span>
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* LIVE MODEL STATUS CARD (equivalente a ATM /v1/withdrawal/info) */}
            {/* ============================================================ */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        modelInfo?.status === 'ready' ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                        : modelInfo?.status === 'updating' ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}>
                        <Server className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Estado del Modelo en Producción</h2>
                        <p className="text-sm text-slate-500">
                            Monitoreo en tiempo real — versión activa, SHAP y disponibilidad
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {/* Live status badge */}
                        {modelInfo && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                modelInfo.status === 'ready' ? 'bg-emerald-50 text-emerald-700'
                                : modelInfo.status === 'updating' ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    modelInfo.status === 'ready' ? 'bg-emerald-500'
                                    : modelInfo.status === 'updating' ? 'bg-amber-500 animate-pulse'
                                    : 'bg-red-500'
                                } ${modelInfo.status === 'ready' ? 'animate-pulse' : ''}`}></span>
                                {modelInfo.status === 'ready' ? 'Activo'
                                : modelInfo.status === 'updating' ? 'Actualizando...'
                                : 'No Disponible'}
                            </div>
                        )}
                        {/* Refresh info button */}
                        <button
                            onClick={fetchModelInfo}
                            disabled={modelInfoLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                            title="Refrescar estado"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${modelInfoLoading ? 'animate-spin' : ''}`} />
                            Refrescar
                        </button>
                        {/* Hot-reload from DagsHub button */}
                        <button
                            onClick={handleReloadModel}
                            disabled={isReloading || modelInfo?.status === 'updating'}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isReloading || modelInfo?.status === 'updating'
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-[#0F172A] text-white hover:bg-slate-800'
                            }`}
                        >
                            {isReloading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Recargando...</>
                            ) : (
                                <><RotateCcw className="w-4 h-4" /> Recargar desde DagsHub</>
                            )}
                        </button>
                    </div>
                </div>

                {!modelInfo ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm">Consultando estado del modelo...</span>
                    </div>
                ) : modelInfo.status === 'error' ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">No se pudo contactar con la API</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {modelInfo.message || 'Verifica que la API Python y el backend Java estén en ejecución.'}
                            </p>
                        </div>
                        <button onClick={fetchModelInfo} className="ml-auto text-xs text-slate-500 hover:text-slate-700 underline">
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Version */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <GitBranch className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Versión Activa</span>
                            </div>
                            <p className="text-xl font-bold text-slate-800">{modelInfo.version}</p>
                        </div>
                        {/* Status */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</span>
                            </div>
                            <p className={`text-xl font-bold ${
                                modelInfo.status === 'ready' ? 'text-emerald-600'
                                : modelInfo.status === 'updating' ? 'text-amber-600'
                                : 'text-red-600'
                            }`}>
                                {modelInfo.status === 'ready' ? 'Listo'
                                : modelInfo.status === 'updating' ? 'Actualizando'
                                : 'No Cargado'}
                            </p>
                        </div>
                        {/* Features */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-4 h-4 text-teal-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Features</span>
                            </div>
                            <p className="text-xl font-bold text-slate-800">
                                {modelInfo.feature_count > 0 ? modelInfo.feature_count : '—'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Scaler: {modelInfo.has_scaler ? 'OK' : 'N/A'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* TRAINING METRICS — calculadas sobre test split              */}
            {/* ============================================================ */}

            {/* Section divider: Training */}
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-2">
                    Métricas de Entrenamiento
                </span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Métricas de Entrenamiento</h2>
                        <p className="text-sm text-slate-500">
                            Evaluadas sobre el split de test · Último entrenamiento: {metrics.lastTrainingDate || 'N/A'}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        <Database className="w-3.5 h-3.5" />
                        Fuente: Split de Test
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                    <MetricRing value={metrics.precision} label="Precision" color="#10B981" />
                    <MetricRing value={metrics.recall} label="Recall" color="#3B82F6" />
                    <MetricRing value={metrics.f1Score} label="F1 Score" color="#8B5CF6" />
                    <MetricRing value={metrics.aucRoc} label="AUC-ROC" color="#F59E0B" />
                </div>
                <p className="text-xs text-slate-400 text-center mt-4">
                    Estas métricas reflejan el rendimiento del modelo sobre datos históricos reservados para evaluación, no sobre predicciones reales en producción.
                </p>
            </div>

            {/* Section divider: Production Monitor */}
            <div className="flex items-center gap-3 mb-4 mt-8">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest px-2">
                    Métricas de Producción (Monitor)
                </span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* ============================================================ */}
            {/* PERFORMANCE MONITOR CARD                                   */}
            {/* ============================================================ */}
            <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${monitorStatus?.status === 'healthy' ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : monitorStatus?.status === 'degraded' ? 'bg-gradient-to-br from-red-400 to-rose-500'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Métricas de Producción (Monitor)</h2>
                        <p className="text-sm text-slate-500">
                            Predicciones reales comparadas contra <code className="text-xs bg-slate-100 px-1 rounded">account_details.exited</code> (ground truth)
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Fuente: Ground Truth
                        </div>
                        {monitorStatus && monitorStatus.status !== 'no_evaluations' && monitorStatus.status !== 'error' && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${monitorStatus.status === 'healthy'
                                ? 'bg-emerald-50 text-emerald-700'
                                : monitorStatus.status === 'degraded'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${monitorStatus.status === 'healthy' ? 'bg-emerald-500'
                                    : monitorStatus.status === 'degraded' ? 'bg-red-500'
                                        : 'bg-amber-500'
                                    } animate-pulse`}></span>
                                {monitorStatus.status === 'healthy' ? 'Saludable'
                                    : monitorStatus.status === 'degraded' ? 'Degradado'
                                        : 'Datos Insuficientes'}
                            </div>
                        )}
                        <button
                            onClick={handleEvaluateNow}
                            disabled={isEvaluating}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isEvaluating
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {isEvaluating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Evaluando...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Evaluar Ahora
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Auto-Training Alert Banner */}
                {monitorStatus?.autoTrainingTriggered && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">
                                ⚡ Re-entrenamiento automático disparado
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Razón: Decay de rendimiento • Run ID: {monitorStatus.trainingRunId || 'N/A'}
                            </p>
                        </div>
                    </div>
                )}

                {monitorLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : monitorStatus?.status === 'no_evaluations' ? (
                    <div className="text-center py-8 text-slate-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No se ha realizado ninguna evaluación aún.</p>
                        <p className="text-xs mt-1">Haz clic en "Evaluar Ahora" para iniciar la primera evaluación.</p>
                    </div>
                ) : monitorStatus?.status === 'error' ? (
                    <div className="text-center py-8 text-red-400">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-70" />
                        <p className="text-sm">{monitorStatus.message}</p>
                    </div>
                ) : monitorStatus?.status === 'insufficient_data' ? (
                    <div className="py-6 px-4">
                        <div className="flex items-start gap-3 mb-5">
                            <Database className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Acumulando datos de producción</p>
                                <p className="text-xs text-slate-500 mt-0.5">{monitorStatus.message}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                <span>Muestras maduras (&gt;{monitorStatus.maturationDays ?? 30} días)</span>
                                <span>{monitorStatus.evaluatedSamples ?? 0} / {monitorStatus.minSamplesRequired ?? 50}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div
                                    className="bg-amber-400 h-2.5 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.min(100, ((monitorStatus.evaluatedSamples ?? 0) / (monitorStatus.minSamplesRequired ?? 50)) * 100)}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-400">
                                Umbral de activación: {((monitorStatus.recallThreshold ?? 0.75) * 100).toFixed(0)}% Recall · Intervalo de evaluación: {monitorStatus.monitorIntervalHours ?? 6}h
                            </p>
                        </div>
                    </div>
                ) : monitorStatus ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Metrics Summary */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Métricas de Producción</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`rounded-lg p-3 border ${(monitorStatus.recall ?? 0) < (monitorStatus.recallThreshold ?? 0.75)
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-emerald-50 border-emerald-200'
                                    }`}>
                                    <p className="text-xs text-slate-500 font-medium">Recall</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {monitorStatus.recall != null ? (monitorStatus.recall * 100).toFixed(1) : '--'}%
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Umbral: {((monitorStatus.recallThreshold ?? 0.75) * 100).toFixed(0)}%
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <p className="text-xs text-slate-500 font-medium">F1-Score</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {monitorStatus.f1Score != null ? (monitorStatus.f1Score * 100).toFixed(1) : '--'}%
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <p className="text-xs text-slate-500 font-medium">Precision</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {monitorStatus.precision != null ? (monitorStatus.precision * 100).toFixed(1) : '--'}%
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <p className="text-xs text-slate-500 font-medium">Accuracy</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {monitorStatus.accuracy != null ? (monitorStatus.accuracy * 100).toFixed(1) : '--'}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Confusion Matrix + Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Matriz de Confusión</h3>

                            {/* Tabla con ejes etiquetados */}
                            <div className="overflow-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            <td className="p-1" />
                                            <td colSpan={2} className="text-center font-bold text-slate-500 pb-1">
                                                Real (ground truth)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-1" />
                                            <td className="text-center font-semibold text-slate-400 pb-1 w-1/2">Fugó (1)</td>
                                            <td className="text-center font-semibold text-slate-400 pb-1 w-1/2">Se quedó (0)</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="font-bold text-slate-500 pr-2 whitespace-nowrap align-middle"
                                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', width: 24 }}
                                                rowSpan={2}>
                                                Predicho
                                            </td>
                                            <td className="p-1">
                                                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                                                    <p className="font-semibold text-emerald-700 mb-0.5">Fugó (1)</p>
                                                    <p className="text-xs text-emerald-600">Verdadero Positivo</p>
                                                    <p className="text-xl font-bold text-emerald-800 mt-1">{monitorStatus.truePositives ?? '--'}</p>
                                                </div>
                                            </td>
                                            <td className="p-1">
                                                <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                                                    <p className="font-semibold text-red-700 mb-0.5">Fugó (1)</p>
                                                    <p className="text-xs text-red-600">Falso Positivo</p>
                                                    <p className="text-xl font-bold text-red-800 mt-1">{monitorStatus.falsePositives ?? '--'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-1">
                                                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                                                    <p className="font-semibold text-amber-700 mb-0.5">Se quedó (0)</p>
                                                    <p className="text-xs text-amber-600">Falso Negativo</p>
                                                    <p className="text-xl font-bold text-amber-800 mt-1">{monitorStatus.falseNegatives ?? '--'}</p>
                                                </div>
                                            </td>
                                            <td className="p-1">
                                                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                                                    <p className="font-semibold text-blue-700 mb-0.5">Se quedó (0)</p>
                                                    <p className="text-xs text-blue-600">Verdadero Negativo</p>
                                                    <p className="text-xl font-bold text-blue-800 mt-1">{monitorStatus.trueNegatives ?? '--'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>Muestras: {monitorStatus.evaluatedSamples ?? '--'} / mín. {monitorStatus.minSamplesRequired ?? 50}</span>
                                <span>Maduración: {monitorStatus.maturationDays ?? 30} días</span>
                            </div>
                            {monitorStatus.lastEvaluationDate && (
                                <p className="text-xs text-slate-400">
                                    Última evaluación: {new Date(monitorStatus.lastEvaluationDate).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ============================================================ */}
            {/* CHART 1 — Evolución de Métricas (full width)               */}
            {/* ============================================================ */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-slate-800">Evolución de Métricas</h3>
                    <span className="text-xs text-slate-400">Últimos 30 registros de entrenamiento/evaluación</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                    Tendencia real de Recall, Precision y F1-Score a lo largo del tiempo ·
                    Línea roja = umbral mínimo de Recall (70%)
                </p>

                {chartsLoading ? (
                    <div className="h-72 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                ) : chartsError ? (
                    <div className="h-72 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertTriangle className="w-8 h-8 text-amber-400 opacity-80" />
                        <p className="text-sm font-medium text-slate-600">{chartsError}</p>
                        <button onClick={fetchChartData} className="text-xs text-indigo-500 hover:underline mt-1">Reintentar</button>
                    </div>
                ) : trainingEvolution.length === 0 ? (
                    <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                        <Activity className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">Sin historial de entrenamientos aún.</p>
                        <p className="text-xs mt-1">Entrena el modelo para ver la evolución de métricas.</p>
                    </div>
                ) : (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trainingEvolution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94A3B8"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(val: string) => val.slice(5)}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    tick={{ fontSize: 11 }}
                                    domain={[0, 100]}
                                    tickFormatter={(v: number) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12 }}
                                    formatter={(value: number, name: string) => [`${value?.toFixed(1)}%`, name]}
                                    labelStyle={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                {/* Umbral mínimo de Recall — usa el valor real del monitor si está disponible */}
                                <ReferenceLine
                                    y={monitorStatus?.recallThreshold != null ? monitorStatus.recallThreshold * 100 : 70}
                                    stroke="#EF4444"
                                    strokeDasharray="6 3"
                                    strokeWidth={1.5}
                                    label={{
                                        value: `Umbral ${monitorStatus?.recallThreshold != null ? (monitorStatus.recallThreshold * 100).toFixed(0) : 70}%`,
                                        position: 'insideTopRight',
                                        fontSize: 10,
                                        fill: '#EF4444'
                                    }}
                                />
                                <Line type="monotone" dataKey="recall"    stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Recall"    connectNulls />
                                <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Precision" connectNulls />
                                <Line type="monotone" dataKey="f1Score"   stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="F1-Score"  connectNulls />
                                <Line type="monotone" dataKey="aucRoc"    stroke="#F59E0B" strokeWidth={2}   dot={{ r: 3 }} activeDot={{ r: 5 }} name="AUC-ROC"   strokeDasharray="5 3" connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* CHARTS 2 & 3 — Distribución + Historial (2 cols)            */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Distribución de Probabilidades */}
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Distribución de Probabilidades</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Histograma de scores de fuga · Un modelo confiado muestra picos en los extremos
                    </p>

                    {chartsLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                        </div>
                    ) : chartsError ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <AlertTriangle className="w-7 h-7 text-amber-400 opacity-80" />
                            <p className="text-sm text-slate-500">Error cargando distribución.</p>
                        </div>
                    ) : predictionDistribution.every(b => b.count === 0) ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                            <Database className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">Sin predicciones registradas aún.</p>
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={predictionDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="bucket" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12 }}
                                        formatter={(value: number) => [value, 'Predicciones']}
                                        labelFormatter={(label) => `Rango: ${label}`}
                                    />
                                    <Bar dataKey="count" name="Predicciones" radius={[4, 4, 0, 0]}>
                                        {predictionDistribution.map((entry, index) => (
                                            <Cell key={index} fill={bucketColor(entry.bucket)} fillOpacity={0.85} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex gap-4 mt-3 justify-center text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Bajo riesgo</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />Riesgo medio</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />Alto riesgo</span>
                    </div>
                </div>

                {/* Historial de Entrenamientos */}
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-slate-800">Historial de Entrenamientos</h3>
                        <span className="text-xs text-slate-400">{trainingEvolution.length} registros</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Eventos de entrenamiento y evaluación ordenados por fecha</p>

                    {chartsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                        </div>
                    ) : trainingEvolution.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <GitBranch className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">Sin historial de entrenamientos.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto flex-1 max-h-64 space-y-2 pr-1">
                            {[...trainingEvolution].reverse().map((entry, idx) => {
                                const trigger = triggerLabel[entry.triggerReason] ?? { label: entry.triggerReason, color: 'bg-slate-100 text-slate-600' };
                                return (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                        {/* Date */}
                                        <div className="text-xs text-slate-400 font-mono w-20 flex-shrink-0 pt-0.5">
                                            {entry.date}
                                        </div>
                                        {/* Trigger badge */}
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${trigger.color}`}>
                                            {trigger.label}
                                        </span>
                                        {/* Metrics */}
                                        <div className="flex gap-3 flex-wrap text-xs text-slate-600 flex-1">
                                            {entry.recall != null && (
                                                <span>R <strong className="text-slate-800">{entry.recall.toFixed(1)}%</strong></span>
                                            )}
                                            {entry.f1Score != null && (
                                                <span>F1 <strong className="text-slate-800">{entry.f1Score.toFixed(1)}%</strong></span>
                                            )}
                                            {entry.precision != null && (
                                                <span>P <strong className="text-slate-800">{entry.precision.toFixed(1)}%</strong></span>
                                            )}
                                        </div>
                                        {/* Production badge */}
                                        {entry.inProduction && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                                                Prod
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Model Info Footer */}
            <div className="mt-8 bg-slate-800 rounded-xl p-6 text-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Algoritmo</p>
                        <p className="font-semibold">XGBoost Classifier</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Última Actualización</p>
                        <p className="font-semibold">{metrics.lastTrainingDate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Features</p>
                        <p className="font-semibold">
                            {modelInfo?.feature_count > 0 ? `${modelInfo.feature_count} variables` : '14 variables'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Repositorio</p>
                        <p className="font-semibold">DagsHub MLflow</p>
                    </div>
                </div>
            </div>

            {/* Info Notice */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>Todas las métricas y gráficos son datos reales obtenidos de la base de datos en tiempo real.</p>
            </div>
        </div>
    );
};

export default MLOpsPage;
