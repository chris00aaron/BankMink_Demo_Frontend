import { useState } from 'react';
import { DollarSign, Tag, Store, MapPin, Brain, Activity, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PredictionResult {
  xgboost: number;
  isolationForest: number;
  finalPrediction: 'legitimate' | 'fraud' | 'review';
  confidence: number;
}

export function XRAIIndividualPrediction() {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    merchant: '',
    latitude: '',
    longitude: '',
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
  };

  const handleReset = () => {
    setFormData({
      amount: '',
      category: '',
      merchant: '',
      latitude: '',
      longitude: '',
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predicción Individual</h1>
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
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-gray-700 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="40.7128"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-gray-700 text-sm">
                  Longitud
                </Label>
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
              </div>
            </div>

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
                <div className={`p-6 rounded-xl border-2 ${
                  result.finalPrediction === 'legitimate' 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : result.finalPrediction === 'fraud'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-orange-50 border-orange-300'
                }`}>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Veredicto Final</p>
                    <p className={`text-3xl font-bold mb-2 ${
                      result.finalPrediction === 'legitimate' 
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
                    </div>
                  </div>
                </div>

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
        </div>
      </div>
    </div>
  );
}