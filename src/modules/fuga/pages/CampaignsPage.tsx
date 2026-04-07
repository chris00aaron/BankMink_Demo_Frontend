import React, { useState, useEffect, useCallback } from 'react';
import {
    Megaphone,
    Plus,
    Calendar,
    Target,
    X,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Trash2,
    Users,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { ChurnService } from '../churn.service';
import { CampaignLog, CampaignTarget, ScenarioSegment, ScenarioIntervention } from '../types';
import { Toaster, toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
    ACTIVE:    'En Curso',
    COMPLETED: 'Finalizada',
    CANCELLED: 'Cancelada',
};
const STATUS_BADGE: Record<string, string> = {
    ACTIVE:    'bg-emerald-100 text-emerald-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
};
const STATUS_DOT: Record<string, string> = {
    ACTIVE:    'bg-emerald-500 animate-pulse',
    COMPLETED: 'bg-blue-400',
    CANCELLED: 'bg-red-400',
};

const CampaignsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<CampaignLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Expanded campaign targets panel
    const [expandedId, setExpandedId] = useState<string | number | null>(null);
    const [targetsCache, setTargetsCache] = useState<Record<string, CampaignTarget[]>>({});
    const [targetsLoading, setTargetsLoading] = useState<string | number | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data (Listas dinámicas)
    const [segments, setSegments] = useState<ScenarioSegment[]>([]);
    const [strategies, setStrategies] = useState<ScenarioIntervention[]>([]);

    // Form Selection
    const [selectedSegId, setSelectedSegId] = useState<string | number>('');
    const [selectedStratId, setSelectedStratId] = useState<string | number>('');
    const [campaignName, setCampaignName] = useState('');

    // Computed Form Data
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [targetCount, setTargetCount] = useState(0);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Cargar historial inicial
    useEffect(() => {
        loadCampaigns();
    }, []);

    // Cargar opciones del formulario al abrir modal — siempre refresca la lista
    useEffect(() => {
        if (isModalOpen) {
            Promise.all([
                ChurnService.getSegments(),
                ChurnService.getStrategies(),
            ]).then(([segs, strats]) => {
                setSegments(segs);
                setStrategies(strats);
            }).catch(() => {
                toast.error('Error cargando opciones del formulario');
            });
        }
    }, [isModalOpen]);

    // Recalcular estimados cuando cambian selecciones
    useEffect(() => {
        if (selectedSegId) {
            setPreviewLoading(true);
            ChurnService.previewSegmentCount(selectedSegId).then(count => {
                setTargetCount(count);
                if (selectedStratId) {
                    const strat = strategies.find(s => s.id == selectedStratId);
                    if (strat) setEstimatedCost(count * strat.costPerClient);
                }
            }).finally(() => setPreviewLoading(false));
        } else {
            setTargetCount(0);
            setEstimatedCost(0);
        }
    }, [selectedSegId, selectedStratId, strategies]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await ChurnService.getCampaignHistory();
            setCampaigns(data);
        } catch {
            toast.error('Error cargando historial de campañas');
        } finally {
            setLoading(false);
        }
    };

    const resetModal = useCallback(() => {
        setIsModalOpen(false);
        setCampaignName('');
        setSelectedSegId('');
        setSelectedStratId('');
        setEstimatedCost(0);
        setTargetCount(0);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignName || !selectedSegId || !selectedStratId) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        setIsSubmitting(true);
        try {
            const strat = strategies.find(s => s.id == selectedStratId);
            // ROI estimado: porcentaje de reducción de riesgo esperada según el impactFactor de la estrategia
            const roi = strat ? Math.round(strat.impactFactor * 100) : 0;

            await ChurnService.createCampaign({
                name: campaignName,
                segmentId: selectedSegId,
                strategyId: selectedStratId,
                budget: estimatedCost,
                expectedRoi: roi,
                targetedCount: targetCount,
                targets: [],
            });

            toast.success('Campaña lanzada exitosamente');
            resetModal();
            loadCampaigns();
        } catch {
            toast.error('Error al crear la campaña');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTargets = async (camp: CampaignLog) => {
        const key = String(camp.id);
        if (expandedId === camp.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(camp.id);
        if (targetsCache[key]) return;
        setTargetsLoading(camp.id);
        try {
            const data = await ChurnService.getCampaignTargets(camp.id);
            setTargetsCache(prev => ({ ...prev, [key]: data }));
        } catch {
            toast.error('Error cargando targets de la campaña');
        } finally {
            setTargetsLoading(null);
        }
    };

    const handleStatusChange = async (camp: CampaignLog, customerId: number, newStatus: string) => {
        try {
            await ChurnService.updateTargetStatus(camp.id, customerId, newStatus);
            const key = String(camp.id);
            setTargetsCache(prev => ({
                ...prev,
                [key]: (prev[key] || []).map(t =>
                    t.customerId === customerId ? { ...t, status: newStatus as CampaignTarget['status'] } : t
                ),
            }));
            const updated = await ChurnService.getCampaignHistory();
            setCampaigns(updated);
            toast.success('Estado actualizado');
        } catch {
            toast.error('Error al actualizar el estado');
        }
    };

    const handleCampaignStatusChange = async (camp: CampaignLog, newStatus: 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => {
        if (newStatus === camp.status) return;
        try {
            const updated = await ChurnService.updateCampaignStatus(camp.id, newStatus);
            setCampaigns(prev => prev.map(c => c.id === camp.id ? updated : c));
            toast.success(`Campaña marcada como "${STATUS_LABELS[newStatus]}"`);
        } catch {
            toast.error('Error al cambiar el estado de la campaña');
        }
    };

    const handleDelete = async (camp: CampaignLog) => {
        if (!window.confirm(`¿Eliminar la campaña "${camp.name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await ChurnService.deleteCampaign(camp.id);
            setCampaigns(prev => prev.filter(c => c.id !== camp.id));
            if (expandedId === camp.id) setExpandedId(null);
            toast.success('Campaña eliminada');
        } catch {
            toast.error('Error al eliminar la campaña');
        }
    };

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800 relative">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Ejecución Comercial</h2>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Gestor de Campañas de Retención</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Campaña
                </button>
            </div>

            {/* KPIs Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">Campañas Activas</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{campaigns.filter(c => c.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">Presupuesto Ejecutado</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">
                        {formatMoney(campaigns.reduce((acc, c) => acc + c.budgetAllocated, 0))}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">Clientes Impactados</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">
                        {campaigns.reduce((acc, c) => acc + c.targetedCount, 0).toLocaleString('es-ES')}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">Tasa de Conversión</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">
                        {(() => {
                            const totalTargeted = campaigns.reduce((acc, c) => acc + c.targetedCount, 0);
                            const totalConverted = campaigns.reduce((acc, c) => acc + (c.convertedCount ?? 0), 0);
                            return totalTargeted > 0 ? `${((totalConverted / totalTargeted) * 100).toFixed(1)}%` : '0.0%';
                        })()}
                    </p>
                </div>
            </div>

            {/* LISTA DE CAMPAÑAS */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">Historial de Ejecución</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
                        <p className="text-slate-400 mt-4">Cargando campañas...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Campaña</th>
                                <th className="px-6 py-4">Segmento Objetivo</th>
                                <th className="px-6 py-4">Estrategia</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Presupuesto</th>
                                <th className="px-6 py-4 text-right">Reducción Est.</th>
                                <th className="px-6 py-4 text-center">Alcance</th>
                                <th className="px-6 py-4 text-center">Convertidos</th>
                                <th className="px-6 py-4 text-center">Targets</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.map((camp) => (
                                <React.Fragment key={camp.id}>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700">{camp.name}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" /> {camp.startDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-slate-600">{camp.segmentName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                            {camp.strategyName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            value={camp.status}
                                            onChange={e => handleCampaignStatusChange(camp, e.target.value as 'ACTIVE' | 'COMPLETED' | 'CANCELLED')}
                                            className={`text-xs font-bold px-3 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_BADGE[camp.status] ?? 'bg-slate-100 text-slate-500'}`}
                                        >
                                            <option value="ACTIVE">En Curso</option>
                                            <option value="COMPLETED">Finalizada</option>
                                            <option value="CANCELLED">Cancelada</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {formatMoney(camp.budgetAllocated)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-emerald-600 font-bold flex justify-end items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> {camp.expectedRoi}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-700">
                                            <Users className="w-3.5 h-3.5 text-blue-400" />
                                            {camp.targetedCount.toLocaleString('es-ES')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-emerald-600">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {(camp.convertedCount ?? 0).toLocaleString('es-ES')}
                                            {camp.targetedCount > 0 && (
                                                <span className="text-xs text-slate-400 font-normal">
                                                    ({((( camp.convertedCount ?? 0) / camp.targetedCount) * 100).toFixed(0)}%)
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleTargets(camp)}
                                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                            title="Ver clientes objetivo"
                                        >
                                            {expandedId === camp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(camp)}
                                            className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                            title="Eliminar campaña"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === camp.id && (
                                    <tr>
                                        <td colSpan={10} className="px-0 py-0 bg-slate-50 border-b border-slate-100">
                                            <div className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                    Clientes Objetivo — {camp.name}
                                                </p>
                                                {targetsLoading === camp.id ? (
                                                    <p className="text-sm text-slate-400 py-2 flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                                                    </p>
                                                ) : (targetsCache[String(camp.id)] || []).length === 0 ? (
                                                    <p className="text-sm text-slate-400 py-2">Sin clientes asignados a esta campaña.</p>
                                                ) : (
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-xs text-slate-400 uppercase">
                                                                <th className="text-left py-1 pr-4">Cliente</th>
                                                                <th className="text-left py-1 pr-4">Estado</th>
                                                                <th className="text-left py-1 pr-4">Contacto</th>
                                                                <th className="text-left py-1">Respuesta</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {(targetsCache[String(camp.id)] || []).map(t => (
                                                                <tr key={t.customerId}>
                                                                    <td className="py-2 pr-4 font-medium text-slate-700">{t.customerName}</td>
                                                                    <td className="py-2 pr-4">
                                                                        <select
                                                                            value={t.status}
                                                                            onChange={e => handleStatusChange(camp, t.customerId, e.target.value)}
                                                                            className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer
                                                                                ${t.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-700'
                                                                                : t.status === 'CONTACTED' ? 'bg-blue-100 text-blue-700'
                                                                                : t.status === 'FAILED' ? 'bg-red-100 text-red-600'
                                                                                : 'bg-slate-100 text-slate-600'}`}
                                                                        >
                                                                            <option value="TARGETED">OBJETIVO</option>
                                                                            <option value="CONTACTED">CONTACTADO</option>
                                                                            <option value="CONVERTED">CONVERTIDO</option>
                                                                            <option value="FAILED">FALLIDO</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="py-2 pr-4 text-slate-400 text-xs">{t.contactDate || '—'}</td>
                                                                    <td className="py-2 text-slate-400 text-xs">{t.responseDate || '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && campaigns.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No hay campañas registradas aún.</p>
                    </div>
                )}
            </div>

            {/* MODAL DE CREACIÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-xl text-slate-800">Lanzar Nueva Campaña</h3>
                            <button onClick={resetModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-6">

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Campaña</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Retención Verano 2026 - VIPs"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Segmento */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Segmento Objetivo</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectedSegId}
                                        onChange={(e) => setSelectedSegId(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {segments.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estrategia */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Estrategia</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectedStratId}
                                        onChange={(e) => setSelectedStratId(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {strategies.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} (€{s.costPerClient})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Resumen Financiero */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Presupuesto Estimado</p>
                                        {previewLoading ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                                <span className="text-sm text-slate-400">Calculando...</span>
                                            </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-slate-800">{formatMoney(estimatedCost)}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Clientes en Segmento</p>
                                        {previewLoading ? (
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                            </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-slate-800">{targetCount.toLocaleString('es-ES')}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Estado Inicial</p>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700">
                                            Activa Inmediata
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || previewLoading}
                                    className="px-8 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                    ) : (
                                        <><Megaphone className="w-4 h-4" /> Lanzar Campaña</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsPage;
