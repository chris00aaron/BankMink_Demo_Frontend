import { useState, useEffect } from 'react';
import {
    Shield, TrendingDown, DollarSign, Users, AlertTriangle,
    ChevronDown, ChevronUp, ArrowRight, Zap, Plus, Pencil,
    Trash2, X, Check, Target, BarChart3, RefreshCw
} from 'lucide-react';
import {
    getStrategySegments,
    simulateCampaignImpact,
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign
} from '../services/morosidadService';
import type {
    StrategyResponse,
    SegmentSummary,
    SimulationResult,
    Campaign,
    CampaignRequest
} from '../types/morosidad.types';

// ============ CONSTANTES ============

const SEGMENT_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; icon: string }> = {
    'Pérdida': { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: '🔴' },
    'Dudoso': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: '🟠' },
    'Deficiente': { color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', icon: '🟡' },
    'CPP': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: '🔵' },
    'Normal': { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: '🟢' },
};

const TARGET_SEGMENTS = ['Pérdida', 'Dudoso', 'Deficiente', 'CPP', 'Normal', 'Todos'];

// ============ COMPONENTE PRINCIPAL ============

export function StrategyPage() {
    const [data, setData] = useState<StrategyResponse | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Simulación
    const [activeSegment, setActiveSegment] = useState<string | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // CRUD campañas
    const [showCampaignForm, setShowCampaignForm] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [campaignForm, setCampaignForm] = useState<CampaignRequest>({
        campaignName: '', description: '', targetSegment: 'Todos',
        reductionFactor: 0.10, estimatedCost: 5.00
    });

    // ---- Carga inicial ----
    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [strategyData, campaignData] = await Promise.all([
                getStrategySegments(),
                getCampaigns()
            ]);
            setData(strategyData);
            setCampaigns(campaignData);
            setError(null);
        } catch (err) {
            console.error('Error cargando datos de estrategia:', err);
            setError('No se pudo cargar los datos. Verifique la conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    // ---- Simulación ----
    const handleSimulate = async () => {
        if (!selectedCampaignId || !activeSegment) return;
        setIsSimulating(true);
        try {
            const result = await simulateCampaignImpact(selectedCampaignId, activeSegment);
            setSimulation(result);
        } catch (err) {
            console.error('Error en simulación:', err);
        } finally {
            setIsSimulating(false);
        }
    };

    const toggleSegment = (segmento: string) => {
        if (activeSegment === segmento) {
            setActiveSegment(null);
            setSimulation(null);
            setSelectedCampaignId(null);
        } else {
            setActiveSegment(segmento);
            setSimulation(null);
            setSelectedCampaignId(null);
        }
    };

    // ---- CRUD Campañas ----
    const handleSaveCampaign = async () => {
        try {
            if (editingCampaign) {
                await updateCampaign(editingCampaign.idCampaign, campaignForm);
            } else {
                await createCampaign(campaignForm);
            }
            const updated = await getCampaigns();
            setCampaigns(updated);
            setShowCampaignForm(false);
            setEditingCampaign(null);
            setCampaignForm({ campaignName: '', description: '', targetSegment: 'Todos', reductionFactor: 0.10, estimatedCost: 5.00 });
        } catch (err) {
            console.error('Error guardando campaña:', err);
        }
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setCampaignForm({
            campaignName: campaign.campaignName,
            description: campaign.description,
            targetSegment: campaign.targetSegment,
            reductionFactor: campaign.reductionFactor,
            estimatedCost: campaign.estimatedCost,
        });
        setShowCampaignForm(true);
    };

    const handleDeleteCampaign = async (id: number) => {
        try {
            await deleteCampaign(id);
            const updated = await getCampaigns();
            setCampaigns(updated);
        } catch (err) {
            console.error('Error eliminando campaña:', err);
        }
    };

    const openNewCampaignForm = () => {
        setEditingCampaign(null);
        setCampaignForm({ campaignName: '', description: '', targetSegment: 'Todos', reductionFactor: 0.10, estimatedCost: 5.00 });
        setShowCampaignForm(true);
    };

    // ---- Formateo ----
    const formatCurrency = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPct = (n: number) => `${n.toFixed(1)}%`;

    // ---- Loading / Error ----
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Cargando estrategias de mitigación...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">{error || 'Sin datos disponibles'}</p>
                <button onClick={loadData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-7 h-7 text-blue-600" />
                        Estrategias de Mitigación
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Analiza segmentos de riesgo y simula el impacto de campañas correctivas
                    </p>
                </div>
                <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                </button>
            </div>

            {/* KPIs Generales */}
            <div className="grid grid-cols-3 gap-4">
                <KPICard icon={<Users className="w-5 h-5" />} label="Total Cuentas" value={data.resumen.totalCuentas.toLocaleString()} color="blue" />
                <KPICard icon={<DollarSign className="w-5 h-5" />} label="Pérdida Estimada Total" value={formatCurrency(data.resumen.perdidaTotal)} color="red" />
                <KPICard icon={<TrendingDown className="w-5 h-5" />} label="Tasa de Morosidad" value={formatPct(data.resumen.tasaMorosidad)} color="amber" />
            </div>

            {/* Segment Cards */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Segmentos de Riesgo
                </h2>
                <div className="grid grid-cols-5 gap-4">
                    {data.segmentos.map(seg => (
                        <SegmentCard key={seg.segmento} segment={seg} isActive={activeSegment === seg.segmento}
                            onToggle={() => toggleSegment(seg.segmento)} formatCurrency={formatCurrency} />
                    ))}
                </div>
            </div>

            {/* Simulador (visible cuando un segmento está seleccionado) */}
            {activeSegment && (
                <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Simulador de Campaña — Segmento: <span className="text-blue-600">{activeSegment}</span>
                    </h3>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar campaña</label>
                            <select
                                value={selectedCampaignId ?? ''}
                                onChange={(e) => { setSelectedCampaignId(Number(e.target.value)); setSimulation(null); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">— Seleccione una campaña —</option>
                                {campaigns.map(c => (
                                    <option key={c.idCampaign} value={c.idCampaign}>
                                        {c.campaignName} ({TARGET_SEGMENTS.includes(c.targetSegment) ? c.targetSegment : c.targetSegment} · reducción {(c.reductionFactor * 100).toFixed(0)}%)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleSimulate} disabled={!selectedCampaignId || isSimulating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                            Simular Impacto
                        </button>
                    </div>

                    {/* Resultados de simulación */}
                    {simulation && <SimulationResults result={simulation} formatCurrency={formatCurrency} formatPct={formatPct} />}
                </div>
            )}

            {/* Gestión de Campañas */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Gestión de Campañas
                    </h3>
                    <button onClick={openNewCampaignForm}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                        <Plus className="w-4 h-4" /> Nueva Campaña
                    </button>
                </div>

                {/* Formulario de nueva/editar campaña */}
                {showCampaignForm && (
                    <div className="border-b border-gray-200 bg-gray-50 p-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            {editingCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                                <input type="text" value={campaignForm.campaignName}
                                    onChange={e => setCampaignForm({ ...campaignForm, campaignName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nombre de la campaña" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Segmento Objetivo</label>
                                <select value={campaignForm.targetSegment}
                                    onChange={e => setCampaignForm({ ...campaignForm, targetSegment: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    {TARGET_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Factor de Reducción (%)</label>
                                <input type="number" min="0" max="100" step="1"
                                    value={(campaignForm.reductionFactor * 100).toFixed(0)}
                                    onChange={e => setCampaignForm({ ...campaignForm, reductionFactor: Number(e.target.value) / 100 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Costo por Cuenta (S/)</label>
                                <input type="number" min="0" step="0.50" value={campaignForm.estimatedCost}
                                    onChange={e => setCampaignForm({ ...campaignForm, estimatedCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                                <textarea value={campaignForm.description}
                                    onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })}
                                    rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Descripción de la campaña..." />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={handleSaveCampaign}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                                <Check className="w-4 h-4" /> Guardar
                            </button>
                            <button onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabla de campañas */}
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-5 py-3 text-left">Nombre</th>
                            <th className="px-5 py-3 text-left">Segmento</th>
                            <th className="px-5 py-3 text-right">Reducción</th>
                            <th className="px-5 py-3 text-right">Costo/Cuenta</th>
                            <th className="px-5 py-3 text-left">Descripción</th>
                            <th className="px-5 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {campaigns.map(c => (
                            <tr key={c.idCampaign} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-800">{c.campaignName}</td>
                                <td className="px-5 py-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SEGMENT_CONFIG[c.targetSegment]?.bgColor || 'bg-blue-50'} ${SEGMENT_CONFIG[c.targetSegment]?.color || 'text-blue-700'}`}>
                                        {c.targetSegment}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right font-mono text-gray-700">{(c.reductionFactor * 100).toFixed(0)}%</td>
                                <td className="px-5 py-3 text-right font-mono text-gray-700">{formatCurrency(c.estimatedCost)}</td>
                                <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{c.description}</td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => handleEditCampaign(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteCampaign(c.idCampaign)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {campaigns.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                                    No hay campañas configuradas. Crea una para comenzar a simular.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============ SUBCOMPONENTES ============

function KPICard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        amber: 'bg-amber-50 text-amber-600 border-amber-200',
    };
    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-2 opacity-70">{icon}<span className="text-xs font-medium uppercase">{label}</span></div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function SegmentCard({ segment, isActive, onToggle, formatCurrency }: {
    segment: SegmentSummary; isActive: boolean; onToggle: () => void; formatCurrency: (n: number) => string;
}) {
    const cfg = SEGMENT_CONFIG[segment.segmento] || SEGMENT_CONFIG['Normal'];
    return (
        <div onClick={onToggle}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${isActive ? `${cfg.borderColor} ${cfg.bgColor} shadow-md ring-2 ring-offset-1 ring-blue-300` : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{cfg.icon}</span>
                <span className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}>{segment.segmento}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{segment.totalCuentas}</p>
            <p className="text-xs text-gray-500 mb-3">cuentas</p>
            <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-500">Pérdida est.</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(segment.perdidaEstimada)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Prob. pago prom.</span>
                    <span className="font-semibold text-gray-700">{segment.probabilidadPromedio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Factor principal</span>
                    <span className="font-semibold text-gray-700 truncate max-w-[100px]" title={segment.factorPrincipal}>{segment.factorPrincipal}</span>
                </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${isActive ? cfg.borderColor : 'border-gray-100'} flex items-center justify-center gap-1 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Cerrar simulador</> : <><ChevronDown className="w-3.5 h-3.5" /> Simular campaña</>}
            </div>
        </div>
    );
}

function SimulationResults({ result, formatCurrency, formatPct }: {
    result: SimulationResult; formatCurrency: (n: number) => string; formatPct: (n: number) => string;
}) {
    const ahorro = result.perdidaActual - result.perdidaProyectada;
    return (
        <div className="mt-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Impacto Proyectado: "{result.campaignName}"
            </h4>
            <div className="grid grid-cols-2 gap-4">
                {/* Pérdida */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Pérdida Estimada</p>
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-sm text-gray-400">Actual</p>
                            <p className="text-lg font-bold text-gray-800">{formatCurrency(result.perdidaActual)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-sm text-green-500">Proyectada</p>
                            <p className="text-lg font-bold text-green-700">{formatCurrency(result.perdidaProyectada)}</p>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-1">▼ Reducción: {formatPct(result.reduccionPerdida)} ({formatCurrency(ahorro)})</p>
                </div>
                {/* Tasa morosidad */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Tasa de Morosidad</p>
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-sm text-gray-400">Actual</p>
                            <p className="text-lg font-bold text-gray-800">{formatPct(result.tasaMorosidadActual)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-sm text-green-500">Proyectada</p>
                            <p className="text-lg font-bold text-green-700">{formatPct(result.tasaMorosidadProyectada)}</p>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-1">▼ {(result.tasaMorosidadActual - result.tasaMorosidadProyectada).toFixed(1)}pp de reducción</p>
                </div>
                {/* Prob. Pago Promedio en el segmento */}
                <div className="bg-white rounded-lg p-4 border border-gray-100 col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Prob. Pago Promedio en Segmento "{result.segmento}"</p>
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Actual</p>
                            <p className="text-lg font-bold text-gray-800">{formatPct(result.probPromedioActual)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-sm text-green-500">Proyectada</p>
                            <p className="text-lg font-bold text-green-700">{formatPct(result.probPromedioProyectada)}</p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-sm text-gray-400">Cuentas que mejoran SBS</p>
                            <p className="text-lg font-bold text-blue-700">{result.cuentasMejoradas} de {result.totalCuentasSegmento}</p>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-2">▲ Mejora: +{(result.probPromedioProyectada - result.probPromedioActual).toFixed(1)}pp en probabilidad de pago</p>
                </div>
                {/* Cuentas mejoradas */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Cuentas que Mejoran SBS</p>
                    <p className="text-2xl font-bold text-blue-700">{result.cuentasMejoradas}</p>
                    <p className="text-xs text-gray-500">de {result.totalCuentasSegmento} en el segmento</p>
                </div>
                {/* ROI */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Análisis Costo-Beneficio</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-indigo-700">
                            {result.roi === -1 ? 'Sin costo' : `${result.roi}x`}
                        </p>
                        <span className="text-xs text-gray-500">
                            {result.roi === -1 ? 'Campaña gratuita' : 'ROI'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Costo total: {formatCurrency(result.costoTotal)} → Ahorro: {formatCurrency(ahorro)}</p>
                </div>
            </div>
        </div>
    );
}
