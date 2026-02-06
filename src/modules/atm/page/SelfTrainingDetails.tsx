import { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  BarChart3,
  Zap,
  Database,
  Settings,
  Clock,
  Calendar,
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import styles from "../styles/SelfTrainingDetails.module.css";

import {
  withdrawalModelService,
  type RegistroAutoentrenamientoDetailsDTO,
} from "../services/withdrawalModelService";

// Descripciones de métricas para tooltips
const metricDescriptions = {
  mae: "Mean Absolute Error - Promedio de errores absolutos",
  mape: "Mean Absolute Percentage Error - Error porcentual promedio",
  rmse: "Root Mean Square Error - Raíz del error cuadrático medio",
};

interface ModelDetailViewProps {
  modelId: number;
  onBack: () => void;
}

const ModelDetailView = ({ modelId, onBack }: ModelDetailViewProps) => {
  const [modelData, setModelData] =
    useState<RegistroAutoentrenamientoDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response =
          await withdrawalModelService.getTrainingDetails(modelId);
        if (response.data) {
          setModelData(response.data);
          // Initialize selected params with all keys once data is loaded
          if (response.data.hyperparameters) {
            setSelectedParams(Object.keys(response.data.hyperparameters));
          }
        } else {
          setError("No se encontraron detalles para este modelo.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los detalles del modelo.");
      } finally {
        setLoading(false);
      }
    };

    if (modelId) {
      fetchDetails();
    }
  }, [modelId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute derived state safely
  const allParamKeys = useMemo(() => {
    return modelData?.hyperparameters
      ? Object.keys(modelData.hyperparameters)
      : [];
  }, [modelData]);

  const filteredParamKeys = useMemo(() => {
    return allParamKeys.filter((key) =>
      key.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, allParamKeys]);

  const filteredParams = useMemo(() => {
    if (!modelData?.hyperparameters) return [];
    return Object.entries(modelData.hyperparameters).filter(([key]) =>
      selectedParams.includes(key),
    );
  }, [selectedParams, modelData]);

  // Formatear date/time helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatParamValue = (value: number | string | boolean) => {
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toFixed(6);
    }
    return String(value);
  };

  const toggleParam = (key: string) => {
    setSelectedParams((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const selectAll = () => setSelectedParams([...allParamKeys]);
  const clearAll = () => setSelectedParams([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !modelData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500 gap-4">
        <p>{error || "Error desconocido"}</p>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={18} />
          Regresar
        </button>
      </div>
    );
  }

  // Calcular porcentajes del dataset
  const trainPercent =
    (modelData.datasetDetails.train / modelData.datasetDetails.total) * 100;
  const testPercent =
    (modelData.datasetDetails.test / modelData.datasetDetails.total) * 100;

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={18} />
        Regresar
      </button>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.modelIcon}>
            <BrainCircuit size={24} />
          </div>
          <div className={styles.titleContent}>
            <h1>{modelData.nombreModelo}</h1>
            <span className={styles.modelCode}>
              Código de Modelo: #{modelData.codigo}
            </span>
          </div>
        </div>
        <div
          className={`${styles.statusBadge} ${modelData.isProduction ? styles.production : styles.development}`}
        >
          <span className={styles.statusDot}></span>
          {modelData.isProduction ? "En Producción" : "Desarrollo"}
        </div>
      </header>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Metrics Card */}
        <div className={`${styles.card} ${styles.metricsCard}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.metrics}`}>
              <BarChart3 size={16} />
            </div>
            <span className={styles.cardTitle}>Métricas de Rendimiento</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.metricsGrid}>
              {/* MAE */}
              <div
                className={styles.metricItem}
                onMouseEnter={() => setHoveredMetric("mae")}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                {hoveredMetric === "mae" && (
                  <div className={styles.tooltip}>{metricDescriptions.mae}</div>
                )}
                <div className={styles.metricLabel}>MAE</div>
                <div className={styles.metricValue}>
                  {modelData.mae.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className={styles.metricDescription}>
                  Error Absoluto Medio
                </div>
              </div>

              {/* MAPE */}
              <div
                className={styles.metricItem}
                onMouseEnter={() => setHoveredMetric("mape")}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                {hoveredMetric === "mape" && (
                  <div className={styles.tooltip}>
                    {metricDescriptions.mape}
                  </div>
                )}
                <div className={styles.metricLabel}>MAPE</div>
                <div className={styles.metricValue}>
                  {modelData.mape.toFixed(2)}
                  <span className={styles.metricUnit}>%</span>
                </div>
                <div className={styles.metricDescription}>
                  Error Porcentual Medio
                </div>
              </div>

              {/* RMSE */}
              <div
                className={styles.metricItem}
                onMouseEnter={() => setHoveredMetric("rmse")}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                {hoveredMetric === "rmse" && (
                  <div className={styles.tooltip}>
                    {metricDescriptions.rmse}
                  </div>
                )}
                <div className={styles.metricLabel}>RMSE</div>
                <div className={styles.metricValue}>
                  {modelData.rmse.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className={styles.metricDescription}>
                  Raíz Error Cuadrático
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Info Card */}
        <div className={`${styles.card} ${styles.trainingCard}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.training}`}>
              <Zap size={16} />
            </div>
            <span className={styles.cardTitle}>Entrenamiento</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.trainingInfo}>
              <div className={styles.trainingItem}>
                <span className={styles.trainingLabel}>
                  <Calendar size={14} /> Fecha Inicio
                </span>
                <span className={styles.trainingValue}>
                  {formatDate(modelData.fechaInicioEntrenamiento)}
                </span>
              </div>
              <div className={styles.trainingItem}>
                <span className={styles.trainingLabel}>
                  <Clock size={14} /> Hora Inicio
                </span>
                <span className={styles.trainingValue}>
                  {formatTime(modelData.fechaInicioEntrenamiento)}
                </span>
              </div>
              <div className={styles.trainingItem}>
                <span className={styles.trainingLabel}>
                  <Calendar size={14} /> Fecha Fin
                </span>
                <span className={styles.trainingValue}>
                  {formatDate(modelData.fechaFinEntrenamiento)}
                </span>
              </div>
              <div className={styles.trainingItem}>
                <span className={styles.trainingLabel}>
                  <Clock size={14} /> Duración
                </span>
                <span className={styles.durationHighlight}>
                  <Clock size={12} /> {modelData.duracionEntrenamientoMinutos}{" "}
                  min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dataset Card */}
        <div className={`${styles.card} ${styles.datasetCard}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.dataset}`}>
              <Database size={16} />
            </div>
            <span className={styles.cardTitle}>Dataset</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.datasetStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {modelData.datasetDetails.total.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Total</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {modelData.datasetDetails.train.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Train</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {modelData.datasetDetails.test.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Test</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={styles.splitBar}>
              <div
                className={styles.splitTrain}
                style={{ width: `${trainPercent}%` }}
              ></div>
              <div
                className={styles.splitTest}
                style={{ width: `${testPercent}%` }}
              ></div>
            </div>
            <div className={styles.splitLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.train}`}></span>
                Train ({trainPercent.toFixed(1)}%)
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.test}`}></span>
                Test ({testPercent.toFixed(1)}%)
              </div>
            </div>

            {/* Date Range */}
            <div className={styles.dateRange}>
              <div className={styles.dateItem}>
                <div className={styles.dateLabel}>Desde</div>
                <div className={styles.dateValue}>
                  {formatDate(modelData.datasetDetails.fechaInicial)}
                </div>
              </div>
              <div className={styles.dateArrow}>
                <ArrowRight size={18} />
              </div>
              <div className={styles.dateItem}>
                <div className={styles.dateLabel}>Hasta</div>
                <div className={styles.dateValue}>
                  {formatDate(modelData.datasetDetails.fechaFinal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hyperparameters Card */}
        <div className={`${styles.card} ${styles.paramsCard}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.params}`}>
              <Settings size={16} />
            </div>
            <span className={styles.cardTitle}>Hiperparámetros</span>
          </div>
          <div className={styles.cardBody}>
            {/* Excel-style Filter Dropdown */}
            <div className={styles.filterSection} ref={filterRef}>
              <div className={styles.filterDropdown}>
                <button
                  className={`${styles.filterTrigger} ${filterOpen ? styles.active : ""}`}
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <div className={styles.filterTriggerLeft}>
                    <Filter size={16} />
                    <span>Filtrar parámetros</span>
                    <span className={styles.filterBadge}>
                      {selectedParams.length}/{allParamKeys.length}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: filterOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {filterOpen && (
                  <div className={styles.filterPanel}>
                    <div className={styles.filterSearch}>
                      <div className={styles.filterSearchWrapper}>
                        <Search size={14} className={styles.filterSearchIcon} />
                        <input
                          type="text"
                          className={styles.filterSearchInput}
                          placeholder="Buscar parámetro..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className={styles.filterActions}>
                      <button
                        className={styles.filterActionBtn}
                        onClick={selectAll}
                      >
                        Seleccionar todo
                      </button>
                      <button
                        className={styles.filterActionBtn}
                        onClick={clearAll}
                      >
                        Limpiar
                      </button>
                    </div>
                    <div className={styles.filterList}>
                      {filteredParamKeys.map((key) => (
                        <div
                          key={key}
                          className={styles.filterItem}
                          onClick={() => toggleParam(key)}
                        >
                          <span className={styles.filterCheckbox}>
                            {selectedParams.includes(key) ? (
                              <CheckSquare size={18} />
                            ) : (
                              <Square size={18} />
                            )}
                          </span>
                          <span className={styles.filterItemLabel}>{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Params Table (solo 2 columnas: Parámetro y Valor) */}
            <table className={styles.paramsTable}>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredParams.length > 0 ? (
                  filteredParams.map(([key, value]) => (
                    <tr key={key}>
                      <td>
                        <span className={styles.paramKey}>{key}</span>
                      </td>
                      <td>
                        <span className={styles.paramValue}>
                          {formatParamValue(value)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>
                      <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>
                          <Filter size={32} />
                        </div>
                        No hay parámetros seleccionados
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailView;
