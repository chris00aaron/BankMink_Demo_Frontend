<<<<<<< Updated upstream
import { useState } from 'react';
import { DollarSign, Tag, Store, MapPin, Brain, Activity, TrendingUp } from 'lucide-react';
=======
import { useState, useEffect } from 'react';
import {
  DollarSign, Tag, Brain, Activity, Search, AlertTriangle, CheckCircle,
  Clock, MapPin, User, Shield, Loader2, CreditCard, RefreshCw
} from 'lucide-react';
>>>>>>> Stashed changes
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
<<<<<<< Updated upstream

interface PredictionResult {
  xgboost: number;
  isolationForest: number;
  finalPrediction: 'legitimate' | 'fraud' | 'review';
  confidence: number;
}
=======
import { catalogService } from '../services/catalogService';
import { whatIfService, WhatIfResponse, RiskFactor } from '../services/whatIfService';
>>>>>>> Stashed changes

export function IndividualPrediction() {
  // Estado del formulario
  const [ccNum, setCcNum] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
<<<<<<< Updated upstream
    merchant: '',
    latitude: '',
    longitude: '',
=======
    hour: new Date().getHours().toString(),
    merchLat: '',
    merchLong: '',
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simular análisis del modelo híbrido
    setTimeout(() => {
      const xgboostScore = Math.random() * 100;
      const isolationScore = Math.random() * 100;
      const avgScore = (xgboostScore + isolationScore) / 2;

      let prediction: 'legitimate' | 'fraud' | 'review';
      if (avgScore > 75) {
        prediction = 'legitimate';
      } else if (avgScore < 40) {
        prediction = 'fraud';
      } else {
        prediction = 'review';
      }

      setResult({
        xgboost: +xgboostScore.toFixed(1),
        isolationForest: +isolationScore.toFixed(1),
        finalPrediction: prediction,
        confidence: +avgScore.toFixed(1),
      });
      setIsAnalyzing(false);
    }, 2000);
=======
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
      const response = await whatIfService.lookupCustomer(Number(ccNum));

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
>>>>>>> Stashed changes
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
        cc_num: Number(ccNum),
        amt: Number(formData.amount),
        category: formData.category,
        hour: Number(formData.hour),
        merch_lat: formData.merchLat ? Number(formData.merchLat) : undefined,
        merch_long: formData.merchLong ? Number(formData.merchLong) : undefined,
      });

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
      amount: '',
      category: '',
<<<<<<< Updated upstream
      merchant: '',
      latitude: '',
      longitude: '',
=======
      hour: new Date().getHours().toString(),
      merchLat: '',
      merchLong: '',
>>>>>>> Stashed changes
    });
    setCustomerInfo(null);
    setResult(null);
    setError(null);
  };

<<<<<<< Updated upstream
=======
  // Helpers de colores
  const getScoreColor = (score: number) => score > 0.5 ? 'text-red-600' : 'text-emerald-600';
  const getShapColor = (val: number) => val > 0 ? 'bg-red-500' : 'bg-emerald-500';

>>>>>>> Stashed changes
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predicción Individual</h1>
<<<<<<< Updated upstream
        <p className="text-gray-600 mt-1">Evaluación detallada de transacción mediante modelo híbrido de IA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Transaction Form */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Evaluación de Transacción</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Monto de la Transacción
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700 text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Categoría
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="retail" className="text-gray-900 hover:bg-gray-50">Retail</SelectItem>
                  <SelectItem value="online" className="text-gray-900 hover:bg-gray-50">Compra Online</SelectItem>
                  <SelectItem value="transfer" className="text-gray-900 hover:bg-gray-50">Transferencia</SelectItem>
                  <SelectItem value="atm" className="text-gray-900 hover:bg-gray-50">Cajero Automático</SelectItem>
                  <SelectItem value="restaurant" className="text-gray-900 hover:bg-gray-50">Restaurante</SelectItem>
                  <SelectItem value="travel" className="text-gray-900 hover:bg-gray-50">Viajes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Merchant Field */}
            <div className="space-y-2">
              <Label htmlFor="merchant" className="text-gray-700 text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                Comercio
              </Label>
              <Input
                id="merchant"
                type="text"
                placeholder="Nombre del comercio"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-2 gap-4">
=======
        <p className="text-gray-600 mt-1">
          Simulador "What-If" - Evalúe escenarios hipotéticos{' '}
          <span className="text-amber-600 font-medium">(No se guarda en BD)</span>
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
          <div className={`backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg transition-opacity ${customerInfo?.found ? 'opacity-100' : 'opacity-50 pointer-events-none'
            }`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Datos de Simulación</h2>
            </div>

            <form onSubmit={handleSimulate} className="space-y-4">
              {/* Monto */}
>>>>>>> Stashed changes
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-gray-700 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  type="number"
<<<<<<< Updated upstream
                  step="0.000001"
                  placeholder="40.7128"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
=======
                  step="0.01"
                  placeholder="Ej: 15420.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
>>>>>>> Stashed changes
                  required
                />
              </div>
<<<<<<< Updated upstream
=======

              {/* Categoría */}
>>>>>>> Stashed changes
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-gray-700 text-sm">
                  Longitud
                </Label>
<<<<<<< Updated upstream
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="-74.0060"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
=======
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
>>>>>>> Stashed changes
              </div>
            </div>

<<<<<<< Updated upstream
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analizar Transacción
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="bg-transparent border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Limpiar
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column - Verdict Card */}
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Tarjeta de Veredicto</h2>
            </div>

            {result ? (
              <div className="space-y-6">
                {/* Final Verdict */}
                <div className={`p-6 rounded-xl border-2 ${result.finalPrediction === 'legitimate'
                  ? 'bg-emerald-50 border-emerald-300'
                  : result.finalPrediction === 'fraud'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-orange-50 border-orange-300'
                  }`}>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Veredicto Final</p>
                    <p className={`text-3xl font-bold mb-2 ${result.finalPrediction === 'legitimate'
                      ? 'text-emerald-600'
                      : result.finalPrediction === 'fraud'
                        ? 'text-red-600'
                        : 'text-orange-600'
                      }`}>
                      {result.finalPrediction === 'legitimate' ? 'LEGÍTIMA' :
                        result.finalPrediction === 'fraud' ? 'FRAUDE' : 'REVISAR'}
                    </p>
                    <p className="text-sm text-gray-700">
                      Confianza: {result.confidence}%
                    </p>
                  </div>
                </div>

                {/* Model Scores */}
                <div className="space-y-4">
                  {/* XGBoost Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">XGBoost Probability</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{result.xgboost}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${result.xgboost}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Isolation Forest Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Isolation Forest Score</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{result.isolationForest}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${result.isolationForest}%` }}
                      ></div>
=======
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

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isAnalyzing || !formData.amount || !formData.category}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Simulando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4" /> Simular Predicción
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
>>>>>>> Stashed changes
                    </div>
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      ⚠️ Simulación - No guardada en BD
                    </p>
                  </div>
                </div>
<<<<<<< Updated upstream

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Recomendación</p>
                  <p className="text-xs text-gray-600">
                    {result.finalPrediction === 'legitimate'
                      ? 'La transacción presenta patrones normales. Se recomienda aprobar.'
                      : result.finalPrediction === 'fraud'
                        ? 'Se detectaron anomalías significativas. Se recomienda rechazar y revisar manualmente.'
                        : 'La transacción presenta algunos indicadores inusuales. Se recomienda revisión adicional.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Complete el formulario y presione "Analizar" para obtener el veredicto</p>
              </div>
            )}
          </div>
=======
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
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}