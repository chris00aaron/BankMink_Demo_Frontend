import { Customer, XAIFactor, ActionRecommendation, CountryStats } from '../types';

// Mock data de clientes
export const mockCustomers: Customer[] = [
    // Alto Riesgo (>0.80)
    { customerId: 15634892, name: 'María González', creditScore: 620, age: 48, balance: 125000, country: 'Alemania', churnScore: 0.87, isActive: true, tenure: 2, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634893, name: 'Hans Mueller', creditScore: 580, age: 52, balance: 87500, country: 'Alemania', churnScore: 0.85, isActive: false, tenure: 1, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634894, name: 'Sophie Dubois', creditScore: 650, age: 46, balance: 210000, country: 'Francia', churnScore: 0.82, isActive: true, tenure: 2, numOfProducts: 2, transactionActivity: 'Baja' },
    { customerId: 15634895, name: 'Klaus Schmidt', creditScore: 590, age: 55, balance: 95000, country: 'Alemania', churnScore: 0.89, isActive: false, tenure: 1, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634896, name: 'Isabel Martínez', creditScore: 610, age: 49, balance: 152000, country: 'España', churnScore: 0.84, isActive: true, tenure: 2, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634897, name: 'Pierre Laurent', creditScore: 595, age: 51, balance: 78000, country: 'Francia', churnScore: 0.86, isActive: false, tenure: 1, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634898, name: 'Anna Weber', creditScore: 635, age: 47, balance: 198000, country: 'Alemania', churnScore: 0.83, isActive: true, tenure: 2, numOfProducts: 2, transactionActivity: 'Baja' },
    { customerId: 15634899, name: 'Carlos Rodríguez', creditScore: 575, age: 53, balance: 115000, country: 'España', churnScore: 0.88, isActive: false, tenure: 1, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634900, name: 'Francoise Martin', creditScore: 640, age: 45, balance: 175000, country: 'Francia', churnScore: 0.81, isActive: true, tenure: 2, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634901, name: 'Ludwig Becker', creditScore: 585, age: 54, balance: 92000, country: 'Alemania', churnScore: 0.87, isActive: false, tenure: 1, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634902, name: 'Ana García', creditScore: 625, age: 50, balance: 165000, country: 'España', churnScore: 0.85, isActive: true, tenure: 2, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634903, name: 'Thomas Hoffman', creditScore: 600, age: 52, balance: 142000, country: 'Alemania', churnScore: 0.84, isActive: true, tenure: 2, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634904, name: 'Marie Leroy', creditScore: 615, age: 48, balance: 188000, country: 'Francia', churnScore: 0.82, isActive: true, tenure: 2, numOfProducts: 2, transactionActivity: 'Baja' },
    { customerId: 15634905, name: 'Javier López', creditScore: 570, age: 56, balance: 105000, country: 'España', churnScore: 0.89, isActive: false, tenure: 1, numOfProducts: 1, transactionActivity: 'Baja' },
    { customerId: 15634906, name: 'Sabine Fischer', creditScore: 630, age: 47, balance: 195000, country: 'Alemania', churnScore: 0.83, isActive: true, tenure: 2, numOfProducts: 2, transactionActivity: 'Media' },

    // Riesgo Medio (0.50-0.80)
    { customerId: 15634907, name: 'Jean Bernard', creditScore: 680, age: 42, balance: 145000, country: 'Francia', churnScore: 0.72, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634908, name: 'Carmen Ruiz', creditScore: 695, age: 39, balance: 132000, country: 'España', churnScore: 0.68, isActive: true, tenure: 4, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634909, name: 'Markus Klein', creditScore: 710, age: 44, balance: 158000, country: 'Alemania', churnScore: 0.75, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634910, name: 'Isabelle Moreau', creditScore: 670, age: 41, balance: 125000, country: 'Francia', churnScore: 0.70, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634911, name: 'Pablo Sánchez', creditScore: 700, age: 38, balance: 140000, country: 'España', churnScore: 0.65, isActive: true, tenure: 4, numOfProducts: 3, transactionActivity: 'Media' },
    { customerId: 15634912, name: 'Petra Schulz', creditScore: 685, age: 43, balance: 152000, country: 'Alemania', churnScore: 0.73, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634913, name: 'Antoine Petit', creditScore: 675, age: 40, balance: 138000, country: 'Francia', churnScore: 0.71, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634914, name: 'Laura Hernández', creditScore: 690, age: 37, balance: 130000, country: 'España', churnScore: 0.63, isActive: true, tenure: 4, numOfProducts: 2, transactionActivity: 'Alta' },
    { customerId: 15634915, name: 'Stefan Wagner', creditScore: 705, age: 45, balance: 162000, country: 'Alemania', churnScore: 0.76, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634916, name: 'Claudine Roux', creditScore: 665, age: 42, balance: 128000, country: 'Francia', churnScore: 0.69, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634917, name: 'Miguel Fernández', creditScore: 715, age: 36, balance: 148000, country: 'España', churnScore: 0.60, isActive: true, tenure: 5, numOfProducts: 3, transactionActivity: 'Alta' },
    { customerId: 15634918, name: 'Monika Bauer', creditScore: 680, age: 43, balance: 155000, country: 'Alemania', churnScore: 0.74, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634919, name: 'Vincent Blanc', creditScore: 670, age: 41, balance: 135000, country: 'Francia', churnScore: 0.72, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634920, name: 'Rosa Jiménez', creditScore: 695, age: 38, balance: 142000, country: 'España', churnScore: 0.67, isActive: true, tenure: 4, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634921, name: 'Frank Meyer', creditScore: 685, age: 44, balance: 150000, country: 'Alemania', churnScore: 0.75, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634922, name: 'Monique Garnier', creditScore: 660, age: 42, balance: 122000, country: 'Francia', churnScore: 0.70, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634923, name: 'David Morales', creditScore: 710, age: 35, balance: 155000, country: 'España', churnScore: 0.58, isActive: true, tenure: 5, numOfProducts: 3, transactionActivity: 'Alta' },
    { customerId: 15634924, name: 'Gisela Schneider', creditScore: 675, age: 43, balance: 145000, country: 'Alemania', churnScore: 0.73, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634925, name: 'Luc Fournier', creditScore: 665, age: 41, balance: 132000, country: 'Francia', churnScore: 0.71, isActive: true, tenure: 3, numOfProducts: 2, transactionActivity: 'Media' },
    { customerId: 15634926, name: 'Elena Pérez', creditScore: 700, age: 37, balance: 138000, country: 'España', churnScore: 0.64, isActive: true, tenure: 4, numOfProducts: 3, transactionActivity: 'Alta' },

    // Bajo Riesgo (<0.50)
    { customerId: 15634927, name: 'Sebastian Wolf', creditScore: 780, age: 32, balance: 185000, country: 'Alemania', churnScore: 0.35, isActive: true, tenure: 8, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634928, name: 'Amélie Dupont', creditScore: 795, age: 30, balance: 210000, country: 'Francia', churnScore: 0.28, isActive: true, tenure: 9, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634929, name: 'Alejandro Torres', creditScore: 765, age: 33, balance: 175000, country: 'España', churnScore: 0.42, isActive: true, tenure: 7, numOfProducts: 3, transactionActivity: 'Alta' },
    { customerId: 15634930, name: 'Julia Richter', creditScore: 785, age: 31, balance: 195000, country: 'Alemania', churnScore: 0.32, isActive: true, tenure: 8, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634931, name: 'Nicolas Girard', creditScore: 800, age: 29, balance: 225000, country: 'Francia', churnScore: 0.25, isActive: true, tenure: 10, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634932, name: 'Sofía Ramírez', creditScore: 775, age: 34, balance: 168000, country: 'España', churnScore: 0.38, isActive: true, tenure: 7, numOfProducts: 3, transactionActivity: 'Alta' },
    { customerId: 15634933, name: 'Oliver Koch', creditScore: 790, age: 31, balance: 198000, country: 'Alemania', churnScore: 0.30, isActive: true, tenure: 9, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634934, name: 'Emma Lambert', creditScore: 805, age: 28, balance: 235000, country: 'Francia', churnScore: 0.22, isActive: true, tenure: 11, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634935, name: 'Daniel Vargas', creditScore: 770, age: 35, balance: 172000, country: 'España', churnScore: 0.40, isActive: true, tenure: 7, numOfProducts: 3, transactionActivity: 'Alta' },
    { customerId: 15634936, name: 'Laura Zimmermann', creditScore: 780, age: 32, balance: 188000, country: 'Alemania', churnScore: 0.33, isActive: true, tenure: 8, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634937, name: 'Thomas Bonnet', creditScore: 795, age: 30, balance: 215000, country: 'Francia', churnScore: 0.27, isActive: true, tenure: 9, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634938, name: 'Lucía Castro', creditScore: 760, age: 36, balance: 165000, country: 'España', churnScore: 0.45, isActive: true, tenure: 6, numOfProducts: 3, transactionActivity: 'Alta' },
    { customerId: 15634939, name: 'Max Krüger', creditScore: 785, age: 31, balance: 192000, country: 'Alemania', churnScore: 0.31, isActive: true, tenure: 8, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634940, name: 'Charlotte Fabre', creditScore: 800, age: 29, balance: 228000, country: 'Francia', churnScore: 0.24, isActive: true, tenure: 10, numOfProducts: 4, transactionActivity: 'Alta' },
    { customerId: 15634941, name: 'Antonio Navarro', creditScore: 755, age: 37, balance: 158000, country: 'España', churnScore: 0.48, isActive: true, tenure: 6, numOfProducts: 3, transactionActivity: 'Alta' },
];

