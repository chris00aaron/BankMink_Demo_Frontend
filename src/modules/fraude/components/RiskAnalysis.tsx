import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, DollarSign, TrendingUp, User, CreditCard, Shield, Info } from 'lucide-react';

interface RiskFactor {
  id: string;
  icon: any;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  score: number;
}

interface Alert {
  id: string;
  transactionId: string;
  amount: number;
  timestamp: string;
  location: string;
  riskScore: number;
  factors: RiskFactor[];
}

export function RiskAnalysis() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Generar alertas mock
    const mockAlerts: Alert[] = [
      {
        id: 'ALT-001',
        transactionId: 'TXN-9834',
        amount: 15420,
        timestamp: '2026-01-08 03:24:15',
        location: 'Miami, FL',
        riskScore: 87,
        factors: [
          {
            id: 'f1',
            icon: Clock,
            title: 'Horario Inusual',
            description: 'Transacción realizada a las 3:24 AM - Fuera del patrón habitual del usuario',
            severity: 'high',
            score: 35,
          },
          {
            id: 'f2',
            icon: MapPin,
            title: 'Distancia Anómala',
            description: 'Ubicación a 320km del domicilio habitual del cliente',
            severity: 'high',
            score: 30,
          },
          {
            id: 'f3',
            icon: DollarSign,
            title: 'Monto Elevado',
            description: 'Monto 340% superior al promedio de transacciones del usuario',
            severity: 'medium',
            score: 22,
          },
        ],
      },
      {
        id: 'ALT-002',
        transactionId: 'TXN-9835',
        amount: 8950,
        timestamp: '2026-01-08 14:56:42',
        location: 'Los Angeles, CA',
        riskScore: 72,
        factors: [
          {
            id: 'f4',
            icon: TrendingUp,
            title: 'Patrón de Velocidad',
            description: '5 transacciones en menos de 10 minutos',
            severity: 'high',
            score: 40,
          },
          {
            id: 'f5',
            icon: CreditCard,
            title: 'Nuevo Comercio',
            description: 'Primera transacción con este comercio',
            severity: 'low',
            score: 15,
          },
          {
            id: 'f6',
            icon: MapPin,
            title: 'Geolocalización Sospechosa',
            description: 'Área identificada con alta tasa de fraude',
            severity: 'medium',
            score: 17,
          },
        ],
      },
      {
        id: 'ALT-003',
        transactionId: 'TXN-9836',
        amount: 3200,
        timestamp: '2026-01-08 09:12:33',
        location: 'New York, NY',
        riskScore: 58,
        factors: [
          {
            id: 'f7',
            icon: User,
            title: 'Cambio de Comportamiento',
            description: 'Categoría de gasto inusual para el perfil del usuario',
            severity: 'medium',
            score: 28,
          },
          {
            id: 'f8',
            icon: DollarSign,
            title: 'Redondeo Sospechoso',
            description: 'Monto redondeado - patrón común en fraudes',
            severity: 'low',
            score: 18,
          },
          {
            id: 'f9',
            icon: Clock,
            title: 'Velocidad de Transacción',
            description: 'Tiempo de procesamiento inusualmente rápido',
            severity: 'low',
            score: 12,
          },
        ],
      },
    ];

    setAlerts(mockAlerts);
    setSelectedAlert(mockAlerts[0]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Riesgo Detallado</h1>
        <p className="text-gray-600 mt-1">Explicación detallada de factores de riesgo por alerta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alert List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`
                    w-full text-left p-4 rounded-lg border transition-all
                    ${selectedAlert?.id === alert.id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${getRiskColor(alert.riskScore)}`} />
                      <span className="text-sm font-medium text-gray-900">{alert.id}</span>
                    </div>
                    <span className={`text-xs font-bold ${getRiskColor(alert.riskScore)}`}>
                      {alert.riskScore}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{alert.transactionId}</p>
                  <p className="text-sm font-semibold text-gray-900">${alert.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Alert Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAlert && (
            <>
              {/* Alert Summary */}
              <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAlert.id}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedAlert.riskScore >= 75
                          ? 'text-red-600 bg-red-50 border-red-200'
                          : selectedAlert.riskScore >= 50
                            ? 'text-orange-600 bg-orange-50 border-orange-200'
                            : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                        }`}>
                        {selectedAlert.riskScore >= 75 ? 'Alto Riesgo' :
                          selectedAlert.riskScore >= 50 ? 'Riesgo Medio' : 'Bajo Riesgo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Transacción: {selectedAlert.transactionId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">${selectedAlert.amount.toLocaleString()}</p>
                    <p className={`text-lg font-semibold mt-1 ${getRiskColor(selectedAlert.riskScore)}`}>
                      Score: {selectedAlert.riskScore}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fecha y Hora</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAlert.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Ubicación</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAlert.location}</p>
                  </div>
                </div>
              </div>

              {/* Risk Factors Analysis */}
              <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">¿Por Qué Esta Alerta?</h3>
                </div>

                <div className="space-y-4">
                  {selectedAlert.factors.map((factor) => {
                    const Icon = factor.icon;
                    return (
                      <div
                        key={factor.id}
                        className="p-5 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${factor.severity === 'high' ? 'bg-red-100' :
                              factor.severity === 'medium' ? 'bg-orange-100' :
                                'bg-yellow-100'
                            }`}>
                            <Icon className={`w-5 h-5 ${factor.severity === 'high' ? 'text-red-600' :
                                factor.severity === 'medium' ? 'text-orange-600' :
                                  'text-yellow-600'
                              }`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-base font-semibold text-gray-900">{factor.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(factor.severity)}`}>
                                  {factor.severity === 'high' ? 'Alta' :
                                    factor.severity === 'medium' ? 'Media' : 'Baja'}
                                </span>
                                <span className="text-sm font-bold text-gray-900">+{factor.score}pts</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{factor.description}</p>

                            {/* Score Bar */}
                            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${factor.severity === 'high' ? 'bg-red-500' :
                                    factor.severity === 'medium' ? 'bg-orange-500' :
                                      'bg-yellow-500'
                                  }`}
                                style={{ width: `${(factor.score / 50) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Recomendación del Sistema</p>
                      <p className="text-xs text-gray-600">
                        {selectedAlert.riskScore >= 75
                          ? 'Esta transacción presenta múltiples indicadores de alto riesgo. Se recomienda bloquear y contactar al cliente para verificación.'
                          : selectedAlert.riskScore >= 50
                            ? 'La transacción muestra señales de alerta moderadas. Se recomienda revisión manual antes de aprobar.'
                            : 'La transacción tiene algunos indicadores menores. Monitorear pero se puede proceder con precaución.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}