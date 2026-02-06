import { useState, useEffect, useMemo } from 'react';
import { Card } from '@shared/components/ui/card';
import { UserHeader } from '../components/UserHeader';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import {
    TrendingDown,
    TrendingUp,
    Users,
    DollarSign,
    AlertTriangle,
    Activity,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Loader2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { getDashboardData } from '../services/morosidadService';
import type { DashboardData } from '../types/morosidad.types';

const COLORS: Record<string, string> = {
    'Crítico': '#1e40af',
    'Alto': '#3b82f6',
    'Medio': '#60a5fa',
    'Bajo': '#93c5fd'
};

export function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTotalLoss, setShowTotalLoss] = useState(false); // Toggle pérdida total/morosos

    // Estado para ordenamiento de tabla (debe estar antes de cualquier return)
    const [sortConfig, setSortConfig] = useState<{
        key: 'recordId' | 'probabilidadPago' | 'nivelRiesgo' | 'montoCuota' | 'cuotasAtrasadas';
        direction: 'asc' | 'desc';
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getDashboardData();
                setDashboardData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Ordenar cuentas según configuración (useMemo debe estar antes de cualquier return)
    const clientesAltoRiesgo = dashboardData?.clientesAltoRiesgo ?? [];
    const sortedClientes = useMemo(() => {
        if (!sortConfig) return clientesAltoRiesgo;
        return [...clientesAltoRiesgo].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [clientesAltoRiesgo, sortConfig]);

    // Función para manejar clic en encabezado de columna
    const handleSort = (key: 'recordId' | 'probabilidadPago' | 'nivelRiesgo' | 'montoCuota' | 'cuotasAtrasadas') => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc'
                    ? { key, direction: 'desc' }
                    : null;
            }
            return { key, direction: 'asc' };
        });
    };

    // Icono de ordenamiento
    const SortIcon = ({ columnKey }: { columnKey: 'recordId' | 'probabilidadPago' | 'nivelRiesgo' | 'montoCuota' | 'cuotasAtrasadas' }) => {
        if (sortConfig?.key !== columnKey) return null;
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-3 h-3 inline ml-1" />
            : <ChevronDown className="w-3 h-3 inline ml-1" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-zinc-500">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { metricas, modelo, distribucionProbabilidad, segmentacionRiesgo, tendenciaMensual } = dashboardData;

    return (
        <div className="space-y-8">
            {/* User Header */}
            <UserHeader
                userName="Administrador"
                title="Panel de Control"
                subtitle="Monitoreo y análisis predictivo de riesgo de morosidad"
            />

            {/* Métricas principales - Diseño Fintech moderno */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>Activos</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Total Cuentas Analizadas</p>
                        <p className="text-3xl text-zinc-900 mb-1">{metricas.totalCuentas.toLocaleString()}</p>
                        <p className="text-xs text-zinc-400">Con predicción activa</p>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>Crítico</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Cuentas en Riesgo</p>
                        <p className="text-3xl text-zinc-900 mb-1">{metricas.cuentasEnRiesgo.toLocaleString()}</p>
                        <p className="text-xs text-zinc-400">
                            {metricas.totalCuentas > 0
                                ? Math.round((metricas.cuentasEnRiesgo / metricas.totalCuentas) * 100)
                                : 0}% del total
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                        <button
                            onClick={() => setShowTotalLoss(!showTotalLoss)}
                            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
                        >
                            <TrendingUp className="w-3 h-3" />
                            <span>{showTotalLoss ? 'Total' : 'Morosos'}</span>
                        </button>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">
                            {showTotalLoss ? 'Exposición Total' : 'Exposición Morosos'}
                        </p>
                        <p className="text-3xl text-zinc-900 mb-1">
                            ${((showTotalLoss ? metricas.dineroEnRiesgoTotal : metricas.dineroEnRiesgo) / 1000).toFixed(1)}K
                        </p>
                        <p className="text-xs text-zinc-400">
                            {showTotalLoss ? 'Pérdida de toda la cartera' : 'Pérdida solo morosos'}
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingDown className="w-3 h-3" />
                            <span>Predicción</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Tasa de Morosidad</p>
                        <p className="text-3xl text-zinc-900 mb-1">{metricas.tasaMorosidadPredicha}%</p>
                        <p className="text-xs text-zinc-400">Predicción mensual</p>
                    </div>
                </Card>
            </div>

            {/* Rendimiento del modelo - Versión minimalista */}
            <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-lg text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl">Rendimiento del Modelo ML</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-blue-100">Precisión</p>
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl">{modelo.precision.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full shadow-lg"
                                style={{ width: `${Math.min(modelo.precision, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-blue-100">Recall</p>
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl">{modelo.recall.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full shadow-lg"
                                style={{ width: `${Math.min(modelo.recall, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-blue-100">F1-Score</p>
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl">{modelo.f1Score.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full shadow-lg"
                                style={{ width: `${Math.min(modelo.f1Score, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Gráficos - Diseño limpio y moderno */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendencia temporal - Area chart más moderno */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Tendencia de Morosidad</h3>
                            <p className="text-xs text-zinc-500 mt-1">
                                {tendenciaMensual.length > 0 ? `Últimos ${tendenciaMensual.length} meses` : 'Sin datos'}
                            </p>
                        </div>
                        <Activity className="w-5 h-5 text-zinc-400" />
                    </div>
                    {tendenciaMensual.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={tendenciaMensual}>
                                <defs>
                                    <linearGradient id="colorMorosidad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrediccion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="mes"
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="morosidad"
                                    stroke="#ef4444"
                                    fill="url(#colorMorosidad)"
                                    strokeWidth={2}
                                    name="Real"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="prediccion"
                                    stroke="#3b82f6"
                                    fill="url(#colorPrediccion)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Predicción"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-zinc-400">
                            No hay datos de tendencia disponibles
                        </div>
                    )}
                </Card>

                {/* Distribución de probabilidades */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Distribución de Riesgo</h3>
                            <p className="text-xs text-zinc-500 mt-1">Probabilidad de pago</p>
                        </div>
                        <TrendingDown className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={distribucionProbabilidad}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="rango"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="cantidad"
                                fill="#3b82f6"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Clientes por nivel de riesgo - Mejorado */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Segmentación por Riesgo</h3>
                            <p className="text-xs text-zinc-500 mt-1">Distribución de clientes</p>
                        </div>
                        <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={segmentacionRiesgo}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.nivel}`}
                                outerRadius={90}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey="cantidad"
                                paddingAngle={2}
                            >
                                {segmentacionRiesgo.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.nivel] || '#93c5fd'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Leyenda personalizada */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {segmentacionRiesgo.map((item) => (
                            <div key={item.nivel} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[item.nivel] || '#93c5fd' }}
                                />
                                <div className="text-xs">
                                    <span className="text-zinc-600">{item.nivel}</span>
                                    <span className="text-zinc-400 ml-1">({item.cantidad})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Exposición financiera */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Exposición Financiera</h3>
                            <p className="text-xs text-zinc-500 mt-1">Por nivel de riesgo</p>
                        </div>
                        <DollarSign className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={segmentacionRiesgo} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                type="number"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                dataKey="nivel"
                                type="category"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                formatter={(value) => `$${Number(value).toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar dataKey="dinero" radius={[0, 8, 8, 0]}>
                                {segmentacionRiesgo.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.nivel] || '#93c5fd'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Tabla de clientes de alto riesgo - Diseño moderno */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg text-zinc-900">Cuentas de Alto Riesgo</h3>
                                <p className="text-xs text-zinc-500 mt-1">Top 10 cuentas que requieren atención inmediata</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {sortedClientes.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-zinc-50">
                                <tr>
                                    <th
                                        className="text-left py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('recordId')}
                                    >
                                        Cuenta <SortIcon columnKey="recordId" />
                                    </th>
                                    <th
                                        className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('probabilidadPago')}
                                    >
                                        Prob. Pago <SortIcon columnKey="probabilidadPago" />
                                    </th>
                                    <th
                                        className="text-left py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('nivelRiesgo')}
                                    >
                                        Nivel <SortIcon columnKey="nivelRiesgo" />
                                    </th>
                                    <th
                                        className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('montoCuota')}
                                    >
                                        Monto <SortIcon columnKey="montoCuota" />
                                    </th>
                                    <th
                                        className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('cuotasAtrasadas')}
                                    >
                                        Atrasos <SortIcon columnKey="cuotasAtrasadas" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {sortedClientes.map((client) => (
                                    <tr key={client.recordId} className="hover:bg-zinc-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="text-sm text-zinc-900">{client.nombre}</p>
                                                <p className="text-xs text-zinc-500">Cuenta: {client.recordId}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-sm text-zinc-900">{client.probabilidadPago.toFixed(1)}%</span>
                                                {client.probabilidadPago < 30 ? (
                                                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs text-white"
                                                style={{ backgroundColor: COLORS[client.nivelRiesgo] || '#93c5fd' }}
                                            >
                                                {client.nivelRiesgo}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-sm text-zinc-900">
                                                ${client.montoCuota.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`text-sm ${client.cuotasAtrasadas > 2 ? 'text-red-600' : 'text-orange-600'}`}>
                                                {client.cuotasAtrasadas}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-zinc-400">
                            No hay cuentas de alto riesgo registradas
                        </div>
                    )}
                </div>
            </Card>

            {/* Insights estratégicos - Rediseñado */}
            <Card className="p-6 bg-zinc-50 border-0">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg text-zinc-900">Insights Estratégicos</h3>
                        <p className="text-xs text-zinc-500 mt-1">Recomendaciones basadas en análisis predictivo</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-blue-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                <span className="font-medium text-blue-600">{metricas.cuentasEnRiesgo}</span> cuentas ({metricas.totalCuentas > 0 ? ((metricas.cuentasEnRiesgo / metricas.totalCuentas) * 100).toFixed(1) : 0}% de la cartera) superan el umbral de riesgo. Contactar para ofrecer refinanciamiento.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-orange-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                Exposición total: <span className="font-medium text-orange-600">${metricas.dineroEnRiesgo.toLocaleString()}</span>. Priorizar cuentas con probabilidad de pago {'<'} 25%.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-green-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                El modelo tiene <span className="font-medium text-green-600">{modelo.precision.toFixed(1)}%</span> de precisión y <span className="font-medium text-green-600">{modelo.f1Score.toFixed(1)}%</span> F1-Score, permitiendo decisiones confiables.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-purple-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                Tasa de morosidad predicha: <span className="font-medium text-purple-600">{metricas.tasaMorosidadPredicha}%</span>. Implementar acciones preventivas para cuentas en riesgo medio.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