// Factores XAI por cliente (pre-generados para algunos clientes de alto riesgo)
export const xaiFactorsByCustomer: Record<number, XAIFactor[]> = {
    15634892: [
        { factor: 'Baja actividad transaccional', impact: 32, description: 'Solo 2 transacciones en los últimos 3 meses', color: '#ef4444' },
        { factor: 'Edad > 45 años', impact: 21, description: 'Segmento demográfico con mayor tasa de abandono', color: '#f97316' },
        { factor: 'País: Alemania', impact: 18, description: 'Alta competencia bancaria en esta región', color: '#f59e0b' },
        { factor: 'Variación negativa de balance', impact: 11, description: 'Balance reducido un 15% en 6 meses', color: '#eab308' },
        { factor: 'Antigüedad menor a 3 años', impact: 5, description: 'Bajo compromiso con la institución', color: '#84cc16' },
    ],
    15634893: [
        { factor: 'Cliente inactivo', impact: 38, description: 'Sin actividad en los últimos 90 días', color: '#ef4444' },
        { factor: 'Puntaje de crédito bajo', impact: 24, description: 'Score 580 indica dificultades financieras', color: '#f97316' },
        { factor: 'Solo 1 producto contratado', impact: 19, description: 'Baja vinculación con el banco', color: '#f59e0b' },
        { factor: 'País: Alemania', impact: 12, description: 'Región con alta tasa de cambio bancario', color: '#eab308' },
        { factor: 'Antigüedad menor a 2 años', impact: 7, description: 'Cliente nuevo con bajo compromiso', color: '#84cc16' },
    ],
    15634894: [
        { factor: 'Baja actividad transaccional', impact: 28, description: 'Reducción del 60% en transacciones mensuales', color: '#ef4444' },
        { factor: 'Alto balance en riesgo', impact: 25, description: '€210,000 susceptibles de migración', color: '#f97316' },
        { factor: 'Edad > 45 años', impact: 20, description: 'Perfil demográfico volátil', color: '#f59e0b' },
        { factor: 'Antigüedad moderada', impact: 14, description: 'No está completamente fidelizado', color: '#eab308' },
        { factor: 'Solo 2 productos', impact: 8, description: 'Oportunidad de cross-selling perdida', color: '#84cc16' },
    ],
};

