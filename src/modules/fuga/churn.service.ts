// Servicio para comunicarse con la API de churn/fuga
// Usa el cliente centralizado que adjunta automáticamente el token JWT

import { apiRequest } from '@shared/services/apiClient';
import { ChurnSimulationRequest, ChurnPredictionResponse, CustomerPageResponse, ScenarioResult, ScenarioSegment, ScenarioIntervention, SegmentRule, CampaignLog, CreateCampaignRequest, TrainResult, PerformanceStatus, TrainingHistoryPoint, PredictionBucket } from './types';

// Prefijo de ruta (sin /api, ya que apiRequest lo agrega)
const BASE = '/v1/churn';

// Note: IN_MEMORY_CAMPAIGNS removed — campaigns now persist in the database via backend API

// --- MOTOR DE REGLAS DINÁMICO (Rule Engine) ---
// Convierte el JSON de la BD en lógica ejecutable
const evaluateRules = (customer: any, rules: SegmentRule[]): boolean => {
    // Todas las reglas deben cumplirse (AND implícito)
    return rules.every(rule => {
        const value = customer[rule.field]; // ej: customer.balance
        const target = rule.val;

        switch (rule.op) {
            case '>': return value > target;
            case '<': return value < target;
            case '>=': return value >= target;
            case '<=': return value <= target;
            case '==': return value == target;
            case '!=': return value != target;
            default: return false;
        }
    });
};

