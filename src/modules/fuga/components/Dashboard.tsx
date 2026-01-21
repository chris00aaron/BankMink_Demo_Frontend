import { useState, useMemo } from 'react';
import { TrendingDown, Search, Target, Shield, AlertCircle } from 'lucide-react';
import { Customer, RiskLevel } from '../types';
import { mockCustomers, calculateMetrics } from '../data/mockData';

interface DashboardProps {
    onViewExplanation: (customer: Customer) => void;
}

export function Dashboard({ onViewExplanation }: DashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
    const [countryFilter, setCountryFilter] = useState<string>('all');

    const metrics = useMemo(() => calculateMetrics(), []);

    // Filtrar clientes
    const filteredCustomers = useMemo(() => {
        return mockCustomers.filter(customer => {
            // Búsqueda por ID o nombre
            const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.customerId.toString().includes(searchQuery);

            // Filtro de riesgo
            let matchesRisk = true;
            if (riskFilter !== 'all') {
                if (riskFilter === 'high') matchesRisk = customer.churnScore > 0.80;
                else if (riskFilter === 'medium') matchesRisk = customer.churnScore >= 0.50 && customer.churnScore <= 0.80;
                else if (riskFilter === 'low') matchesRisk = customer.churnScore < 0.50;
            }

            // Filtro de país
            const matchesCountry = countryFilter === 'all' || customer.country === countryFilter;

            return matchesSearch && matchesRisk && matchesCountry;
        });
    }, [searchQuery, riskFilter, countryFilter]);

    const getRiskLevel = (score: number): RiskLevel => {
        if (score > 0.80) return 'high';
        if (score >= 0.50) return 'medium';
        return 'low';
    };

    const getRiskColor = (level: RiskLevel) => {
        const colors = {
            high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-500' },
            medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', bar: 'bg-yellow-500' },
            low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', bar: 'bg-green-500' },
        };
        return colors[level];
    };

    return (
        <div className="space-y-6 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>
                    Centro de Mando – Fuga de Clientes
                </h1>
                <p className="text-gray-600">
                    Análisis predictivo en tiempo real para decisiones comerciales proactivas
                </p>
            </div>

            {/* KPIs Ejecutivos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tasa de Fuga Activa */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                            <TrendingDown className="w-6 h-6" style={{ color: '#EF4444' }} />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-50 border border-red-200" style={{ color: '#EF4444' }}>
                            Crítico
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Tasa de Fuga Activa</p>
                    <p className="text-4xl font-bold mb-2" style={{ color: '#0F172A' }}>
                        {metrics.activeChurnRate}%
                    </p>
                    <p className="text-xs" style={{ color: '#EF4444' }}>
                        {mockCustomers.filter(c => c.churnScore > 0.80).length} clientes en riesgo crítico
                    </p>
                </div>

                {/* Capital en Riesgo */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                            <Target className="w-6 h-6" style={{ color: '#F59E0B' }} />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 border border-yellow-200" style={{ color: '#F59E0B' }}>
                            Alto Impacto
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Capital en Riesgo Crítico</p>
                    <p className="text-4xl font-bold mb-2" style={{ color: '#0F172A' }}>
                        €{(metrics.capitalAtRisk / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-gray-600">
                        Suma de balances con probabilidad {'>'} 0.80
                    </p>
                </div>

                {/* Confianza del Modelo */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                            <Shield className="w-6 h-6" style={{ color: '#22C55E' }} />
                        </div>
                        <button
                            className="text-xs px-2 py-1 rounded-full bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-help"
                            style={{ color: '#22C55E' }}
                            title="Alta confiabilidad para toma de decisiones comerciales"
                        >
                            ℹ️ Info
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Confianza del Modelo Predictivo</p>
                    <p className="text-4xl font-bold mb-2" style={{ color: '#0F172A' }}>
                        {metrics.modelConfidence}%
                    </p>
                    <p className="text-xs" style={{ color: '#22C55E' }}>
                        F1-Score - Alta precisión
                    </p>
                </div>
            </div>

            {/* Buscador Inteligente y Filtros */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="🔎 Buscar por ID o Nombre del Cliente"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Filtro de Riesgo */}
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        style={{ color: '#0F172A' }}
                    >
                        <option value="all">Todos los Riesgos</option>
                        <option value="high">🔴 Alto Riesgo</option>
                        <option value="medium">🟡 Riesgo Medio</option>
                        <option value="low">🟢 Bajo Riesgo</option>
                    </select>

                    {/* Filtro de País */}
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        style={{ color: '#0F172A' }}
                    >
                        <option value="all">Todos los Países</option>
                        <option value="Francia">🇫🇷 Francia</option>
                        <option value="España">🇪🇸 España</option>
                        <option value="Alemania">🇩🇪 Alemania</option>
                    </select>
                </div>

                {/* Contador de resultados */}
                <div className="mt-3 text-sm text-gray-600">
                    Mostrando <span className="font-semibold">{filteredCustomers.length}</span> de {mockCustomers.length} clientes
                </div>
            </div>

            {/* Tabla de Clientes - Risk List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#0F172A' }}>
                    <h2 className="text-xl font-semibold text-white">Lista de Riesgo – Clientes Monitoreados</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Puntaje Crédito</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Edad</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">País</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score de Fuga</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCustomers.map((customer) => {
                                const riskLevel = getRiskLevel(customer.churnScore);
                                const colors = getRiskColor(riskLevel);

                                return (
                                    <tr
                                        key={customer.customerId}
                                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium" style={{ color: '#0F172A' }}>
                                                #{customer.customerId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium" style={{ color: '#0F172A' }}>
                                                    {customer.name}
                                                </span>
                                                {!customer.isActive && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">{customer.creditScore}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">{customer.age} años</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                                €{customer.balance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">
                                                {customer.country === 'Francia' && '🇫🇷'}
                                                {customer.country === 'España' && '🇪🇸'}
                                                {customer.country === 'Alemania' && '🇩🇪'}
                                                {' '}{customer.country}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                                        {(customer.churnScore * 100).toFixed(0)}%
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                        {riskLevel === 'high' ? 'Alto' : riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full ${colors.bar} transition-all duration-300`}
                                                        style={{ width: `${customer.churnScore * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onViewExplanation(customer)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded-lg text-sm font-medium text-white hover:shadow-lg transform hover:scale-105 transition-all"
                                                style={{ backgroundColor: '#0F172A' }}
                                            >
                                                Ver Explicación
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">No se encontraron clientes con los filtros aplicados</p>
                    </div>
                )}
            </div>
        </div>
    );
}
