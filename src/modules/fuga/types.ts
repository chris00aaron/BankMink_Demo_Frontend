// Datos que enviamos al backend para simular (DTO)
export interface ChurnSimulationRequest {
    CreditScore: number;
    Geography: string;
    Gender: string;
    Age: number;
    Tenure: number;
    Balance: number;
    NumOfProducts: number;
    HasCrCard: number;
    IsActiveMember: number;
    EstimatedSalary: number;
}

// La respuesta que nos da Java (lo que vimos en Postman)
export interface ChurnPredictionResponse {
    churnProbability: number;
    riskLevel: "Bajo" | "Medio" | "Alto" | "Error";
    isChurn: boolean;
    modelVersion?: string;
    predictionConfidence?: number;
    customer?: any;
    risk_factors?: RiskFactor[];
    real_exit?: boolean; // Ground Truth para validación
}

// Datos del cliente para el dashboard
export interface CustomerDashboard {
    id: number;
    score: number;
    age: number;
    balance: number;
    country: string;
    risk: number;
    name: string;
    // New fields from backend (real data from DB)
    tenure?: number;   // Years as customer
    since?: string;    // Year registered
    products?: number; // Number of products
}

// Datos extendidos del cliente para dashboard profesional
export interface CustomerRiskDetail {
    id: number;
    name: string;
    balance: number;
    risk: number;
    segment: 'Corporate' | 'Personal' | 'SME';
    country: string;
    products: number;
    tenure: number;
    since: string;
    contact?: string;
}

// Factor de riesgo para XAI (Explicabilidad)
export interface RiskFactor {
    feature: string;
    impact: number;
    type: 'positive' | 'negative';
}

// Punto de historial de riesgo
export interface RiskHistoryPoint {
    month: string;
    score: number;
}

// Datos para el Scatter Plot de prioridad
export interface PriorityMatrixPoint {
    x: number;  // Probabilidad de Fuga
    y: number;  // Balance
    z: number;  // Tamaño burbuja
    name: string;
    id: number;
}

// Datos para tendencia de riesgo
export interface RiskTrendPoint {
    month: string;
    riskCapital: number;
}

// Estadísticas geográficas
export interface GeographyStats {
    country: string;
    countryCode: string;
    flag: string;
    totalCustomers: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    avgBalance: number;
    churnRate: number;
}

// Métricas MLOps
export interface MLOpsMetrics {
    modelStatus: string;
    modelVersion: string;
    totalPredictions: number;
    lastTrainingDate: string;
    precision: number;
    recall: number;
    f1Score: number;
    aucRoc: number;
}

// -- TIPOS PARA EL SIMULADOR DE ESCENARIOS (Strategic Impact Lab) --

// Definición de una regla atómica (JSON serializable)
export interface SegmentRule {
    field: 'age' | 'balance' | 'products' | 'score' | 'risk' | 'country';
    op: '>' | '<' | '==' | '>=' | '<=' | '!=';
    val: number | string;
}

export interface ScenarioSegment {
    id: number | string; // Ahora puede ser ID de BD
    name: string;
    description: string;
    rules: SegmentRule[]; // Reemplaza a la función 'filter' opaca
}

export interface ScenarioIntervention {
    id: number | string;
    name: string;
    description: string;
    costPerClient: number;
    impactFactor: number;
    // is_active vendrá de la BD
}

export interface ScenarioResult {
    segmentName: string;
    interventionName: string;
    totalClients: number;
    clientsAtRiskBefore: number;
    clientsAtRiskAfter: number;
    capitalAtRiskBefore: number;
    capitalAtRiskAfter: number;
    retentionImprovement: number;
    campaignCost: number;
    roi: number;
}

// -- TIPOS PARA GESTIÓN DE CAMPAÑAS (Execution & History) --

export interface CampaignLog {
    id: number | string;
    name: string;
    strategyName: string; // Desnormalizado para visualización
    segmentName: string;  // Desnormalizado para visualización
    startDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    budgetAllocated: number;
    expectedRoi: number;
    targetedCount: number;
    convertedCount?: number; // Se llena con el tiempo
}

export interface CampaignTarget {
    customerId: number;
    customerName: string;
    status: 'TARGETED' | 'CONTACTED' | 'CONVERTED' | 'FAILED';
    contactDate?: string;
}

export interface CreateCampaignRequest {
    name: string;
    segmentId: number | string;
    strategyId: number | string;
    budget: number;
    expectedRoi: number;
    targets: number[]; // IDs de clientes
}


