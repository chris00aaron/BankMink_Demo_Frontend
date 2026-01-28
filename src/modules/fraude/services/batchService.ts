// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== TIPOS ====================

export interface PendingTransaction {
    id_transaction: number;
    trans_num: string;
    trans_date_time: string;
    amt: number;
    category: string;
    merchant: string;
    customer_name: string;
    cc_num_masked: string;
}

export interface BatchItemResult {
    id_transaction: number;
    trans_num: string;
    amt: number;
    veredicto: string;
    score: number;
    status: 'success' | 'error';
    error_message?: string;
}

export interface BatchResult {
    total_processed: number;
    total_frauds: number;
    total_legitimate: number;
    total_errors: number;
    results: BatchItemResult[];
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
 * Servicio de Predicción por Lotes
 */
export const batchService = {
    /**
     * Obtener conteo de transacciones pendientes
     */
    getPendingCount: async (): Promise<{ pending_count: number }> => {
        return apiRequest<{ pending_count: number }>('/fraud/batch/pending/count');
    },

    /**
     * Obtener lista de transacciones pendientes
     */
    getPendingTransactions: async (limit: number = 100): Promise<PendingTransaction[]> => {
        return apiRequest<PendingTransaction[]>(`/fraud/batch/pending?limit=${limit}`);
    },

    /**
     * Procesar lote por IDs específicos
     */
    processBatch: async (transactionIds: number[]): Promise<BatchResult> => {
        return apiRequest<BatchResult>('/fraud/batch/process', 'POST', transactionIds);
    },

    /**
     * Procesar automáticamente las siguientes N pendientes
     */
    processNextBatch: async (limit: number = 100): Promise<BatchResult> => {
        return apiRequest<BatchResult>(`/fraud/batch/process-next?limit=${limit}`, 'POST');
    },
};

export default batchService;
