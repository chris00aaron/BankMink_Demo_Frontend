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
    nivelRiesgo: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
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
    nivelRiesgo: string;
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
    nivelRiesgo: string;
    montoCuota: number;
    cuotasAtrasadas: number;
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

// Tipos para Alertas Tempranas
export interface EarlyWarningsPreview {
    totalCuentasEnAlerta: number;
    totalDineroEnRiesgo: number;
    alertas: Alerta[];
}

export interface Alerta {
    id: string;
    tipo: 'critico' | 'alto' | 'tendencia' | 'vencimiento';
    titulo: string;
    descripcion: string;
    cuentasAfectadas: number;
    dineroEnRiesgo: number;
    prioridad: 'urgente' | 'alta' | 'media';
    fecha: string;
    accionRecomendada: string;
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

// Tipos para Monitoreo del Modelo
export interface ModelHealthData {
    version: string;
    deploymentDate: string;
    daysActive: number;
    active: boolean;
    metricas: ModelHealthMetrics;
    arquitectura: ModelArchitecture;
    tendencia: ModelTrend[];
    dataset: DatasetSummary;
}

export interface ModelHealthMetrics {
    aucRoc: number;
    precision: number;
    recall: number;
    f1Score: number;
    giniCoefficient: number;
    ksStatistic: number;
    accuracy: number;
}

export interface ModelArchitecture {
    tipo: string;
    estrategia: string;
    componentes: ModelComponent[];
}

export interface ModelComponent {
    nombre: string;
    peso: number;
    parametros: Record<string, unknown>;
}

export interface ModelTrend {
    mes: string;
    morosidadReal: number;
    prediccion: number;
    diferencia: number;
}

export interface DatasetSummary {
    totalRegistros: number;
    datosEntrenamiento: number;
    datosPrueba: number;
    fechaDataset: string;
    fuente: string;
}

