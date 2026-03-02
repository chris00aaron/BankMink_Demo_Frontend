// [PAGE COMPONENT]: This component acts as a Page.
// It orchestrates the Client Prediction view, including search state and displaying results.
import { useState, useEffect } from 'react';
import { Card } from '@shared/components/ui/card';
import { UserHeader } from '../components/UserHeader';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ComposedChart, Cell
} from 'recharts';
import {
  Search,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  CreditCard,
  BarChart3,
  ArrowRight,
  Shield,
  Loader2
} from 'lucide-react';

import { searchCustomers, predictMorosidad, getPredictionTimeline, getClientPaymentHistory } from '../services/morosidadService';
import type { CustomerSearchResult, ClientePredictionDetail, AccountSummary, PredictionTimelineEntry, ClientPaymentHistoryEntry } from '../types/morosidad.types';

const SBS_COLORS: Record<string, { bg: string; text: string; range: string }> = {
  'Normal': { bg: 'bg-emerald-50', text: 'text-emerald-700', range: '0-5%' },
  'CPP': { bg: 'bg-amber-50', text: 'text-amber-700', range: '5-25%' },
  'Deficiente': { bg: 'bg-orange-50', text: 'text-orange-700', range: '25-60%' },
  'Dudoso': { bg: 'bg-red-50', text: 'text-red-700', range: '60-90%' },
  'Pérdida': { bg: 'bg-red-100', text: 'text-red-900', range: '90-100%' },
};

