// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== TIPOS ====================

export interface RiskFactor {
    feature_name: string;
    feature_value: string;
    shap_value: number;
    risk_description: string;
    impact_direction: string;
}

export interface WhatIfRequest {
    cc_num: string;  // String to avoid precision loss with large numbers
    amt: number;
    category: string;
    hour: number;
    merch_lat?: number;
    merch_long?: number;
}

export interface WhatIfResponse {
    customer_found: boolean;
    customer_name?: string;
    customer_location?: string;
    customer_gender?: string;
    customer_age?: number;
    simulated_amount?: number;
    simulated_category?: string;
    simulated_hour?: number;
    transaction_id?: string;
    veredicto?: string;
    score_final?: number;
    detalles_riesgo?: RiskFactor[];
    datos_auditoria?: {
        xgboost_score: number;
        iforest_score: number;
    };
    recomendacion?: string;
    error?: string;
}

export interface CustomerLookup {
    customer_found: boolean;
    customer_name?: string;
    customer_location?: string;
    customer_gender?: string;
    customer_age?: number;
    error?: string;
}

// ==================== SERVICIO ====================

const getAuthToken = (): string | null => {
    return localStorage.getItem('bankmind-token');
};

const apiRequest = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
): Promise<T> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Error en la solicitud');
    }

    return response.json();
};

/**
 * Servicio de What-If (Predicción Individual Simulada)
 */
export const whatIfService = {
    /**
     * Busca información del cliente por número de tarjeta
     */
    lookupCustomer: async (ccNum: string): Promise<CustomerLookup> => {
        return apiRequest<CustomerLookup>(`/fraud/what-if/customer/${ccNum}`);
    },

    /**
     * Simula una predicción de fraude (NO se guarda en BD)
     */
    simulate: async (request: WhatIfRequest): Promise<WhatIfResponse> => {
        return apiRequest<WhatIfResponse>('/fraud/what-if/simulate', 'POST', request);
    },
};

export default whatIfService;
