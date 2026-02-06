import { CustomerDashboard, ChurnPredictionResponse, GeographyStats, MLOpsMetrics, CustomerRiskDetail } from './types';

// Generador de clientes más robusto para la simulación de escenarios
const generateMockCustomers = (count: number): CustomerRiskDetail[] => {
    const countries = ['France', 'Spain', 'Germany'];
    const segments = ['Personal', 'SME', 'Corporate'] as const;
    const names = ['Garcia', 'Martin', 'Smith', 'Mueller', 'Dubois', 'Silva', 'Schmidt', 'Weber', 'Lopez', 'Petit'];
    
    return Array.from({ length: count }, (_, i) => {
        const country = countries[Math.floor(Math.random() * countries.length)];
        const balance = Math.floor(Math.random() * 200000);
        const products = Math.floor(Math.random() * 4) + 1; // 1 to 4
        const age = Math.floor(Math.random() * 60) + 18;
        const score = Math.floor(Math.random() * 500) + 350;
        const risk = Math.floor(Math.random() * 100);
        
        return {
            id: 15000000 + i,
            name: `${names[Math.floor(Math.random() * names.length)]} ${i}`,
            balance,
            country,
            risk, // Riesgo base aleatorio
            products,
            tenure: Math.floor(Math.random() * 10),
            segment: balance > 150000 ? 'Corporate' : balance > 50000 ? 'SME' : 'Personal',
            since: `${2015 + Math.floor(Math.random() * 9)}`,
            score,
            age
        };
    });
};

export const MOCK_CUSTOMERS_EXTENDED: CustomerRiskDetail[] = generateMockCustomers(200);

export const MOCK_CUSTOMERS: CustomerDashboard[] = MOCK_CUSTOMERS_EXTENDED.map(c => ({
    id: c.id,
    name: c.name,
    score: c.score || 600,
    age: c.age || 40,
    balance: c.balance,
    country: c.country,
    risk: c.risk
}));

export const MOCK_PREDICTION: ChurnPredictionResponse = {
    churnProbability: 0.75,
    riskLevel: "Alto",
    isChurn: true,
    modelVersion: "v2.1.0",
    predictionConfidence: 0.88,
    risk_factors: [
        { feature: "Balance", impact: 0.4, type: "negative" },
        { feature: "Age", impact: 0.2, type: "negative" },
        { feature: "NumOfProducts", impact: -0.1, type: "positive" }
    ],
    real_exit: undefined
};

export const MOCK_GEO_STATS: GeographyStats[] = [
    { country: "Spain", countryCode: "ES", flag: "🇪🇸", totalCustomers: 2477, highRisk: 412, mediumRisk: 800, lowRisk: 1265, avgBalance: 61870, churnRate: 16.6 },
    { country: "France", countryCode: "FR", flag: "🇫🇷", totalCustomers: 5014, highRisk: 810, mediumRisk: 1500, lowRisk: 2704, avgBalance: 62092, churnRate: 16.1 },
    { country: "Germany", countryCode: "DE", flag: "🇩🇪", totalCustomers: 2509, highRisk: 814, mediumRisk: 900, lowRisk: 795, avgBalance: 119730, churnRate: 32.4 },
];

export const MOCK_MLOPS_METRICS: MLOpsMetrics = {
    modelStatus: "Active",
    modelVersion: "v2.3.1",
    totalPredictions: 15420,
    lastTrainingDate: "2024-02-01",
    precision: 0.89,
    recall: 0.85,
    f1Score: 0.87,
    aucRoc: 0.92
};
