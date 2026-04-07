import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import {
    ArrowLeft,
    ShieldAlert,
    CheckCircle,
    BrainCircuit,
    Mail,
    Briefcase,
    User,
    Sparkles,
    AlertCircle,
    ShieldCheck,
    CreditCard,
    Crown,
    AlertTriangle,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChurnService } from '../churn.service';
import { CustomerDashboard, RiskFactor, ScenarioIntervention } from '../types';

interface CustomerDetailPageProps {
    customerId: number;
    onBack: () => void;
}

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, onBack }) => {
    const [customer, setCustomer] = useState<CustomerDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzingML, setAnalyzingML] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
    const [realExit, setRealExit] = useState<boolean | undefined>(undefined);
    const [recommendation, setRecommendation] = useState<ScenarioIntervention | null>(null);

    // Fase 1: carga directa por ID (evita búsqueda paginada que puede no encontrar al cliente)
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                const found = await ChurnService.getCustomerById(customerId);
                if (found) setCustomer(found);
            } catch (e) {
                console.error('Error cargando cliente:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [customerId]);

    // Fase 2: análisis ML en segundo plano (Python API — puede tardar varios segundos)
    useEffect(() => {
        if (!customer) return;
        const runAnalysis = async () => {
            setAnalyzingML(true);
            setAnalysisError(null);
            try {
                const [analysis, rec] = await Promise.allSettled([
                    ChurnService.analyzeCustomer(customerId),
                    ChurnService.getRecommendation(customerId),
                ]);
                if (analysis.status === 'fulfilled') {
                    const a = analysis.value;
                    if (a.risk_factors) setRiskFactors(a.risk_factors);
                    if (a.real_exit !== undefined) setRealExit(a.real_exit);
                    if (a.churnProbability !== undefined) {
                        setCustomer(prev => prev ? { ...prev, risk: Math.round(a.churnProbability * 100) } : prev);
                    }
                } else {
                    setAnalysisError('El modelo ML no está disponible. Se muestra la última predicción guardada.');
                }
                if (rec.status === 'fulfilled') setRecommendation(rec.value);
            } finally {
                setAnalyzingML(false);
            }
        };
        runAnalysis();
    }, [customer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const ModelValidationBadge = ({ prediction }: { prediction: boolean }) => {
        if (realExit === undefined) return <span className="text-gray-400 italic">Desconocido</span>;
        const isCorrect = realExit === prediction;
        return (
            <div>
                <p className={`font-bold ${realExit ? 'text-red-600' : 'text-green-600'}`}>
                    {realExit ? 'Fugó (Real)' : 'Se quedó (Real)'}
                </p>
                <div className={`mt-1 text-xs px-2 py-0.5 rounded inline-block font-medium ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {isCorrect ? '✅ Predicción Correcta' : '❌ Divergencia'}
                </div>
            </div>
        );
    };

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    const getSegment = (balance: number) => {
        if (balance >= 100000) return 'Corporate';
        if (balance >= 50000) return 'SME';
        return 'Personal';
    };

    if (loading) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
                    <span className="mt-4 block text-slate-600">Cargando perfil del cliente...</span>
                </div>
            </div>
        );
    }

    if (!customer) return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen">
            <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#0F172A] mb-4 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
            </button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="text-yellow-600 w-6 h-6 flex-shrink-0" />
                <div>
                    <p className="text-yellow-800 font-medium">Cliente no encontrado</p>
                    <p className="text-sm text-yellow-700 mt-1">No se encontró información para el cliente con ID {customerId}. Es posible que haya sido eliminado o que el ID sea incorrecto.</p>
                </div>
            </div>
        </div>
    );

    const segment = getSegment(customer.balance);

    const handleInteraction = async (type: string) => {
        try {
            await ChurnService.logInteraction(customer.id, type);
            toast.success('Acción registrada exitosamente');
        } catch (error) {
            console.error("Error registrando interacción", error);
            toast.error('Error al registrar la acción');
        }
    };

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
            <Toaster position="top-right" />

            {/* 1. HEADER */}
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#0F172A] mb-4 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${customer.risk > 70 ? 'bg-red-100 text-red-600' : customer.risk > 45 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {segment === 'Corporate' ? <Briefcase className="w-8 h-8" /> : <User className="w-8 h-8" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-[#0F172A]">{customer.name || `Cliente ${customer.id}`}</h1>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium border border-slate-200">ID: {customer.id}</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-1">{segment} • {customer.tenure ?? 0} año{(customer.tenure ?? 0) !== 1 ? 's' : ''} como cliente • {customer.country}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm text-slate-400 font-medium">Balance Total</p>
                            <p className="text-xl font-bold text-[#0F172A]">{formatMoney(customer.balance)}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200"></div>
                        <div className="text-right">
                            <p className="text-sm text-slate-400 font-medium">Probabilidad Fuga</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className={`text-2xl font-bold ${customer.risk > 70 ? 'text-red-600' : customer.risk > 45 ? 'text-orange-500' : 'text-emerald-600'}`}>{customer.risk}%</span>
                                {analyzingML
                                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                                    : <ShieldAlert className={`w-5 h-5 ${customer.risk > 70 ? 'text-red-500' : customer.risk > 45 ? 'text-orange-500' : 'text-emerald-500'}`} />
                                }
                            </div>
                            {analyzingML && <p className="text-xs text-slate-400 mt-0.5">Actualizando…</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* XAI */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-[#0F172A]">Análisis de Factores (XAI)</h2>
                            {analyzingML && (
                                <span className="ml-auto flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-500"></div>
                                    Consultando modelo ML…
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            Desglose de las variables que más han influido en la predicción de la IA.
                            <br />
                            <span className="text-red-500 font-bold">Rojo:</span> Aumenta el riesgo de fuga.
                            <span className="text-emerald-500 font-bold ml-2">Verde:</span> Retiene al cliente.
                        </p>
                        <div className="h-96 w-full">
                            {analyzingML && riskFactors.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
                                    <p className="text-sm">Ejecutando análisis de factores…</p>
                                </div>
                            ) : analysisError && riskFactors.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3">
                                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                                    <p className="text-sm text-slate-600 font-medium text-center max-w-xs">{analysisError}</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={riskFactors} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="feature" type="category" width={150} tick={{ fontSize: 12, fill: '#475569' }} />
                                        <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                        <Bar dataKey="impact" barSize={24} radius={[0, 4, 4, 0]}>
                                            {riskFactors.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.type === 'negative' ? '#EF4444' : '#10B981'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-xs text-indigo-700">
                                🧠 <strong>Análisis en Tiempo Real:</strong> Estos factores han sido calculados dinámicamente por el motor de IA (Python) basándose en el comportamiento actual del cliente.
                            </p>
                        </div>
                        {customer && riskFactors.length > 0 && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-slate-500" />Validación del Modelo</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400 mb-1">Predicción IA</p>
                                        <p className={`font-bold ${customer.risk > 45 ? 'text-red-600' : 'text-green-600'}`}>{customer.risk > 45 ? 'Fuga Probable' : 'Retención Probable'}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400 mb-1">Realidad (Histórico)</p>
                                        <ModelValidationBadge prediction={customer.risk > 45} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: ACCIÓN */}
                <div className="space-y-8">

                    {/* TARJETA DE RECOMENDACIÓN IA (Next Best Action) */}
                    {recommendation ? (
                        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 rounded-xl shadow-lg text-white border border-slate-700">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-indigo-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                                    Recomendación Estratégica
                                </span>
                            </div>

                            {/* Icono dinámico según estrategia */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/10 rounded-full border border-white/5">
                                    {/premium|vip|upgrade/i.test(recommendation.name) ? (
                                        <Crown className="w-8 h-8 text-amber-400" />
                                    ) : /tarjeta|card|cr[eé]dito/i.test(recommendation.name) ? (
                                        <CreditCard className="w-8 h-8 text-indigo-300" />
                                    ) : (
                                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold leading-tight">{recommendation.name}</h3>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase">Acción de Retención Prioritaria</span>
                                </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-slate-300 text-sm mb-5 leading-relaxed italic">
                                "{recommendation.description}"
                            </p>

                            {/* Chip de impacto esperado */}
                            <div className="flex items-center justify-between mb-6 p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-xs text-slate-400 font-medium">Reducción Riesgo</span>
                                <span className="text-lg font-black text-emerald-400">
                                    -{(recommendation.impactFactor * 100).toFixed(0)}%
                                </span>
                            </div>

                            <button
                                onClick={() => handleInteraction(`APPLY_STRATEGY_${recommendation.id}`)}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-3 transform hover:scale-[1.02]"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Ejecutar y Notificar Cliente
                            </button>

                            <p className="text-[10px] text-slate-500 mt-4 text-center leading-tight">
                                Estrategia de negocio validada por el motor de riesgo corporativo.
                                <br />Costo estimado: {formatMoney(recommendation.costPerClient || 0)}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-100 p-6 rounded-xl text-center text-slate-400 border border-slate-200">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Sin recomendación disponible</p>
                            <p className="text-xs mt-1 text-slate-400">Ejecute un análisis para generar una estrategia personalizada.</p>
                        </div>
                    )}

                    {/* CONTACTO RÁPIDO — solo email (único canal disponible en BD) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Contactar Cliente</h3>
                        <p className="text-xs text-slate-400 mb-4">Canal de contacto disponible en la base de datos.</p>

                        {customer.email ? (
                            <>
                                {/* Email real del cliente */}
                                <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 truncate" title={customer.email}>
                                        {customer.email}
                                    </span>
                                </div>
                                <a
                                    href={`mailto:${customer.email}?subject=Oferta%20Personalizada%20BankMind&body=Estimado%20cliente%2C%0A%0AHemos%20identificado%20una%20estrategia%20de%20retenci%C3%B3n%20personalizada%20para%20usted.`}
                                    onClick={() => handleInteraction('SEND_EMAIL')}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors text-sm"
                                >
                                    <Mail className="w-4 h-4" />
                                    Enviar Email Personalizado
                                </a>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                <p className="text-xs text-yellow-700">
                                    Email no registrado para este cliente.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* INFO ADICIONAL */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-400 text-xs">Score Crédito</p>
                                <p className="font-bold text-slate-700">{customer.score}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Edad</p>
                                <p className="font-bold text-slate-700">{customer.age} años</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">País</p>
                                <p className="font-bold text-slate-700">{customer.country}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Impacto Potencial</p>
                                <p className="font-bold text-red-600">
                                    {customer.risk != null ? formatMoney(customer.balance * (customer.risk / 100)) : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
