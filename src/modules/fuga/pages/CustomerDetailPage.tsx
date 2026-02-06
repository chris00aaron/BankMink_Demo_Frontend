import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ShieldAlert,
    CheckCircle,
    TrendingUp,
    BrainCircuit,
    MessageSquare,
    Mail,
    Phone,
    Briefcase,
    User
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line
} from 'recharts';
import { ChurnService } from '../churn.service';
import { CustomerDashboard, RiskFactor, RiskHistoryPoint, ScenarioIntervention } from '../types';

interface CustomerDetailPageProps {
    customerId: number;
    onBack: () => void;
}

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, onBack }) => {
    const [customer, setCustomer] = useState<CustomerDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
    const [realExit, setRealExit] = useState<boolean | undefined>(undefined); // Nuevo estado
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [recommendation, setRecommendation] = useState<ScenarioIntervention | null>(null);

    // Cargar datos del cliente y análisis real
    useEffect(() => {
        const fetchCustomerAndAnalysis = async () => {
            try {
                setLoading(true);
                // 1. Obtener info básica
                const customers = await ChurnService.getAllCustomers();
                const found = customers.find(c => c.id === customerId);
                
                if (found) {
                    setCustomer(found);
                    
                    // 2. Ejecutar análisis en tiempo real para obtener factores
                    const analysis = await ChurnService.analyzeCustomer(customerId);
                    console.log("--> Analysis Response:", analysis); // DEBUG
                    
                    if (analysis.risk_factors) {
                        setRiskFactors(analysis.risk_factors);
                    }
                    // Guardar la realidad si existe
                    if (analysis.real_exit !== undefined) {
                        setRealExit(analysis.real_exit);
                    }

                    // 3. Obtener Historial Real
                    const history = await ChurnService.getHistory(customerId);
                    // Mapear historial al formato del gráfico
                    const mappedHistory = history.map((h: any) => ({
                        month: new Date(h.predictionDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                        score: h.churnProbability * 100
                    })).reverse(); // El backend devuelve descendente, queremos ascendente para el gráfico
                    setHistoryData(mappedHistory);

                    // 4. Obtener Recomendación Real
                    const rec = await ChurnService.getRecommendation(customerId);
                    setRecommendation(rec);
                }
            } catch (e) {
                console.error('Error cargando cliente o análisis:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerAndAnalysis();
    }, [customerId]);

    // Componente auxiliar para validación
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

    // Formateador de moneda
    const formatMoney = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // Determinar segmento basado en balance
    const getSegment = (balance: number) => {
        if (balance > 100000) return 'Corporate';
        if (balance > 50000) return 'SME';
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

    if (!customer) {
        return (
            <div className="p-8 bg-[#F8FAFC] min-h-screen">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-[#0F172A] mb-4 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
                </button>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <p className="text-yellow-700 font-medium">⚠️ Cliente no encontrado</p>
                </div>
            </div>
        );
    }

    const segment = getSegment(customer.balance);
    const yearsSince = 2026 - (2020 - Math.floor(customer.id % 5));

    const handleInteraction = async (type: string) => {
        try {
            await ChurnService.logInteraction(customer.id, type);
            // Mostrar feedback simple
            alert(`Acción registrada exitosamente: ${type}`);
        } catch (error) {
            console.error("Error registrando interacción", error);
        }
    };

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">

            {/* 1. HEADER DE NAVEGACIÓN Y PERFIL */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-[#0F172A] mb-4 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${customer.risk > 70 ? 'bg-red-100 text-red-600' : customer.risk > 50 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {segment === 'Corporate' ? <Briefcase className="w-8 h-8" /> : <User className="w-8 h-8" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-[#0F172A]">Cliente {customer.id}</h1>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium border border-slate-200">
                                    ID: {customer.id}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm mt-1">
                                {segment} • Cliente desde {yearsSince} • {customer.country}
                            </p>
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
                                <span className={`text-2xl font-bold ${customer.risk > 70 ? 'text-red-600' : customer.risk > 50 ? 'text-orange-500' : 'text-emerald-600'}`}>
                                    {customer.risk}%
                                </span>
                                <ShieldAlert className={`w-5 h-5 ${customer.risk > 70 ? 'text-red-500' : customer.risk > 50 ? 'text-orange-500' : 'text-emerald-500'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CONTENIDO PRINCIPAL: XAI + HISTORIA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUMNA IZQUIERDA: EL "POR QUÉ" (XAI) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* GRÁFICO DE EXPLICABILIDAD (SHAP SIMULADO) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-[#0F172A]">Análisis de Factores (XAI)</h2>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            Desglose de las variables que más han influido en la predicción de la IA.
                            <br />
                            <span className="text-red-500 font-bold">Rojo:</span> Aumenta el riesgo de fuga.
                            <span className="text-emerald-500 font-bold ml-2">Verde:</span> Retiene al cliente.
                        </p>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={riskFactors} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="feature" type="category" width={150} tick={{ fontSize: 12, fill: '#475569' }} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                    <Bar dataKey="impact" barSize={20} radius={[0, 4, 4, 0]}>
                                        {riskFactors.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'negative' ? '#EF4444' : '#10B981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-xs text-indigo-700">
                                🧠 <strong>Análisis en Tiempo Real:</strong> Estos factores han sido calculados dinámicamente por el motor de IA (Python) basándose en el comportamiento actual del cliente.
                            </p>
                        </div>
                        
                        {/* VALIDACIÓN DEL MODELO (NUEVO) */}
                        {customer && riskFactors.length > 0 && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                                    Validación del Modelo
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400 mb-1">Predicción IA</p>
                                        <p className={`font-bold ${customer.risk > 50 ? 'text-red-600' : 'text-green-600'}`}>
                                            {customer.risk > 50 ? 'Fuga Probable' : 'Retención Probable'}
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400 mb-1">Realidad (Datos Históricos)</p>
                                        {/* Accedemos al estado real si existe en la respuesta del análisis */}
                                        <ModelValidationBadge prediction={customer.risk > 50} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GRÁFICO DE HISTORIA */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Evolución del Riesgo (Real)</h3>
                        
                        {historyData.length > 0 ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} hide />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#F59E0B"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 w-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                                No hay historial de predicciones para este cliente.
                            </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2 italic text-center">
                            *Historial extraído de la base de datos de predicciones.
                        </p>
                    </div>
                </div>

                {/* COLUMNA DERECHA: ACCIÓN Y PRESCRIPCIÓN */}
                <div className="space-y-8">

                    {/* TARJETA DE ACCIÓN RECOMENDADA (Next Best Action) */}
                    {recommendation ? (
                        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 rounded-xl shadow-lg text-white animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-indigo-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">IA Prescription</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{recommendation.name}</h3>
                            <p className="text-indigo-100/80 text-sm mb-6 leading-relaxed">
                                {recommendation.description}
                                <br/>
                                <span className="block mt-2 font-semibold text-emerald-300">
                                    Impacto Esperado: -{(recommendation.impactFactor * 100).toFixed(0)}% Riesgo
                                </span>
                            </p>
                            <button 
                                onClick={() => handleInteraction(`APPLY_STRATEGY_${recommendation.id}`)}
                                className="w-full bg-white text-[#0F172A] font-bold py-3 rounded-lg hover:bg-indigo-50 transition-colors shadow-md"
                            >
                                Aplicar Estrategia
                            </button>
                        </div>
                    ) : (
                         <div className="bg-slate-100 p-6 rounded-xl text-center text-slate-400">
                             <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                             <p className="text-sm">Sin recomendación disponible</p>
                         </div>
                    )}

                    {/* CONTACTO RÁPIDO */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contactar Cliente</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleInteraction('CALL_MOBILE')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700"
                            >
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium">Llamar a Móvil</span>
                            </button>
                            <button 
                                onClick={() => handleInteraction('SEND_EMAIL')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700"
                            >
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium">Enviar Email Personalizado</span>
                            </button>
                            <button 
                                onClick={() => handleInteraction('SCHEDULE_MEETING')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700"
                            >
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium">Agendar Reunión</span>
                            </button>
                        </div>
                    </div>

                    {/* NOTAS DEL GESTOR */}
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                        <h4 className="text-yellow-800 font-bold text-sm mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Notas Recientes
                        </h4>
                        <p className="text-yellow-700/80 text-xs leading-relaxed">
                            "Cliente mencionó que recibió oferta de Banco Competencia. Urgente revisar condiciones de su cuenta."
                            <br />
                            <span className="font-semibold opacity-70">- Hace 2 días por M. López</span>
                        </p>
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
                                <p className="font-bold text-red-600">{formatMoney(customer.balance * (customer.risk / 100))}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
