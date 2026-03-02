// Tipos para el módulo de morosidad

export interface AccountSummary {
    recordId: number;
    limitBal: number;
    balance: number;
    tenure: number;
    isActiveMember: boolean;
}

export interface CustomerSearchResult {
    idCustomer: number;
    nombre: string;
    edad: number;
    educacion: string;
    estadoCivil: string;
    fechaRegistro: string;
    cuentas: AccountSummary[];
}

export interface ClientePredictionDetail {
    // Datos del cliente
    idCustomer: number;
    nombre: string;
    edad: number;
    educacion: string;
    estadoCivil: string;
    fechaRegistro: string;

    // Datos de la cuenta
    recordId: number;
    limitBal: number;
    balance: number;
    estimatedSalary: number;
    tenure: number;

    // Datos calculados del historial
    antiguedadMeses: number;
    cuotasAtrasadas: number;
    historialPagos: number;
    ultimaCuota: number;
    ultimoPago: string;

    // Predicción
    defaultPayment: boolean;
    probabilidadPago: number;
    mainRiskFactor: string;
    riskFactors: RiskFactor[];  // Top 5 factores SHAP
    modelVersion: string;
    estimatedLoss: number;

    // Clasificación y comparación
    clasificacionSBS: 'Normal' | 'CPP' | 'Deficiente' | 'Dudoso' | 'Pérdida';
    percentilRiesgo: number;    // 0-100: más riesgoso que el X% de la cartera
    umbralPolitica: number;     // Umbral de política activa (ej: 50.0)
}

// Factor de riesgo individual con impacto SHAP
export interface RiskFactor {
    name: string;           // Nombre de la variable (ej: PAY_0)
    impact: number;         // Impacto normalizado (-100 a +100)
    direction: 'positive' | 'negative';  // positive = aumenta riesgo
}

