import { useState, useEffect } from 'react';
import {
  DollarSign, Tag, Brain, Activity, Search, AlertTriangle, CheckCircle,
  Clock, MapPin, User, Shield, Loader2, CreditCard, RefreshCw, Store, Database
} from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { catalogService } from '../services/catalogService';
import { whatIfService, WhatIfResponse, RiskFactor } from '../services/whatIfService';

export function IndividualPrediction() {
  // Estado del formulario
  const [ccNum, setCcNum] = useState('');
  const [formData, setFormData] = useState({
    transaction_id: `TXN-${Math.floor(Math.random() * 10000)}`,
    amount: '',
    merchant: '',
    category: '',
    hour: new Date().getHours().toString(),
    merchLat: '',
    merchLong: '',
    saveToDB: false,
  });

  // Estado del cliente
  const [customerInfo, setCustomerInfo] = useState<{
    found: boolean;
    name?: string;
    location?: string;
    gender?: string;
    age?: number;
  } | null>(null);

  // Estado del resultado
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  // Estado de carga
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías al montar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const names = await catalogService.getCategoryNames();
        setCategories(names);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };
    loadCategories();
  }, []);

  // Buscar cliente por número de tarjeta
  const handleLookupCustomer = async () => {
    if (!ccNum.trim()) return;

    setIsLookingUp(true);
    setError(null);
    setCustomerInfo(null);
    setResult(null);

    try {
      const response = await whatIfService.lookupCustomer(ccNum.trim());

      if (response.customer_found) {
        setCustomerInfo({
          found: true,
          name: response.customer_name,
          location: response.customer_location,
          gender: response.customer_gender,
          age: response.customer_age,
        });
      } else {
        setError(response.error || 'Cliente no encontrado');
        setCustomerInfo({ found: false });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar cliente');
      setCustomerInfo({ found: false });
    } finally {
      setIsLookingUp(false);
    }
  };

  // Simular predicción
  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo?.found) {
      setError('Primero busque un cliente válido');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await whatIfService.simulate({
        cc_num: ccNum.trim(),
        amt: Number(formData.amount),
        merchant: formData.saveToDB ? formData.merchant : undefined,
        category: formData.category,
        hour: Number(formData.hour),
        merch_lat: formData.merchLat ? Number(formData.merchLat) : undefined,
        merch_long: formData.merchLong ? Number(formData.merchLong) : undefined,
        save_to_db: formData.saveToDB,
      });

      // VERIFICAR SI HAY ERROR EN EL RESPONSE (ej: tarjeta bloqueada)
      if (response.error) {
        setError(response.error);
        setResult(null);
        return;
      }

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la simulación');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Limpiar formulario
  const handleReset = () => {
    setCcNum('');
    setFormData({
      transaction_id: `TXN-${Math.floor(Math.random() * 10000)}`,
      amount: '',
      merchant: '',
      category: '',
      hour: new Date().getHours().toString(),
      merchLat: '',
      merchLong: '',
      saveToDB: false,
    });
    setCustomerInfo(null);
    setResult(null);
    setError(null);
  };

  // Helpers de colores
  const getScoreColor = (score: number) => score > 0.5 ? 'text-red-600' : 'text-emerald-600';
  const getShapColor = (val: number) => val > 0 ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predicción Individual</h1>
        <p className="text-gray-600 mt-1">
          Simulador "What-If" - Evalúe escenarios hipotéticos{' '}
          {formData.saveToDB ? (
            <span className="text-emerald-600 font-medium">(Se guardará en BD)</span>
          ) : (
            <span className="text-amber-600 font-medium">(No se guarda en BD)</span>
          )}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1 space-y-4">
          {/* Búsqueda de Cliente */}
          <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Identificar Cliente</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Número de Tarjeta
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Ej: 4532123456789012"
                    value={ccNum}
                    onChange={(e) => setCcNum(e.target.value)}
                    className="font-mono text-sm flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleLookupCustomer}
                    disabled={isLookingUp || !ccNum.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLookingUp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Info del Cliente */}
              {customerInfo?.found && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">Cliente Encontrado</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{customerInfo.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                    {customerInfo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {customerInfo.location}
                      </span>
                    )}
                    {customerInfo.gender && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {customerInfo.gender}
                      </span>
                    )}
                    {customerInfo.age && (
                      <span>{customerInfo.age} años</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Datos de Simulación */}
          <div className={`backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg transition-opacity ${customerInfo?.found ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Datos de Simulación</h2>
            </div>

            <form onSubmit={handleSimulate} className="space-y-4">
              {/* Monto */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4 text-gray-500" /> Monto (USD)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 15420.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-gray-500" /> Categoría
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-gray-500" /> Hora Simulada (0-23)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                    className="w-20"
                  />
                  <span className={`text-xs font-medium px-2 py-1 rounded ${Number(formData.hour) >= 0 && Number(formData.hour) < 6
                    ? 'bg-amber-100 text-amber-700'
                    : Number(formData.hour) >= 6 && Number(formData.hour) < 12
                      ? 'bg-blue-100 text-blue-700'
                      : Number(formData.hour) >= 12 && Number(formData.hour) < 18
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                    {Number(formData.hour) >= 0 && Number(formData.hour) < 6
                      ? '🌙 Madrugada'
                      : Number(formData.hour) >= 6 && Number(formData.hour) < 12
                        ? '🌅 Mañana'
                        : Number(formData.hour) >= 12 && Number(formData.hour) < 18
                          ? '☀️ Tarde'
                          : '🌆 Noche'}
                  </span>
                </div>
              </div>

              {/* Ubicación del comercio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-gray-500" /> Ubicación Comercio (opcional)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Latitud"
                    value={formData.merchLat}
                    onChange={(e) => setFormData({ ...formData, merchLat: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Longitud"
                    value={formData.merchLong}
                    onChange={(e) => setFormData({ ...formData, merchLong: e.target.value })}
                  />
                </div>
              </div>

              {/* Comercio (requerido si se guarda en BD) */}
              {formData.saveToDB && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Store className="w-4 h-4 text-gray-500" /> Nombre del Comercio
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ej: Amazon Store, Walmart, etc."
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    required={formData.saveToDB}
                  />
                </div>
              )}

              {/* Toggle Guardar en BD */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Guardar en BD</span>
                    <p className="text-xs text-gray-500">Persiste la transacción y predicción</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, saveToDB: !formData.saveToDB })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${formData.saveToDB ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.saveToDB ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isAnalyzing || !formData.amount || !formData.category || (formData.saveToDB && !formData.merchant.trim())}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Simulando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4" /> {formData.saveToDB ? 'Simular y Guardar' : 'Simular Predicción'}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="lg:col-span-2">
          {result && result.veredicto ? (
            <div className={`h-full flex flex-col backdrop-blur-xl bg-white/90 rounded-xl border-2 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4
                    ${(result.score_final || 0) > 0.5 ? 'border-red-100 shadow-red-50' : 'border-emerald-100 shadow-emerald-50'}`}>

              {/* Header de Resultados */}
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${(result.score_final || 0) > 0.5 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    {(result.score_final || 0) > 0.5 ? (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${getScoreColor(result.score_final || 0)}`}>
                      {result.veredicto}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">{result.recomendacion}</span>
                    </div>
                    {result.saved_to_db ? (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        ✅ Guardado en BD - ID: {result.transaction_id}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        ⚠️ Simulación - No guardada en BD
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Probabilidad de Fraude
                  </span>
                  <div className={`text-4xl font-black tabular-nums ${getScoreColor(result.score_final || 0)}`}>
                    {((result.score_final || 0) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Explicabilidad SHAP */}
              <div className="p-6 flex-1 bg-gray-50/50 rounded-b-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Factores Clave de Decisión (SHAP)</h3>
                </div>

                {result.detalles_riesgo && result.detalles_riesgo.length > 0 ? (
                  <div className="space-y-3">
                    {result.detalles_riesgo.map((factor: RiskFactor, idx: number) => {
                      const maxVal = 5.0;
                      const percentage = Math.min((Math.abs(factor.shap_value) / maxVal) * 100, 100);

                      return (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-800 uppercase">
                                {factor.feature_name.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                {factor.feature_value}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${factor.shap_value > 0 ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'
                              }`}>
                              {factor.shap_value > 0 ? '+' : ''}{factor.shap_value.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{factor.risk_description}</p>
                          <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                            <div
                              className={`h-full ${getShapColor(factor.shap_value)} transition-all duration-700`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Sin detalles SHAP disponibles</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30">
              <div className="w-16 h-16 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Esperando Simulación</h3>
              <p className="text-gray-500 max-w-xs mt-1">
                1. Ingrese un número de tarjeta y busque al cliente<br />
                2. Complete los datos de simulación<br />
                3. Presione "Simular Predicción"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}