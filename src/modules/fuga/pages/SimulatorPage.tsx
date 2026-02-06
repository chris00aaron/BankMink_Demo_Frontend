import React, { useState, useEffect } from 'react';
import { ChurnService } from '../churn.service';
import { ScenarioResult, ScenarioSegment, ScenarioIntervention } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
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
    Briefcase
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const SimulatorPage = () => {
    // Estado para las listas dinámicas (cargadas desde BD/Servicio)
    const [availableSegments, setAvailableSegments] = useState<ScenarioSegment[]>([]);
    const [availableInterventions, setAvailableInterventions] = useState<ScenarioIntervention[]>([]);
    const [configLoading, setConfigLoading] = useState(true);

    const [selectedSegment, setSelectedSegment] = useState<ScenarioSegment | null>(null);
    const [selectedIntervention, setSelectedIntervention] = useState<ScenarioIntervention | null>(null);
    const [result, setResult] = useState<ScenarioResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Cargar configuración inicial al montar
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setConfigLoading(true);
                // Carga paralela de definiciones
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

    const handleRunScenario = async () => {
        if (!selectedSegment || !selectedIntervention) {
            toast.error("Debes seleccionar un Segmento y una Estrategia");
            return;
        }

        setLoading(true);
        try {
            const data = await ChurnService.runScenario(selectedSegment, selectedIntervention);
            setResult(data);
            toast.success("Escenario simulado con éxito");
        } catch (error) {
            console.error(error);
            toast.error("Error al ejecutar simulación: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

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
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">1. Segmento Objetivo</h3>
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
                                    <button
                                        key={seg.id}
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
                                            {selectedSegment?.id === seg.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">{seg.description}</p>
                                    </button>
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
                    {!result ? (
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

                            {/* SCORECARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users className="w-16 h-16 text-blue-600" />
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clientes Retenidos</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <span className="text-3xl font-bold text-slate-800">
                                            {result.clientsAtRiskBefore - result.clientsAtRiskAfter}
                                        </span>
                                        <span className="text-sm font-medium text-emerald-600 mb-1 flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            {result.retentionImprovement.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">de {result.totalClients} clientes totales</p>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <DollarSign className="w-16 h-16 text-emerald-600" />
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Capital Salvado</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <span className="text-3xl font-bold text-emerald-600">
                                            {formatMoney(result.capitalAtRiskBefore - result.capitalAtRiskAfter)}
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
                                        <span className={`text-3xl font-bold ${result.roi > 0 ? 'text-purple-600' : 'text-red-500'}`}>
                                            {result.roi.toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Costo: {formatMoney(result.campaignCost)}</p>
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
                                                    { name: 'Actual', value: result.clientsAtRiskBefore, fill: '#EF4444' },
                                                    { name: 'Simulado', value: result.clientsAtRiskAfter, fill: '#10B981' }
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
                                        La estrategia reduce el grupo de riesgo en un <strong>{((result.clientsAtRiskBefore - result.clientsAtRiskAfter) / result.clientsAtRiskBefore * 100).toFixed(1)}%</strong>.
                                    </div>
                                </div>

                                {/* 2. FINANCIAL WATERFALL (Simplified) */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-slate-400" /> Balance Neto
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                            <span className="text-sm font-medium text-red-800">Riesgo Inicial</span>
                                            <span className="font-bold text-red-900">{formatMoney(result.capitalAtRiskBefore)}</span>
                                        </div>
                                        <div className="flex justify-center">
                                            <ArrowRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                            <span className="text-sm font-medium text-emerald-800">Riesgo Final</span>
                                            <span className="font-bold text-emerald-900">{formatMoney(result.capitalAtRiskAfter)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Costo Inversión</span>
                                            <span className="font-medium text-slate-700">-{formatMoney(result.campaignCost)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-800">Beneficio Neto</span>
                                            <span className="font-bold text-indigo-600 text-lg">
                                                +{formatMoney((result.capitalAtRiskBefore - result.capitalAtRiskAfter) - result.campaignCost)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* RECOMMENDATION BOX */}
                            <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.roi > 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'
                                }`}>
                                <Info className={`w-5 h-5 mt-0.5 ${result.roi > 100 ? 'text-emerald-600' : 'text-yellow-600'}`} />
                                <div>
                                    <h4 className={`text-sm font-bold ${result.roi > 100 ? 'text-emerald-800' : 'text-yellow-800'}`}>
                                        {result.roi > 100 ? 'Estrategia Recomendada' : 'Estrategia de Baja Eficiencia'}
                                    </h4>
                                    <p className={`text-xs mt-1 ${result.roi > 100 ? 'text-emerald-700' : 'text-yellow-700'}`}>
                                        {result.roi > 100
                                            ? "El retorno de inversión supera el umbral del 100%. Se sugiere aprobar esta campaña inmediatamente."
                                            : "El costo de la intervención es alto comparado con el capital retenido. Considere una acción más económica (ej. Email/Push) para este segmento."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimulatorPage;