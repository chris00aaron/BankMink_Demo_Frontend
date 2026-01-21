import { MapPin, AlertTriangle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { countryStats } from '../data/mockData';

export function Geography() {
    // Transformar datos para el gráfico
    const chartData = countryStats.map(stat => ({
        country: stat.country,
        'Activos': stat.activeMembers,
        'Inactivos': stat.inactiveMembers,
    }));

    // Detectar zona crítica
    const criticalCountry = countryStats.find(c => c.churnRate > 45);

    return (
        <div className="space-y-6 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>
                    Geografía & Segmentos de Fuga
                </h1>
                <p className="text-gray-600">
                    Análisis regional de riesgo y distribución de clientes por localidad
                </p>
            </div>

            {/* Alerta de Zona Crítica */}
            {criticalCountry && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-900 mb-1">⚠️ Zona Crítica Detectada</h3>
                            <p className="text-sm text-red-800">
                                <span className="font-bold">{criticalCountry.country}</span> presenta una tasa de fuga del{' '}
                                <span className="font-bold">{criticalCountry.churnRate}%</span>, superando el umbral crítico del 45%.
                                Se recomienda acción comercial inmediata en esta región.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mapa Interactivo */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6" style={{ color: '#0F172A' }} />
                    <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>
                        Mapa de Riesgo por Localidad
                    </h2>
                </div>

                {/* Mapa Simplificado de Europa */}
                <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-gray-300 overflow-hidden">
                    {/* Indicadores de países */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full max-w-4xl">
                            {/* Francia - Centro izquierda */}
                            <div
                                className="absolute cursor-pointer group"
                                style={{ left: '30%', top: '45%' }}
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 ${countryStats.find(c => c.country === 'Francia')!.churnRate > 45
                                    ? 'bg-red-500 animate-pulse'
                                    : 'bg-green-500'
                                    }`}>
                                    <span className="text-3xl">🇫🇷</span>
                                </div>
                                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-xl p-3 whitespace-nowrap z-10">
                                    <p className="font-semibold" style={{ color: '#0F172A' }}>Francia</p>
                                    <p className="text-sm text-gray-600">Tasa de Fuga: {countryStats.find(c => c.country === 'Francia')!.churnRate}%</p>
                                    <p className="text-xs text-gray-500">
                                        Activos: {countryStats.find(c => c.country === 'Francia')!.activeMembers.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* España - Abajo izquierda */}
                            <div
                                className="absolute cursor-pointer group"
                                style={{ left: '25%', top: '65%' }}
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 ${countryStats.find(c => c.country === 'España')!.churnRate > 45
                                    ? 'bg-red-500 animate-pulse'
                                    : 'bg-green-500'
                                    }`}>
                                    <span className="text-3xl">🇪🇸</span>
                                </div>
                                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-xl p-3 whitespace-nowrap z-10">
                                    <p className="font-semibold" style={{ color: '#0F172A' }}>España</p>
                                    <p className="text-sm text-gray-600">Tasa de Fuga: {countryStats.find(c => c.country === 'España')!.churnRate}%</p>
                                    <p className="text-xs text-gray-500">
                                        Activos: {countryStats.find(c => c.country === 'España')!.activeMembers.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Alemania - Centro derecha (CRÍTICA) */}
                            <div
                                className="absolute cursor-pointer group"
                                style={{ left: '60%', top: '35%' }}
                            >
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110 ${countryStats.find(c => c.country === 'Alemania')!.churnRate > 45
                                    ? 'bg-red-500 animate-pulse ring-4 ring-red-300'
                                    : 'bg-green-500'
                                    }`}>
                                    <span className="text-4xl">🇩🇪</span>
                                </div>
                                {countryStats.find(c => c.country === 'Alemania')!.churnRate > 45 && (
                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                                        ⚠️ CRÍTICO
                                    </div>
                                )}
                                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-xl p-3 whitespace-nowrap z-10 border-2 border-red-500">
                                    <p className="font-semibold text-red-600">⚠️ Alemania - Zona Crítica</p>
                                    <p className="text-sm text-red-700 font-bold">Tasa de Fuga: {countryStats.find(c => c.country === 'Alemania')!.churnRate}%</p>
                                    <p className="text-xs text-gray-600">
                                        Activos: {countryStats.find(c => c.country === 'Alemania')!.activeMembers.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">Alta competencia regional</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leyenda del mapa */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold mb-2" style={{ color: '#0F172A' }}>Nivel de Riesgo</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-700">Normal ({'<'}45%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-gray-700">Crítico ({'>'}45%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparativa por País - Gráfico de Barras */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6" style={{ color: '#0F172A' }} />
                    <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>
                        Comparativa de Miembros por País
                    </h2>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="country"
                            tick={{ fill: '#0F172A', fontSize: 14 }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            label={{ value: 'Número de Clientes', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar dataKey="Activos" fill="#22C55E" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Inactivos" fill="#EF4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>

                {/* Tabla de Estadísticas */}
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">País</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Activos</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Inactivos</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tasa de Fuga</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {countryStats.map((stat) => (
                                <tr key={stat.country} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium" style={{ color: '#0F172A' }}>
                                            {stat.country === 'Francia' && '🇫🇷'}
                                            {stat.country === 'España' && '🇪🇸'}
                                            {stat.country === 'Alemania' && '🇩🇪'}
                                            {' '}{stat.country}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-green-600 font-semibold">{stat.activeMembers.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-red-600 font-semibold">{stat.inactiveMembers.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-semibold" style={{ color: '#0F172A' }}>
                                            {(stat.activeMembers + stat.inactiveMembers).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${stat.churnRate > 45 ? 'text-red-600' : 'text-green-600'}`}>
                                                {stat.churnRate}%
                                            </span>
                                            {stat.churnRate > 45 && (
                                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-300">
                                                    Crítico
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
