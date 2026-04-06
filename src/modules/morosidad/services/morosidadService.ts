// Servicio para comunicarse con la API de morosidad
// Usa el cliente centralizado que adjunta automáticamente el token JWT

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

import { apiRequest } from '@shared/services/apiClient';

/**
 * Busca clientes por nombre o ID.
 */
export async function searchCustomers(searchTerm: string): Promise<CustomerSearchResult[]> {
    if (!searchTerm || searchTerm.length < 2) {
        return [];
    }

    return apiRequest<CustomerSearchResult[]>(
        `/morosidad/customers/search?q=${encodeURIComponent(searchTerm)}`
    );
}

/**
 * Realiza una predicción de morosidad para una cuenta.
 * Retorna todos los datos del cliente + predicción.
 */
export async function predictMorosidad(recordId: number): Promise<ClientePredictionDetail> {
    return apiRequest<ClientePredictionDetail>(
        '/morosidad/predict/complete',
        'POST',
        { recordId }
    );
}

/**
 * Filtra clientes según criterios y retorna lista de recordIds.
 */
export async function filterCustomers(filters: BatchFilters): Promise<number[]> {
    return apiRequest<number[]>(
        '/morosidad/customers/filter',
        'POST',
        filters
    );
}

/**
 * Realiza predicción batch para múltiples cuentas.
 */
export async function predictBatch(recordIds: number[], includeShap: boolean = false): Promise<BatchPredictionResponse> {
    return apiRequest<BatchPredictionResponse>(
        '/morosidad/predict/batch',
        'POST',
        { recordIds, includeShap }
    );
}

/**
 * Obtiene todos los datos del dashboard de morosidad.
 */
export async function getDashboardData(): Promise<DashboardData> {
    return apiRequest<DashboardData>('/morosidad/dashboard/morosidad');
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

    return apiRequest(`/morosidad/dashboard/clientes?${params.toString()}`);
}

// ============ POLÍTICAS ============

/**
 * Obtiene todas las políticas.
 */
export async function getAllPolicies(): Promise<DefaultPolicy[]> {
    return apiRequest<DefaultPolicy[]>('/morosidad/policies');
}

/**
 * Obtiene la política activa.
 */
export async function getActivePolicy(): Promise<DefaultPolicy | null> {
    try {
        return await apiRequest<DefaultPolicy>('/morosidad/policies/active');
    } catch {
        return null;
    }
}

/**
 * Crea una nueva política.
 */
export async function createPolicy(policy: PolicyRequest): Promise<DefaultPolicy> {
    return apiRequest<DefaultPolicy>('/morosidad/policies', 'POST', policy);
}

/**
 * Actualiza una política existente.
 */
export async function updatePolicy(id: number, policy: PolicyRequest): Promise<DefaultPolicy> {
    return apiRequest<DefaultPolicy>(`/morosidad/policies/${id}`, 'PUT', policy);
}

/**
 * Activa una política.
 */
export async function activatePolicy(id: number): Promise<DefaultPolicy> {
    return apiRequest<DefaultPolicy>(`/morosidad/policies/${id}/activate`, 'PUT');
}

/**
 * Obtiene el resumen de segmentos de riesgo.
 */
export async function getStrategySegments(): Promise<StrategyResponse> {
    return apiRequest<StrategyResponse>('/morosidad/strategy/segments');
}

/**
 * Simula el impacto de una campaña sobre un segmento.
 */
export async function simulateCampaignImpact(campaignId: number, segment: string): Promise<SimulationResult> {
    return apiRequest<SimulationResult>(
        '/morosidad/strategy/simulate',
        'POST',
        { campaignId, segment }
    );
}

// ============ CAMPAÑAS ============

/**
 * Obtiene todas las campañas activas.
 */
export async function getCampaigns(): Promise<Campaign[]> {
    return apiRequest<Campaign[]>('/morosidad/campaigns');
}

/**
 * Crea una nueva campaña.
 */
export async function createCampaign(data: CampaignRequest): Promise<Campaign> {
    return apiRequest<Campaign>('/morosidad/campaigns', 'POST', data);
}

/**
 * Actualiza una campaña existente.
 */
export async function updateCampaign(id: number, data: CampaignRequest): Promise<Campaign> {
    return apiRequest<Campaign>(`/morosidad/campaigns/${id}`, 'PUT', data);
}

/**
 * Elimina (soft-delete) una campaña.
 */
