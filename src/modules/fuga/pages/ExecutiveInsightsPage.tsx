import React, { useState, useEffect } from 'react';
import {
    TrendingDown,
    DollarSign,
    BarChart3,
    ShieldCheck,
    AlertTriangle,
    Target,
    Zap
} from 'lucide-react';
import {
    Tooltip, ResponsiveContainer, Cell,
    PieChart as RePieChart, Pie
} from 'recharts';
import { ChurnService } from '../churn.service';

// ── Fix 1: Badge dinámico según efficiencyScore ──────────────────────────────
const EFFICIENCY_CONFIG: Record<string, {
    text: string; classes: string; iconClass: string; useAlert: boolean;
}> = {
    'MÁXIMA': { text: 'Operación Rentable',   classes: 'bg-emerald-50 border-emerald-100 text-emerald-700', iconClass: 'text-emerald-600', useAlert: false },
    'ALTA':   { text: 'Operación Estable',    classes: 'bg-blue-50 border-blue-100 text-blue-700',         iconClass: 'text-blue-600',    useAlert: false },
    'MEDIA':  { text: 'Atención Requerida',   classes: 'bg-amber-50 border-amber-100 text-amber-700',      iconClass: 'text-amber-600',   useAlert: true  },
    'BAJA':   { text: 'Intervención Urgente', classes: 'bg-red-50 border-red-100 text-red-700',            iconClass: 'text-red-600',     useAlert: true  },
};

// ── Fix 3: Mapa de efficiencyScore (string) a valor numérico ─────────────────
const EFFICIENCY_SCORE_MAP: Record<string, number> = {
    'MÁXIMA': 95, 'ALTA': 80, 'MEDIA': 60, 'BAJA': 35,
};

// ── Fix 5: Anchos de barra por nivel de impacto ──────────────────────────────
const IMPACT_WIDTH: Record<string, string> = {
    'ALTO': '85%', 'MEDIO': '55%', 'BAJO': '25%',
};
const IMPACT_COLOR: Record<string, string> = {
    'ALTO': 'bg-red-500', 'MEDIO': 'bg-orange-400', 'BAJO': 'bg-yellow-400',
};
const IMPACT_BADGE: Record<string, string> = {
    'ALTO': 'bg-red-100 text-red-600', 'MEDIO': 'bg-orange-100 text-orange-600', 'BAJO': 'bg-yellow-100 text-yellow-600',
};

