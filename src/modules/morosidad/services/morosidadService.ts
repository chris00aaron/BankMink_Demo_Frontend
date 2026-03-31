// Servicio para comunicarse con la API de morosidad

import type {
    CustomerSearchResult,
    ClientePredictionDetail,
    BatchFilters,
    BatchPredictionResponse,
    DashboardData,
    DefaultPolicy,
    PolicyRequest,
    StrategyResponse,
    Campaign,
    CampaignRequest,
    SimulationResult,
    PredictionTimelineEntry,
    ClientPaymentHistoryEntry
} from '../types/morosidad.types';

const API_BASE_URL = 'http://localhost:8080/api';

import { getAuthToken } from '@shared/api';

/**
 * Helper interno que envuelve el fetch nativo inyectando el token JWT y credentials
 */
async function morosidadFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const token = getAuthToken();
    const headers = new Headers(init?.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, {
        ...init,
        headers,
        credentials: 'include'
    });
}

/**
 * Busca clientes por nombre o ID.
 */
export async function searchCustomers(searchTerm: string): Promise<CustomerSearchResult[]> {
    if (!searchTerm || searchTerm.length < 2) {
        return [];
    }

    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/customers/search?q=${encodeURIComponent(searchTerm)}`);

    if (!response.ok) {
        throw new Error('Error al buscar clientes');
    }

    return response.json();
}

/**
 * Realiza una predicción de morosidad para una cuenta.
 * Retorna todos los datos del cliente + predicción.
 */
export async function predictMorosidad(recordId: number): Promise<ClientePredictionDetail> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/predict/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al realizar la predicción');
    }

    return response.json();
}

/**
 * Filtra clientes según criterios y retorna lista de recordIds.
 */
export async function filterCustomers(filters: BatchFilters): Promise<number[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/customers/filter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
    });

    if (!response.ok) {
        throw new Error('Error al filtrar clientes');
    }

    return response.json();
}

/**
 * Realiza predicción batch para múltiples cuentas.
 */
export async function predictBatch(recordIds: number[], includeShap: boolean = false): Promise<BatchPredictionResponse> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/predict/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordIds, includeShap }),
    });

    if (!response.ok) {
        throw new Error('Error al realizar predicción batch');
    }

    return response.json();
}

/**
 * Obtiene todos los datos del dashboard de morosidad.
 */
export async function getDashboardData(): Promise<DashboardData> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/dashboard/morosidad`);

    if (!response.ok) {
        throw new Error('Error al obtener datos del dashboard');
    }

    return response.json();
}

/**
 * Obtiene los clientes paginados y filtrados para el dashboard.
 */
export async function getDashboardClients(
    page: number = 0,
    size: number = 10,
    nombre?: string,
    clasificacionSBS?: string,
    sortBy?: string,
    sortDir?: string,
    educacion?: string,
    edadMin?: number,
    edadMax?: number
): Promise<import('../types/morosidad.types').PageResponse<import('../types/morosidad.types').ClienteAltoRiesgo>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (nombre) params.append('nombre', nombre);
    if (clasificacionSBS && clasificacionSBS !== 'Todas') params.append('clasificacionSBS', clasificacionSBS);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDir) params.append('sortDir', sortDir);
    if (educacion && educacion !== 'Todas') params.append('educacion', educacion);
    if (edadMin != null && !isNaN(edadMin)) params.append('edadMin', edadMin.toString());
    if (edadMax != null && !isNaN(edadMax)) params.append('edadMax', edadMax.toString());

    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/dashboard/clientes?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Error al obtener clientes del dashboard');
    }

    return response.json();
}

// ============ POLÍTICAS ============

/**
 * Obtiene todas las políticas.
 */
export async function getAllPolicies(): Promise<DefaultPolicy[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/policies`);
    if (!response.ok) throw new Error('Error al obtener políticas');
    return response.json();
}

/**
 * Obtiene la política activa.
 */
export async function getActivePolicy(): Promise<DefaultPolicy | null> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/policies/active`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Error al obtener política activa');
    return response.json();
}

/**
 * Crea una nueva política.
 */
export async function createPolicy(policy: PolicyRequest): Promise<DefaultPolicy> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
    });
    if (!response.ok) throw new Error('Error al crear política');
    return response.json();
}

/**
 * Actualiza una política existente.
 */
export async function updatePolicy(id: number, policy: PolicyRequest): Promise<DefaultPolicy> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/policies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
    });
    if (!response.ok) throw new Error('Error al actualizar política');
    return response.json();
}

/**
 * Activa una política.
 */
export async function activatePolicy(id: number): Promise<DefaultPolicy> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/policies/${id}/activate`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Error al activar política');
    return response.json();
}

/**
 * Obtiene el resumen de segmentos de riesgo.
 */
export async function getStrategySegments(): Promise<StrategyResponse> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/strategy/segments`);
    if (!response.ok) throw new Error('Error al obtener segmentos de riesgo');
    return response.json();
}

/**
 * Simula el impacto de una campaña sobre un segmento.
 */
export async function simulateCampaignImpact(campaignId: number, segment: string): Promise<SimulationResult> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/strategy/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, segment }),
    });
    if (!response.ok) throw new Error('Error al simular campaña');
    return response.json();
}

// ============ CAMPAÑAS ============

/**
 * Obtiene todas las campañas activas.
 */
