import { useState, useEffect } from 'react';
import { Sliders, TrendingDown, Sparkles, DollarSign } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';
import { SimulationParameters } from '../types';
import { mockCustomers } from '../data/mockData';

export function WhatIfSimulator() {
    const [params, setParams] = useState<SimulationParameters>({
        commission: 5,
        benefits: 50,
        segment: 'Todos',
        incentives: 50,
    });

    const [churnImpact, setChurnImpact] = useState(30);
    const [isSimulating, setIsSimulating] = useState(false);

    // Calcular impacto en la tasa de fuga basado en los parámetros
    useEffect(() => {
        setIsSimulating(true);
        const timer = setTimeout(() => {
            // Fórmula simplificada de impacto
            const commissionImpact = (10 - params.commission) * 2; // Menor comisión = menor fuga
            const benefitsImpact = (params.benefits / 100) * 15;
            const incentivesImpact = (params.incentives / 100) * 10;

            let segmentMultiplier = 1;
            if (params.segment === 'Premium') segmentMultiplier = 0.7;
            else if (params.segment === 'Estándar') segmentMultiplier = 1;
            else if (params.segment === 'Básico') segmentMultiplier = 1.3;

            const newChurn = Math.max(5, Math.min(50,
                (35 - commissionImpact - benefitsImpact - incentivesImpact) * segmentMultiplier
            ));

            setChurnImpact(Math.round(newChurn * 10) / 10);
            setIsSimulating(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [params]);

    // Datos para la curva de riesgo
    const riskCurveData = [
        { month: 'Mes 1', baseline: 30, simulated: churnImpact },
        { month: 'Mes 2', baseline: 30, simulated: churnImpact * 0.95 },
        { month: 'Mes 3', baseline: 30, simulated: churnImpact * 0.90 },
        { month: 'Mes 4', baseline: 30, simulated: churnImpact * 0.85 },
        { month: 'Mes 5', baseline: 30, simulated: churnImpact * 0.82 },
        { month: 'Mes 6', baseline: 30, simulated: churnImpact * 0.80 },
    ];

    // Datos para scatter plot - Clientes Joya (alto balance + alto riesgo)
    const scatterData = mockCustomers.map(c => ({
        creditScore: c.creditScore,
        balance: c.balance / 1000, // Convertir a miles para mejor visualización
        name: c.name,
        churnScore: c.churnScore,
        isJewel: c.balance > 150000 && c.churnScore > 0.70, // Clientes Joya
    }));

    return (
        <div className="space-y-6 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>
                    Laboratorio "What-If" – Simulador de Decisiones
                </h1>
                <p className="text-gray-600">
                    Simula el impacto de decisiones comerciales antes de implementarlas en producción
                </p>
            </div>

            {/* Panel de Simulación */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <Sliders className="w-6 h-6" style={{ color: '#0F172A' }} />
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>
                            Parámetros de Simulación
                        </h2>
                        <p className="text-sm text-gray-600">
                            Ajusta los valores y observa el impacto en tiempo real
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Slider: Comisión Bancaria */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                💰 Comisión Bancaria Mensual
                            </label>
                            <span className="text-lg font-bold" style={{ color: '#0F172A' }}>
                                €{params.commission}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={params.commission}
                            onChange={(e) => setParams({ ...params, commission: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                                accentColor: '#0F172A',
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>€0 (Gratis)</span>
                            <span>€10 (Alta)</span>
                        </div>
                    </div>

                    {/* Slider: Beneficios Ofrecidos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                🎁 Beneficios Ofrecidos
                            </label>
                            <span className="text-lg font-bold" style={{ color: '#22C55E' }}>
                                {params.benefits}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={params.benefits}
                            onChange={(e) => setParams({ ...params, benefits: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                                accentColor: '#22C55E',
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0% (Ninguno)</span>
                            <span>100% (Máximo)</span>
                        </div>
                    </div>

                    {/* Selector: Segmento */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                            👥 Segmento Objetivo
                        </label>
                        <select
                            value={params.segment}
                            onChange={(e) => setParams({ ...params, segment: e.target.value as any })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            style={{ color: '#0F172A' }}
                        >
                            <option value="Todos">Todos los Segmentos</option>
                            <option value="Premium">Premium (Alto Valor)</option>
                            <option value="Estándar">Estándar</option>
                            <option value="Básico">Básico</option>
                        </select>
                    </div>

                    {/* Slider: Incentivos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                ⭐ Incentivos de Retención
                            </label>
                            <span className="text-lg font-bold" style={{ color: '#F59E0B' }}>
                                {params.incentives}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={params.incentives}
                            onChange={(e) => setParams({ ...params, incentives: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                                accentColor: '#F59E0B',
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0% (Ninguno)</span>
                            <span>100% (Agresivo)</span>
                        </div>
                    </div>
                </div>

                {/* Resultado de la Simulación */}
                <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-xl p-6 transition-all ${isSimulating ? 'opacity-50' : 'opacity-100'
                    }`} style={{ borderColor: '#0F172A' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tasa de Fuga Proyectada</p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-5xl font-bold" style={{ color: '#0F172A' }}>
                                    {churnImpact}%
                                </p>
                                <div className="flex items-center gap-1">
                                    <TrendingDown className="w-5 h-5 text-green-600" />
                                    <span className="text-lg font-semibold text-green-600">
                                        -{(30 - churnImpact).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                vs. escenario base de 30%
                            </p>
                        </div>
                        <Sparkles className="w-16 h-16 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Curva de Riesgo en el Tiempo */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#0F172A' }}>
                    📈 Proyección de Impacto en 6 Meses
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={riskCurveData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                        <YAxis
                            domain={[0, 40]}
                            tick={{ fill: '#6b7280' }}
                            label={{ value: 'Tasa de Fuga (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="baseline"
                            name="Sin Acción"
                            stroke="#EF4444"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="simulated"
                            name="Con Intervención"
                            stroke="#22C55E"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Insight:</strong> La intervención proyectada podría reducir la fuga en{' '}
                        <strong>{(30 - churnImpact).toFixed(1)} puntos porcentuales</strong> en 6 meses,
                        salvaguardando aproximadamente <strong>€{((30 - churnImpact) * 50000).toLocaleString()}</strong> en capital.
                    </p>
                </div>
            </div>

            {/* Scatter Plot - Clientes Joya */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-6 h-6" style={{ color: '#0F172A' }} />
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>
                            💎 Clientes Joya – Alta Prioridad
                        </h2>
                        <p className="text-sm text-gray-600">
                            Clientes de alto balance (&gt;€150k) con riesgo elevado (&gt;70%) · Máxima atención comercial
                        </p>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            dataKey="creditScore"
                            name="Puntaje de Crédito"
                            domain={[500, 850]}
                            tick={{ fill: '#6b7280' }}
                            label={{ value: 'Puntaje de Crédito', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="balance"
                            name="Balance"
                            tick={{ fill: '#6b7280' }}
                            label={{ value: 'Balance (miles €)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                            formatter={(value: any, name: string) => {
                                if (name === 'Balance') return [`€${(value * 1000).toLocaleString()}`, 'Balance'];
                                return [value, name];
                            }}
                            labelFormatter={(_value: any, payload: any) => {
                                if (payload && payload.length > 0) {
                                    return `${payload[0].payload.name} · Riesgo: ${(payload[0].payload.churnScore * 100).toFixed(0)}%`;
                                }
                                return '';
                            }}
                        />
                        <Scatter name="Clientes" data={scatterData}>
                            {scatterData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isJewel ? '#F59E0B' : entry.churnScore > 0.70 ? '#EF4444' : '#22C55E'}
                                    opacity={entry.isJewel ? 1 : 0.6}
                                    r={entry.isJewel ? 10 : 6}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Leyenda del Scatter */}
                <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-gray-700">💎 Clientes Joya (Prioridad Alta)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 opacity-60"></div>
                        <span className="text-sm text-gray-700">Alto Riesgo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 opacity-60"></div>
                        <span className="text-sm text-gray-700">Bajo Riesgo</span>
                    </div>
                </div>

                {/* Recomendación para Clientes Joya */}
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
                    <h3 className="font-semibold text-yellow-900 mb-2">⭐ Recomendación Estratégica</h3>
                    <p className="text-sm text-yellow-800">
                        Se han identificado <strong>{scatterData.filter(c => c.isJewel).length} clientes joya</strong> que
                        representan alto valor económico con riesgo elevado. Se recomienda asignar gestores de cuenta
                        dedicados y ofertas personalizadas para este segmento crítico.
                    </p>
                </div>
            </div>
        </div>
    );
}
