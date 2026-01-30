import { Card } from '@shared/components/ui/card';
import { UserHeader } from '../components/UserHeader';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import {
    TrendingDown,
    TrendingUp,
    Users,
    DollarSign,
    AlertTriangle,
    Activity,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2
} from 'lucide-react';
import {
    modelMetrics,
    distributionData,
    riskLevelData,
    trendData,
    highRiskClients
} from '../utils/mockData';

const COLORS = {
    Crítico: '#1e40af',
    Alto: '#3b82f6',
    Medio: '#60a5fa',
    Bajo: '#93c5fd'
};

export function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* User Header */}
            <UserHeader
                userName="Administrador"
                title="Panel de Control"
                subtitle="Monitoreo y análisis predictivo de riesgo de morosidad"
            />

            {/* Métricas principales - Diseño Fintech moderno */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>+12%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Total Clientes</p>
                        <p className="text-3xl text-zinc-900 mb-1">{modelMetrics.totalClientes.toLocaleString()}</p>
                        <p className="text-xs text-zinc-400">Cartera activa</p>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>+5%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Clientes en Riesgo</p>
                        <p className="text-3xl text-zinc-900 mb-1">{modelMetrics.clientesEnRiesgo.toLocaleString()}</p>
                        <p className="text-xs text-zinc-400">
                            {Math.round((modelMetrics.clientesEnRiesgo / modelMetrics.totalClientes) * 100)}% del total
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>+8%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Exposición al Riesgo</p>
                        <p className="text-3xl text-zinc-900 mb-1">
                            ${(modelMetrics.dineroEnRiesgo / 1000).toFixed(1)}K
                        </p>
                        <p className="text-xs text-zinc-400">Próximas cuotas</p>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingDown className="w-3 h-3" />
                            <span>-2%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Tasa de Morosidad</p>
                        <p className="text-3xl text-zinc-900 mb-1">{modelMetrics.tasaMorosidadPredicha}%</p>
                        <p className="text-xs text-zinc-400">Predicción mensual</p>
                    </div>
                </Card>
            </div>

            {/* Rendimiento del modelo - Versión minimalista */}
            <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-lg text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl">Rendimiento del Modelo ML</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-blue-100">Precisión</p>
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl">{modelMetrics.precision}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full shadow-lg"
                                style={{ width: `${modelMetrics.precision}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-blue-100">Recall</p>
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl">{modelMetrics.recall}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full shadow-lg"
                                style={{ width: `${modelMetrics.recall}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-blue-100">F1-Score</p>
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl">{modelMetrics.f1Score}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full shadow-lg"
                                style={{ width: `${modelMetrics.f1Score}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Gráficos - Diseño limpio y moderno */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendencia temporal - Area chart más moderno */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Tendencia de Morosidad</h3>
                            <p className="text-xs text-zinc-500 mt-1">Últimos 6 meses</p>
                        </div>
                        <Activity className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorMorosidad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPrediccion" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="mes"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="morosidad"
                                stroke="#ef4444"
                                fill="url(#colorMorosidad)"
                                strokeWidth={2}
                                name="Real"
                            />
                            <Area
                                type="monotone"
                                dataKey="prediccion"
                                stroke="#3b82f6"
                                fill="url(#colorPrediccion)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Predicción"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Distribución de probabilidades */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Distribución de Riesgo</h3>
                            <p className="text-xs text-zinc-500 mt-1">Probabilidad de pago</p>
                        </div>
                        <TrendingDown className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={distributionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="rango"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="cantidad"
                                fill="#3b82f6"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Clientes por nivel de riesgo - Mejorado */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Segmentación por Riesgo</h3>
                            <p className="text-xs text-zinc-500 mt-1">Distribución de clientes</p>
                        </div>
                        <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={riskLevelData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.nivel}`}
                                outerRadius={90}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey="cantidad"
                                paddingAngle={2}
                            >
                                {riskLevelData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.nivel as keyof typeof COLORS]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Leyenda personalizada */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {riskLevelData.map((item) => (
                            <div key={item.nivel} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[item.nivel as keyof typeof COLORS] }}
                                />
                                <div className="text-xs">
                                    <span className="text-zinc-600">{item.nivel}</span>
                                    <span className="text-zinc-400 ml-1">({item.cantidad})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Exposición financiera */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg text-zinc-900">Exposición Financiera</h3>
                            <p className="text-xs text-zinc-500 mt-1">Por nivel de riesgo</p>
                        </div>
                        <DollarSign className="w-5 h-5 text-zinc-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={riskLevelData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                type="number"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                dataKey="nivel"
                                type="category"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                formatter={(value) => `$${Number(value).toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar dataKey="dinero" radius={[0, 8, 8, 0]}>
                                {riskLevelData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.nivel as keyof typeof COLORS]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Tabla de clientes de alto riesgo - Diseño moderno */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg text-zinc-900">Clientes de Alto Riesgo</h3>
                                <p className="text-xs text-zinc-500 mt-1">Casos que requieren atención inmediata</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider">Cliente</th>
                                <th className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider">Prob. Pago</th>
                                <th className="text-left py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider">Nivel</th>
                                <th className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider">Monto</th>
                                <th className="text-right py-4 px-6 text-xs text-zinc-500 uppercase tracking-wider">Atrasos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {highRiskClients.map((client) => (
                                <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="text-sm text-zinc-900">{client.nombre}</p>
                                            <p className="text-xs text-zinc-500">ID: {client.id}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-sm text-zinc-900">{client.probabilidadPago.toFixed(1)}%</span>
                                            {client.probabilidadPago < 30 ? (
                                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <ArrowUpRight className="w-4 h-4 text-orange-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs text-white"
                                            style={{ backgroundColor: COLORS[client.nivelRiesgo] }}
                                        >
                                            {client.nivelRiesgo}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="text-sm text-zinc-900">
                                            ${client.montoCuota.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`text-sm ${client.cuotasAtrasadas > 2 ? 'text-red-600' : 'text-orange-600'}`}>
                                            {client.cuotasAtrasadas}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Insights estratégicos - Rediseñado */}
            <Card className="p-6 bg-zinc-50 border-0">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg text-zinc-900">Insights Estratégicos</h3>
                        <p className="text-xs text-zinc-500 mt-1">Recomendaciones basadas en análisis predictivo</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-blue-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                Contactar proactivamente a los <span className="font-medium text-blue-600">{modelMetrics.clientesEnRiesgo} clientes</span> en riesgo para ofrecer opciones de refinanciamiento.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-blue-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                Priorizar seguimiento a clientes con probabilidad {'<'} 25% para minimizar pérdidas de <span className="font-medium text-blue-600">${modelMetrics.dineroEnRiesgo.toLocaleString()}</span>.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-blue-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                Implementar plan de incentivos para clientes con riesgo medio que pueden mejorar su comportamiento de pago.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-lg">
                        <div className="w-1 bg-blue-600 rounded-full" />
                        <div>
                            <p className="text-sm text-zinc-700">
                                El modelo muestra alta precisión (<span className="font-medium text-blue-600">{modelMetrics.precision}%</span>), permitiendo decisiones confiables.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