// Recomendaciones de acción por cliente
export const actionRecommendations: Record<number, ActionRecommendation> = {
    15634892: {
        title: 'Asignar llamada de asesor senior',
        description: 'Contacto personalizado para ofrecer productos premium adaptados a su perfil de alto balance.',
        expectedImpact: 35,
        effortLevel: 'Medio',
    },
    15634893: {
        title: 'Reducir comisiones durante 6 meses',
        description: 'Incentivo económico para reactivar la cuenta y demostrar beneficios tangibles.',
        expectedImpact: 42,
        effortLevel: 'Bajo',
    },
    15634894: {
        title: 'Ofrecer seguro de vida personalizado',
        description: 'Producto de alto valor para este segmento demográfico con beneficios exclusivos.',
        expectedImpact: 38,
        effortLevel: 'Medio',
    },
};

// Estadísticas por país
export const countryStats: CountryStats[] = [
    { country: 'Francia', activeMembers: 12450, inactiveMembers: 3250, churnRate: 28.5 },
    { country: 'España', activeMembers: 10820, inactiveMembers: 2890, churnRate: 25.2 },
    { country: 'Alemania', activeMembers: 8950, inactiveMembers: 5610, churnRate: 47.8 }, // Zona crítica
];

// Métricas agregadas
export const calculateMetrics = () => {
    const highRiskCustomers = mockCustomers.filter(c => c.churnScore > 0.80);
    const activeChurnRate = (highRiskCustomers.length / mockCustomers.length) * 100;
    const capitalAtRisk = highRiskCustomers.reduce((sum, c) => sum + c.balance, 0);

    return {
        activeChurnRate: Math.round(activeChurnRate * 10) / 10,
        capitalAtRisk,
        modelConfidence: 90.2,
    };
};
