import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Users,
    TrendingDown,
    AlertOctagon,
    DollarSign,
    ArrowUpRight,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    X,
    Filter
} from 'lucide-react';
import { ChurnService } from '../churn.service';
import { CustomerDashboard, CustomerRiskDetail, PriorityMatrixPoint, DashboardKpis } from '../types';

// ── Constants ──────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

const RISK_THRESHOLD = 45;
const BALANCE_THRESHOLD = 100000;

// Los 3 países reales del dataset
const COUNTRY_OPTIONS = [
    { value: 'France', label: '🇫🇷 Francia' },
    { value: 'Germany', label: '🇩🇪 Alemania' },
    { value: 'Spain', label: '🇪🇸 España' },
];

const RISK_OPTIONS = [
    { value: 'alto', label: '🔴 Alto', bg: '#FEE2E2', color: '#DC2626' },
    { value: 'medio', label: '🟡 Medio', bg: '#FEF3C7', color: '#D97706' },
    { value: 'bajo', label: '🟢 Bajo', bg: '#D1FAE5', color: '#059669' },
] as const;

// Niveles de cliente con terminología bancaria de patrimonio
const SEGMENT_OPTIONS = [
    {
        value: 'Corporate' as const,
        label: '⭐ Alto Patrimonio',
        description: 'Balance > €100,000',
        bg: '#FFFBEB',
        color: '#B45309',
    },
    {
        value: 'SME' as const,
        label: '💼 Patrimonio Medio',
        description: 'Balance €50,000 – €100,000',
        bg: '#EFF6FF',
        color: '#1D4ED8',
    },
    {
        value: 'Personal' as const,
        label: '👤 Patrimonio Básico',
        description: 'Balance < €50,000',
        bg: '#F8FAFC',
        color: '#475569',
    },
];

// ── Types ──────────────────────────────────────────────────────────────
interface DashboardPageProps {
    onNavigateToCustomer?: (customerId: number) => void;
}

type SegmentValue = 'Corporate' | 'SME' | 'Personal';

// ── Helper: classify a scatter point into a quadrant ───────────────────
const getQuadrant = (risk: number, balance: number) => {
    if (risk > RISK_THRESHOLD && balance > BALANCE_THRESHOLD) return 'danger';
    if (risk > RISK_THRESHOLD && balance <= BALANCE_THRESHOLD) return 'watch';
    if (risk <= RISK_THRESHOLD && balance > BALANCE_THRESHOLD) return 'vip';
    return 'safe';
};

// ── Helper: segment from balance ────────────────────────────────────────
const segmentFromBalance = (balance: number): 'Corporate' | 'SME' | 'Personal' =>
    balance >= 100000 ? 'Corporate' : balance >= 50000 ? 'SME' : 'Personal';

