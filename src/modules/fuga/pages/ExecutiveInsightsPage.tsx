import React, { useState, useEffect } from 'react';

interface ExecutiveMetrics {
    totalAnalyzed:    number;
    highRiskCount:    number;
    mediumRiskCount:  number;
    lowRiskCount:     number;
    totalCampaigns:   number;
    totalTargeted:    number;
    totalConverted:   number;
    totalInvestment:  number;
    strategicInsights: Array<{
        cause:   string;
        segment: string;
        impact:  'ALTO' | 'MEDIO' | 'BAJO';
        pct:     number;
    }>;
}
import {
    Users,
    AlertTriangle,
    ShieldCheck,
    BarChart3,
    Megaphone,
    TrendingDown,
    Target,
    TrendingUp,
} from 'lucide-react';
import { ChurnService } from '../churn.service';

const IMPACT_COLOR: Record<string, string> = {
    'ALTO': 'bg-red-500', 'MEDIO': 'bg-orange-400', 'BAJO': 'bg-yellow-400',
};
const IMPACT_BADGE: Record<string, string> = {
    'ALTO': 'bg-red-100 text-red-600', 'MEDIO': 'bg-orange-100 text-orange-600', 'BAJO': 'bg-yellow-100 text-yellow-600',
};

const ExecutiveInsightsPage: React.FC = () => {
    const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ChurnService.getExecutiveMetrics()
            .then(setMetrics)
            .catch(e => {
                console.error('Error cargando métricas ejecutivas', e);
                setError('No se pudieron cargar las métricas ejecutivas. Verifique que el servidor esté disponible.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-full" />
                <div className="h-4 w-48 bg-slate-200 rounded" />
            </div>
        </div>
    );

    if (error) return (
        <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                <AlertTriangle className="text-red-600 w-6 h-6 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
            </div>
        </div>
    );

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    const totalAnalyzed: number  = metrics?.totalAnalyzed  ?? 0;
    const highRisk: number       = metrics?.highRiskCount   ?? 0;
    const mediumRisk: number     = metrics?.mediumRiskCount ?? 0;
    const lowRisk: number        = metrics?.lowRiskCount    ?? 0;

    // Largest Remainder Method — garantiza que highPct + mediumPct + lowPct = 100
    const [highPct, mediumPct, lowPct] = (() => {
        if (totalAnalyzed === 0) return [0, 0, 0];
        const raw = [
            { key: 0, exact: (highRisk   / totalAnalyzed) * 100 },
            { key: 1, exact: (mediumRisk / totalAnalyzed) * 100 },
            { key: 2, exact: (lowRisk    / totalAnalyzed) * 100 },
        ];
        const floored = raw.map(r => ({ ...r, floor: Math.floor(r.exact), remainder: r.exact - Math.floor(r.exact) }));
        const totalFloored = floored.reduce((s, r) => s + r.floor, 0);
        let remaining = 100 - totalFloored;
        floored.sort((a, b) => b.remainder - a.remainder);
        floored.forEach(r => { if (remaining > 0) { r.floor++; remaining--; } });
        floored.sort((a, b) => a.key - b.key);
        return [floored[0].floor, floored[1].floor, floored[2].floor];
    })();

    const totalCampaigns: number  = metrics?.totalCampaigns  ?? 0;
    const totalTargeted: number   = metrics?.totalTargeted   ?? 0;
    const totalConverted: number  = metrics?.totalConverted  ?? 0;
    const totalInvestment: number = metrics?.totalInvestment ?? 0;

    const conversionRate = totalTargeted > 0
        ? ((totalConverted / totalTargeted) * 100).toFixed(1)
        : '0.0';

    const insights = metrics?.strategicInsights ?? [];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Visión Ejecutiva</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Resumen estratégico del riesgo de fuga, sus causas y las acciones en curso.
                </p>
            </div>

            {/* ── Sección 1: Perfil de Riesgo de la Cartera ── */}
            <section>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Perfil de Riesgo de la Cartera
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Alto Riesgo */}
                    <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                Alto &gt;70%
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-800">{highRisk.toLocaleString('es-ES')}</p>
                        <p className="text-sm text-slate-500 mt-1">clientes en riesgo crítico</p>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full transition-all duration-700"
                                style={{ width: `${highPct}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{highPct}% del total analizado</p>
                    </div>

                    {/* Riesgo Medio */}
                    <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                Medio 45–70%
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-800">{mediumRisk.toLocaleString('es-ES')}</p>
                        <p className="text-sm text-slate-500 mt-1">clientes en zona de vigilancia</p>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-orange-400 h-full rounded-full transition-all duration-700"
                                style={{ width: `${mediumPct}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{mediumPct}% del total analizado</p>
                    </div>

                    {/* Bajo Riesgo */}
                    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                                Bajo &lt;45%
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-800">{lowRisk.toLocaleString('es-ES')}</p>
                        <p className="text-sm text-slate-500 mt-1">clientes con perfil estable</p>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                                style={{ width: `${lowPct}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{lowPct}% del total analizado</p>
                    </div>

                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                    Total analizado por el modelo: {totalAnalyzed.toLocaleString('es-ES')} clientes
                </p>
            </section>

            {/* ── Sección 2: Causas Principales de Fuga ── */}
            <section>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Causas Principales de Fuga
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    {insights.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                            <BarChart3 className="w-10 h-10 text-slate-200" />
                            <p className="text-sm font-medium">Sin datos suficientes</p>
                            <p className="text-xs">
                                Genera predicciones desde el Centro de Mando<br />
                                o la sección Inteligencia de Riesgo.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {insights.map((insight, i) => (
                                <div key={i}
                                    className="p-4 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">{insight.cause}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">
                                                {insight.pct}% de clientes en riesgo
                                            </span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${IMPACT_BADGE[insight.impact] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {insight.impact}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${IMPACT_COLOR[insight.impact] ?? 'bg-slate-400'}`}
                                                style={{ width: `${Math.min(insight.pct ?? 0, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            Seg.: {insight.segment}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Sección 3: Acciones en Curso ── */}
            <section>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Acciones en Curso — Campañas de Retención
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="p-2 bg-indigo-50 rounded-lg w-fit mb-4">
                            <Megaphone className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-black text-slate-800">{totalCampaigns}</p>
                        <p className="text-sm text-slate-500 mt-1">campañas registradas</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-black text-slate-800">{totalTargeted.toLocaleString('es-ES')}</p>
                        <p className="text-sm text-slate-500 mt-1">clientes alcanzados</p>
                    </div>

                    <div className="bg-[#0F172A] rounded-2xl p-6 shadow-xl text-white">
                        <div className="p-2 bg-white/10 rounded-lg w-fit mb-4">
                            <ShieldCheck className="w-5 h-5 text-indigo-300" />
                        </div>
                        <p className="text-3xl font-black text-white">{formatMoney(totalInvestment)}</p>
                        <p className="text-sm text-indigo-300/70 mt-1">inversión total en campañas</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
                        <div className="p-2 bg-emerald-50 rounded-lg w-fit mb-4">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-black text-slate-800">
                            {totalConverted.toLocaleString('es-ES')}
                            <span className="text-base font-semibold text-slate-400 ml-1">
                                ({conversionRate}%)
                            </span>
                        </p>
                        <p className="text-sm text-slate-500 mt-1">clientes convertidos</p>
                        {totalTargeted > 0 && (
                            <p className="text-xs text-slate-400 mt-2">
                                de {totalTargeted.toLocaleString('es-ES')} contactados
                            </p>
                        )}
                    </div>

                </div>
            </section>

        </div>
    );
};

export default ExecutiveInsightsPage;