const ExecutiveInsightsPage: React.FC = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExecutiveData = async () => {
            try {
                // En un entorno real, ChurnService tendría getExecutiveMetrics()
                // Simulamos la llamada basándonos en el nuevo endpoint del backend
                const data = await ChurnService.getExecutiveMetrics();
                setMetrics(data);
            } catch (e) {
                console.error("Error cargando métricas ejecutivas", e);
            } finally {
                setLoading(false);
            }
        };
        fetchExecutiveData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // ── Valores derivados de datos reales ────────────────────────────────────
    const erosion: number  = metrics?.capitalErosionProyectada ?? 0;
    const savings: number  = metrics?.estimatedSavings ?? 0;
    const vipRisk: number  = metrics?.vipCapitalAtRisk ?? 0;

    // Fix 2: % retenido real (estimatedSavings / capitalErosionProyectada)
    const retentionPct = erosion > 0 ? ((savings / erosion) * 100).toFixed(1) : '0.0';

    // Fix 3: eficiencia como número
    const efficiencyKey   = metrics?.efficiencyScore ?? '';
    const efficiencyValue = EFFICIENCY_SCORE_MAP[efficiencyKey] ?? 0;
    const efficiencyConf  = EFFICIENCY_CONFIG[efficiencyKey] ?? EFFICIENCY_CONFIG['MÁXIMA'];

    // Fix 4: % VIP en riesgo sobre total erosión
    const vipRiskPct  = erosion > 0 ? Math.round((vipRisk / erosion) * 1000) / 10 : 25;
    const vipSafePct  = Math.round((100 - vipRiskPct) * 10) / 10;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Estratégico */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Visión Ejecutiva del Negocio</h1>
                    <p className="text-slate-500 text-sm mt-1">Análisis de impacto financiero y optimización de capital retenido.</p>
                </div>
                {/* Fix 1: badge dinámico según efficiencyScore del backend */}
                <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${efficiencyConf.classes}`}>
                    {efficiencyConf.useAlert
                        ? <AlertTriangle className={`w-5 h-5 ${efficiencyConf.iconClass}`} />
                        : <ShieldCheck    className={`w-5 h-5 ${efficiencyConf.iconClass}`} />
                    }
                    <span className={`text-sm font-bold`}>Estado: {efficiencyConf.text}</span>
                </div>
            </div>

            {/* Fila 1: KPIs Monetarios (C-Level Focus) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 rounded-lg"><TrendingDown className="w-6 h-6 text-red-600" /></div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{retentionPct}% retenido</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Erosión de Capital (30d)</p>
                    <h2 className="text-2xl font-black text-[#0F172A] mt-1">{formatMoney(metrics?.capitalErosionProyectada || 2450000)}</h2>
                    <p className="text-[10px] text-slate-400 mt-2 italic">*Capital proyectado a salir por riesgo de fuga.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg"><Zap className="w-6 h-6 text-emerald-600" /></div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">ROI: {metrics?.retentionROI || 8.4}x</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Capital Salvado (Est.)</p>
                    <h2 className="text-2xl font-black text-[#0F172A] mt-1">{formatMoney(metrics?.estimatedSavings || 1280000)}</h2>
                    <p className="text-[10px] text-slate-400 mt-2 italic">Impacto directo de campañas de retención.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg"><DollarSign className="w-6 h-6 text-indigo-600" /></div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Inversión en Retención</p>
                    <h2 className="text-2xl font-black text-[#0F172A] mt-1">{formatMoney(metrics?.totalInvestment || 152000)}</h2>
                    <p className="text-[10px] text-slate-400 mt-2 italic">Costo operativo de beneficios y upgrades.</p>
                </div>

                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Target className="w-6 h-6 text-indigo-300" /></div>
                    </div>
                    <p className="text-indigo-300/60 text-xs font-bold uppercase tracking-wider">Eficiencia de Cartera</p>
                    <h2 className="text-3xl font-black text-white mt-1">{efficiencyValue}%</h2>
                    <p className="text-indigo-300/50 text-[10px] mt-0.5">{efficiencyKey || '—'}</p>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-indigo-400 h-full transition-all duration-700"
                            style={{ width: `${efficiencyValue}%` }} />
                    </div>
                </div>
            </div>

            {/* Fila 2: Análisis Estratégico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Causas Sistémicas */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Distribución Estratégica de Fuga (Causas Sistémicas)
                    </h3>
                    <div className="space-y-6">
                        {metrics?.strategicInsights?.map((insight: any, i: number) => (
                            <div key={i} className="group p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-default">
                                {/* Fix 5: badge y barra con 3 niveles: ALTO / MEDIO / BAJO */}
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">{insight.cause}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${IMPACT_BADGE[insight.impact] ?? 'bg-slate-100 text-slate-600'}`}>
                                        IMPACTO {insight.impact}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${IMPACT_COLOR[insight.impact] ?? 'bg-slate-400'}`}
                                            style={{ width: IMPACT_WIDTH[insight.impact] ?? '20%' }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">Segmento: {insight.segment}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Composición de Capital VIP en Riesgo */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    {/* Fix 4: título y datos del donut calculados desde backend */}
                    <h3 className="text-lg font-bold text-[#0F172A] mb-8 w-full text-left">Composición del Capital en Riesgo</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={[
                                        { name: 'Capital No VIP en Riesgo', value: vipSafePct  },
                                        { name: 'Capital VIP en Riesgo',    value: vipRiskPct  }
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10B981" />
                                    <Cell fill="#F43F5E" />
                                </Pie>
                                <Tooltip formatter={(val: any) => [`${val}%`, '']} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2 w-full">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> No VIP en Riesgo</div>
                            <span className="text-slate-600">{vipSafePct}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-red-600">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> VIP en Riesgo</div>
                            <span className="font-bold">{vipRiskPct}%</span>
                        </div>
                    </div>
                    <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl w-full border border-dashed border-slate-300">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Exposición Total VIP</p>
                        <p className="text-2xl font-black text-red-600">{formatMoney(vipRisk)}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExecutiveInsightsPage;