// ── CSV Export Helper ────────────────────────────────────────────────────
const exportTableToCSV = (customers: CustomerRiskDetail[], filename = 'clientes_riesgo.csv') => {
    const headers = ['ID', 'Nombre', 'Nivel de Cliente', 'País', 'Balance (€)', 'Riesgo (%)', 'Impacto Potencial (€)'];
    const rows = customers.map(c => [
        c.id,
        c.name,
        c.segment,
        c.country,
        c.balance,
        c.risk,
        Math.round(c.balance * (c.risk / 100)),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToCustomer }) => {
    // ── Data state ───────────────────────────────────────────────────────
    const [customers, setCustomers] = useState<CustomerDashboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // KPIs
    const [kpis, setKpis] = useState<DashboardKpis | null>(null);

    // ── Filter state (multi-select via Set) ─────────────────────────────
    const [filterCountries, setFilterCountries] = useState<Set<string>>(new Set());
    const [filterRisks, setFilterRisks] = useState<Set<string>>(new Set());
    const [filterSegments, setFilterSegments] = useState<Set<SegmentValue>>(new Set());

    const toggleCountry = (v: string) =>
        setFilterCountries(prev => { const s = new Set(prev); s.has(v) ? s.delete(v) : s.add(v); return s; });
    const toggleRisk = (v: string) =>
        setFilterRisks(prev => { const s = new Set(prev); s.has(v) ? s.delete(v) : s.add(v); return s; });
    const toggleSegment = (v: SegmentValue) =>
        setFilterSegments(prev => { const s = new Set(prev); s.has(v) ? s.delete(v) : s.add(v); return s; });

    // ── Debounce ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0);
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchTerm]);

    // Reset pagination on filter change
    useEffect(() => { setCurrentPage(0); }, [filterCountries, filterRisks, filterSegments]);

    // ── Fetch ────────────────────────────────────────────────────────────
    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const countryParam  = filterCountries.size === 1 ? [...filterCountries][0] : undefined;
            const riskParam     = filterRisks.size === 1    ? [...filterRisks][0]    : undefined;
            const segmentParam  = filterSegments.size === 1 ? [...filterSegments][0] : undefined;
            const data = await ChurnService.getCustomersPaginated(
                currentPage, PAGE_SIZE, debouncedSearch,
                countryParam,
                riskParam,
                segmentParam
            );
            setCustomers(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
            setKpis(data.kpis ? {
                ...data.kpis,
                capitalAtRisk: parseFloat(String(data.kpis.capitalAtRisk ?? 0)),
                totalCustomers: Number(data.kpis.totalCustomers ?? 0),
                customersAtRisk: Number(data.kpis.customersAtRisk ?? 0),
                retentionRate: parseFloat(String(data.kpis.retentionRate ?? 0)),
            } : null);
        } catch (e) {
            console.error('Error cargando clientes:', e);
            setError('Error al cargar los clientes. Verifica que el backend esté activo.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, filterCountries, filterRisks, filterSegments]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    // ── Derived data ─────────────────────────────────────────────────────
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    // Enhanced customers for table (filtros client-side para multi-select)
    const enhancedCustomers = useMemo((): CustomerRiskDetail[] => {
        if (loading || error) return [];
        let list = customers.map(c => ({
            id: c.id,
            name: c.name || `Cliente ${c.id}`,
            balance: c.balance,
            risk: c.risk,
            segment: segmentFromBalance(c.balance),
            country: c.country,
            products: c.products ?? 1,
            tenure: c.tenure ?? 0,
            since: c.since ?? 'N/A',
        }));
        if (filterCountries.size > 1) {
            list = list.filter(c => filterCountries.has(c.country));
        }
        if (filterRisks.size > 1) {
            list = list.filter(c => {
                const r = c.risk;
                return filterRisks.has('alto') && r > 70 ? true
                    : filterRisks.has('medio') && r > 45 && r <= 70 ? true
                        : filterRisks.has('bajo') && r <= 45 ? true
                            : false;
            });
        }
        // Segment filter is handled server-side; no client-side filtering needed.
        // Order is preserved from server (risk DESC — highest risk first).
        return list;
    }, [customers, loading, error, filterCountries, filterRisks, filterSegments]);

    // ── Pagination ───────────────────────────────────────────────────────
    const goToPage = (page: number) => { if (page >= 0 && page < totalPages) setCurrentPage(page); };

    const getPageNumbers = (): number[] => {
        const pages: number[] = [];
        const maxVisible = 5;
        let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages - 1, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleAnalyze = (customerId: number) => {
        if (onNavigateToCustomer) onNavigateToCustomer(customerId);
    };

    const clearAllFilters = () => {
        setFilterCountries(new Set());
        setFilterRisks(new Set());
        setFilterSegments(new Set());
        setSearchTerm('');
    };

    const hasActiveFilters = filterCountries.size > 0 || filterRisks.size > 0 || filterSegments.size > 0;

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════
    return (
        <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">

            {/* ─── 1. HEADER ─────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Módulo de Retención</h2>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Centro de Mando</h1>
                    <p className="text-sm text-slate-500 mt-1">Gestión operativa de clientes · Riesgo de fuga en tiempo real</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por Nombre o ID..."
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] w-full md:w-72 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => fetchCustomers()} className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                        🔄 Refrescar
                    </button>
                </div>
            </div>

            {/* ─── 2. FILTER PANEL (compact horizontal) ────────────────── */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-6">
                <div className="flex flex-wrap items-end gap-3">

                    {/* Label */}
                    <div className="flex items-center gap-1.5 mr-1">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtros</span>
                        {hasActiveFilters && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                                {filterCountries.size + filterRisks.size + filterSegments.size}
                            </span>
                        )}
                    </div>

                    {/* País */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🌍 País</label>
                        <select
                            value={filterCountries.size === 1 ? [...filterCountries][0] : ''}
                            onChange={e => {
                                const v = e.target.value;
                                setFilterCountries(v ? new Set([v]) : new Set());
                            }}
                            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px] shadow-sm"
                        >
                            <option value="">Todos los países</option>
                            {COUNTRY_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nivel de Riesgo */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">⚡ Riesgo</label>
                        <select
                            value={filterRisks.size === 1 ? [...filterRisks][0] : ''}
                            onChange={e => {
                                const v = e.target.value;
                                setFilterRisks(v ? new Set([v]) : new Set());
                            }}
                            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px] shadow-sm"
                        >
                            <option value="">Todos los niveles</option>
                            {RISK_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nivel de Cliente */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">👥 Patrimonio</label>
                        <select
                            value={filterSegments.size === 1 ? [...filterSegments][0] : ''}
                            onChange={e => {
                                const v = e.target.value as SegmentValue | '';
                                setFilterSegments(v ? new Set([v]) : new Set());
                            }}
                            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[170px] shadow-sm"
                        >
                            <option value="">Todos los niveles</option>
                            {SEGMENT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-300 rounded-lg px-3 py-2 transition-all shadow-sm bg-white"
                        >
                            <X className="w-3 h-3" /> Reset
                        </button>
                    )}
                </div>

                {/* Chips activos */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-slate-100">
                        {[...filterCountries].map(c => {
                            const opt = COUNTRY_OPTIONS.find(o => o.value === c);
                            return (
                                <span key={c} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                                    {opt?.label ?? c}
                                    <button onClick={() => toggleCountry(c)} className="hover:text-red-500 ml-0.5"><X className="w-3 h-3" /></button>
                                </span>
                            );
                        })}
                        {[...filterRisks].map(r => {
                            const opt = RISK_OPTIONS.find(o => o.value === r);
                            return (
                                <span key={r} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{ backgroundColor: opt?.bg, color: opt?.color }}>
                                    {opt?.label ?? r}
                                    <button onClick={() => toggleRisk(r)} className="hover:opacity-70 ml-0.5"><X className="w-3 h-3" /></button>
                                </span>
                            );
                        })}
                        {[...filterSegments].map(s => {
                            const opt = SEGMENT_OPTIONS.find(o => o.value === s);
                            return (
                                <span key={s} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{ backgroundColor: opt?.bg, color: opt?.color }}>
                                    {opt?.label ?? s}
                                    <button onClick={() => toggleSegment(s)} className="hover:opacity-70 ml-0.5"><X className="w-3 h-3" /></button>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="p-12 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
                        <span className="mt-4 block text-slate-600">Cargando clientes...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                    <p className="text-red-700 font-medium">⚠️ {error}</p>
                    <button onClick={() => fetchCustomers()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Reintentar
                    </button>
                </div>
            )}

            {/* ─── MAIN CONTENT ──────────────────────────────────────── */}
            {!loading && !error && (
                <>
                    {/* ─── 3. KPI CARDS ───────────────────────────────── */}
                    {hasActiveFilters && (
                        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600 flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5" />
                            Los KPIs reflejan el total global de la cartera, independientemente del filtro activo.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                        {/* Capital en Riesgo */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-50 rounded-lg"><DollarSign className="w-6 h-6 text-red-600" /></div>
                                <span className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1" /> Crítico</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Capital en Riesgo</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatMoney(kpis?.capitalAtRisk || 0)}</h3>
                        </div>

                        {/* Clientes en Alerta */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-50 rounded-lg"><Users className="w-6 h-6 text-orange-600" /></div>
                                <span className="flex items-center text-slate-500 text-xs font-medium bg-slate-50 px-2 py-1 rounded-full">de {(kpis?.totalCustomers || 0).toLocaleString('es-ES')} total</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Clientes en Zona de Fuga</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis?.customersAtRisk || 0}</h3>
                        </div>

                        {/* Total Clientes */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg"><AlertOctagon className="w-6 h-6 text-indigo-600" /></div>
                                <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">Base Activa</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Total Clientes en BD</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{(kpis?.totalCustomers || 0).toLocaleString('es-ES')}</h3>
                        </div>

                        {/* Tasa de Retención */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg"><TrendingDown className="w-6 h-6 text-emerald-600" /></div>
                                <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1" /> OK</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Tasa de Retención</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis?.retentionRate || 0}%</h3>
                        </div>
                    </div>

                    {/* ─── 4. PRIORITY TABLE ──────────────────────────── */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Clientes Priorizados por Riesgo de Fuga</h3>
                                <p className="text-sm text-slate-500">Ordenados por probabilidad de fuga (mayor riesgo primero)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 font-medium">
                                    Mostrando {enhancedCustomers.length} de {totalElements.toLocaleString('es-ES')}
                                    {debouncedSearch && <span className="ml-1 text-indigo-500">(búsqueda: "{debouncedSearch}")</span>}
                                </span>
                                {enhancedCustomers.length > 0 && (
                                    <button
                                        onClick={() => exportTableToCSV(enhancedCustomers)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Exportar CSV
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 bg-slate-50">Cliente / ID</th>
                                        <th className="px-6 py-4 bg-slate-50">Nivel de Cliente</th>
                                        <th className="px-6 py-4 bg-slate-50">País</th>
                                        <th className="px-6 py-4 bg-slate-50">Balance</th>
                                        <th className="px-6 py-4 bg-slate-50">Probabilidad Fuga</th>
                                        <th className="px-6 py-4 bg-slate-50 text-right">Impacto Potencial</th>
                                        <th className="px-6 py-4 bg-slate-50 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enhancedCustomers.map(client => (
                                        <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700">{client.name}</p>
                                                <p className="text-xs text-slate-400">ID: {client.id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const opt = SEGMENT_OPTIONS.find(o => o.value === client.segment);
                                                    return (
                                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                            style={{ backgroundColor: opt?.bg ?? '#F1F5F9', color: opt?.color ?? '#475569' }}
                                                            title={opt?.description}>
                                                            {opt?.label ?? client.segment}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{client.country}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{formatMoney(client.balance)}</td>
                                            <td className="px-6 py-4">
                                                {client.risk == null ? (
                                                    <span className="text-xs text-slate-400 italic">Sin predicción</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${client.risk > 70 ? 'bg-red-500' : client.risk > 45 ? 'bg-orange-400' : 'bg-green-500'}`}
                                                                style={{ width: `${client.risk}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${client.risk > 70 ? 'text-red-600' : client.risk > 45 ? 'text-orange-500' : 'text-green-600'}`}>
                                                            {client.risk}%
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                {client.risk == null ? '—' : formatMoney(client.balance * (client.risk / 100))}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleAnalyze(client.id)}
                                                    className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-[#0F172A] hover:text-white transition-all shadow-sm font-medium"
                                                >
                                                    Analizar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty States */}
                        {totalElements === 0 && !debouncedSearch ? (
                            <div className="text-center py-16">
                                <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No se encontraron clientes</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                    No hay datos provenientes del backend. Verifica que la base de datos esté poblada y el servicio Java esté corriendo en el puerto 8080.
                                </p>
                            </div>
                        ) : totalElements === 0 && debouncedSearch ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No hay resultados para "{debouncedSearch}"</p>
                            </div>
                        ) : null}

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="text-sm text-slate-500">
                                    Página {currentPage + 1} de {totalPages} • {totalElements.toLocaleString('es-ES')} clientes totales
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => goToPage(0)} disabled={currentPage === 0}
                                        className="p-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Primera página">
                                        <ChevronsLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}
                                        className="p-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Página anterior">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {getPageNumbers().map(page => (
                                        <button key={page} onClick={() => goToPage(page)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}>
                                            {page + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                                        className="p-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Página siguiente">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => goToPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}
                                        className="p-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Última página">
                                        <ChevronsRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>📊 Datos en tiempo real · KPIs server-side · Paginación: {PAGE_SIZE}/página</p>
            </div>
        </div>
    );
};

// Export scatterData derivation helpers for use in RiskIntelligencePage
export { SEGMENT_OPTIONS, RISK_THRESHOLD, BALANCE_THRESHOLD, getQuadrant, segmentFromBalance };
export type { DashboardPageProps };
export default DashboardPage;
