/**
 * Cliente HTTP centralizado con auto-refresh de tokens
 * 
 * Este módulo intercepta errores 401/403 y automáticamente:
 * 1. Llama a /api/auth/refresh para obtener nuevo access token
 * 2. Reintenta la petición original con el nuevo token
 * 3. Dispara evento de logout si el refresh también falla
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Claves de localStorage
const ACCESS_TOKEN_KEY = 'bankmind-token';
const REFRESH_TOKEN_KEY = 'bankmind-refresh-token';

// Estado para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Cola de peticiones pendientes durante el refresh
interface QueuedRequest {
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
}
const requestQueue: QueuedRequest[] = [];

/**
 * Evento personalizado para notificar logout forzado
 */
export const AUTH_EVENTS = {
    LOGOUT_REQUIRED: 'bankmind:logout-required',
} as const;

/**
 * Obtiene el access token actual
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Obtiene el refresh token actual
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Guarda los tokens en localStorage
 */
export const setTokens = (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

/**
 * Limpia todos los tokens
 */
export const clearTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Procesa la cola de peticiones pendientes
 */
const processQueue = (token: string | null, error: Error | null = null): void => {
    requestQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    requestQueue.length = 0; // Limpiar cola
};

/**
 * Intenta renovar el access token usando el refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        console.warn('⚠️ No hay refresh token disponible');
        return null;
    }

    try {
        console.log('🔄 Intentando renovar access token...');

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Refresh token inválido o expirado');
        }

        const data = await response.json();

        if (data.success && data.data?.accessToken) {
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;

            setTokens(newAccessToken, newRefreshToken);
            console.log('✅ Token renovado exitosamente');

            return newAccessToken;
        }

        throw new Error('Respuesta de refresh inválida');
    } catch (error) {
        console.error('❌ Error al renovar token:', error);
        return null;
    }
};

/**
 * Maneja el proceso de refresh con control de concurrencia
 */
const handleTokenRefresh = async (): Promise<string | null> => {
    // Si ya hay un refresh en progreso, esperar su resultado
    if (isRefreshing && refreshPromise) {
        return new Promise((resolve, reject) => {
            requestQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    refreshPromise = refreshAccessToken();

    try {
        const newToken = await refreshPromise;
        processQueue(newToken);
        return newToken;
    } catch (error) {
        processQueue(null, error instanceof Error ? error : new Error('Error desconocido'));
        throw error;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
};

/**
 * Dispara evento de logout forzado
 */
const triggerLogoutEvent = (): void => {
    console.log('🚪 Disparando evento de logout forzado');
    clearTokens();
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT_REQUIRED));
};

/**
 * Cliente HTTP principal con auto-refresh
 */
export const apiRequest = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
    skipAuth = false
): Promise<T> => {
    const makeRequest = async (token: string | null): Promise<Response> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token && !skipAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined,
        });
    };

    // Primera petición
    let token = getAccessToken();
    let response = await makeRequest(token);

    // Si es 401 o 403, intentar refresh y reintentar
    if ((response.status === 401 || response.status === 403) && !skipAuth) {
        console.log(`🔄 Recibido ${response.status}, intentando refresh...`);

        const newToken = await handleTokenRefresh();

        if (newToken) {
            // Reintentar con nuevo token
            response = await makeRequest(newToken);

            // Si sigue fallando después del refresh, logout
            if (response.status === 401 || response.status === 403) {
                triggerLogoutEvent();
                throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
            }
        } else {
            // No se pudo refrescar, forzar logout
            triggerLogoutEvent();
            throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
        }
    }

    // Procesar respuesta
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Error en la solicitud');
    }

    return response.json();
};

export default apiRequest;
