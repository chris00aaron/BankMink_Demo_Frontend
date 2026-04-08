import { apiClient } from '@shared/api';
import { ChurnSimulationRequest, ChurnPredictionResponse, CustomerPageResponse, ScenarioResult, ScenarioSegment, ScenarioIntervention, SegmentRule, CampaignLog, CampaignTarget, CreateCampaignRequest, TrainResult, PerformanceStatus, TrainingHistoryPoint, PredictionBucket, RiskIntelligenceData, ChurnModelInfo } from './types';

// URL base relativa al apiClient (baseURL ya incluye /api)
const API_URL = '/v1/churn';

// Note: IN_MEMORY_CAMPAIGNS removed — campaigns now persist in the database via backend API

// --- MOTOR DE REGLAS DINÁMICO (Rule Engine) ---
// Convierte el JSON de la BD en lógica ejecutable
const evaluateRules = (customer: any, rules: SegmentRule[]): boolean => {
    // Todas las reglas deben cumplirse (AND implícito)
    return rules.every(rule => {
        const raw = customer[rule.field];
        // Si el campo no existe o es null/undefined, excluir al cliente
        if (raw === null || raw === undefined) return false;
        const value = Number(raw);
        const target = Number(rule.val);

        switch (rule.op) {
            case '>':  return value > target;
            case '<':  return value < target;
            case '>=': return value >= target;
            case '<=': return value <= target;
            case '==': return value === target;
            case '!=': return value !== target;
            default:   return false;
        }
    });
};

