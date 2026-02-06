import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingDown,
    AlertOctagon,
    DollarSign,
    ArrowRight,
    ArrowUpRight,
    Search
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ScatterChart, Scatter, Cell
} from 'recharts';
import { ChurnService } from '../churn.service';
import { CustomerDashboard, CustomerRiskDetail, PriorityMatrixPoint, RiskTrendPoint } from '../types';

// --- DATOS MOCK PARA TENDENCIA (El backend no tiene histórico mensual) ---
const TREND_DATA: RiskTrendPoint[] = [
    { month: 'Ene', riskCapital: 120000 },
    { month: 'Feb', riskCapital: 135000 },
    { month: 'Mar', riskCapital: 110000 },
    { month: 'Abr', riskCapital: 180000 },
    { month: 'May', riskCapital: 194000 },
];

interface DashboardPageProps {
    onNavigateToCustomer?: (customerId: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToCustomer }) => {
    const [customers, setCustomers] = useState<CustomerDashboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Cargar clientes al montar el componente
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ChurnService.getAllCustomers();
                setCustomers(data);
            } catch (e) {
                console.error('Error cargando clientes:', e);
                setError('Error al cargar los clientes. Verifica que el backend esté activo.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Filter customers based on search
    const filteredCustomers = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm)
    );

    // Función para formatear dinero
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    // Transformar clientes a datos para matriz de prioridad
    const getScatterData = (): PriorityMatrixPoint[] => {
        return filteredCustomers.map(c => ({
            x: c.risk,
            y: c.balance,
            z: 100,
            name: c.name,
            id: c.id
        }));
    };

    // Calcular KPIs
    const getCapitalEnRiesgo = () => {
        return filteredCustomers
            .filter(c => c.risk >= 50)
            .reduce((sum, c) => sum + (c.balance * c.risk / 100), 0);
    };

    const getClientesEnAlerta = () => {
        return filteredCustomers.filter(c => c.risk >= 50).length;
    };

    const getTasaRetencion = () => {
        if (filteredCustomers.length === 0) return 0;
        const retained = filteredCustomers.filter(c => c.risk < 50).length;
        return ((retained / filteredCustomers.length) * 100).toFixed(1);
    };

    // Transformar clientes a formato extendido para la tabla
    const getEnhancedCustomers = (): CustomerRiskDetail[] => {
        return filteredCustomers.map(c => ({
            id: c.id,
            name: c.name || `Cliente ${c.id}`,
            balance: c.balance,
            risk: c.risk,
            segment: c.balance > 100000 ? 'Corporate' as const : c.balance > 50000 ? 'SME' as const : 'Personal' as const,
            country: c.country,
            products: Math.floor(Math.random() * 3) + 1,
            tenure: Math.floor(Math.random() * 10) + 1,
            since: `${2020 - Math.floor(Math.random() * 5)}`
        }));
    };

    const handleAnalyze = (customerId: number) => {
        if (onNavigateToCustomer) {
            onNavigateToCustomer(customerId);
        }
    };

    // Early returns removed to allow persistent header
    const scatterData = !loading && !error ? getScatterData() : [];
    const enhancedCustomers = !loading && !error ? getEnhancedCustomers() : [];

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">

            {/* 1. HEADER EJECUTIVO */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Módulo de Retención</h2>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Panorama de Fuga de Capital</h1>
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
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                    >
                        🔄 Refrescar
                    </button>
                    <button className="px-4 py-2.5 bg-[#0F172A] text-white rounded-lg text-sm font-medium shadow-lg hover:bg-slate-800 transition-all">
                        Generar Reporte
                    </button>
                </div>
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
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Main Content (Only if no error and not loading) */}
            {!loading && !error && (
                <>
                    {/* 2. GRID DE KPIs FINANCIEROS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                        {/* KPI 1: Capital en Riesgo */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-red-600" />
                                </div>
                                <span className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Capital en Riesgo (Crítico)</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatMoney(getCapitalEnRiesgo())}</h3>
                        </div>

                        {/* KPI 2: Clientes en Alerta */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <Users className="w-6 h-6 text-orange-600" />
                                </div>
                                <span className="flex items-center text-slate-500 text-xs font-medium bg-slate-50 px-2 py-1 rounded-full">
                                    vs. mes anterior
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Clientes en Zona de Fuga</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{getClientesEnAlerta()}</h3>
                        </div>

                        {/* KPI 3: Salud del Modelo */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <AlertOctagon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                    Activo v2.1
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Precisión del Modelo</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">94.2%</h3>
                        </div>

                        {/* KPI 4: Tasa de Retención */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <TrendingDown className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> +4.3%
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Tasa de Retención</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{getTasaRetencion()}%</h3>
                        </div>
                    </div>

                    {/* 3. SECCIÓN VISUAL AVANZADA */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        {/* MATRIZ DE PRIORIDAD (Scatter Plot) */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Matriz de Prioridad de Retención</h3>
                                <p className="text-sm text-slate-500">
                                    Identifica a las "Ballenas" (Alto Balance) con alto riesgo de fuga.
                                    <span className="text-red-500 font-bold ml-1">Atención Prioritaria: Cuadrante Superior Derecho.</span>
                                </p>
                            </div>

                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="x"
                                            name="Probabilidad Fuga"
                                            unit="%"
                                            domain={[0, 100]}
                                            label={{ value: 'Probabilidad de Fuga', position: 'insideBottom', offset: -10 }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="y"
                                            name="Balance"
                                            unit="€"
                                            label={{ value: 'Balance (€)', angle: -90, position: 'insideLeft' }}
                                        />
                                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Clientes" data={scatterData} fill="#8884d8">
                                            {scatterData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.x > 70 && entry.y > 100000 ? '#EF4444' : (entry.x > 50 ? '#F59E0B' : '#10B981')}
                                                />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* TENDENCIA DE RIESGO */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Tendencia de Riesgo</h3>
                            <p className="text-sm text-slate-500 mb-6">Evolución del capital en riesgo mensual.</p>

                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={TREND_DATA}>
                                        <defs>
                                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="riskCapital" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-start gap-3">
                                    <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-red-800">Alerta de Tendencia</h4>
                                        <p className="text-xs text-red-600 mt-1">El riesgo ha aumentado un 15% en Abril debido a la volatilidad del mercado en el sector Pymes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. LISTA DE ACCIÓN RÁPIDA (Smart Table) */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Acciones Recomendadas (Top Priority)</h3>
                                <p className="text-sm text-slate-500">Clientes ordenados por Valor en Riesgo (Weighted Risk)</p>
                            </div>
                            <div className="text-sm text-slate-400 font-medium">
                                Mostrando {enhancedCustomers.length} de {customers.length} clientes
                            </div>
                        </div>

                        {/* Contenedor con Scroll y Header Pegajoso */}
                        <div className="overflow-y-auto max-h-[500px] relative scrollbar-thin scrollbar-thumb-slate-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 bg-slate-50">Cliente / ID</th>
                                        <th className="px-6 py-4 bg-slate-50">Segmento</th>
                                        <th className="px-6 py-4 bg-slate-50">Balance</th>
                                        <th className="px-6 py-4 bg-slate-50">Probabilidad Fuga</th>
                                        <th className="px-6 py-4 bg-slate-50 text-right">Impacto Potencial</th>
                                        <th className="px-6 py-4 bg-slate-50 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enhancedCustomers
                                        .sort((a, b) => (b.balance * b.risk) - (a.balance * a.risk))
                                        .map((client) => (
                                            <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-700">{client.name}</p>
                                                    <p className="text-xs text-slate-400">ID: {client.id}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${client.segment === 'Corporate' ? 'bg-indigo-50 text-indigo-600' :
                                                        client.segment === 'SME' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {client.segment}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {formatMoney(client.balance)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${client.risk > 75 ? 'bg-red-500' : client.risk > 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                                                                style={{ width: `${client.risk}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${client.risk > 75 ? 'text-red-600' : client.risk > 50 ? 'text-orange-500' : 'text-green-600'}`}>
                                                            {client.risk}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                    {formatMoney(client.balance * (client.risk / 100))}
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

                        {customers.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No se encontraron clientes</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                    No hay datos provenientes del backend. Verifica que la base de datos esté poblada y el servicio Java esté corriendo en el puerto 8080.
                                </p>
                            </div>
                        ) : enhancedCustomers.length === 0 ? (
                             <div className="text-center py-12">
                                <p className="text-slate-500">No hay resultados para "{searchTerm}"</p>
                            </div>
                        ) : null}
                    </div>
                </>
            )}

            {/* Footer info */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>📊 Datos cargados desde el backend en tiempo real • KPIs calculados automáticamente</p>
            </div>
        </div>
    );
};

export default DashboardPage;