// Tipos para predicción batch
export interface BatchFilters {
    edadMin?: number;
    edadMax?: number;
    educacion?: string;
    estadoCivil?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface BatchAccountPrediction {
    idCustomer: number;
    nombre: string;
    edad: number;
    educacion: string;
    estadoCivil: string;
    recordId: number;
    limitBal: number;
    balance: number;
    probabilidadPago: number;
    clasificacionSBS: string;
    montoCuota: number;
    estimatedLoss: number;  // Pérdida estimada (EAD × PD × LGD)
}

// Wrapper para respuesta batch con umbral
export interface BatchPredictionResponse {
    predictions: BatchAccountPrediction[];
    umbralPolitica: number; // Umbral de política activa (0-100)
    shapSummary?: RiskFactor[]; // Resumen agregado de SHAP (opcional)
}

// Tipos para el Dashboard
export interface DashboardData {
    metricas: MetricasResumen;
    modelo: MetricasModelo;
    distribucionProbabilidad: DistribucionProbabilidad[];
    segmentacionRiesgo: SegmentacionRiesgo[];
    tendenciaMensual: TendenciaMensual[];
    clientesAltoRiesgo: ClienteAltoRiesgo[];
    distribucionSBS: DistribucionSBS[];
}

export interface MetricasResumen {
    totalCuentas: number;       // Total de cuentas con predicción
    cuentasEnRiesgo: number;    // Cuentas que superan el umbral
    dineroEnRiesgo: number;     // Pérdida solo de morosos (superan umbral)
    dineroEnRiesgoTotal: number; // Pérdida de TODAS las cuentas
    tasaMorosidadPredicha: number;
}

export interface MetricasModelo {
    precision: number;
    recall: number;
    f1Score: number;
}

export interface DistribucionProbabilidad {
    rango: string;
    cantidad: number;
}

export interface SegmentacionRiesgo {
    nivel: string;
    cantidad: number;
    dinero: number;
}

export interface TendenciaMensual {
    mes: string;
    morosidad: number;
    prediccion: number;
}

export interface ClienteAltoRiesgo {
    recordId: number;           // ID de la cuenta (record_id)
    nombre: string;
    probabilidadPago: number;
    clasificacionSBS: string;
    montoCuota: number;
    cuotasAtrasadas: number;
}

export interface DistribucionSBS {
    categoria: string;
    cantidad: number;
}

// Tipos para Políticas
export interface DefaultPolicy {
    idPolicy: number;
    policyName: string;
    thresholdApproval: number;
    factorLgd: number;
    daysGraceDefault: number;
    activationDate: string;
    cancellationDate: string | null;
    isActive: boolean;
    approvedBy: string;
    sbsClassificationMatrix: ClassificationRuleSBS[];
}

export interface ClassificationRuleSBS {
    categoria: string;
    min: number;
    max: number;
    provision: number;
}

export interface PolicyRequest {
    policyName: string;
    thresholdApproval: number;
    factorLgd: number;
    daysGraceDefault: number;
    approvedBy: string;
    sbsClassificationMatrix?: ClassificationRuleSBS[];
}

// Tipos para Estrategias de Mitigación de Riesgo

export interface Campaign {
    idCampaign: number;
    campaignName: string;
    description: string;
    targetSegment: string;
    reductionFactor: number;
    estimatedCost: number;
    isActive: boolean;
    createdDate: string;
}

export interface CampaignRequest {
    campaignName: string;
    description: string;
    targetSegment: string;
    reductionFactor: number;
    estimatedCost: number;
}

export interface StrategySummary {
    totalCuentas: number;
    perdidaTotal: number;
    tasaMorosidad: number;
}

export interface SegmentSummary {
    segmento: string;
    totalCuentas: number;
    perdidaEstimada: number;
    probabilidadPromedio: number;
    factorPrincipal: string;
}

export interface StrategyResponse {
    resumen: StrategySummary;
    segmentos: SegmentSummary[];
}

export interface SimulationResult {
    segmento: string;
    campaignName: string;
    totalCuentasSegmento: number;
    perdidaActual: number;
    perdidaProyectada: number;
    reduccionPerdida: number;
    tasaMorosidadActual: number;
    tasaMorosidadProyectada: number;
    cuentasMejoradas: number;
    costoTotal: number;
    roi: number;
}

// Tipos para Simulación
export interface SimulationRequest {
    LIMIT_BAL: number;
    SEX: number;
    EDUCATION: number;
    MARRIAGE: number;
    AGE: number;
    PAY_0: number;
    PAY_2: number;
    PAY_3: number;
    PAY_4: number;
    PAY_5: number;
    PAY_6: number;
    BILL_AMT1: number;
    BILL_AMT2: number;
    BILL_AMT3: number;
    BILL_AMT4: number;
    BILL_AMT5: number;
    BILL_AMT6: number;
    PAY_AMT1: number;
    PAY_AMT2: number;
    PAY_AMT3: number;
    PAY_AMT4: number;
    PAY_AMT5: number;
    PAY_AMT6: number;
    UTILIZATION_RATE: number;
}

export interface SimulationResponse {
    default: boolean;
    probabilidad_default: number;
    main_risk_factor: string;
    risk_factors: RiskFactor[];
    estimated_loss: number;
    umbral_politica: number;
    clasificacion_sbs: string;
    model_version: string;
}

// Timeline de predicción individual por cuenta
export interface PredictionTimelineEntry {
    date: string;
    defaultProbability: number;
    defaultCategory: string;
    payX: number;
}

// Historial de pagos mensual por cuenta (máx. 10 meses)
export interface ClientPaymentHistoryEntry {
    period: string;           // "Ene 2024"
    payX: number;             // Código del modelo: -2, -1, 0, 1..9
    monthsLate: number;       // Meses de retraso real (max(0, payX))
    billAmt: number;          // Monto facturado
    payAmt: number;           // Monto pagado
    didPay: boolean;          // ¿Pagó ese mes?
    daysLate: number | null;  // Días de retraso (null si no hay fechas en BD)
    paymentStatus: string;    // "Sin consumo" | "A tiempo" | "Crédito renovable" | "N mes(es) de retraso"
}

// Tipos para Monitoreo del Modelo (datos reales)

// Modelo activo en producción (GET /api/model/production)
export interface ProductionModel {
    active: boolean;
    version?: string;
    deploymentDate?: string;
    daysActive?: number;
    aucRoc?: string;
    giniCoefficient?: string;
    ksStatistic?: string;
    assemblyConfiguration?: AssemblyConfig;
    message?: string;
}

export interface AssemblyConfig {
    architecture: string;
    voting_strategy: string;
    weights_assigned: number[];
    order_estimators: string[];
    random_seed: number;
    features_input: string[];
    internal_components: Record<string, Record<string, unknown>>;
}

// Log de drift PSI diario (GET /api/model/monitoring/drift)
export interface DriftLog {
    monitoringDate: string;
    psiFeatures: Record<string, number>;
    driftDetected: boolean;
    consecutiveDaysDrift: number;
}

// Log de validación mensual (GET /api/model/monitoring/validation)
export interface ValidationLog {
    monitoringDate: string;
    aucRocReal: number;
    ksReal: number;
    predictedDefaultRate: number;
    actualDefaultRate: number;
}

// Historial de entrenamientos (GET /api/model/training-history)
export interface TrainingHistoryEntry {
    idTrainingHistory: number;
    trainingDate: string;
    bestCadidateModel: string;
    inProduction: boolean;
    metricsResults: {
        auc_roc: number;
        ks_statistic: number;
        gini_coefficient: number;
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
        training_time_sec: number;
    };
    parametersOptuna: {
        best_value: number;
        best_params: Record<string, unknown>;
        n_trials: number;
    };
    datasetInfo?: {
        dataAmount: number;
        dataTraining: number;
        dataTesting: number;
        creationDate: string;
    };
}

// Verificación de versión (GET /api/model/version-check)
export interface VersionCheck {
    bdVersion: string;
    apiVersion: string;
    match: boolean;
    error?: string;
}

// Política de monitoreo (GET /api/monitoring-policy)
export interface MonitoringPolicy {
    idMonitoringPolicy: number;
    policyName: string;
    psiThreshold: number;
    consecutiveDaysTrigger: number;
    aucDropThreshold: number;
    ksDropThreshold: number;
    optunaTrialsDrift: number;
    optunaTrialsValidation: number;
    activationDate: string;
    cancellationDate: string | null;
    isActive: boolean;
    createdBy: string;
}

export interface MonitoringPolicyRequest {
    policyName: string;
    psiThreshold: number;
    consecutiveDaysTrigger: number;
    aucDropThreshold: number;
    ksDropThreshold: number;
    optunaTrialsDrift: number;
    optunaTrialsValidation: number;
    createdBy: string;
}
