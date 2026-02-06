import { useState } from 'react';
import {
    Brain, TrendingUp, Clock, Award, BarChart3,
    Activity, CheckCircle, AlertTriangle, ChevronRight, Cpu,
    Database, Zap, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

// ==================== COMPONENTE GAUGE CIRCULAR ====================

interface CircularGaugeProps {
    value: number; // 0-1
    label: string;
    color: string;
    size?: 'sm' | 'md' | 'lg';
    showChange?: {
        value: number;
        isPositive: boolean;
    };
}

function CircularGauge({ value, label, color, size = 'md', showChange }: CircularGaugeProps) {
    const percent = value * 100;
    const sizeConfig = {
        sm: { width: 80, stroke: 6, fontSize: 'text-lg', labelSize: 'text-[9px]' },
        md: { width: 100, stroke: 8, fontSize: 'text-xl', labelSize: 'text-[10px]' },
        lg: { width: 120, stroke: 10, fontSize: 'text-2xl', labelSize: 'text-xs' },
    };
    const config = sizeConfig[size];
    const radius = (config.width - config.stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const colorClasses: Record<string, { gradient: string; bg: string; text: string }> = {
        blue: { gradient: 'url(#blueGradient)', bg: 'bg-blue-50', text: 'text-blue-600' },
        emerald: { gradient: 'url(#emeraldGradient)', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        purple: { gradient: 'url(#purpleGradient)', bg: 'bg-purple-50', text: 'text-purple-600' },
        orange: { gradient: 'url(#orangeGradient)', bg: 'bg-orange-50', text: 'text-orange-600' },
        pink: { gradient: 'url(#pinkGradient)', bg: 'bg-pink-50', text: 'text-pink-600' },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: config.width, height: config.width }}>
                <svg className="transform -rotate-90" width={config.width} height={config.width}>
                    <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                        <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f472b6" />
                        </linearGradient>
                    </defs>
                    {/* Background circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={config.stroke}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.gradient}
                        strokeWidth={config.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`${config.fontSize} font-bold text-gray-900`}>
                        {percent.toFixed(1)}%
                    </span>
                    {showChange && (
                        <span className={`text-[10px] font-medium flex items-center gap-0.5 ${showChange.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {showChange.isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                            {showChange.isPositive ? '+' : ''}{showChange.value.toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>
            <span className={`${config.labelSize} font-semibold text-gray-600 uppercase mt-2 tracking-wide`}>
                {label}
            </span>
        </div>
    );
}

// ==================== DATOS MOCKUP ====================

const MOCK_CURRENT_MODEL = {
    id_model: 3,
    model_version: 'v2.1.0',
    algorithm: 'XGBoost + IsolationForest',
    is_active: true,
    threshold: 0.50,
    created_at: '2026-01-15T10:30:00',
    feature_importances: {
        amt: 0.42,
        distance_km: 0.18,
        hour: 0.15,
        anomaly_score: 0.12,
        category: 0.08,
        age: 0.05,
    },
};

const MOCK_PREVIOUS_MODEL = {
    id_model: 2,
    model_version: 'v2.0.0',
    algorithm: 'XGBoost + IsolationForest',
    is_active: false,
    threshold: 0.55,
    created_at: '2025-12-01T14:00:00',
};

const MOCK_TRAINING_HISTORY = [
    {
        id_audit: 5,
        id_model: 3,
        model_version: 'v2.1.0',
        start_training: '2026-01-15T08:00:00',
        end_training: '2026-01-15T10:30:00',
        training_duration_seconds: 9000,
        accuracy: 0.9542,
        precision_score: 0.9234,
        recall_score: 0.8876,
        f1_score: 0.9052,
        auc_roc: 0.9678,
        is_production: true,
        dataset: {
            count_train: 85000,
            count_test: 15000,
            fraud_ratio: 0.0234,
            start_date: '2025-06-01',
            end_date: '2025-12-31',
        },
    },
    {
        id_audit: 4,
        id_model: 2,
        model_version: 'v2.0.0',
        start_training: '2025-12-01T12:00:00',
        end_training: '2025-12-01T14:00:00',
        training_duration_seconds: 7200,
        accuracy: 0.9412,
        precision_score: 0.9089,
        recall_score: 0.8654,
        f1_score: 0.8866,
        auc_roc: 0.9534,
        is_production: false,
        dataset: {
            count_train: 70000,
            count_test: 12000,
            fraud_ratio: 0.0198,
            start_date: '2025-03-01',
            end_date: '2025-11-30',
        },
    },
    {
        id_audit: 3,
        id_model: 1,
        model_version: 'v1.0.0',
        start_training: '2025-09-15T09:00:00',
        end_training: '2025-09-15T10:30:00',
        training_duration_seconds: 5400,
        accuracy: 0.9201,
        precision_score: 0.8756,
        recall_score: 0.8234,
        f1_score: 0.8487,
        auc_roc: 0.9289,
        is_production: false,
        dataset: {
            count_train: 50000,
            count_test: 10000,
            fraud_ratio: 0.0156,
            start_date: '2025-01-01',
            end_date: '2025-09-01',
        },
    },
];

// ==================== COMPONENTE PRINCIPAL ====================

export function ModelMonitoring() {
    const [selectedTraining, setSelectedTraining] = useState(MOCK_TRAINING_HISTORY[0]);

    const currentMetrics = MOCK_TRAINING_HISTORY[0];
    const previousMetrics = MOCK_TRAINING_HISTORY[1];

    // Calcular cambios
    const getChange = (current: number, previous: number) => {
        const diff = ((current - previous) / previous) * 100;
        return {
            value: diff,
            isPositive: diff > 0,
            isNeutral: Math.abs(diff) < 0.5,
        };
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutos`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const metricsConfig = [
        { key: 'accuracy', label: 'Accuracy', color: 'blue', current: currentMetrics.accuracy, previous: previousMetrics.accuracy },
        { key: 'precision', label: 'Precision', color: 'emerald', current: currentMetrics.precision_score, previous: previousMetrics.precision_score },
        { key: 'recall', label: 'Recall', color: 'purple', current: currentMetrics.recall_score, previous: previousMetrics.recall_score },
        { key: 'f1', label: 'F1-Score', color: 'orange', current: currentMetrics.f1_score, previous: previousMetrics.f1_score },
        { key: 'auc', label: 'AUC-ROC', color: 'pink', current: currentMetrics.auc_roc, previous: previousMetrics.auc_roc },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monitoreo del Modelo</h1>
                    <p className="text-gray-600 mt-1">
                        Rendimiento, métricas y evolución del modelo de detección de fraude
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        Modelo Activo: {MOCK_CURRENT_MODEL.model_version}
                    </span>
                </div>
            </div>

            {/* MÉTRICAS PRINCIPALES CON GAUGES CIRCULARES */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-gray-200 p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Métricas del Modelo {MOCK_CURRENT_MODEL.model_version}
                        </h2>
                        <p className="text-sm text-gray-500">Comparación vs {MOCK_PREVIOUS_MODEL.model_version}</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                    {metricsConfig.map((metric) => {
                        const change = getChange(metric.current, metric.previous);
                        return (
                            <CircularGauge
                                key={metric.key}
                                value={metric.current}
                                label={metric.label}
                                color={metric.color}
                                size="md"
                                showChange={{
                                    value: change.value,
                                    isPositive: change.isPositive,
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda: Info del modelo actual */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Card Modelo Activo */}
                    <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Modelo en Producción</h3>
                                <p className="text-sm text-gray-500">{MOCK_CURRENT_MODEL.algorithm}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Versión</span>
                                <span className="text-sm font-bold text-gray-900">{MOCK_CURRENT_MODEL.model_version}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Umbral de Decisión</span>
                                <span className="text-sm font-bold text-gray-900">{(MOCK_CURRENT_MODEL.threshold * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Desplegado</span>
                                <span className="text-sm font-bold text-gray-900">{formatDate(MOCK_CURRENT_MODEL.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature Importances como barras horizontales */}
                    <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-gray-900">Importancia de Features</h3>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(MOCK_CURRENT_MODEL.feature_importances)
                                .sort(([, a], [, b]) => b - a)
                                .map(([feature, importance], idx) => {
                                    const colors = ['from-blue-500 to-blue-400', 'from-purple-500 to-purple-400', 'from-emerald-500 to-emerald-400', 'from-orange-500 to-orange-400', 'from-pink-500 to-pink-400', 'from-cyan-500 to-cyan-400'];
                                    return (
                                        <div key={feature}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-700 font-medium capitalize">{feature.replace('_', ' ')}</span>
                                                <span className="text-gray-900 font-bold">{(importance * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-700 rounded-full`}
                                                    style={{ width: `${(importance / 0.42) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Historial de entrenamientos */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Historial */}
                    <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <h3 className="font-bold text-gray-900">Historial de Entrenamientos</h3>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {MOCK_TRAINING_HISTORY.map((training) => (
                                <button
                                    key={training.id_audit}
                                    onClick={() => setSelectedTraining(training)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedTraining.id_audit === training.id_audit ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${training.is_production ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                <Cpu className={`w-4 h-4 ${training.is_production ? 'text-emerald-600' : 'text-gray-500'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{training.model_version}</span>
                                                    {training.is_production && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                                                            EN PRODUCCIÓN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(training.end_training)} • {formatDuration(training.training_duration_seconds)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{(training.auc_roc * 100).toFixed(2)}%</p>
                                                <p className="text-[10px] text-gray-500 uppercase">AUC-ROC</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detalle del entrenamiento seleccionado con gauges */}
                    {selectedTraining && (
                        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Activity className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Detalle: {selectedTraining.model_version}
                                        </h3>
                                        <p className="text-sm text-gray-500">Métricas de clasificación</p>
                                    </div>
                                </div>
                                {selectedTraining.is_production && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                                        <Award className="w-3 h-3" /> Modelo Ganador
                                    </span>
                                )}
                            </div>

                            {/* Gauges pequeños para el detalle */}
                            <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                                {[
                                    { label: 'Accuracy', value: selectedTraining.accuracy, color: 'blue' },
                                    { label: 'Precision', value: selectedTraining.precision_score, color: 'emerald' },
                                    { label: 'Recall', value: selectedTraining.recall_score, color: 'purple' },
                                    { label: 'F1-Score', value: selectedTraining.f1_score, color: 'orange' },
                                    { label: 'AUC-ROC', value: selectedTraining.auc_roc, color: 'pink' },
                                ].map((metric) => (
                                    <CircularGauge
                                        key={metric.label}
                                        value={metric.value}
                                        label={metric.label}
                                        color={metric.color}
                                        size="sm"
                                    />
                                ))}
                            </div>

                            {/* Dataset Info */}
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Database className="w-4 h-4 text-slate-600" />
                                    <h4 className="font-semibold text-slate-700">Dataset de Entrenamiento</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Registros Train</p>
                                        <p className="font-bold text-slate-900">{selectedTraining.dataset.count_train.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Registros Test</p>
                                        <p className="font-bold text-slate-900">{selectedTraining.dataset.count_test.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Ratio de Fraudes</p>
                                        <p className="font-bold text-slate-900">{(selectedTraining.dataset.fraud_ratio * 100).toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Período</p>
                                        <p className="font-bold text-slate-900">
                                            {formatDate(selectedTraining.dataset.start_date)} - {formatDate(selectedTraining.dataset.end_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer informativo */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">Vista de demostración</p>
                        <p className="text-xs text-amber-700 mt-1">
                            Esta vista muestra datos mockup. En el futuro se conectará a las tablas
                            <code className="bg-amber-100 px-1 rounded mx-1">fraud_models</code>,
                            <code className="bg-amber-100 px-1 rounded mx-1">dataset_fraud_prediction</code> y
                            <code className="bg-amber-100 px-1 rounded mx-1">self_training_audit_fraud</code>
                            para mostrar métricas reales del autoentrenamiento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