export const ChurnService = {
    // 0. Obtener un cliente por ID para la página de detalle
    getCustomerById: async (id: number): Promise<import('./types').CustomerDashboard | null> => {
        try {
            const response = await apiClient.get<import('./types').CustomerDashboard>(`${API_URL}/customers/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },

    // 1. Obtener clientes paginados para el dashboard
    getCustomersPaginated: async (page: number = 0, size: number = 50, search: string = '', country?: string, riskLevel?: string, segment?: string): Promise<CustomerPageResponse> => {
        const response = await apiClient.get<CustomerPageResponse>(`${API_URL}/customers`, {
            params: { page, size, search, country: country || undefined, riskLevel: riskLevel || undefined, segment: segment || undefined }
        });
        return response.data;
    },

    // 2. Simular Escenario (Conectado a /simulate)
    simulate: async (data: ChurnSimulationRequest): Promise<ChurnPredictionResponse> => {
        const response = await apiClient.post<ChurnPredictionResponse>(`${API_URL}/simulate`, data);
        return response.data;
    },

    // 3. Analizar Cliente Real (Conectado a /analyze/{id})
    analyzeCustomer: async (id: number): Promise<ChurnPredictionResponse> => {
        const response = await apiClient.post<ChurnPredictionResponse>(`${API_URL}/analyze/${id}`);
        return response.data;
    },

    // 3.1 Obtener Historial de Riesgo (Real)
    getHistory: async (id: number): Promise<any[]> => {
        try {
            const response = await apiClient.get<any[]>(`${API_URL}/history/${id}`);
            return response.data;
        } catch (error) {
            console.warn("Historial no disponible. El componente usará su fallback visual.");
            return []; // El componente usará su fallback si recibe array vacío
        }
    },

    // 3.2 Obtener Recomendación "Next Best Action" (Real)
    getRecommendation: async (id: number): Promise<ScenarioIntervention | null> => {
        try {
            const response = await apiClient.get<ScenarioIntervention>(`${API_URL}/recommendation/${id}`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible para recomendación.");
            return null;
        }
    },

    // 3.3 Registrar Interacción con Cliente
    logInteraction: async (id: number, actionType: string): Promise<void> => {
        await apiClient.post(`${API_URL}/interact/${id}`, null, {
            params: { actionType }
        });
    },

    // 4. Estadísticas Geográficas
    getGeographyStats: async (): Promise<import('./types').GeographyStats[]> => {
        const response = await apiClient.get<import('./types').GeographyStats[]>(`${API_URL}/geography`);
        return response.data;
    },

    // 5. Métricas MLOps
    getMLOpsMetrics: async (): Promise<import('./types').MLOpsMetrics> => {
        const response = await apiClient.get<import('./types').MLOpsMetrics>(`${API_URL}/mlops`);
        return response.data;
    },

    // 6. Obtener Definiciones de Segmentos (Desde BD)
    getSegments: async (): Promise<ScenarioSegment[]> => {
        const response = await apiClient.get<ScenarioSegment[]>(`${API_URL}/config/segments`);
        return response.data;
    },

    // 6.1 Crear Segmento Personalizado (Persiste en BD)
    createSegment: async (segment: Omit<ScenarioSegment, 'id'>): Promise<ScenarioSegment> => {
        const response = await apiClient.post<ScenarioSegment>(`${API_URL}/config/segments`, segment);
        return response.data;
    },

    // 6.2 Eliminar Segmento
    deleteSegment: async (id: number | string): Promise<void> => {
        await apiClient.delete(`${API_URL}/config/segments/${id}`);
    },

    // 7. Obtener Estrategias Disponibles (Desde BD)
    getStrategies: async (): Promise<ScenarioIntervention[]> => {
        const response = await apiClient.get<ScenarioIntervention[]>(`${API_URL}/config/strategies`);
        return response.data;
    },

    // 8. Ejecutar Escenario Estratégico (Usando Rule Engine + Datos Reales)
    // NOTA ARQUITECTÓNICA: Idealmente la simulación debería ejecutarse server-side.
    // Este enfoque client-side funciona razonablemente con datasets < 10k clientes,
    // que es el caso actual del proyecto BankMind.
    runScenario: async (segment: ScenarioSegment, intervention: ScenarioIntervention): Promise<ScenarioResult> => {
        // Obtener clientes reales de la BD (página grande para análisis)
        // Limitamos a 2000 para evitar problemas de memoria en el navegador
        const MAX_SIMULATION_SIZE = 2000;
        const pageData = await apiClient.get<CustomerPageResponse>(`${API_URL}/customers`, {
            params: { page: 0, size: MAX_SIMULATION_SIZE, search: '' },
            timeout: 90000, // 90s — carga grande para simulación
        }).then(r => r.data);
        const allCustomers = pageData.content;

        // Advertir si hay más clientes que los que pudimos obtener
        if (pageData.totalElements > MAX_SIMULATION_SIZE) {
            console.warn(
                `Simulación ejecutada sobre ${MAX_SIMULATION_SIZE} de ${pageData.totalElements} clientes. ` +
                `Los resultados son representativos pero no exhaustivos.`
            );
        }

        // 1. Filtrar población usando el Motor de Reglas
        const targetClients = allCustomers.filter(c => evaluateRules(c, segment.rules));
        const totalClients = targetClients.length;

        if (totalClients === 0) {
            throw new Error("No se encontraron clientes que cumplan las reglas del segmento.");
        }

        // 2. Calcular estado BASE (Before)
        const riskyClientsBefore = targetClients.filter(c => c.risk >= 45);
        const clientsAtRiskBefore = riskyClientsBefore.length;
        const capitalAtRiskBefore = riskyClientsBefore.reduce((acc, c) => acc + c.balance * (c.risk / 100), 0);

        // 3. Calcular estado PROYECTADO (After) — Monte Carlo con seed determinístico
        // Usamos un PRNG simple basado en el ID del cliente para reproducibilidad
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 9301 + 49297) * 49297;
            return x - Math.floor(x);
        };

        const riskyClientsAfter = targetClients.filter(c => {
            let improvement = intervention.impactFactor * 100;
            improvement = improvement * (0.9 + seededRandom(c.id) * 0.2); // +/- 10% variabilidad determinística
            const newRisk = Math.max(0, c.risk - improvement);
            return newRisk >= 45;
        });

        const clientsAtRiskAfter = riskyClientsAfter.length;
        const capitalAtRiskAfter = riskyClientsAfter.reduce((acc, c) => acc + c.balance * (c.risk / 100), 0);

        // 4. Calcular Financieros
        const campaignCost = totalClients * intervention.costPerClient;
        const capitalSaved = capitalAtRiskBefore - capitalAtRiskAfter;
        const roi = campaignCost > 0 ? ((capitalSaved - campaignCost) / campaignCost) * 100 : 0;
        const retentionImprovement = totalClients > 0
            ? ((clientsAtRiskBefore - clientsAtRiskAfter) / totalClients) * 100
            : 0;

        return {
            segmentName: segment.name,
            interventionName: intervention.name,
            segmentId: segment.id,
            strategyId: intervention.id,
            totalClients,
            clientsAtRiskBefore,
            clientsAtRiskAfter,
            capitalAtRiskBefore,
            capitalAtRiskAfter,
            retentionImprovement,
            campaignCost,
            roi,
            targetIds: targetClients.map((c: any) => c.id),
        };
    },

    // 9. GESTIÓN DE CAMPAÑAS — Real Backend Persistence (M2)
    getCampaignHistory: async (): Promise<CampaignLog[]> => {
        try {
            const response = await apiClient.get<CampaignLog[]>(`${API_URL}/campaigns`);
            return response.data;
        } catch (error) {
            console.warn("Backend campaigns not available, returning empty list.");
            return [];
        }
    },

    previewSegmentCount: async (segmentId: number | string): Promise<number> => {
        try {
            const response = await apiClient.get<{ count: number }>(`${API_URL}/campaigns/preview`, {
                params: { segmentId }
            });
            return response.data.count;
        } catch {
            return 0;
        }
    },

    createCampaign: async (req: CreateCampaignRequest): Promise<CampaignLog> => {
        const response = await apiClient.post<CampaignLog>(`${API_URL}/campaigns`, req);
        return response.data;
    },

    deleteCampaign: async (campaignId: number | string): Promise<void> => {
        await apiClient.delete(`${API_URL}/campaigns/${campaignId}`);
    },

    updateCampaignStatus: async (campaignId: number | string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'): Promise<import('./types').CampaignLog> => {
        const response = await apiClient.patch<import('./types').CampaignLog>(`${API_URL}/campaigns/${campaignId}/status`, { status });
        return response.data;
    },

    getCampaignTargets: async (campaignId: number | string): Promise<CampaignTarget[]> => {
        const response = await apiClient.get<CampaignTarget[]>(`${API_URL}/campaigns/${campaignId}/targets`);
        return response.data;
    },

    updateTargetStatus: async (campaignId: number | string, customerId: number, status: string): Promise<void> => {
        await apiClient.patch(`${API_URL}/campaigns/${campaignId}/targets/${customerId}`, { status });
    },

    // 10. AUTO-ENTRENAMIENTO
    trainModel: async (): Promise<TrainResult> => {
        try {
            const response = await apiClient.post<TrainResult>(`${API_URL}/train`, {}, {
                timeout: 600000 // 10 minutos de timeout para entrenamiento
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
                ? 'El entrenamiento excedió el tiempo de espera (10 min). Puede seguir ejecutándose en el servidor.'
                : error.message || 'Error de conexión con el servidor.';
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
            const response = await apiClient.get<TrainingHistoryPoint[]>(`${API_URL}/mlops/training-evolution`);
            return response.data;
        } catch {
            return [];
        }
    },

    getPredictionDistribution: async (): Promise<PredictionBucket[]> => {
        try {
            const response = await apiClient.get<PredictionBucket[]>(`${API_URL}/mlops/prediction-distribution`);
            return response.data;
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
            const response = await apiClient.get<PerformanceStatus>(`${API_URL}/monitor/status`);
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
            const response = await apiClient.post<PerformanceStatus>(`${API_URL}/monitor/evaluate`, {}, {
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

    // ============================================================
    // LIVE MODEL STATUS (equivalente a ATM /v1/withdrawal/info y /update)
    // ============================================================

    /**
     * Returns live status of the CHURN model in production:
     * version, status (ready/updating/not_loaded), SHAP availability, feature count.
     */
    async getModelInfo(): Promise<ChurnModelInfo> {
        try {
            const response = await apiClient.get<ChurnModelInfo>(`${API_URL}/model/info`);
            return response.data;
        } catch (error: any) {
            return {
                version: 'unknown',
                status: 'error',
                has_explainer: false,
                has_scaler: false,
                feature_count: 0,
                message: error.response?.data?.message || error.message || 'Error consultando estado del modelo.'
            };
        }
    },

    /**
     * Triggers a hot-reload of the CHURN model from DagsHub (no retraining).
     * The actual download runs in background on the Python side.
     */
    async reloadModel(): Promise<{ mensaje?: string; message?: string; status?: string }> {
        const response = await apiClient.post(`${API_URL}/model/reload`, {});
        return response.data;
    },

    // ============================================================
    // RISK INTELLIGENCE — Muestra Estratificada
    // ============================================================

    /**
     * Devuelve la muestra activa para "Inteligencia de Riesgo".
     * hasSample=false si aún no se ha generado ningún lote.
     */
    getRiskIntelligence: async (): Promise<RiskIntelligenceData> => {
        const response = await apiClient.get<RiskIntelligenceData>(`${API_URL}/risk-intelligence`);
        return response.data;
    },

    /**
     * Refresco manual: genera un nuevo lote estratificado.
     * Puede tardar 2-3 minutos — usar timeout generoso.
     */
    refreshRiskSample: async (size: number = 500): Promise<{ status: string; message: string }> => {
        const response = await apiClient.post<{ status: string; message: string }>(
            `${API_URL}/risk-intelligence/refresh`,
            null,
            { params: { size }, timeout: 300000 } // 5 min timeout
        );
        return response.data;
    },

    /**
     * Gets high-level executive metrics for CEO Dashboard
     */
    getExecutiveMetrics: async (): Promise<any> => {
        const response = await apiClient.get(`${API_URL}/executive-metrics`);
        return response.data;
    },
};

