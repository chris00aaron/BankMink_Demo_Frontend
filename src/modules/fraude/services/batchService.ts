import { apiRequest } from '@shared/api';

// ==================== TIPOS ====================

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
