import { useState, useEffect } from 'react';
import {
  AlertTriangle, MapPin, Clock, DollarSign, TrendingUp, User,
  Shield, Brain, Activity, FileText, CheckCircle, Search,
  RefreshCw, ChevronLeft, ChevronRight, Filter, Loader2
} from 'lucide-react';
import { useFraudAlerts } from '../hooks/useFraudAlerts';
import { FraudAlert, RiskFactor } from '../services/fraudService';

// Helper para formatear tiempo relativo
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

// Mapeo de iconos para features SHAP
const getFeatureIcon = (featureName: string) => {
  switch (featureName) {
    case 'amt': return DollarSign;
    case 'hour': return Clock;
    case 'distance_km':
    case 'merch_lat':
    case 'merch_long': return MapPin;
    case 'age':
    case 'dob': return User;
    case 'category': return TrendingUp;
    case 'anomaly_score': return Activity;
    default: return FileText;
  }
};

// Colores para impacto SHAP
const getShapImpactColor = (shapVal: number) => {
  if (shapVal < 0) return 'bg-emerald-500';
  if (shapVal === 0) return 'bg-gray-300';
  if (shapVal > 3.0) return 'bg-red-600';
  if (shapVal > 1.0) return 'bg-orange-500';
  return 'bg-yellow-500';
};

// Badge de impacto
const getImpactBadge = (shapVal: number) => {
  if (shapVal < 0) return { label: 'Reduce Riesgo', style: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (Math.abs(shapVal) < 0.01) return { label: 'Neutro', style: 'text-gray-600 bg-gray-100 border-gray-200' };
  if (shapVal > 3.0) return { label: 'Crítico', style: 'text-red-700 bg-red-50 border-red-200' };
  if (shapVal > 1.0) return { label: 'Alto', style: 'text-orange-700 bg-orange-50 border-orange-200' };
  return { label: 'Moderado', style: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
};

export function RiskAnalysis() {
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<'TODO' | 'ALTO RIESGO' | 'LEGÍTIMO'>('TODO');

  const {
    alerts,
    selectedAlert,
    totalElements,
    currentPage,
    hasNext,
    hasPrevious,
    isLoading,
    isRefreshing,
    error,
    selectAlert,
    loadAlertDetail,
    setPage,
    setVeredicto,
    setSearch,
    refresh,
  } = useFraudAlerts({
    autoRefresh: true,
    refreshInterval: 10000,
    initialSize: 20,
    initialSortBy: 'score',
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  // Cambiar filtro
  const handleFilterChange = (filter: 'TODO' | 'ALTO RIESGO' | 'LEGÍTIMO') => {
    setActiveFilter(filter);
    setVeredicto(filter === 'TODO' ? '' : filter);
  };

  // Cargar detalle cuando se selecciona una alerta
  useEffect(() => {
    if (selectedAlert && !selectedAlert.detalles_riesgo) {
      loadAlertDetail(selectedAlert.prediction_id);
    }
  }, [selectedAlert, loadAlertDetail]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Riesgo Detallado</h1>
          <p className="text-gray-600 mt-1">Explicabilidad del modelo basada en valores SHAP</p>
        </div>
        <div className="flex items-center gap-3">
          {isRefreshing && (
            <span className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Actualizando...
            </span>
          )}
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
            {totalElements} alertas
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Lista de Alertas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-4 shadow-lg">

            {/* Barra de Herramientas */}
            <div className="space-y-4 mb-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por N° de transacción..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtros Rápidos */}
              <div className="flex gap-2">
                {(['TODO', 'ALTO RIESGO', 'LEGÍTIMO'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${activeFilter === filter
                      ? filter === 'ALTO RIESGO'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : filter === 'LEGÍTIMO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    {filter === 'TODO' ? 'Todos' : filter === 'ALTO RIESGO' ? 'Fraudes' : 'Legítimos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay alertas que mostrar</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <button
                    key={alert.prediction_id}
                    onClick={() => selectAlert(alert)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${selectedAlert?.prediction_id === alert.prediction_id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {alert.veredicto === 'LEGÍTIMO' ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                        )}
                        <span
                          className="text-sm font-medium text-gray-900 truncate"
                          title={alert.transaction_id}
                        >
                          {alert.transaction_id.length > 12
                            ? alert.transaction_id.substring(0, 12) + '...'
                            : alert.transaction_id}
                        </span>
                      </div>
                      <span className={`text-xs font-bold flex-shrink-0 ml-2 ${alert.veredicto === 'LEGÍTIMO' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {((alert.score_final || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ${(alert.amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{alert.customer_name || 'Cliente'}</p>
                      <p className="text-xs text-gray-400">
                        {alert.prediction_date ? formatRelativeTime(alert.prediction_date) : ''}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Paginación */}
            {alerts.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!hasPrevious}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {currentPage + 1}
                </span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!hasNext}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha - Detalle SHAP */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAlert ? (
            <>
              {/* Resumen de Alerta */}
              <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAlert.transaction_id}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedAlert.veredicto === 'LEGÍTIMO'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-red-600 bg-red-50 border-red-200'
                        }`}>
                        {selectedAlert.veredicto}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedAlert.merchant || 'Comercio'} • {selectedAlert.category || 'Categoría'}
                    </p>
                    {selectedAlert.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {selectedAlert.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      {((selectedAlert.score_final || 0) * 100).toFixed(2)}%
                    </p>
                    <p className={`text-xs font-medium mt-1 ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                      Probabilidad de Fraude
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Monto</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${(selectedAlert.amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cliente</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAlert.customer_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* ANÁLISIS SHAP */}
              <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">¿Por Qué Esta Alerta?</h3>
                </div>

                {selectedAlert.detalles_riesgo && selectedAlert.detalles_riesgo.length > 0 ? (
                  <div className="space-y-4">
                    {selectedAlert.detalles_riesgo.map((factor: RiskFactor, index: number) => {
                      const Icon = getFeatureIcon(factor.feature_name);
                      const maxShap = Math.max(Math.abs(selectedAlert.detalles_riesgo![0].shap_value), 0.1);
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
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                <div
                                  className={`h-full transition-all duration-500 ${getShapImpactColor(factor.shap_value)}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    <span className="ml-2 text-gray-500">Cargando detalles...</span>
                  </div>
                )}
              </div>

              {/* Auditoría Técnica */}
              {selectedAlert.datos_auditoria && (
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
                          {selectedAlert.datos_auditoria.xgboost_score?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Isolation Forest:</span>
                        <span className="font-medium tabular-nums text-slate-700">
                          {selectedAlert.datos_auditoria.iforest_score?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Score:</span>
                        <span className="font-medium tabular-nums text-slate-700">
                          {selectedAlert.datos_auditoria.base_score?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border flex flex-col justify-center ${selectedAlert.veredicto === 'LEGÍTIMO'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className={`w-4 h-4 ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-600' : 'text-blue-600'
                        }`} />
                      <h4 className={`font-semibold ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                        Acción Recomendada
                      </h4>
                    </div>
                    <p className={`text-lg font-bold ${selectedAlert.veredicto === 'LEGÍTIMO' ? 'text-emerald-900' : 'text-blue-900'
                      }`}>
                      {selectedAlert.recomendacion}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30">
              <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Seleccione una Alerta</h3>
              <p className="text-gray-500 max-w-xs mt-1">
                Haga clic en una alerta de la lista para ver el análisis detallado del modelo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}