export interface Client {
    id: string;
    nombre: string;
    cedula: string;
    clasificacionSBS: 'Normal' | 'CPP' | 'Deficiente' | 'Dudoso' | 'Pérdida';
    cuotasAtrasadas: number;
    historialPagos: number;
    montoCuota: number;
    deudaTotal: number;
    ingresosDeclarados: number;
    ultimoPago: string;
    antiguedad: number;
    probabilidadPago: number;
    edad: number;
    educacion: 'Primaria' | 'Secundaria' | 'Universitaria' | 'Postgrado';
    estadoCivil: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo';
    fechaRegistro: string;
}

export const mockClients: Client[] = [
    {
        id: 'C001',
        nombre: 'Juan Pérez',
        cedula: '1234567890',
        clasificacionSBS: 'Normal',
        cuotasAtrasadas: 0,
        historialPagos: 98,
        montoCuota: 350,
        deudaTotal: 5000,
        ingresosDeclarados: 2500,
        ultimoPago: '2025-12-15',
        antiguedad: 36,
        probabilidadPago: 95,
        edad: 34,
        educacion: 'Universitaria',
        estadoCivil: 'Casado',
        fechaRegistro: '2022-01-15'
    },
    {
        id: 'C002',
        nombre: 'Ana García',
        cedula: '0987654321',
        clasificacionSBS: 'Pérdida',
        cuotasAtrasadas: 3,
        historialPagos: 45,
        montoCuota: 600,
        deudaTotal: 12000,
        ingresosDeclarados: 1800,
        ultimoPago: '2025-09-10',
        antiguedad: 12,
        probabilidadPago: 20,
        edad: 28,
        educacion: 'Secundaria',
        estadoCivil: 'Soltero',
        fechaRegistro: '2025-01-10'
    },
    {
        id: 'C003',
        nombre: 'Carlos López',
        cedula: '1122334455',
        clasificacionSBS: 'Dudoso',
        cuotasAtrasadas: 1,
        historialPagos: 70,
        montoCuota: 450,
        deudaTotal: 8000,
        ingresosDeclarados: 2000,
        ultimoPago: '2025-11-20',
        antiguedad: 8,
        probabilidadPago: 45,
        edad: 40,
        educacion: 'Universitaria',
        estadoCivil: 'Casado',
        fechaRegistro: '2023-05-20'
    },
    {
        id: 'C004',
        nombre: 'María Rodríguez',
        cedula: '5544332211',
        clasificacionSBS: 'CPP',
        cuotasAtrasadas: 0,
        historialPagos: 85,
        montoCuota: 500,
        deudaTotal: 6500,
        ingresosDeclarados: 2200,
        ultimoPago: '2025-12-05',
        antiguedad: 24,
        probabilidadPago: 70,
        edad: 32,
        educacion: 'Postgrado',
        estadoCivil: 'Soltero',
        fechaRegistro: '2022-11-15'
    },
    {
        id: 'C005',
        nombre: 'Luis Fernández',
        cedula: '6677889900',
        clasificacionSBS: 'Pérdida',
        cuotasAtrasadas: 4,
        historialPagos: 35,
        montoCuota: 800,
        deudaTotal: 15000,
        ingresosDeclarados: 1500,
        ultimoPago: '2025-08-20',
        antiguedad: 6,
        probabilidadPago: 15,
        edad: 26,
        educacion: 'Secundaria',
        estadoCivil: 'Divorciado',
        fechaRegistro: '2024-02-10'
    },
    {
        id: 'C006',
        nombre: 'Carmen Díaz',
        cedula: '1122556677',
        clasificacionSBS: 'Dudoso',
        cuotasAtrasadas: 2,
        historialPagos: 55,
        montoCuota: 550,
        deudaTotal: 9000,
        ingresosDeclarados: 1900,
        ultimoPago: '2025-10-15',
        antiguedad: 10,
        probabilidadPago: 35,
        edad: 45,
        educacion: 'Primaria',
        estadoCivil: 'Viudo',
        fechaRegistro: '2021-08-05'
    }
];

// Dashboard Metrics
export const modelMetrics = {
    totalClientes: 2458,
    clientesEnRiesgo: 312,
    dineroEnRiesgo: 185000,
    tasaMorosidadPredicha: 12.7,
    precision: 94.2,
    recall: 91.8,
    f1Score: 93.0
};

// Distribution data for bar chart
export const distributionData = [
    { rango: '0-20%', cantidad: 89 },
    { rango: '20-40%', cantidad: 156 },
    { rango: '40-60%', cantidad: 423 },
    { rango: '60-80%', cantidad: 892 },
    { rango: '80-100%', cantidad: 898 }
];

// Risk level data for pie chart
export const riskLevelData = [
    { nivel: 'Pérdida', cantidad: 89, dinero: 45000 },
    { nivel: 'Dudoso', cantidad: 223, dinero: 78000 },
    { nivel: 'Deficiente', cantidad: 534, dinero: 42000 },
    { nivel: 'CPP', cantidad: 412, dinero: 20000 },
    { nivel: 'Normal', cantidad: 1200, dinero: 5000 }
];

// Trend data for area chart
export const trendData = [
    { mes: 'Jul', morosidad: 8.2, prediccion: 8.5 },
    { mes: 'Ago', morosidad: 9.1, prediccion: 9.0 },
    { mes: 'Sep', morosidad: 10.5, prediccion: 10.2 },
    { mes: 'Oct', morosidad: 11.8, prediccion: 11.5 },
    { mes: 'Nov', morosidad: 12.3, prediccion: 12.0 },
    { mes: 'Dic', morosidad: 12.7, prediccion: 12.5 }
];

// High risk clients (filtered from mockClients for dashboard table)
export const highRiskClients = mockClients.filter(
    client => client.clasificacionSBS === 'Pérdida' || client.clasificacionSBS === 'Dudoso'
);
