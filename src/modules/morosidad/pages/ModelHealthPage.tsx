import { useState, useEffect } from 'react';
import { Activity, Cpu, Database, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { getModelHealth } from '../services/morosidadService';
import type { ModelHealthData } from '../types/morosidad.types';

// Componente para métricas con barra de progreso
function MetricBar({ label, value, description, color }: { label: string; value: number; description: string; color: string }) {
    const percentage = Math.round(value * 100);
    const getColorClass = () => {
        if (percentage >= 70) return 'bg-emerald-500';
        if (percentage >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">{label}</span>
                <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${getColorClass()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
    );
}

// Componente para el gauge circular del AUC-ROC
function AucGauge({ value }: { value: number }) {
    const percentage = Math.round(value * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col items-center">
            <svg width="140" height="140" className="rotate-[-90deg]">
                <circle
                    cx="70"
                    cy="70"
                    r="45"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="12"
                />
                <circle
                    cx="70"
                    cy="70"
                    r="45"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute mt-12">
                <span className="text-3xl font-bold text-white">{percentage}%</span>
            </div>
            <p className="text-slate-400 text-sm mt-2">AUC-ROC</p>
            <p className="text-xs text-slate-500">Capacidad de discriminación</p>
        </div>
    );
}

// Componente para visualizar la arquitectura del modelo
function ModelArchitectureVisual({ arquitectura }: { arquitectura: ModelHealthData['arquitectura'] }) {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4'];
    const totalPeso = arquitectura.componentes.reduce((sum, c) => sum + c.peso, 0);

    return (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                Arquitectura del Modelo
            </h3>

            <div className="text-center mb-6">
                <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                    {arquitectura.tipo} • Votación {arquitectura.estrategia}
                </span>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
                {arquitectura.componentes.map((comp, i) => (
                    <div
                        key={comp.nombre}
                        className="flex-1 min-w-[150px] max-w-[200px] p-4 rounded-xl border-2 transition-all hover:scale-105"
                        style={{
                            borderColor: colors[i],
                            backgroundColor: `${colors[i]}15`
                        }}
                    >
                        <div className="text-center">
                            <p className="font-bold text-white text-lg">{comp.nombre}</p>
                            <div
                                className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium"
                                style={{ backgroundColor: colors[i], color: 'white' }}
                            >
                                Peso: {comp.peso}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {Math.round((comp.peso / totalPeso) * 100)}% del voto
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
    );
}

export default function ModelHealthPage() {
    const [data, setData] = useState<ModelHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const health = await getModelHealth();
                setData(health);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar datos');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Cargando estado del modelo...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error || 'Error al cargar datos'}
                </div>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

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
                            <p className="text-slate-400 text-sm">Estado y rendimiento del modelo en producción</p>
                        </div>
                    </div>
                </div>

                {/* Estado del modelo */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{data.version}</h2>
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
                                <p className="text-white font-medium">{formatDate(data.deploymentDate)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-500 text-xs uppercase tracking-wider">Tiempo Activo</p>
                                <p className="text-white font-medium flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    {data.daysActive} días
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-1 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 flex items-center justify-center relative">
                        <AucGauge value={data.metricas.aucRoc} />
                    </div>
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricBar
                            label="Precision"
                            value={data.metricas.precision}
                            description="De los marcados en riesgo, ¿cuántos lo eran?"
                            color="#10b981"
                        />
                        <MetricBar
                            label="Recall"
                            value={data.metricas.recall}
                            description="De los reales en riesgo, ¿cuántos detectó?"
                            color="#f59e0b"
                        />
                        <MetricBar
                            label="F1-Score"
                            value={data.metricas.f1Score}
                            description="Balance entre precision y recall"
                            color="#8b5cf6"
                        />
                        <MetricBar
                            label="Accuracy"
                            value={data.metricas.accuracy}
                            description="Porcentaje de predicciones correctas"
                            color="#3b82f6"
                        />
                    </div>
                </div>

                {/* Arquitectura y Dataset */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ModelArchitectureVisual arquitectura={data.arquitectura} />
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-cyan-400" />
                            Dataset de Entrenamiento
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Total registros</span>
                                <span className="text-white font-bold text-xl">{data.dataset.totalRegistros.toLocaleString()}</span>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-cyan-500 h-full"
                                    style={{ width: `${(data.dataset.datosEntrenamiento / data.dataset.totalRegistros) * 100}%` }}
                                />
                                <div
                                    className="bg-amber-500 h-full"
                                    style={{ width: `${(data.dataset.datosPrueba / data.dataset.totalRegistros) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-cyan-400">Train: {data.dataset.datosEntrenamiento.toLocaleString()}</span>
                                <span className="text-amber-400">Test: {data.dataset.datosPrueba.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Última actualización</p>
                                <p className="text-white font-medium">{formatDate(data.dataset.fechaDataset)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Fuente</p>
                                <p className="text-slate-300 font-mono text-sm">{data.dataset.fuente}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráfica de Tendencia */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Tendencia de Rendimiento - Predicción vs Realidad
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.tendencia} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="mes"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8' }}
                                    tickFormatter={(v) => `${v}%`}
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#f1f5f9' }}
                                    formatter={(value: number, name: string) => [
                                        `${value.toFixed(1)}%`,
                                        name === 'morosidadReal' ? 'Morosidad Real' : 'Predicción'
                                    ]}
                                />
                                <Legend
                                    formatter={(value) => value === 'morosidadReal' ? 'Morosidad Real' : 'Predicción del Modelo'}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="morosidadReal"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#ef4444', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="prediccion"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Indicador de diferencia */}
                    <div className="mt-4 flex justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-slate-300">Morosidad Real</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-slate-300">Predicción del Modelo</span>
                        </div>
                        <div className="text-slate-500">
                            | Diferencia promedio: {' '}
                            <span className="text-emerald-400 font-medium">
                                {(data.tendencia.reduce((sum, t) => sum + Math.abs(t.diferencia), 0) / data.tendencia.length).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
