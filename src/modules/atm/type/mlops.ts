// ATM Features
export interface DynamicFeatures {
  lag1: number;
  lag5: number;
  lag11: number;
  domingo_bajo: number;
  caida_reciente: number;
  tendencia_lags: number;
  ratio_finde_vs_semana: number;
  retiros_finde_anterior: number;
  retiros_domingo_anterior: number;
}

export interface ATMFeature {
  id_feature_store: number;
  id_transaction: number;
  reference_date: string;
  day_of_month: number | null;
  day_of_week: number | null;
  month: number | null;
  withdrawal_amount_day: number | null;
  created_at: string | null;
  dynamic_features: DynamicFeatures | null;
}

// Model Training
export interface PSIBin {
  bins: (number | null)[];
  stats: {
    std: number;
    mean: number;
    median: number;
    null_pct: number;
    n_samples: number;
  };
  expected_pct: number[];
}

export interface PSIBaseline {
  [feature: string]: PSIBin;
}

export interface SelfTrainingAudit {
  id: number;
  is_production: boolean;
  mae: number;
  mape: number;
  margin_improvement: number;
  rmse: number;
  training_duration_minutes: number;
  compared_to_model: number | null;
  end_training: string;
  id_dataset_withdrawal_prediction: number;
  start_training: string;
  model_name: string;
  hyperparameters: Record<string, any>;
  psi_baseline: PSIBaseline | null;
}

// Performance Monitor
export interface PSIFeatureResult {
  psi: number;
  alert: 'OK' | 'SKIPPED' | 'WARNING' | 'CRITICAL';
  actual_pct: number[];
  expected_pct: number[];
  prod_samples: number;
  prod_null_pct: number;
}

export interface PSIResults {
  [feature: string]: PSIFeatureResult;
}

export interface PSIDetail {
  OK: Record<string, number>;
  SKIPPED: Record<string, number>;
  WARNING: Record<string, number>;
  CRITICAL: Record<string, number>;
}

export interface PSISummary {
  n_ok: number;
  n_skipped: number;
  n_warning: number;
  n_critical: number;
  worst_psi: number;
  worst_feature: string;
  evaluated_at: string;
  pct_critical: number;
  pct_warning_plus: number;
  total_features: number;
}

export interface PerformanceMonitor {
  id: number;
  action: string;
  created_at: string;
  decision: string;
  detail: PSIDetail;
  mae: number;
  mape: number;
  message: string;
  psi_results: PSIResults;
  rmse: number;
  summary: PSISummary;
  id_withdrawal_model: number;
}
