import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  ChevronRight,
  Server,
  ChevronLeft,
  TrendingDown,
  Clock,
  Zap,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { CustomTooltip } from "../components/CustomTooltip";
import { MetricCard } from "../components/MetricCard";
import styles from "../styles/ModelAudit.module.css";
import ModelDetailView from "./SelfTrainingDetails"; // Import the detail view

import {
  withdrawalModelService,
  type ModelProductionDTO,
  type RegistroAutoentrenamientoDTO,
} from "../services/withdrawalModelService";
import type { SpringPage } from "@shared/api";

export default function ModelAudit() {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const itemsPerPage = 5;

  const [productionModel, setProductionModel] =
    useState<ModelProductionDTO | null>(null);
  const [history, setHistory] =
    useState<SpringPage<RegistroAutoentrenamientoDTO> | null>(null);
  const [loading, setLoading] = useState(false);

  // New state for selected model to show details
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  // Initial Fetch
  useEffect(() => {
    loadProductionModel();
  }, []); // Only run once

  // Fetch history on page change
  useEffect(() => {
    loadHistory(currentPage);
  }, [currentPage]);

  const loadProductionModel = async () => {
    try {
      const response = await withdrawalModelService.getProductionModel();
      if (response && response.data) {
        setProductionModel(response.data);
      }
    } catch (error) {
      console.error("Failed to load production model", error);
    }
  };

  const loadHistory = async (page: number) => {
    setLoading(true);
    try {
      const response = await withdrawalModelService.getTrainingHistory(
        page - 1,
        itemsPerPage,
      ); // API uses 0-based index
      if (response && response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = history?.page?.totalPages || 0;
  const currentItems = history?.content || [];

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Chart Data (Derived from current page items, reversed for chronological order if backend sends desc)
  // Assuming backend sends most recent first (desc).
  const chartData = [...currentItems].reverse().map((m) => ({
    name: m.nombreModelo.split("_")[1] || m.nombreModelo,
    mape: m.mape,
    mae: m.mae,
    date: m.startTraining ? m.startTraining.split("T")[0] : "",
  }));

  const getMapeColor = (mape: number) => {
    if (mape < 5) return "text-emerald-600 bg-emerald-50";
    if (mape < 8) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  // Render Detail View logic
  if (selectedModelId) {
    return (
      <ModelDetailView
        modelId={selectedModelId}
        onBack={() => setSelectedModelId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Subtle Pattern Overlay */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: styles.bgGridPattern }}
      />

      <div className="relative space-y-8 p-6 lg:p-8 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <header className={styles.fadeIn}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  Auditoría de Modelos
                </h1>
              </div>
              <p className="text-slate-500 ml-4 lg:ml-5">
                Registro histórico de entrenamiento y métricas de rendimiento
              </p>
            </div>

            {/* Production Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="relative">
                  <Server size={18} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <div className="text-sm">
                  <span className="opacity-80">Producción:</span>
                  <span className="font-bold ml-1">
                    {productionModel?.nombreModelo || "Cargando..."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl border border-slate-200 text-sm">
                <Clock size={16} className="text-slate-400" />
                <span className="opacity-70">Desde:</span>
                <span className="font-semibold text-slate-800">
                  {productionModel?.desde
                    ? productionModel.desde.toString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics Overview */}
        <section
          className={`grid grid-cols-1 md:grid-cols-3 gap-5 ${styles.fadeIn}`}
        >
          <MetricCard
            icon={TrendingDown}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Precisión Actual (MAPE)"
            value={`${productionModel?.mape || 0}%`}
            sublabel="Porcentaje de error promedio"
            delay={0}
          />
          <MetricCard
            icon={Activity}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Error Medio Absoluto (MAE)"
            value={`$${productionModel?.mae?.toLocaleString() || 0}`}
            sublabel="Promedio de desviación por predicción"
            delay={100}
          />
          <MetricCard
            icon={Zap}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            label="Error Cuadrático Medio (RMSE)"
            value={`$${productionModel?.rmse?.toLocaleString() || 0}`}
            sublabel="Raíz del promedio de diferencias²"
            delay={200}
          />
        </section>

        {/* Evolution Chart */}
        <section
          className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden ${styles.fadeIn}`}
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Evolución del Error (MAPE)
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Tendencia histórica de precisión del modelo
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>MAPE %</span>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="mapeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mape"
                    name="MAPE"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#mapeGradient)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Detailed History Table */}
        <section
          className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden ${styles.fadeIn}`}
        >
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Historial de Entrenamientos
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Registro detallado de cada iteración del modelo
            </p>
          </div>

          <div className="overflow-x-auto">
            <table
              className={`w-full text-sm ${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    MAPE
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    MAE
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    RMSE
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((model) => (
                  <tr
                    key={model.id}
                    className={`
                      transition-all duration-200 cursor-pointer ${styles.tableRowEnter}
                      ${hoveredRow === model.id ? "bg-blue-50/50" : "hover:bg-slate-50/70"}
                      ${model.isProduction ? "bg-gradient-to-r from-blue-50/50 to-transparent" : ""}
                    `}
                    onMouseEnter={() => setHoveredRow(model.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => setSelectedModelId(model.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          p-2 rounded-lg transition-colors duration-200
                          ${model.isProduction ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}
                          ${hoveredRow === model.id ? "scale-110" : ""}
                        `}
                        >
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {model.nombreModelo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">
                        {model.startTraining
                          ? model.startTraining.split("T")[0]
                          : "-"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {model.startTraining
                          ? model.startTraining.split("T")[1]?.substring(0, 5)
                          : ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`
                        inline-flex items-center px-3 py-1.5 rounded-lg font-mono font-bold text-sm
                        transition-transform duration-200
                        ${getMapeColor(model.mape)}
                        ${hoveredRow === model.id ? "scale-105" : ""}
                      `}
                      >
                        {model.mape}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">
                      ${model.mae.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">
                      ${model.rmse.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-600">
                        {model.trainingDurationMinutes} min
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {model.isProduction ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          Producción
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Archivado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className={`
                        p-2 rounded-lg transition-all duration-200
                        ${
                          hoveredRow === model.id
                            ? "bg-blue-100 text-blue-600 translate-x-1"
                            : "text-slate-400 hover:text-slate-600"
                        }
                      `}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-700">
                {history?.page.totalElements
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}
              </span>{" "}
              a{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(
                  currentPage * itemsPerPage,
                  history?.page.totalElements || 0,
                )}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-700">
                {history?.page.totalElements || 0}
              </span>{" "}
              resultados
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-200 text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`
                      w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200
                      ${
                        currentPage === number
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                          : "text-slate-600 hover:bg-slate-100"
                      }
                    `}
                    >
                      {number}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-200 text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