export const ChurnService = {
    // 1. Obtener clientes paginados para el dashboard
    getCustomersPaginated: async (page: number = 0, size: number = 50, search: string = '', country?: string, riskLevel?: string): Promise<CustomerPageResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });
        if (search) params.append('search', search);
        if (country) params.append('country', country);
        if (riskLevel) params.append('riskLevel', riskLevel);

        return apiRequest<CustomerPageResponse>(`${BASE}/customers?${params.toString()}`);
    },

    // 2. Simular Escenario (Conectado a /simulate)
    simulate: async (data: ChurnSimulationRequest): Promise<ChurnPredictionResponse> => {
        return apiRequest<ChurnPredictionResponse>(`${BASE}/simulate`, 'POST', data);
    },

    // 3. Analizar Cliente Real (Conectado a /analyze/{id})
    analyzeCustomer: async (id: number): Promise<ChurnPredictionResponse> => {
        return apiRequest<ChurnPredictionResponse>(`${BASE}/analyze/${id}`, 'POST');
    },

    // 3.1 Obtener Historial de Riesgo (Real)
    getHistory: async (id: number): Promise<any[]> => {
        try {
            return await apiRequest<any[]>(`${BASE}/history/${id}`);
        } catch (error) {
            console.warn("Historial no disponible. El componente usará su fallback visual.");
            return []; // El componente usará su fallback si recibe array vacío
        }
    },

    // 3.2 Obtener Recomendación "Next Best Action" (Real)
    getRecommendation: async (id: number): Promise<ScenarioIntervention | null> => {
        try {
            return await apiRequest<ScenarioIntervention>(`${BASE}/recommendation/${id}`);
        } catch (error) {
            console.warn("Backend no disponible para recomendación.");
            return null;
        }
    },

    // 3.3 Registrar Interacción con Cliente
    logInteraction: async (id: number, actionType: string): Promise<void> => {
        await apiRequest<void>(`${BASE}/interact/${id}?actionType=${encodeURIComponent(actionType)}`, 'POST');
    },

    // 4. Estadísticas Geográficas
    getGeographyStats: async (): Promise<import('./types').GeographyStats[]> => {
        return apiRequest<import('./types').GeographyStats[]>(`${BASE}/geography`);
    },

    // 5. Métricas MLOps
    getMLOpsMetrics: async (): Promise<import('./types').MLOpsMetrics> => {
        return apiRequest<import('./types').MLOpsMetrics>(`${BASE}/mlops`);
    },

    // 6. Obtener Definiciones de Segmentos (Desde BD)
    getSegments: async (): Promise<ScenarioSegment[]> => {
        try {
            return await apiRequest<ScenarioSegment[]>(`${BASE}/config/segments`);
        } catch (error) {
            // Fallback: Datos que coinciden con los INSERTs del SQL
            return [
                {
                    id: 1,
                    name: 'VIPs en Riesgo',
                    description: 'Clientes con balance alto y riesgo superior al 70%',
                    rules: [
                        { field: 'balance', op: '>', val: 100000 },
                        { field: 'risk', op: '>', val: 70 }
                    ]
                },
                {
                    id: 2,
                    name: 'Vulnerables Mono-Producto',
                    description: 'Clientes con un solo producto contratado',
                    rules: [
                        { field: 'products', op: '==', val: 1 } // Mapeado de 'num_of_products'
                    ]
                },
                {
                    id: 3,
                    name: 'Jóvenes con Bajo Score',
                    description: 'Menores de 30 años con score crediticio débil',
                    rules: [
                        { field: 'age', op: '<', val: 30 },
                        { field: 'score', op: '<', val: 600 } // Mapeado de 'credit_score'
                    ]
                }
            ];
        }
    },

    // 6.1 Crear Segmento Personalizado (Persiste en BD)
    createSegment: async (segment: Omit<ScenarioSegment, 'id'>): Promise<ScenarioSegment> => {
        return apiRequest<ScenarioSegment>(`${BASE}/config/segments`, 'POST', segment);
    },

    // 6.2 Eliminar Segmento
    deleteSegment: async (id: number | string): Promise<void> => {
        await apiRequest<void>(`${BASE}/config/segments/${id}`, 'DELETE');
    },

    // 7. Obtener Estrategias Disponibles (Desde BD)
    getStrategies: async (): Promise<ScenarioIntervention[]> => {
        try {
            return await apiRequest<ScenarioIntervention[]>(`${BASE}/config/strategies`);
        } catch (error) {
            // Fallback: Datos que coinciden con los INSERTs del SQL
            return [
                {
                    id: 1,
                    name: 'Descuento Tasa Interés',
                    description: 'Bonificación en tasas de préstamos activos',
                    costPerClient: 50.00,
                    impactFactor: 0.25
                },
                {
                    id: 2,
                    name: 'Campaña Cross-Selling',
                    description: 'Oferta para contratar segundo producto',
                    costPerClient: 20.00,
                    impactFactor: 0.15
                },
                {
                    id: 3,
                    name: 'Gestor VIP Personalizado',
                    description: 'Atención directa por gerente de cuenta',
                    costPerClient: 150.00,
                    impactFactor: 0.45
                }
            ];
        }
    },

    // 8. Ejecutar Escenario Estratégico (Usando Rule Engine + Datos Reales)
    runScenario: async (segment: ScenarioSegment, intervention: ScenarioIntervention): Promise<ScenarioResult> => {
        // Obtener clientes reales de la BD (primera página grande para análisis)
        const pageData = await ChurnService.getCustomersPaginated(0, 5000, '');
        const allCustomers = pageData.content;

        // 1. Filtrar población usando el Motor de Reglas
        const targetClients = allCustomers.filter(c => evaluateRules(c, segment.rules));
        const totalClients = targetClients.length;

        if (totalClients === 0) {
            throw new Error("No se encontraron clientes que cumplan las reglas del segmento.");
        }

        // 2. Calcular estado BASE (Before)
        const riskyClientsBefore = targetClients.filter(c => c.risk > 50);
        const clientsAtRiskBefore = riskyClientsBefore.length;
        const capitalAtRiskBefore = riskyClientsBefore.reduce((acc, c) => acc + c.balance, 0);

        // 3. Calcular estado PROYECTADO (After)
        const riskyClientsAfter = targetClients.filter(c => {
            let improvement = intervention.impactFactor * 100;
            improvement = improvement * (0.9 + Math.random() * 0.2); // +/- 10% variabilidad
            const newRisk = Math.max(0, c.risk - improvement);
            return newRisk > 50;
        });

        const clientsAtRiskAfter = riskyClientsAfter.length;
        const capitalAtRiskAfter = riskyClientsAfter.reduce((acc, c) => acc + c.balance, 0);

        // 4. Calcular Financieros
        const campaignCost = totalClients * intervention.costPerClient;
        const capitalSaved = capitalAtRiskBefore - capitalAtRiskAfter;
        const roi = campaignCost > 0 ? ((capitalSaved - campaignCost) / campaignCost) * 100 : 0;
        const retentionImprovement = ((clientsAtRiskBefore - clientsAtRiskAfter) / totalClients) * 100;

        return {
            segmentName: segment.name,
            interventionName: intervention.name,
            totalClients,
            clientsAtRiskBefore,
            clientsAtRiskAfter,
            capitalAtRiskBefore,
            capitalAtRiskAfter,
            retentionImprovement,
            campaignCost,
            roi
        };
    },

    // 9. GESTIÓN DE CAMPAÑAS — Real Backend Persistence (M2)
    getCampaignHistory: async (): Promise<CampaignLog[]> => {
        try {
            return await apiRequest<CampaignLog[]>(`${BASE}/campaigns`);
        } catch (error) {
            console.warn("Backend campaigns not available, returning empty list.");
            return [];
        }
    },

    createCampaign: async (req: CreateCampaignRequest): Promise<CampaignLog> => {
        return apiRequest<CampaignLog>(`${BASE}/campaigns`, 'POST', req);
    },

    // 10. AUTO-ENTRENAMIENTO
    trainModel: async (): Promise<TrainResult> => {
        try {
            return await apiRequest<TrainResult>(`${BASE}/train`, 'POST', {});
        } catch (error: any) {
            const message = error.message || 'Error de conexión con el servidor.';
            return {
                status: 'error',
                error: message
            };
        }
    },

    // ============================================================
    // MLOPS CHART DATA
    // ============================================================

    getTrainingEvolution: async (): Promise<TrainingHistoryPoint[]> => {
        try {
            return await apiRequest<TrainingHistoryPoint[]>(`${BASE}/mlops/training-evolution`);
        } catch {
            return [];
        }
    },

    getPredictionDistribution: async (): Promise<PredictionBucket[]> => {
        try {
            return await apiRequest<PredictionBucket[]>(`${BASE}/mlops/prediction-distribution`);
        } catch {
            return [];
        }
    },

    // ============================================================
    // PERFORMANCE MONITOR
    // ============================================================

    /**
     * Gets the current performance monitor status.
     * Returns metrics from the last evaluation, configuration, and schedule info.
     */
    async getMonitorStatus(): Promise<PerformanceStatus> {
        try {
            return await apiRequest<PerformanceStatus>(`${BASE}/monitor/status`);
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Error consultando estado del monitor.'
            };
        }
    },

    /**
     * Manually triggers a performance evaluation.
     * Compares historical predictions against ground truth.
     */
    async triggerEvaluation(): Promise<PerformanceStatus> {
        try {
            return await apiRequest<PerformanceStatus>(`${BASE}/monitor/evaluate`, 'POST', {});
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Error disparando evaluación manual.'
            };
        }
    },

    /**
     * Gets high-level executive metrics for CEO Dashboard
     */
    getExecutiveMetrics: async (): Promise<any> => {
        try {
            return await apiRequest(`${BASE}/executive-metrics`);
        } catch (error: any) {
            console.error('Error al obtener métricas ejecutivas:', error);
            // Fallback mock data if endpoint is not yet published in controller
            return {
                capitalErosionProyectada: 2450000,
                retentionROI: 8.4,
                estimatedSavings: 1280000,
                totalInvestment: 152000,
                vipCapitalAtRisk: 8450000,
                strategicInsights: [
                    { cause: 'Competencia de Tasas', impact: 'ALTO', segment: 'VIP' },
                    { cause: 'Falta de Vinculación', impact: 'MEDIO', segment: 'Jóvenes' },
                    { cause: 'Fricción por Comisiones', impact: 'ALTO', segment: 'Personal' }
                ]
            };
        }
    },
};
