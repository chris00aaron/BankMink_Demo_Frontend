// Servicio para comunicarse con la API de morosidad

import type {
    CustomerSearchResult,
    ClientePredictionDetail,
    BatchFilters,
    BatchAccountPrediction
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
export async function predictBatch(recordIds: number[]): Promise<BatchAccountPrediction[]> {
    const response = await fetch(`${API_BASE_URL}/morosidad/predict/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordIds }),
    });

    if (!response.ok) {
        throw new Error('Error al realizar predicción batch');
    }

    return response.json();
}

