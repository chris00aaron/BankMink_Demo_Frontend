import { useState, useEffect, useMemo } from 'react';
import { Card } from '@shared/components/ui/card';
import { UserHeader } from '../components/UserHeader';
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
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
    ChevronDown,
    Briefcase,
    RefreshCw
} from 'lucide-react';
import { getAllPolicies, getActivePolicy, activatePolicy, createPolicy, getDashboardClients } from '../services/morosidadService';
import { useDashboard } from '../context/DashboardContext';
import type { DefaultPolicy, PolicyRequest, PageResponse, ClienteAltoRiesgo } from '../types/morosidad.types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";

const SBS_COLORS: Record<string, string> = {
    'Normal': '#10b981',
    'CPP': '#f59e0b',
    'Deficiente': '#f97316',
    'Dudoso': '#ef4444',
    'Pérdida': '#991b1b',
    'Sin clasificar': '#a1a1aa'
};

const SBS_RANGES: Record<string, string> = {
    'Normal': '0-5%', 'CPP': '5-25%', 'Deficiente': '25-60%', 'Dudoso': '60-90%', 'Pérdida': '90-100%'
};

export interface DashboardPageProps {
    onNavigateToPrediction?: (recordId: number) => void;
}

export function DashboardPage({ onNavigateToPrediction }: DashboardPageProps) {
    const { data: dashboardData, isLoading, isRefreshing, error, refresh } = useDashboard();

    // Estado para paginación y filtros de clientes
    const [clientsPage, setClientsPage] = useState<PageResponse<ClienteAltoRiesgo> | null>(null);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [filterName, setFilterName] = useState('');
    const [filterSbs, setFilterSbs] = useState('Todas');
    const [filterEducacion, setFilterEducacion] = useState('Todas');
    const [filterEdadMin, setFilterEdadMin] = useState<number | ''>('');
    const [filterEdadMax, setFilterEdadMax] = useState<number | ''>('');

    // Applied filters
    const [appliedName, setAppliedName] = useState('');
    const [appliedSbs, setAppliedSbs] = useState('');
    const [appliedEducacion, setAppliedEducacion] = useState('');
    const [appliedEdadMin, setAppliedEdadMin] = useState<number | undefined>(undefined);
    const [appliedEdadMax, setAppliedEdadMax] = useState<number | undefined>(undefined);

    // Sort status
    const [appliedSortBy, setAppliedSortBy] = useState<string>('probabilidadPago');
    const [appliedSortDir, setAppliedSortDir] = useState<'asc' | 'desc'>('desc');

    const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
            const data = await getDashboardClients(
                page, pageSize, appliedName, appliedSbs,
                appliedSortBy, appliedSortDir, appliedEducacion, appliedEdadMin, appliedEdadMax
            );
            setClientsPage(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [page, appliedName, appliedSbs, appliedEducacion, appliedEdadMin, appliedEdadMax, appliedSortBy, appliedSortDir, pageSize]);

    const handleSearch = () => {
        setPage(0); // Reset to first page
        setAppliedName(filterName);
        setAppliedSbs(filterSbs === 'Todas' ? '' : filterSbs);
        setAppliedEducacion(filterEducacion === 'Todas' ? '' : filterEducacion);
        setAppliedEdadMin(filterEdadMin === '' ? undefined : filterEdadMin);
        setAppliedEdadMax(filterEdadMax === '' ? undefined : filterEdadMax);
    };

    const [policies, setPolicies] = useState<DefaultPolicy[]>([]);
    const [activePolicy, setActivePolicy] = useState<DefaultPolicy | null>(null);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newPolicyName, setNewPolicyName] = useState('');
    const [newPolicyThreshold, setNewPolicyThreshold] = useState(50);
    const [newPolicyLgd, setNewPolicyLgd] = useState(45);
    const [newPolicyGrace, setNewPolicyGrace] = useState(5);
    const [newPolicyApprover, setNewPolicyApprover] = useState('');

    const loadPolicies = async () => {
        try {
            const [allPolicies, active] = await Promise.all([
                getAllPolicies(),
                getActivePolicy()
            ]);
            setPolicies(allPolicies);
            setActivePolicy(active);
            if (active) setSelectedPolicyId(active.idPolicy.toString());
        } catch (error) {
            console.error('Error loading policies:', error);
        }
    };


    const confirmPolicyChange = async () => {
        try {
            await activatePolicy(parseInt(selectedPolicyId));
            await loadPolicies();
            await refresh(); // Refrescar dashboard con nueva política
            setIsConfirmDialogOpen(false);
        } catch (_error) {
            console.error('Error al cambiar la política activa');
        }
    };

    const handleCreatePolicy = async () => {
        if (!newPolicyName || !newPolicyApprover) return;

        try {
            const newPolicy: PolicyRequest = {
                policyName: newPolicyName,
                thresholdApproval: newPolicyThreshold,
                factorLgd: newPolicyLgd,
                daysGraceDefault: newPolicyGrace,
                approvedBy: newPolicyApprover
            };

            await createPolicy(newPolicy);
            await loadPolicies();
            setIsCreateDialogOpen(false);

            // Reset form
            setNewPolicyName('');
            setNewPolicyThreshold(50);
            setNewPolicyApprover('');
        } catch (_error) {
            console.error('Error al crear la política');
        }
    };

    useEffect(() => {
        loadPolicies();
    }, []);

    const handleSort = (key: string) => {
        if (appliedSortBy === key) {
            setAppliedSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setAppliedSortBy(key);
            setAppliedSortDir(key === 'probabilidadPago' || key === 'cuotasAtrasadas' || key === 'montoCuota' ? 'desc' : 'asc');
        }
        setPage(0); // Reset to first page on sort change
    };

    // Icono de ordenamiento
    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (appliedSortBy !== columnKey) return null;
        return appliedSortDir === 'asc'
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

    const { metricas, modelo, distribucionProbabilidad, segmentacionRiesgo, tendenciaMensual, distribucionSBS } = dashboardData;

    return (
        <div className="space-y-8">
            {/* User Header con botón de actualizar */}
            <UserHeader
                userName="Administrador"
                title="Panel de Control"
                subtitle="Monitoreo y análisis predictivo de riesgo de morosidad"
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refresh}
                        disabled={isRefreshing}
                        className="gap-2 border-zinc-200 hover:bg-zinc-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                }
            />

            {/* Banner de Política de Riesgo Activa — compacto */}
            <Card className="p-4 bg-white border-l-4 border-blue-600 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">Política activa:</span>
                        {activePolicy ? (
                            <span className="text-sm font-semibold text-gray-900">{activePolicy.policyName}</span>
                        ) : (
                            <span className="text-sm text-gray-400">Sin política activa</span>
                        )}
                    </div>
                    {activePolicy && (
                        <div className="flex items-center gap-6 text-sm">
                            <span className="text-gray-500">Umbral: <strong className="text-gray-900">{activePolicy.thresholdApproval}%</strong></span>
                            <span className="text-gray-500">LGD: <strong className="text-gray-900">{activePolicy.factorLgd}%</strong></span>
                            <span className="text-gray-500">Gracia: <strong className="text-gray-900">{activePolicy.daysGraceDefault}d</strong></span>
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}
                        className="text-xs gap-1">
                        Gestionar política
                    </Button>
                </div>
            </Card>

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
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>Exposición</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Exposición Morosos</p>
                        <p className="text-2xl text-zinc-900 mb-1">${(metricas.dineroEnRiesgo / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-zinc-400 mb-3">Pérdida estimada morosos</p>
                        <div className="border-t border-zinc-100 pt-2">
                            <p className="text-xs text-zinc-400">Total cartera</p>
                            <p className="text-lg text-zinc-700">${(metricas.dineroEnRiesgoTotal / 1000).toFixed(1)}K</p>
                        </div>
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
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrediccion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
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
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="prediccion"
                                    stroke="#3b82f6"
                                    fill="url(#colorPrediccion)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Predicción"
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-zinc-400">
                            No hay datos de tendencia disponibles
                        </div>
                    )}
                </Card>

                {/* Distribución de Riesgo */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Distribución de Riesgo</h3>
                            <p className="text-xs text-zinc-500 mt-1">Distribución de cuentas por probabilidad de impago</p>
                        </div>
                        <TrendingDown className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
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
                                label={{ value: 'N° Cuentas', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#71717a', dx: -4 }}
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
                                name="Cuentas"
                                radius={[8, 8, 0, 0]}
                            >
                                {distribucionProbabilidad.map((_, i) => {
                                    const RISK_GRADIENT = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
                                    return <Cell key={i} fill={RISK_GRADIENT[Math.min(i, RISK_GRADIENT.length - 1)]} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Clasificación SBS: Real vs Predicha (agrupado) */}
                <Card className="p-6 bg-white border-0 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Clasificación SBS — Real vs Predicha</h3>
                            <p className="text-xs text-zinc-500 mt-1">Comparación del estado actual con la predicción del modelo por categoría</p>
                        </div>
                        <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart
                            data={(() => {
                                const ORDER = ['Normal', 'CPP', 'Deficiente', 'Dudoso', 'Pérdida'];
                                const realMap = Object.fromEntries((segmentacionRiesgo || []).map(s => [s.nivel, s.cantidad]));
                                const predMap = Object.fromEntries((distribucionSBS || []).map(s => [s.categoria, s.cantidad]));
                                return ORDER.map(cat => ({ categoria: cat, real: realMap[cat] ?? 0, predicha: predMap[cat] ?? 0 }));
                            })()}
                            barGap={4}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="categoria" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                            <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }}
                                label={{ value: 'N° Cuentas', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#71717a', dx: -4 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Bar dataKey="real" name="Real (actual)" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={36}>
                                {['Normal', 'CPP', 'Deficiente', 'Dudoso', 'Pérdida'].map((cat, i) => <Cell key={i} fill={SBS_COLORS[cat]} />)}
                            </Bar>
                            <Bar dataKey="predicha" name="Predicha (modelo)" fill="#b0b3b6ff" radius={[4, 4, 0, 0]} maxBarSize={36}>
                                {['Normal', 'CPP', 'Deficiente', 'Dudoso', 'Pérdida'].map((cat, i) => <Cell key={i} fill={SBS_COLORS[cat]} opacity={0.6} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>





            {/* Insights estratégicos — Posicionados antes de la tabla para mayor visibilidad */}
            <Card className="p-5 bg-zinc-50 border-0">
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg text-zinc-900">Insights Estratégicos</h3>
                        <p className="text-xs text-zinc-500 mt-1">Recomendaciones basadas en análisis predictivo</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(() => {
                        const insights: { color: string; text: React.ReactNode }[] = [];
                        if (!metricas || !segmentacionRiesgo || !modelo || !tendenciaMensual) return null;

                        const pctRiesgo = metricas.totalCuentas > 0 ? (metricas.cuentasEnRiesgo / metricas.totalCuentas) * 100 : 0;

                        // 1. Riesgo de cartera — condicional
                        if (pctRiesgo > 30) {
                            insights.push({ color: 'bg-red-600', text: <p className="text-sm text-zinc-700"><span className="font-medium text-red-600">⚠️ Alerta:</span> {pctRiesgo.toFixed(1)}% de la cartera ({metricas.cuentasEnRiesgo} cuentas) supera el umbral de riesgo. Se recomienda acción inmediata de cobranza.</p> });
                        } else if (pctRiesgo > 15) {
                            insights.push({ color: 'bg-orange-600', text: <p className="text-sm text-zinc-700"><span className="font-medium text-orange-600">{metricas.cuentasEnRiesgo}</span> cuentas ({pctRiesgo.toFixed(1)}% de la cartera) superan el umbral. Contactar para ofrecer refinanciamiento.</p> });
                        } else {
                            insights.push({ color: 'bg-green-600', text: <p className="text-sm text-zinc-700"><span className="font-medium text-green-600">✓ Cartera saludable:</span> solo {pctRiesgo.toFixed(1)}% de cuentas en riesgo. Mantener monitoreo preventivo.</p> });
                        }

                        // 2. Concentración SBS
                        const totalSBS = segmentacionRiesgo.reduce((s, r) => s + r.cantidad, 0);
                        const criticos = segmentacionRiesgo.filter(r => r.nivel === 'Pérdida' || r.nivel === 'Dudoso').reduce((s, r) => s + r.cantidad, 0);
                        const pctCriticos = totalSBS > 0 ? (criticos / totalSBS) * 100 : 0;
                        if (pctCriticos > 20) {
                            insights.push({ color: 'bg-red-600', text: <p className="text-sm text-zinc-700"><span className="font-medium text-red-600">{pctCriticos.toFixed(0)}%</span> de cuentas están en categoría <strong>Dudoso o Pérdida</strong>. Se recomienda provisionar y asignar gestores especializados.</p> });
                        } else {
                            insights.push({ color: 'bg-blue-600', text: <p className="text-sm text-zinc-700">Exposición total: <span className="font-medium text-blue-600">${metricas.dineroEnRiesgo.toLocaleString()}</span>. Solo {pctCriticos.toFixed(0)}% en Dudoso/Pérdida.</p> });
                        }

                        // 3. Modelo
                        if (modelo.precision >= 90) {
                            insights.push({ color: 'bg-green-600', text: <p className="text-sm text-zinc-700">El modelo tiene <span className="font-medium text-green-600">{modelo.precision.toFixed(1)}%</span> de precisión y <span className="font-medium text-green-600">{modelo.f1Score.toFixed(1)}%</span> F1-Score, permitiendo decisiones confiables.</p> });
                        } else if (modelo.precision >= 80) {
                            insights.push({ color: 'bg-orange-600', text: <p className="text-sm text-zinc-700">Modelo con <span className="font-medium text-orange-600">{modelo.precision.toFixed(1)}%</span> de precisión. Considerar re-entrenamiento para mejorar desempeño.</p> });
                        } else {
                            insights.push({ color: 'bg-red-600', text: <p className="text-sm text-zinc-700"><span className="font-medium text-red-600">⚠️ Precisión baja: {modelo.precision.toFixed(1)}%</span>. Se recomienda re-entrenar el modelo urgentemente.</p> });
                        }

                        // 4. Tendencia de morosidad
                        if (tendenciaMensual.length >= 2) {
                            const ultimo = tendenciaMensual[tendenciaMensual.length - 1];
                            const penultimo = tendenciaMensual[tendenciaMensual.length - 2];
                            const diff = ultimo.morosidad - penultimo.morosidad;
                            if (diff > 1) {
                                insights.push({ color: 'bg-red-600', text: <p className="text-sm text-zinc-700">Tasa de morosidad <span className="font-medium text-red-600">subió {diff.toFixed(1)}pp</span> el último mes ({penultimo.morosidad.toFixed(1)}% → {ultimo.morosidad.toFixed(1)}%). Implementar acciones preventivas.</p> });
                            } else if (diff < -1) {
                                insights.push({ color: 'bg-green-600', text: <p className="text-sm text-zinc-700">Tasa de morosidad <span className="font-medium text-green-600">bajó {Math.abs(diff).toFixed(1)}pp</span> el último mes. Las estrategias de mitigación muestran resultados positivos.</p> });
                            } else {
                                insights.push({ color: 'bg-purple-600', text: <p className="text-sm text-zinc-700">Tasa de morosidad estable en <span className="font-medium text-purple-600">{metricas.tasaMorosidadPredicha}%</span>. Mantener acciones preventivas en cuentas de riesgo medio.</p> });
                            }
                        }

                        return insights.map((insight, i) => (
                            <div key={i} className="flex gap-3 p-4 bg-white rounded-lg transition-all hover:shadow-sm">
                                <div className={`w-1 ${insight.color} rounded-full flex-shrink-0`} />
                                <div>{insight.text}</div>
                            </div>
                        ));
                    })()}
                </div>
            </Card>

            {/* Tabla de clientes */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg text-zinc-900">Listado de Clientes</h3>
                                <p className="text-xs text-zinc-500 mt-1">Busque y filtre todos los clientes</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[180px]">
                        <Label htmlFor="searchName" className="text-xs text-zinc-500 mb-1 block">Buscar por Nombre</Label>
                        <Input
                            id="searchName"
                            placeholder="Ej. Juan Pérez"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-full sm:w-[150px]">
                        <Label htmlFor="filterSbs" className="text-xs text-zinc-500 mb-1 block">Clasificación SBS</Label>
                        <select
                            id="filterSbs"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={filterSbs}
                            onChange={(e) => setFilterSbs(e.target.value)}
                        >
                            <option value="Todas">Todas</option>
                            <option value="Normal">Normal</option>
                            <option value="CPP">CPP</option>
                            <option value="Deficiente">Deficiente</option>
                            <option value="Dudoso">Dudoso</option>
                            <option value="Pérdida">Pérdida</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-[150px]">
                        <Label htmlFor="filterEducacion" className="text-xs text-zinc-500 mb-1 block">Educación</Label>
                        <select
                            id="filterEducacion"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            value={filterEducacion}
                            onChange={(e) => setFilterEducacion(e.target.value)}
                        >
                            <option value="Todas">Todas</option>
                            <option value="Universidad">Universidad</option>
                            <option value="Posgrado">Posgrado</option>
                            <option value="Preparatoria">Preparatoria</option>
                            <option value="Otro">Otro/Secundaria</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-[180px] flex gap-2">
                        <div className="w-1/2">
                            <Label htmlFor="filterEdadMin" className="text-xs text-zinc-500 mb-1 block">Edad Mín.</Label>
                            <Input
                                id="filterEdadMin"
                                type="number"
                                placeholder="18"
                                value={filterEdadMin}
                                onChange={(e) => setFilterEdadMin(e.target.value ? Number(e.target.value) : '')}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="filterEdadMax" className="text-xs text-zinc-500 mb-1 block">Edad Máx.</Label>
                            <Input
                                id="filterEdadMax"
                                type="number"
                                placeholder="100"
                                value={filterEdadMax}
                                onChange={(e) => setFilterEdadMax(e.target.value ? Number(e.target.value) : '')}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </div>
                    <div>
                        <Button onClick={handleSearch} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto h-10">
                            Buscar
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[300px]">
                    {isLoadingClients && (
                        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}
                    {(clientsPage?.content && clientsPage.content.length > 0) ? (
                        <table className="w-full">
                            <thead className="bg-zinc-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('recordId')}>Cuenta <SortIcon columnKey="recordId" /></th>
                                    <th className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('probabilidadPago')}>Prob. Impago <SortIcon columnKey="probabilidadPago" /></th>
                                    <th className="text-left py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('clasificacionSBS')}>Clase SBS <SortIcon columnKey="clasificacionSBS" /></th>
                                    <th className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('montoCuota')}>Monto <SortIcon columnKey="montoCuota" /></th>
                                    <th className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => handleSort('cuotasAtrasadas')}>Atrasos <SortIcon columnKey="cuotasAtrasadas" /></th>
                                    <th className="py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {clientsPage.content.map((client) => (
                                    <tr
                                        key={client.recordId}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                                        onClick={() => onNavigateToPrediction?.(client.recordId)}
                                        title="Ver última predicción"
                                    >
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
                                                style={{ backgroundColor: SBS_COLORS[client.clasificacionSBS] || '#a1a1aa' }}
                                            >
                                                {client.clasificacionSBS}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-sm text-zinc-900">${client.montoCuota.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`text-sm ${client.cuotasAtrasadas > 2 ? 'text-red-600' : 'text-orange-600'}`}>
                                                {client.cuotasAtrasadas}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-zinc-400">
                            No se encontraron clientes con los filtros aplicados
                        </div>
                    )}
                </div>
                {clientsPage && (clientsPage.page?.totalPages ?? clientsPage.totalPages ?? 0) > 0 && (
                    <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50 overflow-x-auto">
                        <span className="text-sm text-zinc-500 hidden sm:inline whitespace-nowrap">
                            Página {(clientsPage.page?.number ?? clientsPage.number ?? 0) + 1} de {clientsPage.page?.totalPages ?? clientsPage.totalPages ?? 1} ({clientsPage.page?.totalElements ?? clientsPage.totalElements ?? 0} resultados)
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2 mx-auto sm:mx-0">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={(clientsPage.page?.number ?? clientsPage.number ?? 0) === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                «
                            </Button>

                            {/* Lógica de botones de paginación numérica */}
                            {(() => {
                                const totalPages = clientsPage.page?.totalPages ?? clientsPage.totalPages ?? 1;
                                const currentPage = clientsPage.page?.number ?? clientsPage.number ?? 0;
                                let pages: (number | string)[] = [];

                                if (totalPages <= 7) {
                                    pages = Array.from({ length: totalPages }, (_, i) => i);
                                } else {
                                    if (currentPage <= 3) {
                                        pages = [0, 1, 2, 3, 4, '...', totalPages - 2, totalPages - 1];
                                    } else if (currentPage >= totalPages - 4) {
                                        pages = [0, 1, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
                                    } else {
                                        pages = [0, 1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 2, totalPages - 1];
                                    }
                                }

                                return pages.map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className="text-zinc-400 px-2 text-sm">...</span>
                                    ) : (
                                        <Button
                                            key={p}
                                            variant={p === currentPage ? 'default' : 'outline'}
                                            size="sm"
                                            className={p === currentPage ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                            onClick={() => setPage(p as number)}
                                        >
                                            {(p as number) + 1}
                                        </Button>
                                    )
                                ));
                            })()}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={(clientsPage.page?.number ?? clientsPage.number ?? 0) >= (clientsPage.page?.totalPages ?? clientsPage.totalPages ?? 1) - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                »
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar cambio de política</DialogTitle>
                        <DialogDescription>
                            Está a punto de cambiar la política activa de riesgo. Esto recalculará los indicadores de riesgo para toda la cartera. ¿Está seguro que desea continuar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsConfirmDialogOpen(false);
                            if (activePolicy) setSelectedPolicyId(activePolicy.idPolicy.toString());
                        }}>Cancelar</Button>
                        <Button onClick={confirmPolicyChange}>Confirmar Cambio</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Nueva Política */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Política de Riesgo</DialogTitle>
                        <DialogDescription>
                            Defina los parámetros para la nueva política.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la Política</Label>
                            <Input id="name" value={newPolicyName} onChange={e => setNewPolicyName(e.target.value)} placeholder="Ej: Política Conservadora 2025" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="threshold">Umbral Aprob. (%)</Label>
                                <Input id="threshold" type="number" value={newPolicyThreshold} onChange={e => setNewPolicyThreshold(Number(e.target.value))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lgd">LGD (%)</Label>
                                <Input id="lgd" type="number" value={newPolicyLgd} onChange={e => setNewPolicyLgd(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="grace">Días Gracia</Label>
                                <Input id="grace" type="number" value={newPolicyGrace} onChange={e => setNewPolicyGrace(Number(e.target.value))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="approver">Aprobado Por</Label>
                                <Input id="approver" value={newPolicyApprover} onChange={e => setNewPolicyApprover(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreatePolicy}>Crear Política</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
