import React, { useState, useEffect } from 'react';
import { ChurnService } from '../churn.service';
import { ScenarioResult, ScenarioSegment, ScenarioIntervention, SegmentRule } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
    Filter,
    Zap,
    TrendingUp,
    Users,
    DollarSign,
    ArrowRight,
    PlayCircle,
    Info,
    CheckCircle2,
    Briefcase,
    Plus,
    Trash2,
    X,
    Trophy,
    RotateCcw,
    Layers
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// ── Campos disponibles para el Rule Builder ────────────────────────
const RULE_FIELDS: { value: SegmentRule['field']; label: string }[] = [
    { value: 'age', label: 'Edad' },
    { value: 'balance', label: 'Balance' },
    { value: 'products', label: 'Nº Productos' },
    { value: 'score', label: 'Credit Score' },
    { value: 'risk', label: 'Riesgo (%)' },
    { value: 'country', label: 'País' },
];

const RULE_OPERATORS: { value: SegmentRule['op']; label: string }[] = [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '≥' },
    { value: '<=', label: '≤' },
    { value: '==', label: '=' },
    { value: '!=', label: '≠' },
];

const SimulatorPage = () => {
    // ── Config state ────────────────────────────────────────────────
    const [availableSegments, setAvailableSegments] = useState<ScenarioSegment[]>([]);
    const [availableInterventions, setAvailableInterventions] = useState<ScenarioIntervention[]>([]);
    const [configLoading, setConfigLoading] = useState(true);

    // ── Selection state ─────────────────────────────────────────────
    const [selectedSegment, setSelectedSegment] = useState<ScenarioSegment | null>(null);
    const [selectedIntervention, setSelectedIntervention] = useState<ScenarioIntervention | null>(null);
    const [loading, setLoading] = useState(false);

    // ── Multi-simulation results ────────────────────────────────────
    const [results, setResults] = useState<ScenarioResult[]>([]);

    // ── Create Segment modal state ──────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSegName, setNewSegName] = useState('');
    const [newSegDesc, setNewSegDesc] = useState('');
    const [newSegRules, setNewSegRules] = useState<SegmentRule[]>([
        { field: 'balance', op: '>', val: 0 }
    ]);
    const [creating, setCreating] = useState(false);

    // ── Load config on mount ────────────────────────────────────────
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setConfigLoading(true);
                const [segments, strategies] = await Promise.all([
                    ChurnService.getSegments(),
                    ChurnService.getStrategies()
                ]);
                setAvailableSegments(segments);
                setAvailableInterventions(strategies);
            } catch (error) {
                console.error("Error loading simulator config:", error);
                toast.error("Error cargando definiciones del simulador.");
            } finally {
                setConfigLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // ── Run scenario ────────────────────────────────────────────────
    const handleRunScenario = async () => {
        if (!selectedSegment || !selectedIntervention) {
            toast.error("Debes seleccionar un Segmento y una Estrategia");
            return;
        }

        setLoading(true);
        try {
            const data = await ChurnService.runScenario(selectedSegment, selectedIntervention);
            setResults(prev => [...prev, data]);
            toast.success("Escenario simulado con éxito");
        } catch (error) {
            console.error(error);
            toast.error("Error al ejecutar simulación: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    // ── Create Segment ──────────────────────────────────────────────
    const handleCreateSegment = async () => {
        if (!newSegName.trim()) {
            toast.error("El nombre del segmento es obligatorio");
            return;
        }
        if (newSegRules.length === 0) {
            toast.error("Debes agregar al menos una regla");
            return;
        }

        setCreating(true);
        try {
            const created = await ChurnService.createSegment({
                name: newSegName.trim(),
                description: newSegDesc.trim(),
                rules: newSegRules
            });
            setAvailableSegments(prev => [...prev, created]);
            toast.success(`Segmento "${created.name}" creado con éxito`);
            resetModal();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear segmento");
        } finally {
            setCreating(false);
        }
    };

    // ── Delete Segment ──────────────────────────────────────────────
    const handleDeleteSegment = async (seg: ScenarioSegment) => {
        try {
            await ChurnService.deleteSegment(seg.id);
            setAvailableSegments(prev => prev.filter(s => s.id !== seg.id));
            if (selectedSegment?.id === seg.id) setSelectedSegment(null);
            toast.success(`Segmento "${seg.name}" eliminado`);
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar segmento");
        }
    };

    // ── Helpers ─────────────────────────────────────────────────────
    const resetModal = () => {
        setShowCreateModal(false);
        setNewSegName('');
        setNewSegDesc('');
        setNewSegRules([{ field: 'balance', op: '>', val: 0 }]);
    };

    const addRule = () => {
        setNewSegRules(prev => [...prev, { field: 'age', op: '>', val: 0 }]);
    };

    const removeRule = (index: number) => {
        setNewSegRules(prev => prev.filter((_, i) => i !== index));
    };

    const updateRule = (index: number, key: keyof SegmentRule, value: any) => {
        setNewSegRules(prev => prev.map((r, i) => i === index ? { ...r, [key]: value } : r));
    };

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    const latestResult = results.length > 0 ? results[results.length - 1] : null;
    const bestRoiIndex = results.length > 0 ? results.reduce((best, r, i) => r.roi > results[best].roi ? i : best, 0) : -1;

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Strategic Impact Lab
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-[#0F172A]">Simulador de Escenarios de Retención</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Herramienta de decisión estratégica. Define un <strong>segmento objetivo</strong>, aplica una <strong>política de retención</strong> y evalúa el <strong>ROI financiero</strong> proyectado antes de lanzar la campaña.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT PANEL: CONFIGURATOR (4 cols) --- */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. SELECT SEGMENT */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-800">1. Segmento Objetivo</h3>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Crear nuevo segmento"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {configLoading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-16 bg-slate-100 rounded-lg"></div>
                                <div className="h-16 bg-slate-100 rounded-lg"></div>
                                <div className="h-16 bg-slate-100 rounded-lg"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableSegments.map(seg => (
                                    <div key={seg.id} className="relative group">
                                        <button
                                            onClick={() => setSelectedSegment(seg)}
                                            className={`w-full text-left p-4 rounded-lg border transition-all ${selectedSegment?.id === seg.id
                                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                : 'bg-white border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold text-sm ${selectedSegment?.id === seg.id ? 'text-blue-800' : 'text-slate-700'}`}>
                                                    {seg.name}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {selectedSegment?.id === seg.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-snug">{seg.description}</p>
                                        </button>
                                        {/* Delete button — visible on hover for custom segments (id > 3) */}
                                        {Number(seg.id) > 3 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSegment(seg); }}
                                                className="absolute top-2 right-2 p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Eliminar segmento"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. SELECT INTERVENTION */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">2. Estrategia a Aplicar</h3>
                        </div>

                        {configLoading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-16 bg-slate-100 rounded-lg"></div>
                                <div className="h-16 bg-slate-100 rounded-lg"></div>
                                <div className="h-16 bg-slate-100 rounded-lg"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableInterventions.map(act => (
                                    <button
                                        key={act.id}
                                        onClick={() => setSelectedIntervention(act)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${selectedIntervention?.id === act.id
                                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                                            : 'bg-white border-slate-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold text-sm ${selectedIntervention?.id === act.id ? 'text-purple-800' : 'text-slate-700'}`}>
                                                {act.name}
                                            </span>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                €{act.costPerClient}/cliente
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">{act.description}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                        onClick={handleRunScenario}
                        disabled={loading || configLoading || !selectedSegment || !selectedIntervention}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all ${loading || configLoading || !selectedSegment || !selectedIntervention
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-[#0F172A] hover:bg-slate-800 transform hover:scale-[1.02]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Simulando Monte Carlo...</span>
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-5 h-5" />
                                <span>Ejecutar Simulación</span>
                            </>
                        )}
                    </button>
                </div>

                {/* --- RIGHT PANEL: RESULTS DASHBOARD (8 cols) --- */}
                <div className="lg:col-span-8">
                    {results.length === 0 ? (
                        // EMPTY STATE
                        <div className="h-full bg-white rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-75">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <TrendingUp className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Esperando parámetros</h3>
                            <p className="text-slate-500 max-w-sm">
                                Selecciona un segmento y una estrategia en el panel izquierdo para visualizar el impacto financiero proyectado.
                            </p>
                        </div>
                    ) : (
                        // RESULTS STATE
                        <div className="space-y-6 animate-fade-in-up">

                            {/* ── COMPARISON TABLE ──────────────────────────── */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg">
                                            <Layers className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Comparación de Escenarios</h3>
                                            <p className="text-xs text-slate-500">{results.length} simulación{results.length !== 1 ? 'es' : ''} ejecutada{results.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setResults([])}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Limpiar Todo
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                                <th className="text-left px-5 py-3 font-semibold">#</th>
                                                <th className="text-left px-5 py-3 font-semibold">Segmento</th>
                                                <th className="text-left px-5 py-3 font-semibold">Estrategia</th>
                                                <th className="text-right px-5 py-3 font-semibold">Clientes</th>
                                                <th className="text-right px-5 py-3 font-semibold">Retenidos</th>
                                                <th className="text-right px-5 py-3 font-semibold">Capital Salvado</th>
                                                <th className="text-right px-5 py-3 font-semibold">Costo</th>
                                                <th className="text-right px-5 py-3 font-semibold">ROI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((r, i) => {
                                                const retained = r.clientsAtRiskBefore - r.clientsAtRiskAfter;
                                                const capitalSaved = r.capitalAtRiskBefore - r.capitalAtRiskAfter;
                                                const isBest = i === bestRoiIndex && results.length > 1;
                                                return (
                                                    <tr
                                                        key={i}
                                                        className={`border-t border-slate-100 transition-colors ${isBest ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                                                    >
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-slate-400 font-mono text-xs">{i + 1}</span>
                                                                {isBest && (
                                                                    <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                                        <Trophy className="w-3 h-3" /> Mejor
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 font-medium text-slate-700">{r.segmentName}</td>
                                                        <td className="px-5 py-3 text-slate-600">{r.interventionName}</td>
                                                        <td className="px-5 py-3 text-right text-slate-600">{r.totalClients}</td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className="font-semibold text-emerald-600">{retained}</span>
                                                            <span className="text-slate-400 text-xs ml-1">({r.retentionImprovement.toFixed(1)}%)</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium text-emerald-600">{formatMoney(capitalSaved)}</td>
                                                        <td className="px-5 py-3 text-right text-slate-600">{formatMoney(r.campaignCost)}</td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className={`font-bold ${r.roi > 100 ? 'text-emerald-600' : r.roi > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                                {r.roi.toFixed(0)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ── LATEST RESULT DETAILS ──────────────────────── */}
                            {latestResult && (
                                <>
                                    {/* SCORECARDS */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Users className="w-16 h-16 text-blue-600" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clientes Retenidos</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <span className="text-3xl font-bold text-slate-800">
                                                    {latestResult.clientsAtRiskBefore - latestResult.clientsAtRiskAfter}
                                                </span>
                                                <span className="text-sm font-medium text-emerald-600 mb-1 flex items-center">
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    {latestResult.retentionImprovement.toFixed(1)}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">de {latestResult.totalClients} clientes totales</p>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <DollarSign className="w-16 h-16 text-emerald-600" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Capital Salvado</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <span className="text-3xl font-bold text-emerald-600">
                                                    {formatMoney(latestResult.capitalAtRiskBefore - latestResult.capitalAtRiskAfter)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Valor de cartera preservado</p>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Briefcase className="w-16 h-16 text-purple-600" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">ROI Campaña</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <span className={`text-3xl font-bold ${latestResult.roi > 0 ? 'text-purple-600' : 'text-red-500'}`}>
                                                    {latestResult.roi.toFixed(0)}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Costo: {formatMoney(latestResult.campaignCost)}</p>
                                        </div>
                                    </div>

                                    {/* MAIN CHARTS AREA */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                        {/* 1. RISK REDUCTION CHART */}
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-slate-400" /> Impacto en Fuga
                                            </h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={[
                                                            { name: 'Actual', value: latestResult.clientsAtRiskBefore, fill: '#EF4444' },
                                                            { name: 'Simulado', value: latestResult.clientsAtRiskAfter, fill: '#10B981' }
                                                        ]}
                                                        layout="vertical"
                                                        margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fontWeight: 600 }} />
                                                        <Tooltip
                                                            cursor={{ fill: 'transparent' }}
                                                            formatter={(val: number) => [`${val} Clientes`, 'Riesgo Alto']}
                                                        />
                                                        <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                                                            {
                                                                [0, 1].map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : '#10B981'} />
                                                                ))
                                                            }
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                                                La estrategia reduce el grupo de riesgo en un <strong>{((latestResult.clientsAtRiskBefore - latestResult.clientsAtRiskAfter) / latestResult.clientsAtRiskBefore * 100).toFixed(1)}%</strong>.
                                            </div>
                                        </div>

                                        {/* 2. FINANCIAL WATERFALL */}
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-slate-400" /> Balance Neto
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                                    <span className="text-sm font-medium text-red-800">Riesgo Inicial</span>
                                                    <span className="font-bold text-red-900">{formatMoney(latestResult.capitalAtRiskBefore)}</span>
                                                </div>
                                                <div className="flex justify-center">
                                                    <ArrowRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                                    <span className="text-sm font-medium text-emerald-800">Riesgo Final</span>
                                                    <span className="font-bold text-emerald-900">{formatMoney(latestResult.capitalAtRiskAfter)}</span>
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="text-sm text-slate-500">Costo Inversión</span>
                                                    <span className="font-medium text-slate-700">-{formatMoney(latestResult.campaignCost)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-800">Beneficio Neto</span>
                                                    <span className="font-bold text-indigo-600 text-lg">
                                                        +{formatMoney((latestResult.capitalAtRiskBefore - latestResult.capitalAtRiskAfter) - latestResult.campaignCost)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* RECOMMENDATION BOX */}
                                    <div className={`p-4 rounded-lg border flex items-start gap-3 ${latestResult.roi > 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'
                                        }`}>
                                        <Info className={`w-5 h-5 mt-0.5 ${latestResult.roi > 100 ? 'text-emerald-600' : 'text-yellow-600'}`} />
                                        <div>
                                            <h4 className={`text-sm font-bold ${latestResult.roi > 100 ? 'text-emerald-800' : 'text-yellow-800'}`}>
                                                {latestResult.roi > 100 ? 'Estrategia Recomendada' : 'Estrategia de Baja Eficiencia'}
                                            </h4>
                                            <p className={`text-xs mt-1 ${latestResult.roi > 100 ? 'text-emerald-700' : 'text-yellow-700'}`}>
                                                {latestResult.roi > 100
                                                    ? "El retorno de inversión supera el umbral del 100%. Se sugiere aprobar esta campaña inmediatamente."
                                                    : "El costo de la intervención es alto comparado con el capital retenido. Considere una acción más económica (ej. Email/Push) para este segmento."}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                CREATE SEGMENT MODAL
               ═══════════════════════════════════════════════════════════════ */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Crear Segmento</h2>
                            </div>
                            <button onClick={resetModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Segmento</label>
                                <input
                                    type="text"
                                    value={newSegName}
                                    onChange={e => setNewSegName(e.target.value)}
                                    placeholder="Ej: Clientes Inactivos con Balance Alto"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
                                <textarea
                                    value={newSegDesc}
                                    onChange={e => setNewSegDesc(e.target.value)}
                                    placeholder="Descripción breve del segmento..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                                />
                            </div>

                            {/* Rules Builder */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-semibold text-slate-700">Reglas de Filtrado</label>
                                    <button
                                        onClick={addRule}
                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Agregar Regla
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {newSegRules.map((rule, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            {idx > 0 && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200 px-1.5 py-0.5 rounded">Y</span>
                                            )}
                                            <select
                                                value={rule.field}
                                                onChange={e => updateRule(idx, 'field', e.target.value)}
                                                className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            >
                                                {RULE_FIELDS.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={rule.op}
                                                onChange={e => updateRule(idx, 'op', e.target.value)}
                                                className="w-14 px-1 py-1.5 border border-slate-300 rounded text-sm bg-white text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            >
                                                {RULE_OPERATORS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                type={rule.field === 'country' ? 'text' : 'number'}
                                                value={rule.val}
                                                onChange={e => updateRule(idx, 'val', rule.field === 'country' ? e.target.value : Number(e.target.value))}
                                                className="w-24 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                placeholder={rule.field === 'country' ? 'Spain' : '0'}
                                            />
                                            {newSegRules.length > 1 && (
                                                <button
                                                    onClick={() => removeRule(idx)}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Todas las reglas se evalúan con lógica AND (deben cumplirse todas).</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={resetModal}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateSegment}
                                disabled={creating || !newSegName.trim()}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 ${creating || !newSegName.trim()
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {creating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Guardar Segmento
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulatorPage;