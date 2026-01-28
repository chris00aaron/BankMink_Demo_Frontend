// Tipos para el módulo de morosidad

export interface AccountSummary {
    recordId: number;
    limitBal: number;
    balance: number;
    tenure: number;
    isActiveMember: boolean;
}

export interface CustomerSearchResult {
    idCustomer: number;
    nombre: string;
    edad: number;
    educacion: string;
    estadoCivil: string;
    fechaRegistro: string;
    cuentas: AccountSummary[];
}

export interface ClientePredictionDetail {
    // Datos del cliente
    idCustomer: number;
    nombre: string;
    edad: number;
    educacion: string;
    estadoCivil: string;
    fechaRegistro: string;

    // Datos de la cuenta
    recordId: number;
    limitBal: number;
    balance: number;
    estimatedSalary: number;
    tenure: number;

    // Datos calculados del historial
    antiguedadMeses: number;
    cuotasAtrasadas: number;
    historialPagos: number;
    ultimaCuota: number;
    ultimoPago: string;

    // Predicción
    defaultPayment: boolean;
    probabilidadPago: number;
    nivelRiesgo: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
    mainRiskFactor: string;
    modelVersion: string;
    estimatedLoss: number;
}

// Tipos para predicción batch
export interface BatchFilters {
    edadMin?: number;
    edadMax?: number;
    educacion?: string;
    estadoCivil?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface BatchAccountPrediction {
    idCustomer: number;
    nombre: string;
    edad: number;
    educacion: string;
    estadoCivil: string;
    recordId: number;
    limitBal: number;
    balance: number;
    probabilidadPago: number;
    nivelRiesgo: string;
    ultimaCuota: number;
}

