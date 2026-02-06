import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Calendar,
    Target,
    Users,
    DollarSign,
    CheckCircle,
    Clock,
    X,
    TrendingUp
} from 'lucide-react';
import { ChurnService } from '../churn.service';
import { CampaignLog, ScenarioSegment, ScenarioIntervention } from '../types';
import { Toaster, toast } from 'sonner';

const CampaignsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<CampaignLog[]>([]);
    const [loading, setLoading] = useState(true);
    
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

    // Cargar historial inicial
    useEffect(() => {
        loadCampaigns();
    }, []);

    // Cargar opciones del formulario al abrir modal
    useEffect(() => {
        if (isModalOpen && segments.length === 0) {
            const loadOptions = async () => {
                const [segs, strats] = await Promise.all([
                    ChurnService.getSegments(),
                    ChurnService.getStrategies()
                ]);
                setSegments(segs);
                setStrategies(strats);
            };
            loadOptions();
        }
    }, [isModalOpen]);

    // Recalcular estimados cuando cambian selecciones
    useEffect(() => {
        if (selectedSegId && selectedStratId) {
            const strat = strategies.find(s => s.id == selectedStratId);
            const seg = segments.find(s => s.id == selectedSegId);
            
            // Simular conteo rápido (en realidad vendría del backend)
            const count = Math.floor(Math.random() * 200) + 50; 
            setTargetCount(count);

            if (strat) {
                setEstimatedCost(count * strat.costPerClient);
            }
        }
    }, [selectedSegId, selectedStratId]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await ChurnService.getCampaignHistory();
            setCampaigns(data);
        } catch (error) {
            toast.error("Error cargando historial de campañas");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignName || !selectedSegId || !selectedStratId) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulamos lógica de ROI esperado (simplificado)
            const strat = strategies.find(s => s.id == selectedStratId);
            const roi = strat ? (strat.impactFactor * 400) : 100; // Mock ROI calculation

            await ChurnService.createCampaign({
                name: campaignName,
                segmentId: selectedSegId,
                strategyId: selectedStratId,
                budget: estimatedCost,
                expectedRoi: roi,
                targets: [] // Backend lo llenaría
            });

            toast.success("Campaña lanzada exitosamente");
            setIsModalOpen(false);
            setCampaignName('');
            setSelectedSegId('');
            setSelectedStratId('');
            loadCampaigns(); // Recargar lista
        } catch (error) {
            toast.error("Error al crear la campaña");
        } finally {
            setIsSubmitting(false);
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
                        {campaigns.reduce((acc, c) => acc + c.targetedCount, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">Conversión Promedio</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">28.5%</p>
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
                                <th className="px-6 py-4 text-right">ROI Esperado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
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
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${camp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            <span className={`w-2 h-2 rounded-full ${camp.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                            {camp.status === 'ACTIVE' ? 'En Curso' : 'Finalizada'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {formatMoney(camp.budgetAllocated)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-emerald-600 font-bold flex justify-end items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> {camp.expectedRoi}%
                                        </span>
                                    </td>
                                </tr>
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
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                                    {selectedSegId && (
                                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                                            <Users className="w-3 h-3" />
                                            {targetCount} clientes potenciales detectados
                                        </div>
                                    )}
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
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Presupuesto Estimado</p>
                                    <p className="text-2xl font-bold text-slate-800">{formatMoney(estimatedCost)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Estado Inicial</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700">
                                        Activa Inmediata
                                    </span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Procesando...' : (
                                        <>
                                            <Megaphone className="w-4 h-4" /> Lanzar Campaña
                                        </>
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