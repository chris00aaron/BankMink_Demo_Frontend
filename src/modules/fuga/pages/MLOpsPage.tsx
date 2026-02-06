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
    Zap
} from 'lucide-react';
import { ChurnService } from '../churn.service';

// Mock data for ROC Curve
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

// Mock data for Training Loss
const trainingLossData = [
    { epoch: 1, training: 0.85, validation: 0.88 },
    { epoch: 2, training: 0.62, validation: 0.68 },
    { epoch: 3, training: 0.45, validation: 0.52 },
    { epoch: 4, training: 0.32, validation: 0.40 },
    { epoch: 5, training: 0.24, validation: 0.33 },
    { epoch: 6, training: 0.18, validation: 0.28 },
    { epoch: 7, training: 0.14, validation: 0.24 },
    { epoch: 8, training: 0.11, validation: 0.21 },
    { epoch: 9, training: 0.09, validation: 0.19 },
    { epoch: 10, training: 0.07, validation: 0.17 },
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
    const [metrics, setMetrics] = useState<import('../types').MLOpsMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const data = await ChurnService.getMLOpsMetrics();
                setMetrics(data);
            } catch (err) {
                console.error("Error fetching MLOps metrics:", err);
                setError("No se pudieron cargar las métricas MLOps.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

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
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Consola Técnica MLOps</h1>
                    <p className="text-slate-500 mt-1">Monitoreo de métricas del modelo de predicción de fuga (Backend: {metrics.modelStatus})</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm shadow-lg shadow-slate-900/10">
                        <RefreshCw className="w-4 h-4" />
                        Re-entrenar Modelo
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm border border-slate-200">
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
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-lg font-bold text-emerald-600">{metrics.modelStatus}</span>
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
                        <p className="text-sm text-slate-500">Última evaluación: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Modelo Óptimo</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                    <MetricRing value={metrics.precision} label="Precision" color="#10B981" />
                    <MetricRing value={metrics.recall} label="Recall" color="#3B82F6" />
                    <MetricRing value={metrics.f1Score} label="F1 Score" color="#8B5CF6" />
                    <MetricRing value={metrics.aucRoc} label="AUC-ROC" color="#F59E0B" />
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ROC Curve */}
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Curva ROC</h3>
                    <p className="text-sm text-slate-500 mb-6">AUC = {metrics.aucRoc}% • Umbral óptimo = 0.45</p>
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
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Pérdida de Entrenamiento</h3>
                    <p className="text-sm text-slate-500 mb-6">Training vs Validation • 10 epochs</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trainingLossData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="epoch"
                                    label={{ value: 'Epoch', position: 'bottom', offset: -5 }}
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
                        <p className="font-semibold">10 variables</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Entrenamiento</p>
                        <p className="font-semibold">6,800 muestras</p>
                    </div>
                </div>
            </div>

            {/* Mock Notice */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>📊 Métricas globales obtenidas del servidor. Gráficos de entrenamiento mostrados a modo de ejemplo.</p>
            </div>
        </div>
    );
};

export default MLOpsPage;
