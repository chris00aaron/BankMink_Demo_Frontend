import React, { useEffect, useState, useMemo } from 'react';
import {
    Globe, AlertCircle, Info, TrendingUp,
    BarChart2, PieChart as PieIcon, DollarSign, Users, Target
} from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceArea,
    PieChart, Pie, Legend as RechartsLegend,
    BarChart, Bar,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ChurnService } from '../churn.service';
import { GeographyStats, DashboardKpis, PriorityMatrixPoint, CustomerDashboard } from '../types';

// ── Constants ──────────────────────────────────────────────────────────
const RISK_THRESHOLD = 50;
const BALANCE_THRESHOLD = 100000;

const QUADRANT_COLORS = {
    danger: 'rgba(239, 68, 68, 0.07)',
    watch: 'rgba(245, 158, 11, 0.07)',
    safe: 'rgba(16, 185, 129, 0.07)',
    vip: 'rgba(59, 130, 246, 0.07)',
};

const quadrantLabel: Record<string, string> = {
    danger: '🔴 Ballenas en Peligro',
    watch: '🟡 Vigilar de Cerca',
    safe: '🟢 Clientes Estables',
    vip: '🔵 Oportunidad VIP',
};

const quadrantAction: Record<string, string> = {
    danger: '⚠️ Acción Inmediata',
    watch: '👁️ Monitoreo',
    safe: '✅ Retener',
    vip: '💎 Cross-Sell',
};

const COUNTRY_COLORS: Record<string, string> = {
    Germany: '#EF4444',
    Alemania: '#EF4444',
    France: '#3B82F6',
    Francia: '#3B82F6',
    Spain: '#10B981',
    España: '#10B981',
};

const AGE_GROUPS = ['18-25', '26-35', '36-45', '46-55', '56+'];

// ── Helpers ────────────────────────────────────────────────────────────
const getQuadrant = (risk: number, balance: number) => {
    if (risk > RISK_THRESHOLD && balance > BALANCE_THRESHOLD) return 'danger';
    if (risk > RISK_THRESHOLD && balance <= BALANCE_THRESHOLD) return 'watch';
    if (risk <= RISK_THRESHOLD && balance > BALANCE_THRESHOLD) return 'vip';
    return 'safe';
};

const pointFill = (risk: number, balance: number) => {
    const q = getQuadrant(risk, balance);
    switch (q) {
        case 'danger': return '#EF4444';
        case 'watch': return '#F59E0B';
        case 'safe': return '#10B981';
        case 'vip': return '#3B82F6';
        default: return '#8884d8';
    }
};

const getColorByChurn = (rate: number) => {
    if (rate > 25) return '#ef4444';
    if (rate > 15) return '#f97316';
    if (rate > 10) return '#eab308';
    return '#22c55e';
};

const getAgeGroup = (age: number): string => {
    if (age <= 25) return '18-25';
    if (age <= 35) return '26-35';
    if (age <= 45) return '36-45';
    if (age <= 55) return '46-55';
    return '56+';
};

const getRiskColor = (risk: number): string => {
    if (risk > 70) return '#EF4444';
    if (risk > 55) return '#F59E0B';
    if (risk > 40) return '#FB923C';
    return '#10B981';
};

// ── Custom Scatter Tooltip ──────────────────────────────────────────────
const ScatterTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload as PriorityMatrixPoint;
    const q = getQuadrant(d.x, d.y);
    return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-4 min-w-[220px]">
            <p className="font-bold text-slate-800 text-sm mb-2">{d.name || `Cliente #${d.id}`}</p>
            <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>Riesgo:</span><span className="font-bold" style={{ color: pointFill(d.x, d.y) }}>{d.x}%</span></div>
                <div className="flex justify-between"><span>Balance:</span><span className="font-medium">€{d.y.toLocaleString('es-ES')}</span></div>
                <div className="flex justify-between"><span>País:</span><span>{d.country || 'N/A'}</span></div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-semibold" style={{ color: pointFill(d.x, d.y) }}>
                {quadrantAction[q]}
            </div>
        </div>
    );
};

