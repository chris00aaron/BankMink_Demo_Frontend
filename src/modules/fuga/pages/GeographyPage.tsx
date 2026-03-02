import React, { useEffect, useState } from 'react';
import { Globe, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { ChurnService } from '../churn.service';
import { GeographyStats } from '../types';



const GeographyPage: React.FC = () => {
    const [countryData, setCountryData] = useState<GeographyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<GeographyStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await ChurnService.getGeographyStats();
                setCountryData(data);
            } catch (err) {
                console.error("Error fetching geography stats:", err);
                setError("No se pudieron cargar los datos geográficos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalCustomers = countryData.reduce((sum, c) => sum + c.totalCustomers, 0);
    const totalHighRisk = countryData.reduce((sum, c) => sum + c.highRisk, 0);

    // Función para obtener color según tasa de fuga
    const getColorByChurn = (rate: number) => {
        if (rate > 25) return '#ef4444'; // Red-500
        if (rate > 15) return '#f97316'; // Orange-500
        if (rate > 10) return '#eab308'; // Yellow-500
        return '#22c55e'; // Green-500
    };

    // Componente interno de Mapa SVG Simplificado
    const EuropeMap = () => {
        // Datos unidos con SVG paths
        const mapConfig = [
            {
                id: 'Spain',
                names: ['Spain', 'España'],
                d: "M220 380 L280 370 L300 390 L310 360 L340 350 L320 300 L260 300 L210 320 Z", // Forma aproximada España
                cx: 270, cy: 340
            },
            {
                id: 'France',
                names: ['France', 'Francia'],
                d: "M280 300 L340 350 L380 330 L400 280 L380 220 L320 230 L280 280 Z", // Forma aproximada Francia
                cx: 340, cy: 280
            },
            {
                id: 'Germany',
                names: ['Germany', 'Alemania'],
                d: "M380 220 L400 280 L440 290 L460 250 L440 190 L400 180 Z", // Forma aproximada Alemania
                cx: 420, cy: 240
            }
        ];

        return (
            <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-xl filter">
                {/* Background Ocean/Map Area */}
                <rect width="600" height="500" fill="#f8fafc" />

                {mapConfig.map((geo) => {
                    // Buscar datos reales
                    const stats = countryData.find(c => geo.names.includes(c.country));
                    const churnRate = stats ? stats.churnRate : 0;
                    const fill = stats ? getColorByChurn(churnRate) : '#cbd5e1';

                    return (
                        <g
                            key={geo.id}
                            onMouseEnter={() => stats && setHoveredCountry(stats)}
                            onMouseLeave={() => setHoveredCountry(null)}
                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                        >
                            <path
                                d={geo.d}
                                fill={fill}
                                stroke="white"
                                strokeWidth="2"
                                className="hover:opacity-80 transition-opacity"
                            />
                            {/* Etiqueta País */}
                            <text x={geo.cx} y={geo.cy} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                                {geo.names[0]}
                            </text>
                            {/* Etiqueta % */}
                            <text x={geo.cx} y={geo.cy + 15} textAnchor="middle" fill="white" fontSize="10" style={{ pointerEvents: 'none' }}>
                                {stats ? `${stats.churnRate.toFixed(1)}%` : 'N/A'}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
                    <span className="mt-4 block text-slate-600">Cargando mapa de riesgo...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                    <AlertCircle className="text-red-600 w-6 h-6" />
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Distribución Geográfica</h1>
                    <p className="text-slate-500 mt-1">Análisis de riesgo de fuga por ubicación (Datos en tiempo real)</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase">Total Clientes</p>
                        <p className="text-2xl font-bold text-slate-800">{totalCustomers.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600 uppercase">Alto Riesgo Global</p>
                        <p className="text-2xl font-bold text-red-600">{totalHighRisk.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Mapa Coroplético */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Columna Izquierda: Mapa */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">Mapa de Riesgo (EMEA)</h2>
                                <p className="text-sm text-slate-500">Color indica tasa de fuga.</p>
                            </div>
                        </div>
                        {hoveredCountry && (
                            <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-fade-in">
                                <strong>{hoveredCountry.country}:</strong> {hoveredCountry.churnRate.toFixed(1)}% Fuga
                            </div>
                        )}
                    </div>

                    <div className="h-96 w-full bg-slate-50 rounded-lg border border-slate-100 relative">
                        <EuropeMap />

                        {/* Leyenda del Mapa */}
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm text-xs">
                            <p className="font-bold text-slate-700 mb-2">Nivel de Riesgo</p>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>Bajo (&lt;10%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span>Medio (10-15%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                    <span>Alto (15-25%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span>Crítico (&gt;25%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Detalles */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ranking de Fuga</h3>
                        <div className="space-y-4">
                            {countryData.sort((a, b) => b.churnRate - a.churnRate).map((country, idx) => (
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

                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-800 text-sm">Análisis Regional</h4>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    Las regiones con colores cálidos (Naranja/Rojo) requieren intervención inmediata.
                                    Revise las políticas de precios en esas zonas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mapa Visual (Cards) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold text-slate-800">Mapa de Riesgo por Región</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {countryData.map((country) => {
                        const riskPercent = (country.highRisk / country.totalCustomers) * 100;
                        const riskColor = riskPercent > 25 ? 'from-red-500 to-red-600'
                            : riskPercent > 15 ? 'from-yellow-500 to-yellow-600'
                                : 'from-green-500 to-green-600';

                        return (
                            <div
                                key={country.countryCode}
                                className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{country.flag}</span>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{country.country}</h3>
                                            <p className="text-sm text-slate-500">{country.totalCustomers.toLocaleString()} clientes</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${riskColor} text-white text-sm font-medium`}>
                                        {country.churnRate.toFixed(1)}% fuga
                                    </div>
                                </div>

                                {/* Barras de riesgo */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 w-16">Alto</span>
                                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 rounded-full transition-all"
                                                style={{ width: `${(country.highRisk / country.totalCustomers) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 w-12">{country.highRisk}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 w-16">Medio</span>
                                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500 rounded-full transition-all"
                                                style={{ width: `${(country.mediumRisk / country.totalCustomers) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 w-12">{country.mediumRisk}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 w-16">Bajo</span>
                                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all"
                                                style={{ width: `${(country.lowRisk / country.totalCustomers) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 w-12">{country.lowRisk}</span>
                                    </div>
                                </div>

                                {/* Balance promedio */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Balance Promedio</span>
                                        <span className="font-semibold text-slate-700">€{country.avgBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Insights */}
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
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
        </div>
    );
};

export default GeographyPage;
