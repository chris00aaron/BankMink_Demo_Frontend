import { useState } from 'react';
import { DollarSign, Tag, Brain, Activity, Search, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp, User, Shield } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';

// --- INTERFACES (Consistentes con RiskAnalysis) ---
interface ApiRiskFactor {
  feature_name: string;
  feature_value: string;
  shap_value: number;
  risk_description: string;
  impact_direction: string;
}

interface PredictionResult {
  transaction_id: string;
  veredicto: string;      // "ALTO RIESGO" | "LEGÍTIMO"
  score_final: number;    // Float 0-1
  detalles_riesgo: ApiRiskFactor[];
  recomendacion: string;
}

export function IndividualPrediction() {
  const [formData, setFormData] = useState({
    transaction_id: `TXN-${Math.floor(Math.random() * 10000)}`,
    amount: '',
    category: '',
    merchant: '',
    distance_km: '',
    hour: new Date().getHours().toString(),
    age: ''
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- LÓGICA DE SIMULACIÓN (What-If Analysis) ---
  const simulatePrediction = () => {
    const amt = Number(formData.amount) || 0;
    const hour = Number(formData.hour) || 12;
    const dist = Number(formData.distance_km) || 0;
    const age = Number(formData.age) || 30;

    let baseScore = 0.05; // Riesgo base muy bajo
    const risks: ApiRiskFactor[] = [];

    // 1. Regla: Monto Alto
    if (amt > 5000) {
      baseScore += 0.60;
      risks.push({
        feature_name: "amt",
        feature_value: amt.toFixed(2),
        shap_value: 4.50,
        risk_description: "Monto inusualmente alto para el perfil.",
        impact_direction: "AUMENTA_RIESGO"
      });
    } else if (amt > 1000) {
      baseScore += 0.20;
      risks.push({
        feature_name: "amt",
        feature_value: amt.toFixed(2),
        shap_value: 1.20,
        risk_description: "Monto superior al promedio diario.",
        impact_direction: "AUMENTA_RIESGO"
      });
    }

    // 2. Regla: Hora Sospechosa (Madrugada)
    if (hour < 6 || hour > 23) {
      baseScore += 0.30;
      risks.push({
        feature_name: "hour",
        feature_value: hour.toString(),
        shap_value: 2.10,
        risk_description: "Transacción realizada en horario inusual.",
        impact_direction: "AUMENTA_RIESGO"
      });
    }

    // 3. Regla: Distancia (Ubicación inusual)
    if (dist > 100) {
      baseScore += 0.40;
      risks.push({
        feature_name: "distance_km",
        feature_value: dist.toFixed(1),
        shap_value: 3.05,
        risk_description: "Ubicación muy distante del hogar.",
        impact_direction: "AUMENTA_RIESGO"
      });
    }

    // 4. Factores Mitigantes (Si no es riesgo obvio)
    if (baseScore < 0.5) {
      risks.push({
        feature_name: "history",
        feature_value: "Good",
        shap_value: -0.85,
        risk_description: "Historial de cliente confiable.",
        impact_direction: "DISMINUYE_RIESGO"
      });
      risks.push({
        feature_name: "device",
        feature_value: "Mobile",
        shap_value: -0.40,
        risk_description: "Dispositivo conocido.",
        impact_direction: "DISMINUYE_RIESGO"
      });
    } else {
      // Factor neutro si es riesgo
      risks.push({
        feature_name: "device",
        feature_value: "New IP",
        shap_value: 0.15,
        risk_description: "Dispositivo o IP nueva.",
        impact_direction: "AUMENTA_RIESGO"
      });
    }

    // Normalizar Score
    const finalScore = Math.min(Math.max(baseScore, 0.001), 0.999);
    const isFraud = finalScore > 0.5;

    return {
      transaction_id: formData.transaction_id,
      veredicto: isFraud ? "ALTO RIESGO" : "LEGÍTIMO",
      score_final: finalScore,
      recomendacion: isFraud ? "Bloquear y Notificar" : "Aprobar Transacción",
      detalles_riesgo: risks.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);

    // Simular delay de red
    setTimeout(() => {
      const pred = simulatePrediction();
      setResult(pred);
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      transaction_id: `TXN-${Math.floor(Math.random() * 10000)}`,
      amount: '',
      category: '',
      merchant: '',
      distance_km: '',
      hour: new Date().getHours().toString(),
      age: ''
    });
    setResult(null);
  };

  // Helper de Colores
  const getScoreColor = (score: number) => score > 0.5 ? 'text-red-600' : 'text-emerald-600';
  const getBgColor = (score: number) => score > 0.5 ? 'bg-red-500' : 'bg-emerald-500';
  const getShapColor = (val: number) => val > 0 ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predicción Individual</h1>
        <p className="text-gray-600 mt-1">Simulador de fraude en tiempo real ("What-If Analysis")</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Datos de Entrada</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Transacción</Label>
                <Input value={formData.transaction_id} disabled className="bg-gray-50 font-mono text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4 text-gray-500" /> Monto ($)
                </Label>
                <Input
                  type="number"
                  placeholder="Ej: 15420.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="font-medium text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-gray-500" /> Hora
                  </Label>
                  <Input
                    type="number" min="0" max="23"
                    value={formData.hour}
                    onChange={e => setFormData({ ...formData, hour: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-gray-500" /> Distancia (km)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.distance_km}
                    onChange={e => setFormData({ ...formData, distance_km: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-gray-500" /> Categoría
                </Label>
                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Compras Online</SelectItem>
                    <SelectItem value="grocery">Supermercado</SelectItem>
                    <SelectItem value="travel">Viajes</SelectItem>
                    <SelectItem value="tech">Tecnología</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isAnalyzing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Analizando...</span>
                  ) : "Predecir Riesgo"}
                </Button>
                <Button type="button" onClick={handleReset} variant="outline" className="text-gray-600">
                  Limpiar
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="lg:col-span-2">
          {result ? (
            <div className={`h-full flex flex-col backdrop-blur-xl bg-white/90 rounded-xl border-2 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4
                    ${result.score_final > 0.5 ? 'border-red-100 shadow-red-50' : 'border-emerald-100 shadow-emerald-50'}`}>

              {/* Header Resultados */}
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${result.score_final > 0.5 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    {result.score_final > 0.5 ? <AlertTriangle className="w-8 h-8 text-red-600" /> : <CheckCircle className="w-8 h-8 text-emerald-600" />}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${getScoreColor(result.score_final)}`}>
                      {result.veredicto}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">{result.recomendacion}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Probabilidad de Fraude</span>
                  <div className={`text-4xl font-black tabular-nums ${getScoreColor(result.score_final)}`}>
                    {(result.score_final * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Explicabilidad SHAP */}
              <div className="p-6 flex-1 bg-gray-50/50 rounded-b-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Factores Clave de Decisión (SHAP Values)</h3>
                </div>

                <div className="space-y-3">
                  {result.detalles_riesgo.map((factor, idx) => {
                    const maxVal = 5.0; // Valor de referencia visual
                    const percentage = Math.min((Math.abs(factor.shap_value) / maxVal) * 100, 100);

                    return (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800 uppercase">{factor.feature_name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                              Val: {factor.feature_value}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded 
                                                ${factor.shap_value > 0 ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>
                            {factor.shap_value > 0 ? '+' : ''}{factor.shap_value.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-2">{factor.risk_description}</p>

                        {/* Barra de Progreso Visual */}
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
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30">
              <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Esperando Análisis</h3>
              <p className="text-gray-500 max-w-xs mt-1">
                Complete los parámetros de la transacción y presione "Predecir" para ver el resultado del modelo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}