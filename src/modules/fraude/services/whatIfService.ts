import { apiRequest } from '@shared/api';

// ==================== TIPOS ====================

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
