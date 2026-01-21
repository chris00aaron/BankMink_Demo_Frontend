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
  Shield
} from 'lucide-react';
import { mockClients, Client } from '../utils/mockData';

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

export function ClientPredictionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      const filtered = mockClients.filter(
        (client) =>
          client.nombre.toLowerCase().includes(value.toLowerCase()) ||
          client.id.toLowerCase().includes(value.toLowerCase()) ||
          client.cedula.includes(value)
      ).slice(0, 10);
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm('');
    setFilteredClients([]);
  };

  const getFactoresInfluencia = (client: Client) => {
    const factores = [];

    if (client.cuotasAtrasadas > 0) {
      factores.push({
        factor: 'Cuotas atrasadas',
        impacto: 'Negativo',
        valor: `${client.cuotasAtrasadas} cuota(s)`,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    if (client.historialPagos >= 85) {
      factores.push({
        factor: 'Historial de pagos',
        impacto: 'Positivo',
        valor: `${client.historialPagos}% a tiempo`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    } else if (client.historialPagos < 60) {
      factores.push({
        factor: 'Historial de pagos',
        impacto: 'Negativo',
        valor: `${client.historialPagos}% a tiempo`,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    const ratioDeuda = (client.montoCuota / client.ingresosDeclarados) * 100;
    if (ratioDeuda > 40) {
      factores.push({
        factor: 'Ratio cuota/ingreso',
        impacto: 'Negativo',
        valor: `${ratioDeuda.toFixed(1)}% de ingresos`,
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    } else if (ratioDeuda < 25) {
      factores.push({
        factor: 'Ratio cuota/ingreso',
        impacto: 'Positivo',
        valor: `${ratioDeuda.toFixed(1)}% de ingresos`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    }

    if (client.antiguedad > 24) {
      factores.push({
        factor: 'Antigüedad como cliente',
        impacto: 'Positivo',
        valor: `${Math.floor(client.antiguedad / 12)} año(s)`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    } else if (client.antiguedad < 6) {
      factores.push({
        factor: 'Antigüedad como cliente',
        impacto: 'Negativo',
        valor: `${client.antiguedad} mes(es)`,
        icon: MinusCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }

    return factores;
  };

  const getRecomendaciones = (client: Client) => {
    const recomendaciones = [];

    if (client.probabilidadPago < 25) {
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
    } else if (client.probabilidadPago < 50) {
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
    } else if (client.probabilidadPago < 75) {
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

      {/* Búsqueda - Diseño Fintech moderno */}
      <Card className="p-8 bg-white border-0 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg text-zinc-900 mb-2">Buscar Cliente</h3>
          <p className="text-sm text-zinc-500">Ingresa nombre, ID o número de cédula</p>
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

          {filteredClients.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className="w-full px-6 py-4 hover:bg-zinc-50 text-left border-b border-zinc-100 last:border-b-0 flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="text-zinc-900 mb-1">{client.nombre}</p>
                    <p className="text-sm text-zinc-500">ID: {client.id} • Cédula: {client.cedula}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${RISK_COLORS[client.nivelRiesgo].bg} ${RISK_COLORS[client.nivelRiesgo].text}`}
                  >
                    {client.nivelRiesgo}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de ejemplo rápido */}
        <div className="mt-6 pt-6 border-t border-zinc-100">
          <p className="text-sm text-zinc-500 mb-3">Ejemplos rápidos:</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => selectClient(mockClients[0])}
              className="border-zinc-200 hover:bg-zinc-50"
            >
              Cliente ejemplo 1
            </Button>
            <Button
              variant="outline"
              onClick={() => selectClient(mockClients.find(c => c.nivelRiesgo === 'Crítico')!)}
              className="border-zinc-200 hover:bg-zinc-50"
            >
              Riesgo crítico
            </Button>
            <Button
              variant="outline"
              onClick={() => selectClient(mockClients.find(c => c.nivelRiesgo === 'Bajo')!)}
              className="border-zinc-200 hover:bg-zinc-50"
            >
              Bajo riesgo
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados de predicción */}
      {selectedClient && (
        <div className="space-y-6">
          {/* Información del cliente - Header Card */}
          <Card className="p-8 bg-white border-0 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl text-zinc-900 mb-1">{selectedClient.nombre}</h2>
                  <p className="text-sm text-zinc-500">
                    ID: {selectedClient.id} • Cédula: {selectedClient.cedula}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm ${RISK_COLORS[selectedClient.nivelRiesgo].bg} ${RISK_COLORS[selectedClient.nivelRiesgo].text}`}
              >
                Riesgo {selectedClient.nivelRiesgo}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Monto Cuota</p>
                </div>
                <p className="text-2xl text-zinc-900">${selectedClient.montoCuota.toLocaleString()}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Deuda Total</p>
                </div>
                <p className="text-2xl text-zinc-900">${selectedClient.deudaTotal.toLocaleString()}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Ingresos</p>
                </div>
                <p className="text-2xl text-zinc-900">${selectedClient.ingresosDeclarados.toLocaleString()}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Último Pago</p>
                </div>
                <p className="text-2xl text-zinc-900">{new Date(selectedClient.ultimoPago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
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
                <h2 className="text-2xl">Predicción de Pago</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Probabilidad principal */}
                <div className="lg:col-span-2">
                  <p className="text-sm text-blue-100 mb-4">Probabilidad de pago de la próxima cuota</p>
                  <div className="flex items-end gap-4 mb-6">
                    <span className="text-7xl leading-none">
                      {selectedClient.probabilidadPago.toFixed(0)}%
                    </span>
                    {selectedClient.probabilidadPago >= 75 ? (
                      <CheckCircle className="w-10 h-10 text-green-300 mb-2" />
                    ) : selectedClient.probabilidadPago >= 50 ? (
                      <MinusCircle className="w-10 h-10 text-yellow-300 mb-2" />
                    ) : selectedClient.probabilidadPago >= 25 ? (
                      <AlertCircle className="w-10 h-10 text-orange-300 mb-2" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-300 mb-2" />
                    )}
                  </div>

                  {/* Barra de progreso elegante */}
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-3 bg-white rounded-full transition-all shadow-lg"
                      style={{ width: `${selectedClient.probabilidadPago}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-blue-100 mt-2">
                    <span>0% No pagará</span>
                    <span>100% Pagará con certeza</span>
                  </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Clock className="w-6 h-6 mb-2 text-blue-200" />
                    <p className="text-xs text-blue-100 mb-1">Antigüedad</p>
                    <p className="text-2xl">{Math.floor(selectedClient.antiguedad / 12)} años</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Shield className="w-6 h-6 mb-2 text-blue-200" />
                    <p className="text-xs text-blue-100 mb-1">Puntualidad</p>
                    <p className="text-2xl">{selectedClient.historialPagos}%</p>
                  </div>
                </div>
              </div>

              {selectedClient.cuotasAtrasadas > 0 && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-white">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">
                      Este cliente tiene <span className="font-medium">{selectedClient.cuotasAtrasadas}</span> cuota(s) atrasada(s)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full blur-3xl opacity-20" />
          </Card>

          {/* Factores de influencia - Grid moderno */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg text-zinc-900">Factores de Influencia</h3>
              <p className="text-sm text-zinc-500 mt-1">Variables que afectan la predicción</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFactoresInfluencia(selectedClient).map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <Card
                    key={index}
                    className={`p-6 border-0 shadow-sm ${factor.bgColor}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${factor.color}`} />
                        <p className="text-zinc-900">{factor.factor}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${factor.impacto === 'Positivo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {factor.impacto}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600">{factor.valor}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recomendaciones - Lista limpia */}
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
              {getRecomendaciones(selectedClient).map((recomendacion, index) => (
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
        </div>
      )}
    </div>
  );
}
