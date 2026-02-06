import { useState } from 'react';
import { Card } from '@shared/components/ui/card';
import { UserHeader } from '../components/UserHeader';
import {
    Activity,
    AlertTriangle,
    Calculator,
    CheckCircle2,
    RotateCcw,
    DollarSign,
    Users,
    CreditCard
} from 'lucide-react';
import { simulatePrediction } from '../services/morosidadService';
import type { SimulationRequest, SimulationResponse } from '../types/morosidad.types';

export function SimulationPage() {
    const [formData, setFormData] = useState<SimulationRequest>({
        LIMIT_BAL: 20000,
        SEX: 1,
        EDUCATION: 2,
        MARRIAGE: 2,
        AGE: 30,
        PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0,
        BILL_AMT1: 0, BILL_AMT2: 0, BILL_AMT3: 0, BILL_AMT4: 0, BILL_AMT5: 0, BILL_AMT6: 0,
        PAY_AMT1: 0, PAY_AMT2: 0, PAY_AMT3: 0, PAY_AMT4: 0, PAY_AMT5: 0, PAY_AMT6: 0,
        UTILIZATION_RATE: 0.1
    });

    const [result, setResult] = useState<SimulationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const handleSimulate = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await simulatePrediction(formData);
            setResult(response);
        } catch (err) {
            setError('Error al realizar la simulación. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskLevel = (prob: number) => {
        if (prob > 0.75) return { label: 'CRÍTICO', color: 'text-red-600', bg: 'bg-red-100' };
        if (prob > 0.50) return { label: 'ALTO', color: 'text-orange-600', bg: 'bg-orange-100' };
        if (prob > 0.25) return { label: 'MEDIO', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { label: 'BAJO', color: 'text-green-600', bg: 'bg-green-100' };
    };

    const InputField = ({ label, name, type = "number", step = "1", min }: any) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name as keyof SimulationRequest]}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                step={step}
                min={min}
            />
        </div>
    );

    const SelectField = ({ label, name, options }: any) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
            <select
                name={name}
                value={formData[name as keyof SimulationRequest]}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <UserHeader
                title="Simulador de Riesgo"
                subtitle="Prueba el modelo con datos hipotéticos"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Formulario */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 border-0 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Datos Personales</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField label="Sexo" name="SEX" options={[
                                    { value: 1, label: 'Masculino' },
                                    { value: 2, label: 'Femenino' }
                                ]} />
                                <SelectField label="Educación" name="EDUCATION" options={[
                                    { value: 1, label: 'Postgrado' },
                                    { value: 2, label: 'Universitaria' },
                                    { value: 3, label: 'Secundaria' },
                                    { value: 4, label: 'Otro' }
                                ]} />
                                <SelectField label="Estado Civil" name="MARRIAGE" options={[
                                    { value: 1, label: 'Casado' },
                                    { value: 2, label: 'Soltero' },
                                    { value: 3, label: 'Otro' }
                                ]} />
                                <InputField label="Edad" name="AGE" min="18" />
                            </div>
                        </Card>

                        <Card className="p-6 border-0 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-semibold text-gray-800">Información Financiera</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Límite de Crédito" name="LIMIT_BAL" step="1000" />
                                <InputField label="Tasa de Utilización (0-1)" name="UTILIZATION_RATE" step="0.01" />
                            </div>
                        </Card>

                        <Card className="p-6 border-0 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <Activity className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-800">Historial de Pagos (Estado)</h3>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6'].map((field, idx) => (
                                    <InputField key={field} label={`Mes -${idx}`} name={field} type="number" min="-2" max="8" />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                -2: Sin consumo, -1: Pago total, 0: Pago mínimo, 1-8: Meses de retraso
                            </p>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 border-0 shadow-sm ring-1 ring-gray-100">
                                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                    <CreditCard className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-semibold text-gray-800">Facturación (Últimos 6 meses)</h3>
                                </div>
                                <div className="space-y-3">
                                    {['BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3', 'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6'].map((field, idx) => (
                                        <InputField key={field} label={`Factura Mes -${idx}`} name={field} />
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6 border-0 shadow-sm ring-1 ring-gray-100">
                                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                    <RotateCcw className="w-5 h-5 text-teal-600" />
                                    <h3 className="font-semibold text-gray-800">Pagos Realizados</h3>
                                </div>
                                <div className="space-y-3">
                                    {['PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6'].map((field, idx) => (
                                        <InputField key={field} label={`Pago Mes -${idx}`} name={field} />
                                    ))}
                                </div>
                            </Card>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSimulate}
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                                {loading ? 'Calculando...' : 'Ejecutar Simulación'}
                            </button>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-8">
                            {result ? (
                                <Card className="p-6 border-0 shadow-xl ring-1 ring-blue-100 bg-white">
                                    <div className="text-center mb-6">
                                        <h2 className="text-lg font-semibold text-gray-600 mb-2">Resultado de la Predicción</h2>
                                        <div className="flex justify-center my-4">
                                            <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center relative
                                                ${result.default ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                                <div className="text-center">
                                                    <span className="block text-xl font-bold text-gray-800">
                                                        {(result.probabilidad_default * 100).toFixed(1)}%
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 uppercase font-medium">Prob. Default</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clasificación SBS */}
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm
                                            ${result.clasificacion_sbs === 'Normal' ? 'bg-green-100 text-green-700' :
                                                result.clasificacion_sbs === 'CPP' ? 'bg-yellow-100 text-yellow-700' :
                                                    result.clasificacion_sbs === 'Deficiente' ? 'bg-orange-100 text-orange-700' :
                                                        result.clasificacion_sbs === 'Dudoso' ? 'bg-red-100 text-red-600' :
                                                            'bg-red-200 text-red-800'}`}>
                                            {result.default ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {result.clasificacion_sbs?.toUpperCase() || 'SIN CLASIFICAR'}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-600">Estado</span>
                                            <span className={`font-semibold ${result.default ? 'text-red-600' : 'text-green-600'}`}>
                                                {result.default ? 'MOROSO' : 'NO MOROSO'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-600">Pérdida Estimada</span>
                                            <span className="font-semibold text-red-600">
                                                ${result.estimated_loss?.toLocaleString('es-PE', { minimumFractionDigits: 2 }) || '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-600">Umbral Política</span>
                                            <span className="font-mono text-xs text-gray-500">
                                                {((result.umbral_politica || 0.3) * 100).toFixed(0)}% prob. pago
                                            </span>
                                        </div>
                                    </div>

                                    {/* Factores SHAP */}
                                    {result.risk_factors && result.risk_factors.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Factores de Riesgo (SHAP)</h3>
                                            <div className="space-y-2">
                                                {result.risk_factors.slice(0, 5).map((factor, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-600 w-24 truncate" title={factor.name}>
                                                            {factor.name}
                                                        </span>
                                                        <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                                                            <div
                                                                className={`h-full ${factor.direction === 'positive' ? 'bg-red-400' : 'bg-green-400'}`}
                                                                style={{ width: `${Math.min(Math.abs(factor.impact), 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-medium w-12 text-right ${factor.direction === 'positive' ? 'text-red-600' : 'text-green-600'}`}>
                                                            {factor.direction === 'positive' ? '+' : '-'}{Math.abs(factor.impact).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2">
                                                🔴 Aumenta riesgo | 🟢 Reduce riesgo
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Modelo</span>
                                        <span className="font-mono text-xs text-gray-400">{result.model_version}</span>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-8 border-dashed border-2 border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center h-64">
                                    <Calculator className="w-12 h-12 text-gray-300 mb-4" />
                                    <h3 className="font-medium text-gray-900">Resultado de Simulación</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Complete el formulario y ejecute la simulación para ver el análisis de riesgo.
                                    </p>
                                </Card>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm mt-4">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
