import { apiRequest } from '@shared/api';

// ==================== TIPOS ====================

/**
 * Servicio de Catálogos
 */
export const catalogService = {
    /**
     * Obtiene todas las categorías activas
     */
    getCategories: async (): Promise<Category[]> => {
        return apiRequest<Category[]>('/catalog/categories');
    },

    /**
     * Obtiene solo los nombres de categorías (versión ligera)
     */
    getCategoryNames: async (): Promise<string[]> => {
        return apiRequest<string[]>('/catalog/categories/names');
    },
};

export default catalogService;
