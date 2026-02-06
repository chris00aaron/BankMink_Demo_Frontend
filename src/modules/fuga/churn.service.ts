import axios from 'axios';
import { ChurnSimulationRequest, ChurnPredictionResponse, CustomerDashboard, ScenarioResult, ScenarioSegment, ScenarioIntervention, SegmentRule, CampaignLog, CreateCampaignRequest } from './types';
import { MOCK_CUSTOMERS, MOCK_GEO_STATS, MOCK_MLOPS_METRICS, MOCK_PREDICTION, MOCK_CUSTOMERS_EXTENDED } from './mockData';

// Configura la URL base (usando Proxy de Vite)
const API_URL = '/api/v1/churn';

// Helper para simular delay en respuestas mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// --- ALMACÉN EN MEMORIA PARA CAMPAÑAS (Simula BD persistente en sesión) ---
let IN_MEMORY_CAMPAIGNS: CampaignLog[] = [
    {
        id: 101,
        name: "Campaña Retención Q1 - VIPs",
        strategyName: "Gestor VIP Personalizado",
        segmentName: "VIPs en Riesgo",
        startDate: "2024-03-01",
        status: 'ACTIVE',
        budgetAllocated: 15000,
        expectedRoi: 125.5,
        targetedCount: 45,
        convertedCount: 12
    },
    {
        id: 102,
        name: "Recuperación Saldos Bajos",
        strategyName: "Campaña Cross-Selling",
        segmentName: "Vulnerables Mono-Producto",
        startDate: "2024-02-15",
        status: 'COMPLETED',
        budgetAllocated: 2400,
        expectedRoi: 45.0,
        targetedCount: 120,
        convertedCount: 35
    }
];

export const ChurnService = {
    // 1. Obtener todos los clientes para el dashboard
    getAllCustomers: async (): Promise<CustomerDashboard[]> => {
        try {
            const response = await axios.get<CustomerDashboard[]>(`${API_URL}/customers`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible. Usando datos Mock para Customers.");
            await delay(800);
            return MOCK_CUSTOMERS;
        }
    },

    // 2. Simular Escenario (Conectado a /simulate)
    simulate: async (data: ChurnSimulationRequest): Promise<ChurnPredictionResponse> => {
        try {
            const response = await axios.post<ChurnPredictionResponse>(`${API_URL}/simulate`, data);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible. Usando respuesta Mock para Simulación.");
            await delay(1000);
            // Simulación básica en frontend para variar un poco el resultado
            const probability = Math.min(0.95, Math.max(0.05, (data.Age * 0.01) + (data.Balance > 100000 ? 0.2 : 0)));
            return {
                ...MOCK_PREDICTION,
                churnProbability: probability,
                riskLevel: probability > 0.5 ? "Alto" : "Bajo",
                isChurn: probability > 0.5
            };
        }
    },

    // 3. Analizar Cliente Real (Conectado a /analyze/{id})
    analyzeCustomer: async (id: number): Promise<ChurnPredictionResponse> => {
        try {
            const response = await axios.post<ChurnPredictionResponse>(`${API_URL}/analyze/${id}`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible. Usando respuesta Mock para Análisis.");
            await delay(800);
            return {
                ...MOCK_PREDICTION,
                customer: { id }
            };
        }
    },

    // 3.1 Obtener Historial de Riesgo (Real)
    getHistory: async (id: number): Promise<any[]> => {
        try {
            const response = await axios.get<any[]>(`${API_URL}/history/${id}`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible. Usando datos Mock para historial.");
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

    // 4. Estadísticas Geográficas
    getGeographyStats: async (): Promise<import('./types').GeographyStats[]> => {
        try {
            const response = await axios.get<import('./types').GeographyStats[]>(`${API_URL}/geography`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible. Usando datos Mock para Geografía.");
            await delay(600);
            return MOCK_GEO_STATS;
        }
    },

    // 5. Métricas MLOps
    getMLOpsMetrics: async (): Promise<import('./types').MLOpsMetrics> => {
        try {
            const response = await axios.get<import('./types').MLOpsMetrics>(`${API_URL}/mlops`);
            return response.data;
        } catch (error) {
            console.warn("Backend no disponible. Usando datos Mock para MLOps.");
            await delay(500);
            return MOCK_MLOPS_METRICS;
        }
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

    // 8. Ejecutar Escenario Estratégico (Usando Rule Engine)
    runScenario: async (segment: ScenarioSegment, intervention: ScenarioIntervention): Promise<ScenarioResult> => {
        await delay(1000); // Simular proceso

        // 1. Filtrar población usando el Motor de Reglas
        // Nota: Mapeamos nombres de campos de BD a propiedades del objeto JS si difieren
        const targetClients = MOCK_CUSTOMERS_EXTENDED.filter(c => evaluateRules(c, segment.rules));
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

    // 9. GESTIÓN DE CAMPAÑAS (NUEVO)
    getCampaignHistory: async (): Promise<CampaignLog[]> => {
        await delay(500);
        // Simulamos obtener de BD. En realidad devolvemos el array en memoria
        return [...IN_MEMORY_CAMPAIGNS].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    },

    createCampaign: async (req: CreateCampaignRequest): Promise<CampaignLog> => {
        await delay(1200);

        // Encontrar nombres para desnormalizar (simulación de JOIN)
        const segments = await ChurnService.getSegments();
        const strategies = await ChurnService.getStrategies();
        const segName = segments.find(s => s.id === req.segmentId)?.name || "Segmento Personalizado";
        const stratName = strategies.find(s => s.id === req.strategyId)?.name || "Estrategia";

        const newCampaign: CampaignLog = {
            id: Math.floor(Math.random() * 10000) + 200, // ID aleatorio
            name: req.name,
            segmentName: segName,
            strategyName: stratName,
            startDate: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            budgetAllocated: req.budget,
            expectedRoi: req.expectedRoi,
            targetedCount: req.targets.length,
            convertedCount: 0 // Empieza en 0
        };

        // Guardar en memoria (PERSISTENCIA SIMULADA)
        IN_MEMORY_CAMPAIGNS.push(newCampaign);

        return newCampaign;
    }
};

