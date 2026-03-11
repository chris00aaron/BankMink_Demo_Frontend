import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend
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
import type { TrainResult, MLOpsMetrics, PerformanceStatus } from '../types';

// Curva ROC sintética para referencia visual — la forma no representa el modelo real.
// El valor AUC real viene del backend y se muestra en los anillos de métricas.
const rocCurveData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.05, tpr: 0.52 },
    { fpr: 0.10, tpr: 0.68 },
    { fpr: 0.15, tpr: 0.76 },
    { fpr: 0.20, tpr: 0.82 },
    { fpr: 0.30, tpr: 0.88 },
    { fpr: 0.40, tpr: 0.91 },
    { fpr: 0.50, tpr: 0.94 },
    { fpr: 0.60, tpr: 0.95 },
    { fpr: 0.70, tpr: 0.97 },
    { fpr: 0.80, tpr: 0.98 },
    { fpr: 0.90, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
];

// Convergencia de XGBoost por número de árboles (referencia visual).
// XGBoost no entrena por epochs — cada paso añade un árbol al ensemble.
const trainingLossData = [
    { epoch: 10,  training: 0.85, validation: 0.88 },
    { epoch: 20,  training: 0.62, validation: 0.68 },
    { epoch: 30,  training: 0.45, validation: 0.52 },
    { epoch: 40,  training: 0.32, validation: 0.40 },
    { epoch: 50,  training: 0.24, validation: 0.33 },
    { epoch: 60,  training: 0.18, validation: 0.28 },
    { epoch: 70,  training: 0.14, validation: 0.24 },
    { epoch: 80,  training: 0.11, validation: 0.21 },
    { epoch: 90,  training: 0.09, validation: 0.19 },
    { epoch: 100, training: 0.07, validation: 0.17 },
];

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

    useEffect(() => {
        fetchMetrics();
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
            setMonitorStatus(result);
            // If auto-training was triggered, refresh main metrics too
            if (result.autoTrainingTriggered) {
                await fetchMetrics();
            }
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

            // If training succeeded, refresh metrics
            if (result.status === 'success') {
                await fetchMetrics();
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ROC Curve */}
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Curva ROC</h3>
                    <p className="text-sm text-slate-500 mb-6">Referencia visual • Umbral óptimo = 0.45 • AUC real en anillos superiores</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={rocCurveData}>
                                <defs>
                                    <linearGradient id="rocGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="fpr"
                                    label={{ value: 'False Positive Rate', position: 'bottom', offset: -5 }}
                                    stroke="#94A3B8"
                                    tickFormatter={(val) => val.toFixed(1)}
                                />
                                <YAxis
                                    label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                                    stroke="#94A3B8"
                                    tickFormatter={(val) => val.toFixed(1)}
                                />
                                <Tooltip
                                    formatter={(value: number) => [value.toFixed(3), '']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tpr"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fill="url(#rocGradient)"
                                    name="TPR"
                                />
                                {/* Diagonal reference line */}
                                <Line
                                    type="monotone"
                                    data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                                    dataKey="tpr"
                                    stroke="#CBD5E1"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Training Loss */}
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Convergencia del Modelo</h3>
                    <p className="text-sm text-slate-500 mb-6">Training vs Validation • 100 árboles (referencia visual)</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trainingLossData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="epoch"
                                    label={{ value: 'Árboles', position: 'bottom', offset: -5 }}
                                    stroke="#94A3B8"
                                />
                                <YAxis
                                    label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
                                    stroke="#94A3B8"
                                />
                                <Tooltip
                                    formatter={(value: number) => [value.toFixed(3), '']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="training"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                    name="Training"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="validation"
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                                    name="Validation"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
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
                <p>📊 Métricas de rendimiento obtenidas del servidor en tiempo real. Curva ROC y gráfico de convergencia mostrados como referencia visual — no representan la curva real del modelo.</p>
            </div>
        </div>
    );
};

export default MLOpsPage;
