import React, { useState, useEffect } from 'react';
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
    X as XIcon
} from 'lucide-react';
import { ChurnService } from '../churn.service';
import type { TrainResult, MLOpsMetrics, PerformanceStatus, TrainingHistoryPoint, PredictionBucket } from '../types';

// Colores por nivel de probabilidad para el histograma de distribución
const bucketColor = (bucket: string): string => {
    const start = parseInt(bucket.split('-')[0]);
    if (start >= 70) return '#EF4444'; // Alto riesgo — rojo
    if (start >= 40) return '#F59E0B'; // Riesgo medio — ámbar
    return '#10B981';                  // Bajo riesgo — verde
};

const triggerLabel: Record<string, { label: string; color: string }> = {
    manual_training:  { label: 'Manual',        color: 'bg-slate-100 text-slate-700'   },
    performance_decay:{ label: 'Auto (Decay)',   color: 'bg-red-100 text-red-700'       },
    scheduled_check:  { label: 'Check Prog.',    color: 'bg-emerald-100 text-emerald-700'},
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
        try {
            const [evolution, distribution] = await Promise.all([
                ChurnService.getTrainingEvolution(),
                ChurnService.getPredictionDistribution(),
            ]);
            setTrainingEvolution(evolution);
            setPredictionDistribution(distribution);
        } catch (err) {
            console.error('Error fetching chart data:', err);
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
            // If auto-training was triggered, refresh main metrics too
            if (result.autoTrainingTriggered) {
                await fetchMetrics();
            }
            // Re-fetch complete status (consistent with GET /monitor/status)
            await fetchMonitorStatus();
        } catch (err) {
            console.error('Error evaluating performance:', err);
        } finally {
            setIsEvaluating(false);
        }
    };

    useEffect(() => {
        fetchMonitorStatus();
    }, []);

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
        URL.revokeObjectURL(url);
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
            {trainResult && (
                <div className={`mb-6 rounded-xl p-5 border flex items-start gap-4 ${trainResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${trainResult.status === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                        {trainResult.status === 'success'
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            : <AlertTriangle className="w-5 h-5 text-red-600" />
                        }
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-semibold ${trainResult.status === 'success' ? 'text-emerald-800' : 'text-red-800'
                            }`}>
                            {trainResult.status === 'success' ? '✅ Entrenamiento Exitoso' : '❌ Error en Entrenamiento'}
                        </h4>
                        <p className={`text-sm mt-1 ${trainResult.status === 'success' ? 'text-emerald-700' : 'text-red-700'
                            }`}>
                            {trainResult.message || trainResult.error}
                        </p>

                        {/* Show metrics on success */}
                        {trainResult.status === 'success' && trainResult.metrics && (
                            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div className="bg-white/70 rounded-lg p-2 text-center">
                                    <p className="text-xs text-emerald-600 font-medium">Accuracy</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {(trainResult.metrics.accuracy * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white/70 rounded-lg p-2 text-center">
                                    <p className="text-xs text-emerald-600 font-medium">F1 Score</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {(trainResult.metrics.f1Score * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white/70 rounded-lg p-2 text-center">
                                    <p className="text-xs text-emerald-600 font-medium">Precision</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {(trainResult.metrics.precision * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white/70 rounded-lg p-2 text-center">
                                    <p className="text-xs text-emerald-600 font-medium">Recall</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {(trainResult.metrics.recall * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white/70 rounded-lg p-2 text-center">
                                    <p className="text-xs text-emerald-600 font-medium">AUC-ROC</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {(trainResult.metrics.aucRoc * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* MLflow Run ID */}
                        {trainResult.runId && (
                            <p className="mt-2 text-xs text-emerald-600 font-mono">
                                MLflow Run: {trainResult.runId}
                            </p>
                        )}
                    </div>

                    {/* Dismiss button */}
                    <button
                        onClick={() => setTrainResult(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

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

            {/* Metrics Performance Section */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Métricas de Rendimiento</h2>
                        <p className="text-sm text-slate-500">
                            Último entrenamiento: {metrics.lastTrainingDate || 'N/A'}
                        </p>
                    </div>
                    {monitorStatus && monitorStatus.status !== 'no_evaluations' && monitorStatus.status !== 'error' && monitorStatus.status !== 'insufficient_data' && (
                        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full ${
                            monitorStatus.status === 'healthy'
                                ? 'bg-emerald-50'
                                : 'bg-red-50'
                        }`}>
                            {monitorStatus.status === 'healthy'
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                : <AlertTriangle className="w-4 h-4 text-red-600" />
                            }
                            <span className={`text-sm font-medium ${
                                monitorStatus.status === 'healthy' ? 'text-emerald-700' : 'text-red-700'
                            }`}>
                                {monitorStatus.status === 'healthy' ? 'Modelo Óptimo' : 'Modelo Degradado'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                    <MetricRing value={metrics.precision} label="Precision" color="#10B981" />
                    <MetricRing value={metrics.recall} label="Recall" color="#3B82F6" />
                    <MetricRing value={metrics.f1Score} label="F1 Score" color="#8B5CF6" />
                    <MetricRing value={metrics.aucRoc} label="AUC-ROC" color="#F59E0B" />
                </div>
            </div>

            {/* ============================================================ */}
            {/* PERFORMANCE MONITOR CARD */}
            {/* ============================================================ */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${monitorStatus?.status === 'healthy' ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : monitorStatus?.status === 'degraded' ? 'bg-gradient-to-br from-red-400 to-rose-500'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Monitor de Rendimiento</h2>
                        <p className="text-sm text-slate-500">
                            Evaluación automática contra ground truth (account_details.exited)
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
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
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                                    <p className="text-xs text-emerald-600 font-medium">Verdaderos Positivos</p>
                                    <p className="text-xl font-bold text-emerald-800">{monitorStatus.truePositives ?? '--'}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                                    <p className="text-xs text-red-600 font-medium">Falsos Positivos</p>
                                    <p className="text-xl font-bold text-red-800">{monitorStatus.falsePositives ?? '--'}</p>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                                    <p className="text-xs text-amber-600 font-medium">Falsos Negativos</p>
                                    <p className="text-xl font-bold text-amber-800">{monitorStatus.falseNegatives ?? '--'}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                                    <p className="text-xs text-blue-600 font-medium">Verdaderos Negativos</p>
                                    <p className="text-xl font-bold text-blue-800">{monitorStatus.trueNegatives ?? '--'}</p>
                                </div>
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
                    Línea roja = umbral mínimo de Recall (75%)
                </p>

                {chartsLoading ? (
                    <div className="h-72 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
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
                                    tickFormatter={(val: string) => val.slice(5)} // Show MM-DD
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
                                {/* Umbral mínimo de Recall */}
                                <ReferenceLine
                                    y={75}
                                    stroke="#EF4444"
                                    strokeDasharray="6 3"
                                    strokeWidth={1.5}
                                    label={{ value: 'Umbral 75%', position: 'insideTopRight', fontSize: 10, fill: '#EF4444' }}
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
                        <p className="font-semibold">14 variables</p>
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
