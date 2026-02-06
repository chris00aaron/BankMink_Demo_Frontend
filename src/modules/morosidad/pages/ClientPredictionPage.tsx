// [PAGE COMPONENT]: This component acts as a Page.
// It orchestrates the Client Prediction view, including search state and displaying results.
import { useState } from 'react';
import { Card } from '@shared/components/ui/card';
import { UserHeader } from '../components/UserHeader';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
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

import { searchCustomers, predictMorosidad } from '../services/morosidadService';
import type { CustomerSearchResult, ClientePredictionDetail, AccountSummary } from '../types/morosidad.types';

const RISK_COLORS = {
  Crítico: {
    bg: 'bg-blue-900',
    text: 'text-white',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-900',
    border: 'border-blue-900'
  },
  Alto: {
    bg: 'bg-blue-700',
    text: 'text-white',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    border: 'border-blue-700'
  },
  Medio: {
    bg: 'bg-blue-500',
    text: 'text-white',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    border: 'border-blue-500'
  },
  Bajo: {
    bg: 'bg-blue-400',
    text: 'text-white',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-500',
    border: 'border-blue-400'
  }
};

const SBS_COLORS = {
  'Normal': 'bg-green-100 text-green-800',
  'CPP': 'bg-yellow-100 text-yellow-800',
  'Deficiente': 'bg-orange-100 text-orange-800',
  'Dudoso': 'bg-red-100 text-red-800',
  'Pérdida': 'bg-red-200 text-red-900'
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
    'PAY_0': 'Estado Pago Septiembre',
    'PAY_2': 'Estado Pago Agosto',
    'PAY_3': 'Estado Pago Julio',
    'PAY_4': 'Estado Pago Junio',
    'PAY_5': 'Estado Pago Mayo',
    'PAY_6': 'Estado Pago Abril',
    'BILL_AMT1': 'Factura Septiembre',
    'BILL_AMT2': 'Factura Agosto',
    'BILL_AMT3': 'Factura Julio',
    'BILL_AMT4': 'Factura Junio',
    'BILL_AMT5': 'Factura Mayo',
    'BILL_AMT6': 'Factura Abril',
    'PAY_AMT1': 'Pago Septiembre',
    'PAY_AMT2': 'Pago Agosto',
    'PAY_AMT3': 'Pago Julio',
    'PAY_AMT4': 'Pago Junio',
    'PAY_AMT5': 'Pago Mayo',
    'PAY_AMT6': 'Pago Abril',
    'UTILIZATION_RATE': 'Tasa de Utilización'
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

    if (result.probabilidadPago < 25) {
      recomendaciones.push({
        text: 'Cliente de riesgo crítico - Contactar urgentemente para evaluación de cuenta',
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
    } else if (result.probabilidadPago < 50) {
      recomendaciones.push({
        text: 'Cliente de riesgo alto - Programar llamada de seguimiento proactivo',
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
    } else if (result.probabilidadPago < 75) {
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
        text: 'Cliente de bajo riesgo - Mantener monitoreo estándar',
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
                className={`px-4 py-2 rounded-full text-sm ${RISK_COLORS[predictionResult.nivelRiesgo].bg} ${RISK_COLORS[predictionResult.nivelRiesgo].text}`}
              >
                Riesgo {predictionResult.nivelRiesgo}
              </span>
            </div>

            {/* Badges de clasificación y comparación */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${SBS_COLORS[predictionResult.clasificacionSBS]}`}>
                SBS: {predictionResult.clasificacionSBS}
              </span>
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
                      Este cliente tiene <span className="font-medium">{predictionResult.cuotasAtrasadas}</span> cuota(s) atrasada(s)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full blur-3xl opacity-20" />
          </Card>

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
                        <p className="font-medium text-zinc-900">{factor.factor}</p>
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