export function ClientPredictionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<CustomerSearchResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [predictionResult, setPredictionResult] = useState<ClientePredictionDetail | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<PredictionTimelineEntry[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<ClientPaymentHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    setError(null);

    if (value.length >= 2) {
      setIsSearching(true);
      try {
        const results = await searchCustomers(value);
        setFilteredClients(results);
      } catch (err) {
        setError('Error al buscar clientes');
        setFilteredClients([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setFilteredClients([]);
    }
  };

  const selectCustomer = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer);
    setSelectedAccount(null);
    setPredictionResult(null);
    setSearchTerm('');
    setFilteredClients([]);
    setError(null);
  };

  const selectAccountAndPredict = async (account: AccountSummary) => {
    setSelectedAccount(account);
    setError(null);
    setIsPredicting(true);

    try {
      const result = await predictMorosidad(account.recordId);
      setPredictionResult(result);

      // Cargar timeline de predicciones e historial de pagos en paralelo
      setIsLoadingTimeline(true);
      setIsLoadingHistory(true);
      try {
        const [timeline, history] = await Promise.all([
          getPredictionTimeline(account.recordId).catch(() => [] as PredictionTimelineEntry[]),
          getClientPaymentHistory(account.recordId).catch(() => [] as ClientPaymentHistoryEntry[])
        ]);
        setTimelineData(timeline);
        setPaymentHistory(history);
      } catch {
        setTimelineData([]);
        setPaymentHistory([]);
      } finally {
        setIsLoadingTimeline(false);
        setIsLoadingHistory(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la predicción');
      setPredictionResult(null);
    } finally {
      setIsPredicting(false);
    }
  };

  // Mapa de etiquetas amigables para las variables del modelo
  const FACTOR_LABELS: { [key: string]: string } = {
    'LIMIT_BAL': 'Límite de Crédito',
    'SEX': 'Género',
    'EDUCATION': 'Nivel Educativo',
    'MARRIAGE': 'Estado Civil',
    'AGE': 'Edad',
    'PAY_0': 'Estado Pago (Mes Anterior)',
    'PAY_2': 'Estado Pago (Hace 2 Meses)',
    'PAY_3': 'Estado Pago (Hace 3 Meses)',
    'PAY_4': 'Estado Pago (Hace 4 Meses)',
    'PAY_5': 'Estado Pago (Hace 5 Meses)',
    'PAY_6': 'Estado Pago (Hace 6 Meses)',
    'BILL_AMT1': 'Factura (Mes Anterior)',
    'BILL_AMT2': 'Factura (Hace 2 Meses)',
    'BILL_AMT3': 'Factura (Hace 3 Meses)',
    'BILL_AMT4': 'Factura (Hace 4 Meses)',
    'BILL_AMT5': 'Factura (Hace 5 Meses)',
    'BILL_AMT6': 'Factura (Hace 6 Meses)',
    'PAY_AMT1': 'Pago (Mes Anterior)',
    'PAY_AMT2': 'Pago (Hace 2 Meses)',
    'PAY_AMT3': 'Pago (Hace 3 Meses)',
    'PAY_AMT4': 'Pago (Hace 4 Meses)',
    'PAY_AMT5': 'Pago (Hace 5 Meses)',
    'PAY_AMT6': 'Pago (Hace 6 Meses)',
    'UTILIZATION_RATE': 'Tasa de Utilización'
  };

  const FACTOR_DESCRIPTIONS: Record<string, string> = {
    'LIMIT_BAL': 'Límite de crédito asignado. Límites bajos pueden indicar perfil de mayor riesgo.',
    'SEX': 'Género del cliente. Variable demográfica del perfil base.',
    'EDUCATION': 'Nivel educativo. Puede correlacionar con estabilidad laboral y capacidad de pago.',
    'MARRIAGE': 'Estado civil del cliente. Afecta la carga financiera del hogar.',
    'AGE': 'Edad del cliente. Puede correlacionar con estabilidad financiera.',
    'PAY_0': 'Meses de atraso en el pago más reciente. Valores > 0 indican falta de pago puntual.',
    'PAY_2': 'Meses de atraso hace 2 períodos. Indica patrón histórico de pago.',
    'PAY_3': 'Meses de atraso hace 3 períodos.',
    'PAY_4': 'Meses de atraso hace 4 períodos.',
    'PAY_5': 'Meses de atraso hace 5 períodos.',
    'PAY_6': 'Meses de atraso hace 6 períodos.',
    'BILL_AMT1': 'Monto facturado el mes reciente. Facturas altas presionan la capacidad de pago.',
    'BILL_AMT2': 'Monto facturado hace 2 meses.',
    'BILL_AMT3': 'Monto facturado hace 3 meses.',
    'BILL_AMT4': 'Monto facturado hace 4 meses.',
    'BILL_AMT5': 'Monto facturado hace 5 meses.',
    'BILL_AMT6': 'Monto facturado hace 6 meses.',
    'PAY_AMT1': 'Monto pagado el mes reciente. Pagos bajos respecto a la factura indican riesgo.',
    'PAY_AMT2': 'Monto pagado hace 2 meses.',
    'PAY_AMT3': 'Monto pagado hace 3 meses.',
    'PAY_AMT4': 'Monto pagado hace 4 meses.',
    'PAY_AMT5': 'Monto pagado hace 5 meses.',
    'PAY_AMT6': 'Monto pagado hace 6 meses.',
    'UTILIZATION_RATE': 'Porcentaje del crédito utilizado. Tasas > 80% indican sobreuso del crédito.'
  };

  const getFactoresInfluencia = (result: ClientePredictionDetail) => {
    // Si hay factores SHAP dinámicos, usarlos
    if (result.riskFactors && result.riskFactors.length > 0) {
      return result.riskFactors.map(factor => ({
        factor: FACTOR_LABELS[factor.name] || factor.name,
        name: factor.name,
        impacto: factor.direction === 'positive' ? 'Aumenta Riesgo' : 'Reduce Riesgo',
        impact: factor.impact,
        icon: factor.direction === 'positive' ? AlertCircle : CheckCircle,
        color: factor.direction === 'positive' ? 'text-red-600' : 'text-green-600',
        bgColor: factor.direction === 'positive' ? 'bg-red-50' : 'bg-green-50',
        barColor: factor.direction === 'positive' ? 'bg-red-400' : 'bg-green-400'
      }));
    }

    // Fallback: si no hay factores SHAP, mostrar mensaje
    return [{
      factor: 'Factor principal',
      name: result.mainRiskFactor,
      impacto: result.defaultPayment ? 'Aumenta Riesgo' : 'Reduce Riesgo',
      impact: 100,
      icon: result.defaultPayment ? AlertCircle : CheckCircle,
      color: result.defaultPayment ? 'text-red-600' : 'text-green-600',
      bgColor: result.defaultPayment ? 'bg-red-50' : 'bg-green-50',
      barColor: result.defaultPayment ? 'bg-red-400' : 'bg-green-400'
    }];
  };

  const getRecomendaciones = (result: ClientePredictionDetail) => {
    const recomendaciones = [];
    const sbs = result.clasificacionSBS;

    if (sbs === 'Pérdida' || sbs === 'Dudoso') {
      recomendaciones.push({
        text: `Clasificación ${sbs} - Contactar urgentemente para evaluación de cuenta`,
        priority: 'critical'
      });
      recomendaciones.push({
        text: 'Considerar opciones de reestructuración de deuda o refinanciamiento',
        priority: 'high'
      });
      recomendaciones.push({
        text: 'Asignar a gestor de cobranza especializado',
        priority: 'high'
      });
    } else if (sbs === 'Deficiente') {
      recomendaciones.push({
        text: 'Clasificación Deficiente - Programar llamada de seguimiento proactivo',
        priority: 'high'
      });
      recomendaciones.push({
        text: 'Ofrecer plan de pagos flexible o recordatorios automáticos',
        priority: 'medium'
      });
      recomendaciones.push({
        text: 'Incluir en campaña de retención de clientes',
        priority: 'medium'
      });
    } else if (sbs === 'CPP') {
      recomendaciones.push({
        text: 'Realizar seguimiento preventivo en 2 semanas',
        priority: 'medium'
      });
      recomendaciones.push({
        text: 'Ofrecer incentivos por pagos puntuales (descuentos, beneficios)',
        priority: 'low'
      });
      recomendaciones.push({
        text: 'Activar recordatorios de pago automáticos por SMS/email',
        priority: 'low'
      });
    } else {
      recomendaciones.push({
        text: 'Clasificación Normal - Mantener monitoreo estándar',
        priority: 'low'
      });
      recomendaciones.push({
        text: 'Considerar para ofertas de productos premium',
        priority: 'low'
      });
      recomendaciones.push({
        text: 'Enviar agradecimiento por puntualidad en pagos',
        priority: 'low'
      });
    }

    return recomendaciones;
  };

  return (
    <div className="space-y-8">
      {/* User Header */}
      <UserHeader
        userName="Administrador"
        title="Predicción Individual"
        subtitle="Análisis detallado del riesgo de morosidad por cliente"
      />

      {/* Búsqueda */}
      <Card className="p-8 bg-white border-0 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg text-zinc-900 mb-2">Buscar Cliente</h3>
          <p className="text-sm text-zinc-500">Ingresa nombre o ID del cliente</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Escribe para buscar..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-14 text-base border-zinc-200 focus:border-blue-500"
          />

          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5 animate-spin" />
          )}

          {filteredClients.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
              {filteredClients.map((customer) => (
                <button
                  key={customer.idCustomer}
                  onClick={() => selectCustomer(customer)}
                  className="w-full px-6 py-4 hover:bg-zinc-50 text-left border-b border-zinc-100 last:border-b-0 flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="text-zinc-900 mb-1">{customer.nombre}</p>
                    <p className="text-sm text-zinc-500">
                      ID: {customer.idCustomer} • {customer.cuentas.length} cuenta(s)
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-600">
                    {customer.educacion}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Selección de cuenta */}
      {selectedCustomer && !predictionResult && (
        <Card className="p-8 bg-white border-0 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-zinc-900">{selectedCustomer.nombre}</h2>
              <p className="text-sm text-zinc-500">
                {selectedCustomer.edad} años • {selectedCustomer.educacion} • {selectedCustomer.estadoCivil}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg text-zinc-900 mb-2">Selecciona una cuenta</h3>
            <p className="text-sm text-zinc-500">Elige la cuenta para realizar la predicción</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCustomer.cuentas.map((account) => (
              <button
                key={account.recordId}
                onClick={() => selectAccountAndPredict(account)}
                disabled={isPredicting}
                className="p-6 border border-zinc-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <span className={`px-2 py-1 rounded-full text-xs ${account.isActiveMember ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {account.isActiveMember ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mb-1">Cuenta #{account.recordId}</p>
                <p className="text-xl text-zinc-900 mb-2">
                  Límite: ${account.limitBal?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-zinc-500">
                  Balance: ${account.balance?.toLocaleString() || 0} • {account.tenure || 0} meses
                </p>
              </button>
            ))}
          </div>

          {isPredicting && (
            <div className="mt-6 flex items-center justify-center gap-3 text-blue-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Realizando predicción...</span>
            </div>
          )}
        </Card>
      )}

      {/* Resultados de predicción */}
      {predictionResult && (
        <div className="space-y-6">
          {/* Información del cliente - Header Card */}
          <Card className="p-8 bg-white border-0 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl text-zinc-900 mb-1">{predictionResult.nombre}</h2>
                  <p className="text-sm text-zinc-500">
                    ID: {predictionResult.idCustomer} • Cuenta: {predictionResult.recordId}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${(SBS_COLORS[predictionResult.clasificacionSBS] || SBS_COLORS['Normal']).bg
                  } ${(SBS_COLORS[predictionResult.clasificacionSBS] || SBS_COLORS['Normal']).text
                  }`}
              >
                SBS: {predictionResult.clasificacionSBS} ({(SBS_COLORS[predictionResult.clasificacionSBS] || SBS_COLORS['Normal']).range})
              </span>
            </div>

            {/* Badges de comparación */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 text-zinc-700">
                Más riesgoso que el {predictionResult.percentilRiesgo}% de la cartera
              </span>
              {predictionResult.estimatedLoss > 0 && (
                <span className="px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-700">
                  Pérdida estimada: ${predictionResult.estimatedLoss.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Última Cuota</p>
                </div>
                <p className="text-2xl text-zinc-900">${predictionResult.ultimaCuota?.toLocaleString() || 0}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Límite</p>
                </div>
                <p className="text-2xl text-zinc-900">${predictionResult.limitBal?.toLocaleString() || 0}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Ingresos</p>
                </div>
                <p className="text-2xl text-zinc-900">${predictionResult.estimatedSalary?.toLocaleString() || 0}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Último Pago</p>
                </div>
                <p className="text-2xl text-zinc-900">
                  {predictionResult.ultimoPago ? new Date(predictionResult.ultimoPago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Predicción - Hero Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-lg text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl">Predicción de Pago</h2>
                  <p className="text-xs text-blue-200">Modelo: {predictionResult.modelVersion}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Probabilidad principal */}
                <div className="lg:col-span-2">
                  <p className="text-sm text-blue-100 mb-4">Probabilidad de pago de la próxima cuota</p>
                  <div className="flex items-end gap-4 mb-6">
                    <span className="text-7xl leading-none">
                      {predictionResult.probabilidadPago.toFixed(0)}%
                    </span>
                    {predictionResult.probabilidadPago >= 75 ? (
                      <CheckCircle className="w-10 h-10 text-green-300 mb-2" />
                    ) : predictionResult.probabilidadPago >= 50 ? (
                      <MinusCircle className="w-10 h-10 text-yellow-300 mb-2" />
                    ) : predictionResult.probabilidadPago >= 25 ? (
                      <AlertCircle className="w-10 h-10 text-orange-300 mb-2" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-300 mb-2" />
                    )}
                  </div>

                  {/* Barra de progreso con umbral */}
                  <div className="relative w-full">
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-3 bg-white rounded-full transition-all shadow-lg"
                        style={{ width: `${predictionResult.probabilidadPago}%` }}
                      />
                    </div>
                    {/* Línea de umbral */}
                    <div
                      className="absolute top-0 h-3 w-0.5 bg-yellow-400"
                      style={{ left: `${predictionResult.umbralPolitica}%` }}
                      title={`Umbral de política: ${predictionResult.umbralPolitica}%`}
                    />
                    <div
                      className="absolute -top-1 text-xs text-yellow-300"
                      style={{ left: `${predictionResult.umbralPolitica}%`, transform: 'translateX(-50%)' }}
                    >
                      ▼
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-blue-100 mt-2">
                    <span>0% No pagará</span>
                    <span className="text-yellow-300">Umbral: {predictionResult.umbralPolitica.toFixed(0)}%</span>
                    <span>100% Pagará</span>
                  </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Clock className="w-6 h-6 mb-2 text-blue-200" />
                    <p className="text-xs text-blue-100 mb-1">Antigüedad</p>
                    <p className="text-2xl">{Math.floor(predictionResult.antiguedadMeses / 12)} años</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Shield className="w-6 h-6 mb-2 text-blue-200" />
                    <p className="text-xs text-blue-100 mb-1">Puntualidad</p>
                    <p className="text-2xl">{predictionResult.historialPagos.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {predictionResult.cuotasAtrasadas > 0 && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-white">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">
                      Este cliente registra <span className="font-medium">{predictionResult.cuotasAtrasadas}</span> mes(es) con atraso en su historial
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full blur-3xl opacity-20" />
          </Card>

          {/* Historial de Pagos del Cliente */}
          {paymentHistory.length > 0 && (
            <Card className="p-8 bg-white border-0 shadow-sm">
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg text-zinc-900">Historial de Pagos del Cliente</h3>
                  <p className="text-sm text-zinc-500 mt-1">Comportamiento financiero mensual — últimos {paymentHistory.length} meses</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={paymentHistory.map(d => ({
                      periodo: d.period,
                      'Facturado': d.billAmt,
                      'Pagado': d.payAmt,
                      'Meses Atraso': d.monthsLate,
                      payX: d.payX,
                      paymentStatus: d.paymentStatus,
                      daysLate: d.daysLate,
                      didPay: d.didPay
                    }))}
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="periodo" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      stroke="#6366f1"
                      tick={{ fill: '#6366f1', fontSize: 11 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#ef4444"
                      tick={{ fill: '#ef4444', fontSize: 11 }}
                      domain={[0, 'auto']}
                      allowDecimals={false}
                      label={{ value: 'Meses Atraso', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const data = payload[0]?.payload;
                        const statusColor = data.payX === -2 ? '#94a3b8' : data.payX <= 0 ? '#10b981' : data.payX <= 2 ? '#f59e0b' : '#ef4444';
                        return (
                          <div className="bg-white border border-zinc-200 shadow-lg rounded-lg p-3 text-sm">
                            <p className="font-bold text-zinc-900 mb-2">{label}</p>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
                              <span className="text-zinc-600">{data.paymentStatus}</span>
                            </div>
                            <p className="text-zinc-600">Facturado: <span className="font-medium text-indigo-600">${data['Facturado']?.toLocaleString() ?? 0}</span></p>
                            <p className="text-zinc-600">Pagado: <span className="font-medium text-emerald-600">${data['Pagado']?.toLocaleString() ?? 0}</span></p>
                            {data['Meses Atraso'] > 0 && (
                              <p className="text-zinc-600">Meses de atraso: <span className="font-medium text-red-600">{data['Meses Atraso']}</span></p>
                            )}
                            {data.daysLate != null && data.daysLate > 0 && (
                              <p className="text-zinc-600">Días de retraso: <span className="font-medium text-orange-600">{data.daysLate} días</span></p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Facturado" fill="#a5b4fc" opacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={35} />
                    <Bar yAxisId="left" dataKey="Pagado" radius={[4, 4, 0, 0]} maxBarSize={35}>
                      {paymentHistory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.payX === -2 ? '#94a3b8' : entry.payX <= 0 ? '#10b981' : entry.payX <= 2 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Meses Atraso"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={(props: { cx?: number; cy?: number; index?: number }) => {
                        const idx = props.index ?? 0;
                        const entry = paymentHistory[idx];
                        if (!entry || entry.monthsLate === 0) return <circle key={idx} cx={0} cy={0} r={0} fill="none" />;
                        const color = entry.payX <= 2 ? '#f59e0b' : '#ef4444';
                        return <circle key={idx} cx={props.cx ?? 0} cy={props.cy ?? 0} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Leyenda de grupos */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#94a3b8]" />
                  <span>Sin consumo (payX = -2)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#10b981]" />
                  <span>A tiempo / Crédito renovable (payX ≤ 0)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
                  <span>Retraso leve (1-2 meses)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                  <span>Retraso severo (3+ meses)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#a5b4fc] opacity-50" />
                  <span>Barra clara = monto facturado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 border-t-2 border-dashed border-red-500" />
                  <span>Línea = meses de atraso</span>
                </div>
              </div>
            </Card>
          )}

          {isLoadingHistory && (
            <Card className="p-8 bg-white border-0 shadow-sm">
              <div className="flex items-center justify-center gap-3 text-violet-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Cargando historial de pagos...</span>
              </div>
            </Card>
          )}

          {/* Factores de influencia */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg text-zinc-900">Factores de Influencia</h3>
              <p className="text-sm text-zinc-500 mt-1">Variables que afectan la predicción</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {getFactoresInfluencia(predictionResult).map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <Card
                    key={index}
                    className={`p-4 border-0 shadow-sm ${factor.bgColor}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${factor.color}`} />
                        <div>
                          <p className="font-medium text-zinc-900">{factor.factor}</p>
                          {FACTOR_DESCRIPTIONS[factor.name] && (
                            <p className="text-xs text-zinc-500 mt-0.5">{FACTOR_DESCRIPTIONS[factor.name]}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${factor.impacto === 'Reduce Riesgo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {factor.impacto}
                      </span>
                    </div>
                    {/* Barra de impacto */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${factor.barColor}`}
                          style={{ width: `${Math.abs(factor.impact)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold min-w-[50px] text-right ${factor.color}`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(0)}%
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recomendaciones */}
          <Card className="p-8 bg-white border-0 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg text-zinc-900">Plan de Acción Recomendado</h3>
                <p className="text-sm text-zinc-500 mt-1">Pasos sugeridos según el nivel de riesgo</p>
              </div>
            </div>
            <div className="space-y-3">
              {getRecomendaciones(predictionResult).map((recomendacion, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg ${recomendacion.priority === 'critical' ? 'bg-red-50' :
                    recomendacion.priority === 'high' ? 'bg-orange-50' :
                      recomendacion.priority === 'medium' ? 'bg-blue-50' :
                        'bg-zinc-50'
                    }`}
                >
                  <div className={`mt-1 w-2 h-2 rounded-full ${recomendacion.priority === 'critical' ? 'bg-red-500' :
                    recomendacion.priority === 'high' ? 'bg-orange-500' :
                      recomendacion.priority === 'medium' ? 'bg-blue-500' :
                        'bg-zinc-400'
                    }`} />
                  <p className="text-sm text-zinc-700 flex-1">{recomendacion.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline de Predicción */}
          {timelineData.length > 0 && (
            <Card className="p-8 bg-white border-0 shadow-sm">
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg text-zinc-900">Evolución de Predicción</h3>
                  <p className="text-sm text-zinc-500 mt-1">Probabilidad de default y estado de pago real a lo largo del tiempo</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={timelineData.map(d => ({
                      fecha: new Date(d.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
                      'Prob. Default (%)': +(d.defaultProbability * 100).toFixed(1),
                      'Meses Atraso': d.payX,
                      category: d.defaultCategory
                    }))}
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      stroke="#3b82f6"
                      tick={{ fill: '#3b82f6', fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 100]}
                      label={{ value: 'Prob. Default (%)', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#ef4444"
                      tick={{ fill: '#ef4444', fontSize: 11 }}
                      domain={[0, 'auto']}
                      allowDecimals={false}
                      label={{ value: 'Meses Atraso', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                      formatter={(value, name) => [
                        name === 'Prob. Default (%)' ? `${value}%` : `${value} mes(es)`,
                        String(name)
                      ]}
                    />
                    <Legend />
                    {predictionResult && (
                      <ReferenceLine
                        yAxisId="left"
                        y={100 - predictionResult.umbralPolitica}
                        stroke="#f59e0b"
                        strokeDasharray="8 4"
                        label={{ value: `Umbral (${(100 - predictionResult.umbralPolitica).toFixed(0)}%)`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }}
                      />
                    )}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Prob. Default (%)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="Meses Atraso"
                      fill="#fca5a5"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Leyenda de interpretación */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-blue-500 rounded-full" />
                  <span>Línea azul = % probabilidad de impago según el modelo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-300 rounded-sm" />
                  <span>Barras rojas = meses de atraso real (pay_x)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-500" />
                  <span>Línea amarilla = umbral de política</span>
                </div>
              </div>
            </Card>
          )}

          {isLoadingTimeline && (
            <Card className="p-8 bg-white border-0 shadow-sm">
              <div className="flex items-center justify-center gap-3 text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Cargando evolución de predicción...</span>
              </div>
            </Card>
          )}

          {/* Botón para nueva búsqueda */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCustomer(null);
                setSelectedAccount(null);
                setPredictionResult(null);
              }}
              className="border-zinc-200 hover:bg-zinc-50"
            >
              Realizar nueva predicción
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
