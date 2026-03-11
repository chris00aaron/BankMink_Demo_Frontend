// Importar cliente API centralizado con auto-refresh
import { apiRequest } from '../../../shared/services/apiClient';

// ==================== TIPOS ====================

export interface RiskFactor {
    feature_name: string;
    feature_value: string;
    shap_value: number;
    risk_description: string;
    impact_direction: string;
}

export interface AuditData {
    xgboost_score: number;
    iforest_score: number;
    base_score: number;
    prediction_id: number;
}

export interface FraudAlert {
    prediction_id: number;
    transaction_id: string;
    transaction_db_id: number;
    veredicto: string;
    score_final: number;
    amount: number;
    merchant: string;
    category: string;
    customer_name: string;
    prediction_date: string;
    location: string;
    detalles_riesgo?: RiskFactor[];
    datos_auditoria?: AuditData;
    recomendacion: string;
}

export interface FraudAlertsPage {
    content: FraudAlert[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface AlertsParams {
    page?: number;
    size?: number;
    sortBy?: 'score' | 'date';
    order?: 'asc' | 'desc';
    veredicto?: string;
    search?: string;
    /** 'today' → predicciones de hoy · 'week' → últimos 7 días · 'all' → sin límite */
    dateFilter?: 'today' | 'week' | 'all';
}

// ==================== SERVICIO ====================

/**
 * Servicio de Fraude - API calls
 */
export const fraudService = {
    /**
     * Obtiene alertas paginadas con filtros y búsqueda
     */
    getAlerts: async (params: AlertsParams = {}): Promise<FraudAlertsPage> => {
        const queryParams = new URLSearchParams();

        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.order) queryParams.append('order', params.order);
        if (params.veredicto && params.veredicto !== 'TODO') queryParams.append('veredicto', params.veredicto);
        if (params.search) queryParams.append('search', params.search);
        if (params.dateFilter && params.dateFilter !== 'all') queryParams.append('dateFilter', params.dateFilter);

        const query = queryParams.toString();
        const endpoint = `/fraud/alerts${query ? `?${query}` : ''}`;

        return apiRequest<FraudAlertsPage>(endpoint);
    },

    /**
     * Obtiene el detalle completo de una alerta (incluye SHAP)
     */
    getAlertDetail: async (predictionId: number): Promise<FraudAlert> => {
        return apiRequest<FraudAlert>(`/fraud/alerts/${predictionId}`);
    },

    /**
     * Verifica si la API de fraude (Python) está disponible
     */
    checkHealth: async (): Promise<{ fraud_api_available: boolean; status: string }> => {
        return apiRequest<{ fraud_api_available: boolean; status: string }>('/fraud/health');
    },

    /**
     * Procesa una nueva transacción (simula POS)
     */
    processTransaction: async (data: {
        cc_num: number;
        amt: number;
        merchant: string;
        category: string;
        merch_lat?: number;
        merch_long?: number;
    }): Promise<unknown> => {
        return apiRequest('/transactions/process', 'POST', data);
    },
};

export default fraudService;
