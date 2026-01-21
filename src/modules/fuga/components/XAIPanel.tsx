import { X, TrendingDown, Lightbulb, Target, BarChart3 } from 'lucide-react';
import { Customer } from '../types';
import { xaiFactorsByCustomer, actionRecommendations } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface XAIPanelProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
}

export function XAIPanel({ customer, isOpen, onClose }: XAIPanelProps) {
    if (!isOpen || !customer) return null;

    // Obtener factores XAI (usar genéricos si no existen específicos)
    const xaiFactors = xaiFactorsByCustomer[customer.customerId] || [
        { factor: 'Baja actividad transaccional', impact: 30, description: `Actividad: ${customer.transactionActivity}`, color: '#ef4444' },
        { factor: `Edad: ${customer.age} años`, impact: 22, description: 'Segmento con tendencia a cambiar de banco', color: '#f97316' },
        { factor: `País: ${customer.country}`, impact: 18, description: 'Competencia bancaria regional', color: '#f59e0b' },
        { factor: `Puntaje de crédito: ${customer.creditScore}`, impact: 15, description: 'Indica estabilidad financiera', color: '#eab308' },
        { factor: `${customer.numOfProducts} producto(s)`, impact: 10, description: 'Nivel de vinculación con el banco', color: '#84cc16' },
    ];

    // Obtener recomendación (usar genérica si no existe específica)
    const recommendation = actionRecommendations[customer.customerId] || {
        title: 'Contacto personalizado del equipo comercial',
        description: 'Realizar llamada de asesor para identificar necesidades y ofrecer productos personalizados.',
        expectedImpact: 30,
        effortLevel: 'Medio' as const,
    };

    const chartData = xaiFactors.map(f => ({
        name: f.factor.length > 30 ? f.factor.substring(0, 30) + '...' : f.factor,
        fullName: f.factor,
        value: f.impact,
        color: f.color,
    }));

    return (
        <>
            {/* Overlay - Transparent but clickable */}
            <div
                className="fixed inset-0 bg-transparent z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#0F172A' }}>
                    <div>
                        <h2 className="text-xl font-bold text-white">Análisis XAI – Explicabilidad</h2>
                        <p className="text-sm text-gray-300 mt-1">{customer.name} (#{customer.customerId})</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* 1. Resumen Ejecutivo del Riesgo */}
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                        <div className="flex items-start gap-3">
                            <TrendingDown className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 mb-2">Resumen Ejecutivo del Riesgo</h3>
                                <p className="text-sm text-red-800 leading-relaxed">
                                    Este cliente presenta <span className="font-bold">{customer.churnScore > 0.80 ? 'alto' : customer.churnScore >= 0.50 ? 'medio' : 'bajo'} riesgo de fuga ({(customer.churnScore * 100).toFixed(0)}%)</span>,
                                    impulsado principalmente por factores de comportamiento y perfil demográfico.
                                    El balance de <span className="font-bold">€{customer.balance.toLocaleString()}</span> está en riesgo de migración a la competencia.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Factores Clave de Riesgo (XAI) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5" style={{ color: '#0F172A' }} />
                            <h3 className="font-semibold" style={{ color: '#0F172A' }}>Factores Clave de Riesgo</h3>
                        </div>

                        {/* Gráfico de Barras Horizontales */}
                        <div className="mb-4">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" domain={[0, 40]} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value: number, _name: string, props: any) => [
                                            `+${value}%`,
                                            props.payload.fullName
                                        ]}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Lista de Factores con Descripciones */}
                        <div className="space-y-3">
                            {xaiFactors.map((factor, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div
                                        className="w-1 h-full rounded-full flex-shrink-0 mt-1"
                                        style={{ backgroundColor: factor.color, minHeight: '40px' }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                                {factor.factor}
                                            </span>
                                            <span className="text-sm font-bold" style={{ color: factor.color }}>
                                                +{factor.impact}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{factor.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Interpretación Humana (Insight) */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">💡 Interpretación del Analista</h3>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Clientes con este perfil suelen abandonar el banco cuando no perciben beneficios personalizados o contacto proactivo.
                                    La combinación de {customer.transactionActivity.toLowerCase()} actividad transaccional y {customer.numOfProducts} producto(s) contratado(s)
                                    indica una baja vinculación emocional con la institución.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Botón de Acción Recomendada por IA */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-full bg-yellow-400">
                                <Target className="w-6 h-6 text-yellow-900" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-yellow-900 text-lg">Acción Recomendada por IA</h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 font-semibold">
                                        ⭐ Sugerencia
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-800">Prescripción automática basada en patrones históricos</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                            <h4 className="font-semibold mb-2" style={{ color: '#0F172A' }}>
                                {recommendation.title}
                            </h4>
                            <p className="text-sm text-gray-700 mb-3">
                                {recommendation.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-xs text-green-700 mb-1">Impacto Esperado</p>
                                    <p className="text-lg font-bold text-green-700">
                                        ↓ {recommendation.expectedImpact}%
                                    </p>
                                    <p className="text-xs text-green-600">Reducción de riesgo</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-700 mb-1">Nivel de Esfuerzo</p>
                                    <p className="text-lg font-bold text-blue-700">
                                        {recommendation.effortLevel}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        {recommendation.effortLevel === 'Bajo' ? 'Fácil implementación' :
                                            recommendation.effortLevel === 'Medio' ? 'Esfuerzo moderado' :
                                                'Alta inversión'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            style={{ backgroundColor: '#0F172A' }}
                        >
                            📋 Prescribir Acción al Equipo Comercial
                        </button>
                    </div>

                    {/* Información Adicional del Cliente */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <h3 className="font-semibold mb-4" style={{ color: '#0F172A' }}>Información del Cliente</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Antigüedad</p>
                                <p className="font-semibold" style={{ color: '#0F172A' }}>{customer.tenure} años</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Productos Activos</p>
                                <p className="font-semibold" style={{ color: '#0F172A' }}>{customer.numOfProducts}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Actividad</p>
                                <p className="font-semibold" style={{ color: '#0F172A' }}>{customer.transactionActivity}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Estado</p>
                                <p className="font-semibold" style={{ color: customer.isActive ? '#22C55E' : '#EF4444' }}>
                                    {customer.isActive ? '✓ Activo' : '✗ Inactivo'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
