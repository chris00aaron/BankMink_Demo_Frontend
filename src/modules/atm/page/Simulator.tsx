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
  Activity,
} from "lucide-react";
import { useWeather } from "../hooks/useWeatherQueries";
import { useSimulation } from "../hooks/useAtmQueries";
import { KPICard } from "../components/KPICard";
import { ComparisonChart, ConfidenceIntervalChart, ConfidenceLinesChart } from "../components/Charts";
import { toast } from "sonner";
import styles from "../styles/Simulator.module.css";
import { EmptyStateSimulator } from "../components/EmptyStateSimulator";
import { ChartContainer } from "../components/ChartContainer";
import { LoadingState } from "../components/LoadingState";

export function Simulator() {
  const [targetDate, setTargetDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weather, setWeather] = useState(0);
  const [cashLevel, setCashLevel] = useState(80);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  
  const { data: weatherList, isLoading: isLoadingWeather } = useWeather();
  const simulationMutation = useSimulation();
  const simulationResult = simulationMutation.data;

  // Transform API data for charts
  const chartData = useMemo(() => {
    if (!simulationResult) return [];
    
    const predictionsMap = new Map(
      simulationResult.predicciones?.map((p) => [p.idAtm, p]) || []
    );

    return (simulationResult.retirosHistoricos || []).map((h) => {
      const prediction = predictionsMap.get(h.atm);
      return {
        atmId: `ATM-${h.atm}`,
        historical: h.retiroHistorico,
        predicted: prediction?.retiroPrevisto || 0,
        lowerBound: prediction?.lowerBound || 0,
        upperBound: prediction?.upperBound || 0,
      };
    });
  }, [simulationResult]);

  // KPIs from API summary
  const totalPredicted = simulationResult?.resumen.totalRetirosPrevisto || 0;
  const totalOptimistic = simulationResult?.resumen.totalRetirosPrevistoOptimista || 0;
  const totalPessimistic = simulationResult?.resumen.totalRetirosPrevistoPesimista || 0;

  // Risk Logic
  const riskLevel = useMemo(() => {
    if (cashLevel < 30) return "high";
    if (cashLevel < 60) return "medium";
    return "low";
  }, [cashLevel]);

  const riskConfig = {
    high: {
      badge: "bg-red-100 text-red-700 border-red-200",
      label: "ALTO RIESGO",
      container: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200",
      accent: "border-l-red-500",
      title: "text-red-800",
      text: "text-red-700",
    },
    medium: {
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      label: "RIESGO MODERADO",
      container: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
      accent: "border-l-amber-500",
      title: "text-amber-800",
      text: "text-amber-700",
    },
    low: {
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "BAJO RIESGO",
      container: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
      accent: "border-l-emerald-500",
      title: "text-emerald-800",
      text: "text-emerald-700",
    },
  };

  const recommendation = useMemo(() => {
    if (riskLevel === "high")
      return "Se recomienda programar recargas de emergencia inmediatamente. El nivel actual de efectivo es insuficiente para cubrir la demanda proyectada, especialmente en escenarios optimistas.";
    if (riskLevel === "medium")
      return "Monitorear de cerca los ATM con alta volatilidad. Considere realizar recargas preventivas en ATM-003 y ATM-005 antes del fin de semana.";
    return "Los niveles de efectivo son óptimos. No se requieren acciones inmediatas. El modelo predice estabilidad en la red para las próximas 24 horas.";
  }, [riskLevel]);

  const handleSimulate = () => {
    if (weather === 0) {
      toast.error("Por favor selecciona un clima.");
      return;
    }

    setIsSimulating(true);
    simulationMutation.mutate(
      {
        fechaObjetivo: targetDate,
        idWeather: weather,
        nivelCarga: cashLevel,
      },
      {
        onSuccess: () => {
          toast.success("Simulación completada correctamente.");
          setIsSimulating(false);
          setHasSimulated(true);
        },
        onError: (error) => {
          toast.error(`Error en la simulación: ${error.message}`);
          setIsSimulating(false);
        },
      }
    );
  };

  const risk = riskConfig[riskLevel];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className={`space-y-6 p-4 sm:p-6 lg:px-8 w-full mx-auto 2xl:max-w-[1500px] pb-16 ${styles.fadeIn}`}>
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-violet-500 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Simulador de Demanda
              </h2>
            </div>
            <p className="text-slate-500 ml-4">
              Ajusta los parámetros para predecir el comportamiento de retiro.
            </p>
          </div>
          
          {hasSimulated && !isSimulating && (
            <button
              onClick={handleSimulate}
              disabled={weather === 0}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none"
            >
              <Search size={18} />
              Ejecutar Simulación
            </button>
          )}
        </header>

        {/* Parameters Panel */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Calendar size={14} className="text-blue-600" />
                </div>
                Fecha Objetivo
              </label>
              <input
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all duration-200 hover:border-slate-300"
              />
            </div>

            {/* Weather Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <CloudSun size={14} className="text-amber-600" />
                </div>
                Pronóstico del Clima
              </label>
              <div className="relative">
                <select
                  value={weather}
                  onChange={(e) => setWeather(Number(e.target.value))}
                  disabled={isLoadingWeather}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none disabled:opacity-50 transition-all duration-200 hover:border-slate-300 pr-10"
                >
                  {isLoadingWeather ? (
                    <option>Cargando clima...</option>
                  ) : (
                    <>
                      <option value={0}>Seleccionar clima...</option>
                      {weatherList?.data?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cash Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-lg">
                    <DollarSign size={14} className="text-emerald-600" />
                  </div>
                  Nivel de Carga Actual
                </label>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {cashLevel}%
                </span>
              </div>
              <div className="pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cashLevel}
                  onChange={(e) => setCashLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  style={{
                    background: `linear-gradient(to right, #2563eb ${cashLevel}%, #e2e8f0 ${cashLevel}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Vacío</span>
                  <span>Lleno</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conditional Content */}
        {isSimulating ? (
          <LoadingState />
        ) : !hasSimulated ? (
          <EmptyStateSimulator onSimulate={handleSimulate} isDisabled={weather === 0} />
        ) : (
          <div className={`space-y-6 ${styles.resultsSection}`}>
            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6">
              <KPICard
                title="Escenario Pesimista"
                value={`$${totalPessimistic.toLocaleString()}`}
                icon={AlertTriangle}
                color="orange"
                className={styles.kpiCard}
              />
              <KPICard
                title="Demanda Predicha Total"
                value={`$${totalPredicted.toLocaleString()}`}
                icon={TrendingUp}
                color="blue"
                className={styles.kpiCard}
              />
              <KPICard
                title="Escenario Optimista"
                value={`$${totalOptimistic.toLocaleString()}`}
                icon={CheckCircle}
                color="green"
                className={styles.kpiCard}
              />
              
              {/* Risk Badge Card */}
              <div className={`group bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${styles.hoverLift} ${styles.kpiCard}`}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Riesgo de Desabastecimiento
                    </p>
                    <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${risk.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${styles.pulseEffect}`} />
                      {risk.label}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Basado en la carga actual y demanda proyectada.
                  </p>
                </div>
              </div>
            </section>

            {/* Charts Section - Improved spacing with xl/2xl breakpoint for sidebar */}
            <section className="grid grid-cols-1 2xl:grid-cols-2 gap-6 lg:gap-8 min-h-[400px]">
              <ChartContainer 
                title="Predicción vs Histórico por ATM"
                subtitle="Comparativa de retiros reales vs proyectados"
                className={styles.chartContainer}
              >
                <ComparisonChart data={chartData} />
              </ChartContainer>
              
              <ChartContainer 
                title="Intervalos de Confianza (95%)"
                subtitle="Rango de variación esperado por ATM"
                className={styles.chartContainerAlt}
              >
                <ConfidenceIntervalChart data={chartData} />
              </ChartContainer>

              <ChartContainer 
                title="Análisis de Límites de Predicción"
                subtitle="Valores máximos y mínimos con líneas continuas"
                className={`2xl:col-span-2 min-h-0 ${styles.chartContainerAlt}`}
              >
                <ConfidenceLinesChart data={chartData} />
              </ChartContainer>
            </section>

            {/* Recommendation Section */}
            <section className={`p-6 rounded-2xl border border-l-4 ${risk.container} ${risk.accent} shadow-sm ${styles.hoverLift} ${styles.recommendationCard}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${risk.badge} border-0 flex-shrink-0`}>
                  {riskLevel === 'high' ? <AlertTriangle size={20} /> : 
                   riskLevel === 'medium' ? <Activity size={20} /> : 
                   <CheckCircle size={20} />}
                </div>
                <div className="min-w-0">
                  <h4 className={`text-lg font-bold mb-2 ${risk.title}`}>
                    Recomendación de Operaciones
                  </h4>
                  <p className={`text-sm leading-relaxed ${risk.text}`}>
                    {recommendation}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );}