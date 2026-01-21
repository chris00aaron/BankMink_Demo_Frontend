export interface Customer {
    customerId: number;
    name: string;
    creditScore: number;
    age: number;
    balance: number;
    country: 'Francia' | 'España' | 'Alemania';
    churnScore: number; // 0-1
    isActive: boolean;
    tenure: number; // años
    numOfProducts: number;
    transactionActivity: 'Baja' | 'Media' | 'Alta';
}

export interface XAIFactor {
    factor: string;
    impact: number; // porcentaje positivo
    description: string;
    color: string;
}

export interface ActionRecommendation {
    title: string;
    description: string;
    expectedImpact: number; // reducción de riesgo en %
    effortLevel: 'Bajo' | 'Medio' | 'Alto';
}

export interface CountryStats {
    country: string;
    activeMembers: number;
    inactiveMembers: number;
    churnRate: number;
}

export interface SimulationParameters {
    commission: number; // 0-10
    benefits: number; // 0-100
    segment: 'Todos' | 'Premium' | 'Estándar' | 'Básico';
    incentives: number; // 0-100
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ChurnMetrics {
    activeChurnRate: number;
    capitalAtRisk: number;
    modelConfidence: number;
}
