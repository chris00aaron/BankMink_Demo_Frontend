// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== TIPOS ====================

export interface Category {
    idCategory: number;
    categoryName: string;
    active: boolean;
}

// ==================== SERVICIO ====================

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('bankmind-token');
};

/**
 * Helper para hacer requests autenticados
 */
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