export async function getCampaigns(): Promise<Campaign[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/campaigns`);
    if (!response.ok) throw new Error('Error al obtener campañas');
    return response.json();
}

/**
 * Crea una nueva campaña.
 */
export async function createCampaign(data: CampaignRequest): Promise<Campaign> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear campaña');
    return response.json();
}

/**
 * Actualiza una campaña existente.
 */
export async function updateCampaign(id: number, data: CampaignRequest): Promise<Campaign> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar campaña');
    return response.json();
}

/**
 * Elimina (soft-delete) una campaña.
 */
export async function deleteCampaign(id: number): Promise<void> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/campaigns/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar campaña');
}

/**
 * Realiza una simulación de predicción sin guardar datos.
 */
export async function simulatePrediction(data: import('../types/morosidad.types').SimulationRequest): Promise<import('../types/morosidad.types').SimulationResponse> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/simulate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Error al simular predicción');
    }

    return response.json();
}

/**
 * Obtiene el timeline de predicciones para una cuenta individual.
 * Incluye probabilidad de default y estado de pago real (payX) por fecha.
 */
export async function getPredictionTimeline(recordId: number): Promise<PredictionTimelineEntry[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/prediction-timeline/${recordId}`);
    if (!response.ok) throw new Error('Error al obtener timeline de predicción');
    return response.json();
}

/**
 * Obtiene el historial mensual de pagos de una cuenta (máx. 10 meses).
 */
export async function getClientPaymentHistory(recordId: number): Promise<ClientPaymentHistoryEntry[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/payment-history/${recordId}`);
    if (!response.ok) throw new Error('Error al obtener historial de pagos');
    return response.json();
}

/**
 * Obtiene la última predicción guardada para una cuenta sin recalcular el modelo.
 * Usado para navegar desde el dashboard al detalle del cliente.
 */
export async function getLastPrediction(recordId: number): Promise<ClientePredictionDetail> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/prediccion/${recordId}/ultima`);
    if (!response.ok) throw new Error('No se encontró predicción guardada para esta cuenta');
    return response.json();
}

// ============ MONITOREO DEL MODELO ============

import type {
    ProductionModel,
    DriftLog,
    ValidationLog,
    TrainingHistoryEntry,
    VersionCheck,
    MonitoringPolicy,
    MonitoringPolicyRequest
} from '../types/morosidad.types';

/**
 * Obtiene el modelo activo en producción.
 */
export async function getProductionModel(): Promise<ProductionModel> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/model-monitoring/production`);
    if (!response.ok) throw new Error('Error al obtener modelo en producción');
    return response.json();
}

/**
 * Obtiene logs de drift PSI de los últimos N días.
 */
export async function getDriftLogs(days: number = 30): Promise<DriftLog[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/model-monitoring/monitoring/drift?days=${days}`);
    if (!response.ok) throw new Error('Error al obtener datos de drift');
    return response.json();
}

/**
 * Obtiene logs de validación mensual (predicción vs realidad).
 */
export async function getValidationLogs(): Promise<ValidationLog[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/model-monitoring/monitoring/validation`);
    if (!response.ok) throw new Error('Error al obtener validaciones');
    return response.json();
}

/**
 * Obtiene el historial completo de entrenamientos.
 */
export async function getTrainingHistory(): Promise<TrainingHistoryEntry[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/model-monitoring/training-history`);
    if (!response.ok) throw new Error('Error al obtener historial');
    return response.json();
}

/**
 * Verifica si la versión del modelo en BD coincide con la API de predicción.
 */
export async function checkModelVersion(): Promise<VersionCheck> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/model-monitoring/version-check`);
    if (!response.ok) throw new Error('Error al verificar versión');
    return response.json();
}

/**
 * Dispara el auto-entrenamiento manual.
 */
export async function triggerSelfTraining(optunaTrials: number = 30): Promise<Record<string, unknown>> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/self-training/trigger?optunaTrials=${optunaTrials}`, {
        method: 'POST',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Error al iniciar entrenamiento');
    }
    return response.json();
}

// ============ POLÍTICAS DE MONITOREO ============

/**
 * Obtiene todas las políticas de monitoreo.
 */
export async function getMonitoringPolicies(): Promise<MonitoringPolicy[]> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/monitoring-policy`);
    if (!response.ok) throw new Error('Error al obtener políticas de monitoreo');
    return response.json();
}

/**
 * Obtiene la política de monitoreo activa.
 */
export async function getActiveMonitoringPolicy(): Promise<MonitoringPolicy | null> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/monitoring-policy/active`);
    if (response.status === 204) return null;
    if (!response.ok) throw new Error('Error al obtener política de monitoreo activa');
    return response.json();
}

/**
 * Crea una nueva política de monitoreo.
 */
export async function createMonitoringPolicy(data: MonitoringPolicyRequest): Promise<MonitoringPolicy> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/monitoring-policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear política de monitoreo');
    return response.json();
}

/**
 * Activa una política de monitoreo.
 */
export async function activateMonitoringPolicy(id: number): Promise<MonitoringPolicy> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/monitoring-policy/${id}/activate`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Error al activar política de monitoreo');
    return response.json();
}

/**
 * Ejecuta manualmente el análisis PSI de data drift.
 */
export async function triggerDriftAnalysis(): Promise<{ status: string; message: string }> {
    const response = await morosidadFetch(`${API_BASE_URL}/morosidad/model-monitoring/trigger-drift`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Error al ejecutar análisis PSI');
    return response.json();
}
