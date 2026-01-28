/**
 * Servicio para estadísticas del Dashboard de Fraude
 * Consume los endpoints /api/fraud/stats/*
 */

import { apiRequest } from '../../../shared/services/apiClient';

// ==================== TIPOS ====================

export interface DashboardStats {
    transactions_today: number;
    frauds_detected: number;
    legitimate: number;
    fraud_rate: number;
    total_amount_at_risk: number;
    avg_fraud_score: number;
}

export interface HourlyTrend {
    hour: number;
    total_transactions: number;
    fraud_count: number;
    fraud_rate: number;
}

export interface ShapGlobal {
    feature_name: string;
    avg_impact: number;
    occurrences: number;
    display_name: string;
}

export interface CategoryStats {
    category: string;
    total_transactions: number;
    fraud_count: number;
    fraud_rate: number;
    total_amount: number;
}

export interface LocationStats {
    state: string;
    city: string | null;
    fraud_count: number;
    total_transactions: number;
    fraud_rate: number;
}

// ==================== SERVICIO ====================

export const fraudStatsService = {
    /**
     * Obtiene estadísticas consolidadas del dashboard
     */
    getSummary: async (): Promise<DashboardStats> => {
        return apiRequest<DashboardStats>('/fraud/stats/summary');
    },

    /**
     * Obtiene tendencia horaria de transacciones y fraudes
     */
    getHourlyTrend: async (): Promise<HourlyTrend[]> => {
        return apiRequest<HourlyTrend[]>('/fraud/stats/hourly');
    },

    /**
     * Obtiene factores SHAP globales más influyentes
     */
    getShapGlobal: async (): Promise<ShapGlobal[]> => {
        return apiRequest<ShapGlobal[]>('/fraud/stats/shap-global');
    },

    /**
     * Obtiene estadísticas por categoría de comercio
     */
    getCategoryStats: async (): Promise<CategoryStats[]> => {
        return apiRequest<CategoryStats[]>('/fraud/stats/categories');
    },

    /**
     * Obtiene estadísticas por ubicación geográfica
     */
    getLocationStats: async (): Promise<LocationStats[]> => {
        return apiRequest<LocationStats[]>('/fraud/stats/locations');
    },
};

export default fraudStatsService;