// ── Custom Bubble Tooltip ──────────────────────────────────────────────
const BubbleTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-4 min-w-[200px]">
            <p className="font-bold text-slate-800 text-sm mb-2">{d.label}</p>
            <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>Riesgo Promedio:</span><span className="font-bold" style={{ color: getRiskColor(d.avgRisk) }}>{d.avgRisk.toFixed(1)}%</span></div>
                <div className="flex justify-between"><span>Clientes:</span><span className="font-medium">{d.count}</span></div>
                <div className="flex justify-between"><span>Balance Prom.:</span><span>€{d.avgBalance.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span></div>
            </div>
        </div>
    );
};

// ── Europe SVG Map ──────────────────────────────────────────────────────
interface EuropeMapProps {
    countryData: GeographyStats[];
    onHover: (country: GeographyStats | null) => void;
}

const EuropeMap: React.FC<EuropeMapProps> = ({ countryData, onHover }) => {
    const mapConfig = [
        {
            id: 'Spain',
            names: ['Spain', 'España'],
            d: "M220 380 L280 370 L300 390 L310 360 L340 350 L320 300 L260 300 L210 320 Z",
            cx: 270, cy: 340
        },
        {
            id: 'France',
            names: ['France', 'Francia'],
            d: "M280 300 L340 350 L380 330 L400 280 L380 220 L320 230 L280 280 Z",
            cx: 340, cy: 280
        },
        {
            id: 'Germany',
            names: ['Germany', 'Alemania'],
            d: "M380 220 L400 280 L440 290 L460 250 L440 190 L400 180 Z",
            cx: 420, cy: 240
        }
    ];

    return (
        <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-xl filter">
            <rect width="600" height="500" fill="#f8fafc" />
            {mapConfig.map((geo) => {
                const stats = countryData.find(c => geo.names.includes(c.country));
                const churnRate = stats ? stats.churnRate : 0;
                const fill = stats ? getColorByChurn(churnRate) : '#cbd5e1';
                return (
                    <g
                        key={geo.id}
                        onMouseEnter={() => stats && onHover(stats)}
                        onMouseLeave={() => onHover(null)}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                        <path d={geo.d} fill={fill} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity" />
                        <text x={geo.cx} y={geo.cy} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                            {geo.names[0]}
                        </text>
                        <text x={geo.cx} y={geo.cy + 15} textAnchor="middle" fill="white" fontSize="10" style={{ pointerEvents: 'none' }}>
                            {stats ? `${stats.churnRate.toFixed(1)}%` : 'N/A'}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
const RiskIntelligencePage: React.FC = () => {
    // ── Strategy data (scatter / donut) ─────────────────────────────────
    const [kpis, setKpis] = useState<DashboardKpis | null>(null);
    const [loadingKpis, setLoadingKpis] = useState(true);

    // ── Geography data ───────────────────────────────────────────────────
    const [countryData, setCountryData] = useState<GeographyStats[]>([]);
    const [loadingGeo, setLoadingGeo] = useState(true);
    const [errorGeo, setErrorGeo] = useState<string | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<GeographyStats | null>(null);

    // ── Customer data (for Bubble Chart) ─────────────────────────────────
    const [customers, setCustomers] = useState<CustomerDashboard[]>([]);

    // Fetch strategy KPIs + scatterData + ALL customers for Bubble chart
    useEffect(() => {
        const load = async () => {
            try {
                const data = await ChurnService.getCustomersPaginated(0, 5000, '');
                if (data.kpis) {
                    setKpis({
                        ...data.kpis,
                        capitalAtRisk: parseFloat(String(data.kpis.capitalAtRisk ?? 0)),
                        totalCustomers: Number(data.kpis.totalCustomers ?? 0),
                        customersAtRisk: Number(data.kpis.customersAtRisk ?? 0),
                        retentionRate: parseFloat(String(data.kpis.retentionRate ?? 0)),
                    });
                }
                setCustomers(data.content || []);
            } catch (e) {
                console.error('Error cargando KPIs estratégicos:', e);
            } finally {
                setLoadingKpis(false);
            }
        };
        load();
    }, []);

    // Fetch geography
    useEffect(() => {
        const load = async () => {
            try {
                const data = await ChurnService.getGeographyStats();
                setCountryData(data);
            } catch (e) {
                console.error('Error cargando datos geográficos:', e);
                setErrorGeo('No se pudieron cargar los datos geográficos.');
            } finally {
                setLoadingGeo(false);
            }
        };
        load();
    }, []);

    // ── Derived: scatter ─────────────────────────────────────────────────
    const scatterData: PriorityMatrixPoint[] = kpis?.scatterData || [];

    const maxBalance = useMemo(() => {
        if (!scatterData.length) return 250000;
        const max = Math.max(...scatterData.map(d => d.y));
        return Math.max(max * 1.1, BALANCE_THRESHOLD * 1.5);
    }, [scatterData]);

    const quadrantCounts = useMemo(() => {
        const counts = { danger: 0, watch: 0, safe: 0, vip: 0 };
        scatterData.forEach(d => { counts[getQuadrant(d.x, d.y)]++; });
        return counts;
    }, [scatterData]);

    // ── Derived: donut ───────────────────────────────────────────────────
    const donutData = useMemo(() => {
        if (!kpis) return [];
        return [
            { name: 'Alto Riesgo (>70%)', value: kpis.highRiskCount, fill: '#EF4444' },
            { name: 'Riesgo Medio (50-70%)', value: kpis.mediumRiskCount, fill: '#F59E0B' },
            { name: 'Bajo Riesgo (<50%)', value: kpis.lowRiskCount, fill: '#10B981' },
        ];
    }, [kpis]);

    // ══════════════════════════════════════════════════════════════════════
    // NEW CHART 1: Capital en Riesgo por País (Stacked Horizontal Bars)
    // ══════════════════════════════════════════════════════════════════════
    const capitalAtRiskData = useMemo(() => {
        return countryData.map(c => ({
            country: `${c.flag} ${c.country}`,
            capitalAltoRiesgo: Math.round(c.highRisk * c.avgBalance),
            capitalMedioRiesgo: Math.round(c.mediumRisk * c.avgBalance),
            capitalBajoRiesgo: Math.round(c.lowRisk * c.avgBalance),
            totalCapital: Math.round(c.totalCustomers * c.avgBalance),
            highRisk: c.highRisk,
            churnRate: c.churnRate,
        })).sort((a, b) => b.capitalAltoRiesgo - a.capitalAltoRiesgo);
    }, [countryData]);

    const maxCapital = useMemo(() => {
        if (!capitalAtRiskData.length) return 1;
        return Math.max(...capitalAtRiskData.map(d => d.totalCapital));
    }, [capitalAtRiskData]);

    // ══════════════════════════════════════════════════════════════════════
    // NEW CHART 2: Bubble Chart — Riesgo por Segmento (Edad × Productos)
    // ══════════════════════════════════════════════════════════════════════
    const bubbleData = useMemo(() => {
        if (!customers.length) return [];

        // Group customers by (ageGroup, products)
        const groups: Record<string, { totalRisk: number; totalBalance: number; count: number; ageIdx: number; products: number }> = {};

        customers.forEach(c => {
            const ageGroup = getAgeGroup(c.age);
            const products = Math.min(c.products || 1, 4); // Cap at 4
            const key = `${ageGroup}_${products}`;

            if (!groups[key]) {
                groups[key] = { totalRisk: 0, totalBalance: 0, count: 0, ageIdx: AGE_GROUPS.indexOf(ageGroup), products };
            }
            groups[key].totalRisk += c.risk;
            groups[key].totalBalance += c.balance;
            groups[key].count++;
        });

        return Object.entries(groups).map(([key, g]) => ({
            x: g.ageIdx, // Age group index for positioning
            y: g.products,
            z: Math.max(g.count * 8, 60), // Bubble size (scaled)
            avgRisk: g.totalRisk / g.count,
            avgBalance: g.totalBalance / g.count,
            count: g.count,
            label: `${AGE_GROUPS[g.ageIdx]} años, ${g.products} prod.`,
            ageGroup: AGE_GROUPS[g.ageIdx],
        }));
    }, [customers]);

    // ══════════════════════════════════════════════════════════════════════
    // NEW CHART 3: Radar Chart — Perfil Comparativo Multi-País
    // ══════════════════════════════════════════════════════════════════════
    const radarData = useMemo(() => {
        if (!countryData.length) return [];

        // Calcula los máximos para normalizar
        const maxChurn = Math.max(...countryData.map(c => c.churnRate), 1);
        const maxAvgBal = Math.max(...countryData.map(c => c.avgBalance), 1);
        const maxTotal = Math.max(...countryData.map(c => c.totalCustomers), 1);
        const maxHigh = Math.max(...countryData.map(c => (c.highRisk / c.totalCustomers) * 100), 1);
        const maxLow = Math.max(...countryData.map(c => (c.lowRisk / c.totalCustomers) * 100), 1);

        const dimensions = [
            { dim: 'Tasa de Fuga' },
            { dim: 'Balance Promedio' },
            { dim: 'Volumen Clientes' },
            { dim: '% Alto Riesgo' },
            { dim: '% Bajo Riesgo' },
        ];

        return dimensions.map(({ dim }) => {
            const entry: any = { dimension: dim };
            countryData.forEach(c => {
                let val = 0;
                switch (dim) {
                    case 'Tasa de Fuga': val = (c.churnRate / maxChurn) * 100; break;
                    case 'Balance Promedio': val = (c.avgBalance / maxAvgBal) * 100; break;
                    case 'Volumen Clientes': val = (c.totalCustomers / maxTotal) * 100; break;
                    case '% Alto Riesgo': val = ((c.highRisk / c.totalCustomers) * 100 / maxHigh) * 100; break;
                    case '% Bajo Riesgo': val = ((c.lowRisk / c.totalCustomers) * 100 / maxLow) * 100; break;
                }
                entry[c.country] = Math.round(val);
            });
            return entry;
        });
    }, [countryData]);

    // ── Geography totals ─────────────────────────────────────────────────
    const totalCustomers = countryData.reduce((sum, c) => sum + c.totalCustomers, 0);
    const totalHighRisk = countryData.reduce((sum, c) => sum + c.highRisk, 0);

    const loading = loadingKpis && loadingGeo;

    if (loading) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
                    <span className="mt-4 block text-slate-600">Cargando análisis estratégico...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">

            {/* ─── HEADER ──────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Módulo de Retención</h2>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Inteligencia de Riesgo</h1>
                    <p className="text-sm text-slate-500 mt-1">Análisis estratégico de riesgo · Distribución y geografía de fuga</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm text-right">
                        <p className="text-xs text-slate-500 uppercase">Total Clientes</p>
                        <p className="text-2xl font-bold text-slate-800">{totalCustomers.toLocaleString('es-ES')}</p>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 text-right">
                        <p className="text-xs text-red-600 uppercase">Alto Riesgo Global</p>
                        <p className="text-2xl font-bold text-red-600">{totalHighRisk.toLocaleString('es-ES')}</p>
                    </div>
                </div>
            </div>

            {/* ══ SECCIÓN 1 — ANÁLISIS ESTRATÉGICO ════════════════════════ */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Análisis Estratégico</h2>
                    <div className="flex-1 h-px bg-slate-200 ml-2" />
                </div>
            </div>

            {loadingKpis ? (
                <div className="flex justify-center items-center h-48 bg-white rounded-xl border border-slate-100 mb-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                    {/* SCATTER — Matriz de Prioridad */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Matriz de Prioridad de Retención</h3>
                            <p className="text-sm text-slate-500">
                                Clientes analizados. Cada punto representa un cliente — posición por probabilidad de fuga vs balance.
                            </p>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />

                                    {/* Quadrant backgrounds */}
                                    <ReferenceArea x1={0} x2={RISK_THRESHOLD} y1={0} y2={BALANCE_THRESHOLD}
                                        fill={QUADRANT_COLORS.safe} fillOpacity={1}
                                        label={{ value: '✅ Retener', position: 'insideBottomLeft', fill: '#059669', fontSize: 11, fontWeight: 600 }} />
                                    <ReferenceArea x1={0} x2={RISK_THRESHOLD} y1={BALANCE_THRESHOLD} y2={maxBalance}
                                        fill={QUADRANT_COLORS.vip} fillOpacity={1}
                                        label={{ value: '💎 Cross-Sell', position: 'insideTopLeft', fill: '#2563EB', fontSize: 11, fontWeight: 600 }} />
                                    <ReferenceArea x1={RISK_THRESHOLD} x2={100} y1={0} y2={BALANCE_THRESHOLD}
                                        fill={QUADRANT_COLORS.watch} fillOpacity={1}
                                        label={{ value: '👁️ Monitoreo', position: 'insideBottomRight', fill: '#D97706', fontSize: 11, fontWeight: 600 }} />
                                    <ReferenceArea x1={RISK_THRESHOLD} x2={100} y1={BALANCE_THRESHOLD} y2={maxBalance}
                                        fill={QUADRANT_COLORS.danger} fillOpacity={1}
                                        label={{ value: '⚠️ Acción Inmediata', position: 'insideTopRight', fill: '#DC2626', fontSize: 11, fontWeight: 600 }} />

                                    <XAxis type="number" dataKey="x" name="Probabilidad Fuga" unit="%"
                                        domain={[0, 100]}
                                        label={{ value: 'Probabilidad de Fuga (%)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 12 }}
                                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                                    />
                                    <YAxis type="number" dataKey="y" name="Balance" unit="€"
                                        domain={[0, maxBalance]}
                                        tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val)}
                                        label={{ value: 'Balance (€)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12 }}
                                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                                    />

                                    <RechartsTooltip content={<ScatterTooltipContent />} cursor={{ strokeDasharray: '3 3' }} />

                                    <Scatter name="Clientes" data={scatterData} fill="#8884d8">
                                        {scatterData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pointFill(entry.x, entry.y)} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Quadrant counts */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                            {(['danger', 'watch', 'safe', 'vip'] as const).map(q => (
                                <div key={q} className="text-left p-2.5 rounded-lg border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-600">{quadrantLabel[q]}</p>
                                    <p className="text-lg font-bold text-slate-800">{quadrantCounts[q]}</p>
                                    <p className="text-[10px] text-slate-400">{quadrantAction[q]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DONUT — Distribución de Riesgo */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <PieIcon className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800">Distribución de Riesgo</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Clasificación de toda la base de clientes.</p>

                        <div className="flex-1 min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%" cy="50%"
                                        innerRadius="55%" outerRadius="80%"
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`pie-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={((value: number | undefined, name: string | undefined) =>
                                            [`${(value ?? 0).toLocaleString('es-ES')} clientes`, name ?? '']) as any}
                                    />
                                    <RechartsLegend verticalAlign="bottom" height={36}
                                        formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary */}
                        <div className="mt-4 space-y-2">
                            {donutData.map(d => (
                                <div key={d.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                                        <span className="text-slate-600 text-xs">{d.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{(d.value || 0).toLocaleString('es-ES')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ SECCIÓN 2 — CAPITAL EN RIESGO POR PAÍS (NEW) ═══════════ */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-rose-500" />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Impacto Financiero por País</h2>
                    <div className="flex-1 h-px bg-slate-200 ml-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Stacked Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Capital en Riesgo por País</h3>
                        <p className="text-sm text-slate-500">
                            Distribución del capital expuesto por nivel de riesgo. Tamaño de barra = impacto financiero real.
                        </p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={capitalAtRiskData} layout="vertical"
                                margin={{ top: 10, right: 30, bottom: 10, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                <XAxis type="number"
                                    tickFormatter={(val: number) => val >= 1000000 ? `€${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `€${(val / 1000).toFixed(0)}K` : `€${val}`}
                                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                                />
                                <YAxis type="category" dataKey="country" width={130}
                                    tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }}
                                />
                                <RechartsTooltip
                                    formatter={(value: number, name: string) => [
                                        `€${value.toLocaleString('es-ES')}`,
                                        name
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <RechartsLegend verticalAlign="top" height={36}
                                    formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
                                />
                                <Bar dataKey="capitalAltoRiesgo" name="🔴 Alto Riesgo" stackId="capital" fill="#EF4444" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="capitalMedioRiesgo" name="🟡 Medio Riesgo" stackId="capital" fill="#F59E0B" />
                                <Bar dataKey="capitalBajoRiesgo" name="🟢 Bajo Riesgo" stackId="capital" fill="#10B981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Capital Summary Cards */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <h4 className="font-bold text-red-800 text-sm">Capital Crítico</h4>
                        </div>
                        <p className="text-2xl font-bold text-red-700">
                            €{capitalAtRiskData.reduce((s, c) => s + c.capitalAltoRiesgo, 0).toLocaleString('es-ES')}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            En clientes con riesgo &gt;70% de fuga
                        </p>
                    </div>

                    {capitalAtRiskData.map((c, idx) => {
                        const pctHigh = c.totalCapital > 0 ? (c.capitalAltoRiesgo / c.totalCapital * 100) : 0;
                        return (
                            <div key={idx} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-800 text-sm">{c.country}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pctHigh > 30 ? 'bg-red-100 text-red-700' : pctHigh > 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {pctHigh.toFixed(1)}% en riesgo alto
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full flex">
                                        <div className="bg-red-500 h-full" style={{ width: `${(c.capitalAltoRiesgo / maxCapital) * 100}%` }} />
                                        <div className="bg-yellow-400 h-full" style={{ width: `${(c.capitalMedioRiesgo / maxCapital) * 100}%` }} />
                                        <div className="bg-green-400 h-full" style={{ width: `${(c.capitalBajoRiesgo / maxCapital) * 100}%` }} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">
                                    Total: €{c.totalCapital.toLocaleString('es-ES')}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══ SECCIÓN 3 — SEGMENTACIÓN DEMOGRÁFICA (NEW) ═══════════════ */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-violet-500" />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Segmentación Demográfica de Riesgo</h2>
                    <div className="flex-1 h-px bg-slate-200 ml-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Bubble Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Mapa de Riesgo: Edad × Productos</h3>
                        <p className="text-sm text-slate-500">
                            Cada burbuja = un segmento demográfico. Tamaño = cantidad de clientes. Color = riesgo promedio de fuga.
                        </p>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis type="number" dataKey="x" name="Grupo de Edad"
                                    domain={[-0.5, 4.5]}
                                    ticks={[0, 1, 2, 3, 4]}
                                    tickFormatter={(val: number) => AGE_GROUPS[val] || ''}
                                    label={{ value: 'Grupo de Edad', position: 'insideBottom', offset: -15, fill: '#94A3B8', fontSize: 12 }}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <YAxis type="number" dataKey="y" name="N° Productos"
                                    domain={[0.5, 4.5]}
                                    ticks={[1, 2, 3, 4]}
                                    label={{ value: 'N° Productos', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12 }}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <RechartsTooltip content={<BubbleTooltipContent />} cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Segmentos" data={bubbleData} fill="#8884d8">
                                    {bubbleData.map((entry, index) => (
                                        <Cell key={`bubble-${index}`}
                                            fill={getRiskColor(entry.avgRisk)}
                                            fillOpacity={0.75}
                                            r={Math.min(entry.z / 4, 35)}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Leyenda de colores */}
                    <div className="flex items-center gap-6 mt-4 justify-center text-xs text-slate-600">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /> Riesgo &gt;70%</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /> Riesgo 55-70%</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400" /> Riesgo 40-55%</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Riesgo &lt;40%</div>
                        <div className="flex items-center gap-1.5 ml-4 border-l pl-4 border-slate-200">⬤ Grande = más clientes</div>
                    </div>
                </div>

                {/* Top Risk Segments */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-violet-600" />
                            <h4 className="font-bold text-violet-800 text-sm">Segmentos de Mayor Riesgo</h4>
                        </div>
                        <p className="text-xs text-violet-600 mb-3">Los 5 grupos demográficos con mayor probabilidad de fuga.</p>
                        <div className="space-y-3">
                            {[...bubbleData]
                                .sort((a, b) => b.avgRisk - a.avgRisk)
                                .slice(0, 5)
                                .map((seg, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                                            <span className="text-xs font-medium text-slate-700">{seg.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{seg.count} cl.</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: getRiskColor(seg.avgRisk) + '20',
                                                    color: getRiskColor(seg.avgRisk)
                                                }}>
                                                {seg.avgRisk.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-800 text-sm">Insight Accionable</h4>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    Los segmentos con <strong>burbujas rojas grandes</strong> son la prioridad para campañas de retención.
                                    Cruza estos datos con las estrategias disponibles en el Simulador para diseñar ofertas personalizadas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ SECCIÓN 4 — ANÁLISIS GEOGRÁFICO + RADAR (UPDATED) ═══════ */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Análisis Geográfico Comparativo</h2>
                    <div className="flex-1 h-px bg-slate-200 ml-2" />
                </div>
            </div>

            {loadingGeo ? (
                <div className="flex justify-center items-center h-48 bg-white rounded-xl border border-slate-100 mb-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : errorGeo ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-center gap-3">
                    <AlertCircle className="text-red-600 w-6 h-6" />
                    <p className="text-red-700 font-medium">{errorGeo}</p>
                </div>
            ) : (
                <>
                    {/* Mapa SVG + Radar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                        {/* Mapa */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">Mapa de Riesgo (EMEA)</h3>
                                        <p className="text-sm text-slate-500">Color indica tasa de fuga por país.</p>
                                    </div>
                                </div>
                                {hoveredCountry && (
                                    <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                                        <strong>{hoveredCountry.country}:</strong> {hoveredCountry.churnRate.toFixed(1)}% Fuga
                                    </div>
                                )}
                            </div>
                            <div className="h-80 w-full bg-slate-50 rounded-lg border border-slate-100 relative">
                                <EuropeMap countryData={countryData} onHover={setHoveredCountry} />
                                {/* Leyenda */}
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm text-xs">
                                    <p className="font-bold text-slate-700 mb-2">Nivel de Riesgo</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Bajo (&lt;10%)</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Medio (10-15%)</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span>Alto (15-25%)</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Crítico (&gt;25%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RADAR CHART (NEW) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-semibold text-slate-800">Perfil Comparativo Multi-País</h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Cada eje normalizado a 100. Compara la "personalidad" de cada mercado simultáneamente.
                            </p>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                                        <PolarGrid stroke="#E2E8F0" />
                                        <PolarAngleAxis dataKey="dimension"
                                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                                        />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]}
                                            tick={{ fill: '#94A3B8', fontSize: 9 }}
                                        />
                                        {countryData.map((c) => (
                                            <Radar
                                                key={c.country}
                                                name={`${c.flag} ${c.country}`}
                                                dataKey={c.country}
                                                stroke={COUNTRY_COLORS[c.country] || '#8884d8'}
                                                fill={COUNTRY_COLORS[c.country] || '#8884d8'}
                                                fillOpacity={0.15}
                                                strokeWidth={2}
                                            />
                                        ))}
                                        <RechartsLegend verticalAlign="bottom" height={36}
                                            formatter={(value: string) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Ranking + Cards por País */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Ranking */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ranking de Fuga</h3>
                            <div className="space-y-4">
                                {[...countryData].sort((a, b) => b.churnRate - a.churnRate).map((country, idx) => (
                                    <div key={country.countryCode} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-slate-300 w-4">#{idx + 1}</span>
                                            <div>
                                                <p className="font-bold text-slate-700">{country.country}</p>
                                                <p className="text-xs text-slate-500">{country.totalCustomers} clientes</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${country.churnRate > 15 ? 'text-red-600' : 'text-green-600'}`}>
                                                {country.churnRate.toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-slate-400">tasa fuga</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cards por País */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {countryData.map((country) => {
                                    const riskPercent = (country.highRisk / country.totalCustomers) * 100;
                                    const riskColor = riskPercent > 25 ? 'from-red-500 to-red-600'
                                        : riskPercent > 15 ? 'from-yellow-500 to-yellow-600'
                                            : 'from-green-500 to-green-600';
                                    return (
                                        <div key={country.countryCode}
                                            className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-4xl">{country.flag}</span>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-lg">{country.country}</h4>
                                                        <p className="text-sm text-slate-500">{country.totalCustomers.toLocaleString('es-ES')} clientes</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${riskColor} text-white text-sm font-medium`}>
                                                    {country.churnRate.toFixed(1)}% fuga
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Alto', value: country.highRisk, color: 'bg-red-500' },
                                                    { label: 'Medio', value: country.mediumRisk, color: 'bg-yellow-500' },
                                                    { label: 'Bajo', value: country.lowRisk, color: 'bg-green-500' },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label} className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500 w-12">{label}</span>
                                                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className={`h-full ${color} rounded-full transition-all`}
                                                                style={{ width: `${(value / country.totalCustomers) * 100}%` }} />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-700 w-10">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Balance Promedio</span>
                                                    <span className="font-semibold text-slate-700">€{country.avgBalance.toLocaleString('es-ES')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Insight */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-6 h-6 text-emerald-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-emerald-800">Insight Clave</h3>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Según los datos en tiempo real, <strong>Alemania</strong> presenta la mayor tasa de fuga
                                    con un balance promedio crítico. Se recomienda implementar campañas de retención focalizadas en esta región.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>📊 Datos en tiempo real · Análisis estratégico + geográfico + demográfico · KPIs server-side</p>
            </div>
        </div>
    );
};

export default RiskIntelligencePage;
