import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, DollarSign, TrendingUp, User, Shield, Brain, Activity, FileText, CheckCircle } from 'lucide-react';

interface RiskFactor {
  feature_name: string;
  feature_value: string;
  shap_value: number;
  risk_description: string;
  impact_direction: string;
}

interface AuditData {
  xgboost_score: number;
  iforest_score: number;
  base_score: number;
}

interface FraudAlert {
  transaction_id: string;
  veredicto: string;
  score_final: number;
  detalles_riesgo: RiskFactor[];
  datos_auditoria: AuditData;
  recomendacion: string;
  timestamp?: string;
  location?: string;
  amount_display?: number;
}

export function RiskAnalysis() {
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  // --- MAPEO DE ICONOS ---
  const getFeatureIcon = (featureName: string) => {
    switch (featureName) {
      case 'amt': return DollarSign;
      case 'hour': return Clock;
      case 'distance_km': return MapPin;
      case 'merch_lat':
      case 'merch_long': return MapPin;
      case 'age':
      case 'dob': return User;
      case 'category': return TrendingUp;
      case 'anomaly_score': return Activity;
      default: return FileText;
    }
  };

  // --- LÓGICA VISUAL PARA SHAP (Colores de barras) ---
  const getShapImpactColor = (shapVal: number) => {
    if (shapVal < 0) return 'bg-emerald-500';    // Reduce Riesgo
    if (shapVal === 0) return 'bg-gray-300';     // Neutro
    if (shapVal > 3.0) return 'bg-red-600';      // Crítico
    if (shapVal > 1.0) return 'bg-orange-500';   // Alto
    return 'bg-yellow-500';                      // Moderado
  };

  // --- LÓGICA PARA BADGES (Etiquetas) ---
  const getImpactBadge = (shapVal: number) => {
    if (shapVal < 0) return {
      label: 'Reduce Riesgo',
      style: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
    // Caso especial para cuando SHAP es casi cero (sin impacto)
    if (Math.abs(shapVal) < 0.01) return {
      label: 'Neutro',
      style: 'text-gray-600 bg-gray-100 border-gray-200'
    };

    if (shapVal > 3.0) return { label: 'Crítico', style: 'text-red-700 bg-red-50 border-red-200' };
    if (shapVal > 1.0) return { label: 'Alto', style: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Moderado', style: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
  };

  // Helper para determinar si es Alto Riesgo (para colores globales)
  const isHighRisk = (score: number) => score > 0.5;

  useEffect(() => {
    // --- DATOS MOCK ---
    const mockAlerts: FraudAlert[] = [
      {
        transaction_id: 'TXN-9834',
        veredicto: 'ALTO RIESGO',
        score_final: 0.9982,
        amount_display: 15420.0,
        timestamp: '2026-01-08 03:24:15',
        location: 'Miami, FL',
        recomendacion: 'Bloquear y Notificar',
        detalles_riesgo: [
          { feature_name: "amt", feature_value: "15420.0", shap_value: 5.74, risk_description: "Monto inusualmente alto.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "hour", feature_value: "3", shap_value: 1.44, risk_description: "Hora sospechosa.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "anomaly_score", feature_value: "-0.025", shap_value: 0.37, risk_description: "Patrón inusual detectado.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "age", feature_value: "41", shap_value: 0.06, risk_description: "Edad con influencia mínima.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "distance_km", feature_value: "330.12", shap_value: 0.02, risk_description: "Ubicación atípica.", impact_direction: "AUMENTA_RIESGO" }
        ],
        datos_auditoria: { xgboost_score: 0.9982, iforest_score: -0.0257, base_score: 0.1510 }
      },
      {
        transaction_id: 'TXN-10003',
        veredicto: 'LEGÍTIMO',
        score_final: 0.00069,
        amount_display: 85.60,
        timestamp: '2026-01-15 13:45:10',
        location: 'Trujillo, PE',
        recomendacion: 'Aprobar',
        detalles_riesgo: [
          { feature_name: "anomaly_score", feature_value: "0.0665", shap_value: -0.047, risk_description: "Patrón consistente.", impact_direction: "DISMINUYE_RIESGO" },
          { feature_name: "age", feature_value: "30", shap_value: -0.070, risk_description: "Edad consistente.", impact_direction: "DISMINUYE_RIESGO" },
          { feature_name: "category", feature_value: "grocery_pos", shap_value: -0.100, risk_description: "Compra frecuente.", impact_direction: "DISMINUYE_RIESGO" },
          { feature_name: "job", feature_value: "Clerk", shap_value: -0.132, risk_description: "Perfil seguro.", impact_direction: "DISMINUYE_RIESGO" },
          { feature_name: "gender", feature_value: "M", shap_value: -0.156, risk_description: "Impacto neutro.", impact_direction: "DISMINUYE_RIESGO" }
        ],
        datos_auditoria: { xgboost_score: 0.0006, iforest_score: 0.0665, base_score: 0.1510 }
      },
      {
        transaction_id: 'TXN-10002',
        veredicto: 'ALTO RIESGO',
        score_final: 0.7809,
        amount_display: 2350.0,
        timestamp: '2026-01-13 21:12:05',
        location: 'Lima, PE',
        recomendacion: 'Bloquear y Notificar',
        detalles_riesgo: [
          { feature_name: "amt", feature_value: "2350.0", shap_value: 4.41, risk_description: "Monto elevado.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "distance_km", feature_value: "766.29", shap_value: 0.060, risk_description: "Ubicación inusual.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "anomaly_score", feature_value: "-0.0307", shap_value: 0.00, risk_description: "El modelo de anomalías detectó un patrón atípico.", impact_direction: "AUMENTA_RIESGO" },
          { feature_name: "job", feature_value: "Teacher", shap_value: -0.186, risk_description: "Perfil reduce riesgo.", impact_direction: "DISMINUYE_RIESGO" },
          { feature_name: "gender", feature_value: "F", shap_value: -0.272, risk_description: "Impacto mitigador.", impact_direction: "DISMINUYE_RIESGO" }
        ],
        datos_auditoria: { xgboost_score: 0.7809, iforest_score: -0.0306, base_score: 0.1510 }
      }
    ];

    setAlerts(mockAlerts);
    setSelectedAlert(mockAlerts[0]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Riesgo Detallado (XAI)</h1>
        <p className="text-gray-600 mt-1">Explicabilidad del modelo basada en valores SHAP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Lista de Alertas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <button
                  key={alert.transaction_id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`
                    w-full text-left p-4 rounded-lg border transition-all
                    ${selectedAlert?.transaction_id === alert.transaction_id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* ICONO CON COLOR DINÁMICO */}
                      {alert.veredicto === 'LEGÍTIMO' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className={`w-4 h-4 ${isHighRisk(alert.score_final) ? 'text-red-600' : 'text-yellow-600'}`} />
                      )}
                      <span className="text-sm font-medium text-gray-900">{alert.transaction_id}</span>
                    </div>
                    {/* PORCENTAJE CON COLOR DINÁMICO */}
                    <span className={`text-xs font-bold ${alert.veredicto === 'LEGÍTIMO' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(alert.score_final * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">${alert.amount_display?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Detalle SHAP */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAlert && (
            <>
              {/* Resumen de Alerta */}
              <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAlert.transaction_id}</h2>
                      {/* BADGE DE VEREDICTO CON COLOR DINÁMICO */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border 
                        ${selectedAlert.veredicto === 'LEGÍTIMO'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-red-600 bg-red-50 border-red-200'}`}>
                        {selectedAlert.veredicto}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">ID Auditoría: {selectedAlert.transaction_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">{(selectedAlert.score_final * 100).toFixed(2)}%</p>
                    {/* TEXTO DEBAJO DEL PORCENTAJE CON COLOR DINÁMICO */}
                    <p className={`text-xs font-medium mt-1 ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-600' : 'text-red-600'}`}>
                      Probabilidad de Fraude
                    </p>
                  </div>
                </div>
              </div>

              {/* ANÁLISIS SHAP (Ranking de Factores) */}
              <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Explicabilidad del Modelo (SHAP)</h3>
                </div>

                <div className="space-y-4">
                  {selectedAlert.detalles_riesgo.map((factor, index) => {
                    const Icon = getFeatureIcon(factor.feature_name);

                    const maxShap = Math.max(Math.abs(selectedAlert.detalles_riesgo[0].shap_value), 0.1);
                    const barWidth = (Math.abs(factor.shap_value) / maxShap) * 100;
                    const impactInfo = getImpactBadge(factor.shap_value);

                    return (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-white border border-gray-200">
                            <Icon className="w-5 h-5 text-gray-700" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="text-sm font-bold text-gray-900 uppercase mr-2">
                                  {factor.feature_name.replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Valor: <span className="font-medium text-gray-900">{factor.feature_value}</span>
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${impactInfo.style}`}>
                                {impactInfo.label} ({factor.shap_value > 0 ? '+' : ''}{factor.shap_value.toFixed(2)})
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{factor.risk_description}</p>

                            {/* Barra de Progreso */}
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                              <div
                                className={`h-full transition-all duration-500 ${getShapImpactColor(factor.shap_value)}`}
                                style={{ width: `${barWidth}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pie de Auditoría Técnica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-slate-600" />
                    <h4 className="font-semibold text-slate-700">Auditoría Técnica</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">XGBoost Score:</span>
                      <span className="font-medium tabular-nums text-slate-700">
                        {selectedAlert.datos_auditoria.xgboost_score.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Isolation Forest:</span>
                      <span className="font-medium tabular-nums text-slate-700">
                        {selectedAlert.datos_auditoria.iforest_score.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Score:</span>
                      <span className="font-medium tabular-nums text-slate-700">
                        {selectedAlert.datos_auditoria.base_score.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col justify-center
                   ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className={`w-4 h-4 ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-600' : 'text-blue-600'}`} />
                    <h4 className={`font-semibold ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-700' : 'text-blue-700'}`}>
                      Acción Recomendada
                    </h4>
                  </div>
                  <p className={`text-lg font-bold ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-900' : 'text-blue-900'}`}>
                    {selectedAlert.recomendacion}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}