export async function deleteCampaign(id: number): Promise<void> {
    return apiRequest<void>(`/morosidad/campaigns/${id}`, 'DELETE');
}

/**
 * Realiza una simulación de predicción sin guardar datos.
 */
export async function simulatePrediction(data: import('../types/morosidad.types').SimulationRequest): Promise<import('../types/morosidad.types').SimulationResponse> {
    return apiRequest('/morosidad/simulate', 'POST', data);
}

/**
 * Obtiene el timeline de predicciones para una cuenta individual.
 * Incluye probabilidad de default y estado de pago real (payX) por fecha.
 */
export async function getPredictionTimeline(recordId: number): Promise<PredictionTimelineEntry[]> {
    return apiRequest<PredictionTimelineEntry[]>(`/morosidad/prediction-timeline/${recordId}`);
}

/**
 * Obtiene el historial mensual de pagos de una cuenta (máx. 10 meses).
 */
export async function getClientPaymentHistory(recordId: number): Promise<ClientPaymentHistoryEntry[]> {
    return apiRequest<ClientPaymentHistoryEntry[]>(`/morosidad/payment-history/${recordId}`);
}

/**
 * Obtiene la última predicción guardada para una cuenta sin recalcular el modelo.
 * Usado para navegar desde el dashboard al detalle del cliente.
 */
export async function getLastPrediction(recordId: number): Promise<ClientePredictionDetail> {
    return apiRequest<ClientePredictionDetail>(`/morosidad/prediccion/${recordId}/ultima`);
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
    return apiRequest<ProductionModel>('/morosidad/model-monitoring/production');
}

/**
 * Obtiene logs de drift PSI de los últimos N días.
 */
export async function getDriftLogs(days: number = 30): Promise<DriftLog[]> {
    return apiRequest<DriftLog[]>(`/morosidad/model-monitoring/monitoring/drift?days=${days}`);
}

/**
 * Obtiene logs de validación mensual (predicción vs realidad).
 */
export async function getValidationLogs(): Promise<ValidationLog[]> {
    return apiRequest<ValidationLog[]>('/morosidad/model-monitoring/monitoring/validation');
}

/**
 * Obtiene el historial completo de entrenamientos.
 */
export async function getTrainingHistory(): Promise<TrainingHistoryEntry[]> {
    return apiRequest<TrainingHistoryEntry[]>('/morosidad/model-monitoring/training-history');
}

/**
 * Verifica si la versión del modelo en BD coincide con la API de predicción.
 */
export async function checkModelVersion(): Promise<VersionCheck> {
    return apiRequest<VersionCheck>('/morosidad/model-monitoring/version-check');
}

/**
 * Dispara el auto-entrenamiento manual.
 */
export async function triggerSelfTraining(optunaTrials: number = 30): Promise<Record<string, unknown>> {
    return apiRequest<Record<string, unknown>>(
        `/morosidad/self-training/trigger?optunaTrials=${optunaTrials}`,
        'POST'
    );
}

// ============ POLÍTICAS DE MONITOREO ============

/**
 * Obtiene todas las políticas de monitoreo.
 */
export async function getMonitoringPolicies(): Promise<MonitoringPolicy[]> {
    return apiRequest<MonitoringPolicy[]>('/morosidad/monitoring-policy');
}

/**
 * Obtiene la política de monitoreo activa.
 */
export async function getActiveMonitoringPolicy(): Promise<MonitoringPolicy | null> {
    try {
        return await apiRequest<MonitoringPolicy>('/morosidad/monitoring-policy/active');
    } catch {
        return null;
    }
}

/**
 * Crea una nueva política de monitoreo.
 */
export async function createMonitoringPolicy(data: MonitoringPolicyRequest): Promise<MonitoringPolicy> {
    return apiRequest<MonitoringPolicy>('/morosidad/monitoring-policy', 'POST', data);
}

/**
 * Activa una política de monitoreo.
 */
export async function activateMonitoringPolicy(id: number): Promise<MonitoringPolicy> {
    return apiRequest<MonitoringPolicy>(`/morosidad/monitoring-policy/${id}/activate`, 'PUT');
}

/**
 * Ejecuta manualmente el análisis PSI de data drift.
 */
export async function triggerDriftAnalysis(): Promise<{ status: string; message: string }> {
    return apiRequest<{ status: string; message: string }>(
        '/morosidad/model-monitoring/trigger-drift',
        'POST'
    );
}
