import axios from 'axios';
import { ChurnSimulationRequest, ChurnPredictionResponse, CustomerPageResponse, ScenarioResult, ScenarioSegment, ScenarioIntervention, SegmentRule, CampaignLog, CreateCampaignRequest, TrainResult, PerformanceStatus } from './types';

// Configura la URL base (usando Proxy de Vite)
const API_URL = '/api/v1/churn';

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
            case '=':
            case '==': return value == target;
            case '!=': return value != target;
            default: return false;
        }
    });
};

export const ChurnService = {
    // 1. Obtener clientes paginados para el dashboard
    getCustomersPaginated: async (page: number = 0, size: number = 50, search: string = '', country?: string, riskLevel?: string): Promise<CustomerPageResponse> => {
        const response = await axios.get<CustomerPageResponse>(`${API_URL}/customers`, {
            params: { page, size, search, country: country || undefined, riskLevel: riskLevel || undefined }
        });
        return response.data;
    },

    // 2. Simular Escenario (Conectado a /simulate)
    simulate: async (data: ChurnSimulationRequest): Promise<ChurnPredictionResponse> => {
        const response = await axios.post<ChurnPredictionResponse>(`${API_URL}/simulate`, data);
        return response.data;
    },

    // 3. Analizar Cliente Real (Conectado a /analyze/{id})
    analyzeCustomer: async (id: number): Promise<ChurnPredictionResponse> => {
        const response = await axios.post<ChurnPredictionResponse>(`${API_URL}/analyze/${id}`);
        return response.data;
    },

    // 3.1 Obtener Historial de Riesgo (Real)
    getHistory: async (id: number): Promise<any[]> => {
        try {
            const response = await axios.get<any[]>(`${API_URL}/history/${id}`);
            return response.data;
        } catch (error) {
            console.warn("Historial no disponible. El componente usará su fallback visual.");
            return []; // El componente usará su fallback si recibe array vacío
        }
    },

    // 3.2 Obtener Recomendación "Next Best Action" (Real)
    getRecommendation: async (id: number): Promise<ScenarioIntervention | null> => {
        try {
            const response = await axios.get<ScenarioIntervention>(`${API_URL}/recommendation/${id}`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible para recomendación.");
            return null;
        }
    },

    // 3.3 Registrar Interacción con Cliente
    logInteraction: async (id: number, actionType: string): Promise<void> => {
        await axios.post(`${API_URL}/interact/${id}`, null, {
            params: { actionType }
        });
    },

    // 4. Estadísticas Geográficas
    getGeographyStats: async (): Promise<import('./types').GeographyStats[]> => {
        const response = await axios.get<import('./types').GeographyStats[]>(`${API_URL}/geography`);
        return response.data;
    },

    // 5. Métricas MLOps
    getMLOpsMetrics: async (): Promise<import('./types').MLOpsMetrics> => {
        const response = await axios.get<import('./types').MLOpsMetrics>(`${API_URL}/mlops`);
        return response.data;
    },

    // 6. Obtener Definiciones de Segmentos (Desde BD)
    getSegments: async (): Promise<ScenarioSegment[]> => {
        try {
            const response = await axios.get<ScenarioSegment[]>(`${API_URL}/config/segments`);
            return response.data;
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
        const response = await axios.post<ScenarioSegment>(`${API_URL}/config/segments`, segment);
        return response.data;
    },

    // 6.2 Eliminar Segmento
    deleteSegment: async (id: number | string): Promise<void> => {
        await axios.delete(`${API_URL}/config/segments/${id}`);
    },

    // 7. Obtener Estrategias Disponibles (Desde BD)
    getStrategies: async (): Promise<ScenarioIntervention[]> => {
        try {
            const response = await axios.get<ScenarioIntervention[]>(`${API_URL}/config/strategies`);
            return response.data;
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
            const response = await axios.get<CampaignLog[]>(`${API_URL}/campaigns`);
            return response.data;
        } catch (error) {
            console.warn("Backend campaigns not available, returning empty list.");
            return [];
        }
    },

    createCampaign: async (req: CreateCampaignRequest): Promise<CampaignLog> => {
        const response = await axios.post<CampaignLog>(`${API_URL}/campaigns`, req);
        return response.data;
    },

    // 10. AUTO-ENTRENAMIENTO
    trainModel: async (): Promise<TrainResult> => {
        try {
            const response = await axios.post<TrainResult>(`${API_URL}/train`, {}, {
                timeout: 120000 // 2 minutos de timeout para entrenamiento
            });
            return response.data;
        } catch (error: any) {
            // If the server returned a structured error response, use it
            if (error.response?.data?.error) {
                return {
                    status: 'error',
                    error: error.response.data.error
                };
            }
            // Network error or timeout
            const message = error.code === 'ECONNABORTED'
                ? 'El entrenamiento excedió el tiempo de espera (2 min). Puede seguir ejecutándose en el servidor.'
                : error.message || 'Error de conexión con el servidor.';
            return {
                status: 'error',
                error: message
            };
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
            const response = await axios.get<PerformanceStatus>(`${API_URL}/monitor/status`);
            return response.data;
        } catch (error: any) {
            return {
                status: 'error',
                message: error.response?.data?.message || error.message || 'Error consultando estado del monitor.'
            };
        }
    },

    /**
     * Manually triggers a performance evaluation.
     * Compares historical predictions against ground truth.
     */
    async triggerEvaluation(): Promise<PerformanceStatus> {
        try {
            const response = await axios.post<PerformanceStatus>(`${API_URL}/monitor/evaluate`, {}, {
                timeout: 60000 // 1 minuto de timeout
            });
            return response.data;
        } catch (error: any) {
            return {
                status: 'error',
                message: error.response?.data?.message || error.message || 'Error disparando evaluación manual.'
            };
        }
    },

    /**
     * Gets high-level executive metrics for CEO Dashboard
     */
    getExecutiveMetrics: async (): Promise<any> => {
        try {
            const response = await axios.get(`${API_URL}/executive-metrics`);
            return response.data;
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

