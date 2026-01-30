import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar,
  CloudSun,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";
import { useWeather } from "../hooks/useWeatherQueries";
import KPICard from "../components/KPICard";
import { ComparisonChart, ConfidenceIntervalChart } from "../components/Charts";
import { toast } from "sonner";

// Mock Data Generators
const generateMockPredictions = (weatherId: number, cashMultiplier: number) => {
  const atms = [
    "ATM-001",
    "ATM-002",
    "ATM-003",
    "ATM-004",
    "ATM-005",
    "ATM-006",
  ];
  return atms.map((atm) => {
    const baseDemand = Math.floor(Math.random() * 50000) + 20000;
    // Weather impact: 1=Sunny (normal), 2=Rain (lower demand), 3=Event (high demand)
    let weatherFactor = 1.0;
    if (weatherId === 2) weatherFactor = 0.8;
    if (weatherId === 3) weatherFactor = 1.4;

    const predicted = Math.floor(baseDemand * weatherFactor * cashMultiplier);
    const volatility = Math.floor(predicted * 0.15); // 15% volatility

    return {
      atmId: atm,
      historical: Math.floor(baseDemand * (0.9 + Math.random() * 0.2)), // +/- 10%
      predicted: predicted,
      lowerBound: predicted - volatility,
      upperBound: predicted + volatility,
    };
  });
};

export function Simulator() {
  // State de Dia para que sea por defecto el dia de hoy
  const [targetDate, setTargetDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [weather, setWeather] = useState(0); // 0: No seleccionado, number: ID del clima
  const [cashLevel, setCashLevel] = useState(80); // Porcentaje de efectivo
  const [isSimulating, setIsSimulating] = useState(false); // Estado de simulación (si está cargando)
  const { data: weatherList, isLoading: isLoadingWeather } = useWeather(); // Hook para obtener el clima

  // Derived Data
  const data = useMemo(
    () => generateMockPredictions(weather, 1 + (100 - cashLevel) / 200),
    [targetDate, weather, cashLevel],
  );

  // KPIs
  const totalPredicted = data.reduce((acc, curr) => acc + curr.predicted, 0);
  const totalOptimistic = data.reduce((acc, curr) => acc + curr.upperBound, 0);
  const totalPessimistic = data.reduce((acc, curr) => acc + curr.lowerBound, 0);

  // Risk Logic
  const riskLevel = useMemo(() => {
    if (cashLevel < 30) return "high";
    if (cashLevel < 60) return "medium";
    return "low";
  }, [cashLevel]);

  const riskBadgeColor = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-orange-100 text-orange-700 border-orange-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const riskLabel = {
    high: "ALTO RIESGO",
    medium: "RIESGO MODERADO",
    low: "BAJO RIESGO",
  };

  const recommendation = useMemo(() => {
    if (riskLevel === "high")
      return "Se recomienda programar recargas de emergencia inmediatamente. El nivel actual de efectivo es insuficiente para cubrir la demanda proyectada, especialmente en escenarios optimistas.";
    if (riskLevel === "medium")
      return "Monitorear de cerca los ATM con alta volatilidad. Considere realizar recargas preventivas en ATM-003 y ATM-005 antes del fin de semana.";
    return "Los niveles de efectivo son óptimos. No se requieren acciones inmediatas. El modelo predice estabilidad en la red para las próximas 24 horas.";
  }, [riskLevel]);

  const handleSimulate = () => {
    setIsSimulating(true);
    // Fake delay
    setTimeout(() => {
      setIsSimulating(false);
      toast.success("Simulación actualizada con los nuevos parámetros.");
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Simulador de Demanda
          </h2>
          <p className="text-slate-500 text-sm">
            Ajusta los parámetros para predecir el comportamiento de retiro.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            {isSimulating ? (
              "Calculando..."
            ) : (
              <>
                <Search size={18} /> Ejecutar Simulación
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters / Parameters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Date Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar size={16} /> Fecha Objetivo
          </label>
          <input
            type="date"
            min={format(new Date(), "yyyy-MM-dd")}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        {/* Weather Select */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <CloudSun size={16} /> Pronóstico del Clima
          </label>
          <select
            value={weather}
            onChange={(e) => setWeather(Number(e.target.value))}
            disabled={isLoadingWeather}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none disabled:opacity-50"
          >
            {isLoadingWeather ? (
              <option>Cargando clima...</option>
            ) : (
              weatherList?.data?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))
            )}
            {!isLoadingWeather && !weatherList?.data?.length && (
              <>
                <option value={0}> Error al cargar clima</option>
              </>
            )}
          </select>
        </div>

        {/* Cash Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign size={16} /> Nivel de Carga Actual
            </label>
            <span className="text-sm font-bold text-blue-600">
              {cashLevel}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={cashLevel}
            onChange={(e) => setCashLevel(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Vacío</span>
            <span>Lleno</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Escenario Pesimista"
          value={`$${totalPessimistic.toLocaleString()}`}
          icon={AlertTriangle}
          color="orange"
        />
        
        <KPICard
          title="Demanda Predicha Total"
          value={`$${totalPredicted.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
        />

        <KPICard
          title="Escenario Optimista"
          value={`$${totalOptimistic.toLocaleString()}`}
          icon={CheckCircle}
          color="green"
        />

        {/* Risk Badge Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Riesgo de Desabastecimiento
            </p>
            <div
              className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeColor[riskLevel]}`}
            >
              {riskLabel[riskLevel]}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Basado en la carga actual y demanda proyectada.
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Predicción vs Histórico por ATM
          </h3>
          <ComparisonChart data={data} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Intervalos de Confianza (95%)
          </h3>
          <ConfidenceIntervalChart data={data} />
        </div>
      </div>

      {/* Recommendation Section */}
      <div
        className={`p-6 rounded-xl border border-l-4 shadow-sm ${
          riskLevel === "high"
            ? "bg-red-50 border-red-500 border-l-red-500"
            : riskLevel === "medium"
              ? "bg-orange-50 border-orange-500 border-l-orange-500"
              : "bg-blue-50 border-blue-500 border-l-blue-500"
        }`}
      >
        <h4
          className={`text-lg font-bold mb-2 ${
            riskLevel === "high"
              ? "text-red-800"
              : riskLevel === "medium"
                ? "text-orange-800"
                : "text-blue-800"
          }`}
        >
          Recomendación de Operaciones
        </h4>
        <p
          className={`text-sm ${
            riskLevel === "high"
              ? "text-red-700"
              : riskLevel === "medium"
                ? "text-orange-700"
                : "text-blue-700"
          }`}
        >
          {recommendation}
        </p>
      </div>
    </div>
  );
}
