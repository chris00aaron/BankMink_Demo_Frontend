/**
 * Servicio para el Panel de Monitoreo del Modelo de Fraude
 * Consume /api/fraud/monitoring/* en el backend Java
 */
import { apiRequest } from '../../../shared/services/apiClient';

// ==================== TIPOS ====================

export interface ChampionModel {
    id_model: number;
    model_version: string;
    algorithm: string;
    threshold: number | null;
    promotion_status: string;
    is_active: boolean;
    created_at: string;
    promoted_at: string | null;
    // Métricas
    accuracy: number | null;
    precision_score: number | null;
    recall_score: number | null;
    f1_score: number | null;
    auc_roc: number | null;
}

export interface TrainingAudit {
    id_audit: number;
    id_model: number | null;
    start_training: string | null;
    end_training: string | null;
    training_duration_seconds: number | null;
    // Challenger
    accuracy: number | null;
    precision_score: number | null;
    recall_score: number | null;
    f1_score: number | null;
    auc_roc: number | null;
    optimal_threshold: number | null;
    // Champion referencia
    champion_f1_score: number | null;
    champion_recall: number | null;
    champion_auc_roc: number | null;
    // Optuna
    optuna_best_f1: number | null;
    optuna_best_params: string | null;
    // Decisión
    promotion_status: string | null;
    promotion_reason: string | null;
    // Trigger
    triggered_by: string | null;
    is_success: boolean | null;
    error_message: string | null;
    // Dataset del entrenamiento
    dataset_id: number | null;
    dataset_start_date: string | null;
    dataset_end_date: string | null;
    dataset_total_samples: number | null;
    dataset_count_train: number | null;
    dataset_count_test: number | null;
    dataset_fraud_ratio: number | null;
    dataset_undersampling_ratio: number | null;
}

export interface FeatureDrift {
    id_drift: number | null;
    id_model: number;
    feature_name: string;
    psi_value: number;
    drift_category: 'LOW' | 'MODERATE' | 'HIGH';
    measured_at: string;
}

export interface ManualTrainingRequest {
    start_date: string;
    end_date: string;
}

/**
 * Opción curada del backend para el selector de modelo del gráfico PSI.
 * Solo contiene champion + últimos 5 PROMOTED. REJECTED nunca aparece.
 */
export interface DriftModelOption {
    id_model: number;
    model_version: string;
    is_champion: boolean;
    created_at: string;
}

// ==================== SERVICIO ====================

export const monitoringService = {
    /**
     * Modelo CHAMPION activo con métricas del último entrenamiento
     */
    getChampion: (): Promise<ChampionModel> =>
        apiRequest<ChampionModel>('/fraud/monitoring/champion'),

    /**
     * Historial de ciclos de entrenamiento (último N)
     */
    getHistory: (limit = 10): Promise<TrainingAudit[]> =>
        apiRequest<TrainingAudit[]>(`/fraud/monitoring/history?limit=${limit}`),

    /**
     * Historial de PSI para la gráfica de líneas.
     * - modelId undefined → cross-model (todos los modelos, línea continua).
     * - modelId = n → solo ese modelo (auditoría).
     */
    getDriftHistory: (days = 30, modelId?: number): Promise<FeatureDrift[]> => {
        const params = modelId != null
            ? `/fraud/monitoring/drift?days=${days}&modelId=${modelId}`
            : `/fraud/monitoring/drift?days=${days}`;
        return apiRequest<FeatureDrift[]>(params);
    },

    /**
     * Último PSI por feature.
     * - modelId undefined → cross-model (el más reciente de cada feature).
     * - modelId = n → solo ese modelo.
     */
    getLatestDrift: (modelId?: number): Promise<FeatureDrift[]> => {
        const url = modelId != null
            ? `/fraud/monitoring/drift/latest?modelId=${modelId}`
            : '/fraud/monitoring/drift/latest';
        return apiRequest<FeatureDrift[]>(url);
    },

    /**
     * Dispara entrenamiento manual
     */
    triggerManualTraining: (body: ManualTrainingRequest): Promise<Record<string, unknown>> =>
        apiRequest<Record<string, unknown>>('/fraud/monitoring/train/manual', 'POST', body),

    /**
     * Lista curada de modelos para el selector del gráfico PSI.
     * Backend devuelve: champion + últimos 5 PROMOTED. Nunca REJECTED.
     * Máximo 6 opciones sin importar cuántos modelos existan en la BD.
     */
    getDriftModelOptions: (): Promise<DriftModelOption[]> =>
        apiRequest<DriftModelOption[]>('/fraud/monitoring/drift/models'),
};

export default monitoringService;
