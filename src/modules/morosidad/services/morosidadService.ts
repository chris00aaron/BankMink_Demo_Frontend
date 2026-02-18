// Servicio para comunicarse con la API de morosidad

import type {
    CustomerSearchResult,
    ClientePredictionDetail,
    BatchFilters,
    BatchPredictionResponse,
    DashboardData,
    DefaultPolicy,
    PolicyRequest,
    EarlyWarningsPreview
} from '../types/morosidad.types';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Busca clientes por nombre o ID.
 */
export async function searchCustomers(searchTerm: string): Promise<CustomerSearchResult[]> {
    if (!searchTerm || searchTerm.length < 2) {
        return [];
    }

    const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(searchTerm)}`);

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
    const response = await fetch(`${API_BASE_URL}/morosidad/predict/complete`, {
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
    const response = await fetch(`${API_BASE_URL}/customers/filter`, {
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
    const response = await fetch(`${API_BASE_URL}/morosidad/predict/batch`, {
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
    const response = await fetch(`${API_BASE_URL}/dashboard/morosidad`);

    if (!response.ok) {
        throw new Error('Error al obtener datos del dashboard');
    }

    return response.json();
}

// ============ POLÍTICAS ============

/**
 * Obtiene todas las políticas.
 */
export async function getAllPolicies(): Promise<DefaultPolicy[]> {
    const response = await fetch(`${API_BASE_URL}/policies`);
    if (!response.ok) throw new Error('Error al obtener políticas');
    return response.json();
}

/**
 * Obtiene la política activa.
 */
export async function getActivePolicy(): Promise<DefaultPolicy | null> {
    const response = await fetch(`${API_BASE_URL}/policies/active`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Error al obtener política activa');
    return response.json();
}

/**
 * Crea una nueva política.
 */
export async function createPolicy(policy: PolicyRequest): Promise<DefaultPolicy> {
    const response = await fetch(`${API_BASE_URL}/policies`, {
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
    const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/policies/${id}/activate`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Error al activar política');
    return response.json();
}

// ============ ALERTAS TEMPRANAS ============

/**
 * Obtiene preview de alertas con umbrales temporales.
 */
export async function getWarningsPreview(threshold: number, days: number): Promise<EarlyWarningsPreview> {
    const response = await fetch(`${API_BASE_URL}/warnings/preview?threshold=${threshold}&days=${days}`);
    if (!response.ok) throw new Error('Error al obtener preview de alertas');
    return response.json();
}

/**
 * Realiza una simulación de predicción sin guardar datos.
 */
export async function simulatePrediction(data: import('../types/morosidad.types').SimulationRequest): Promise<import('../types/morosidad.types').SimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/morosidad/simulate`, {
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

// ============ MONITOREO DEL MODELO ============

import type {
    ProductionModel,
    DriftLog,
    ValidationLog,
    TrainingHistoryEntry,
    VersionCheck
} from '../types/morosidad.types';

/**
 * Obtiene el modelo activo en producción.
 */
export async function getProductionModel(): Promise<ProductionModel> {
    const response = await fetch(`${API_BASE_URL}/model/production`);
    if (!response.ok) throw new Error('Error al obtener modelo en producción');
    return response.json();
}

/**
 * Obtiene logs de drift PSI de los últimos N días.
 */
export async function getDriftLogs(days: number = 30): Promise<DriftLog[]> {
    const response = await fetch(`${API_BASE_URL}/model/monitoring/drift?days=${days}`);
    if (!response.ok) throw new Error('Error al obtener datos de drift');
    return response.json();
}

/**
 * Obtiene logs de validación mensual (predicción vs realidad).
 */
export async function getValidationLogs(): Promise<ValidationLog[]> {
    const response = await fetch(`${API_BASE_URL}/model/monitoring/validation`);
    if (!response.ok) throw new Error('Error al obtener validaciones');
    return response.json();
}

/**
 * Obtiene el historial completo de entrenamientos.
 */
export async function getTrainingHistory(): Promise<TrainingHistoryEntry[]> {
    const response = await fetch(`${API_BASE_URL}/model/training-history`);
    if (!response.ok) throw new Error('Error al obtener historial');
    return response.json();
}

/**
 * Verifica si la versión del modelo en BD coincide con la API de predicción.
 */
export async function checkModelVersion(): Promise<VersionCheck> {
    const response = await fetch(`${API_BASE_URL}/model/version-check`);
    if (!response.ok) throw new Error('Error al verificar versión');
    return response.json();
}

/**
 * Dispara el auto-entrenamiento manual.
 */
export async function triggerSelfTraining(optunaTrials: number = 30): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/default/self-training/trigger?optunaTrials=${optunaTrials}`, {
        method: 'POST',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Error al iniciar entrenamiento');
    }
    return response.json();
}

