import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SimulationResult {
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  fraudProbability: number;
  status: 'Aprobada' | 'Sospechosa' | 'Bloqueada';
  riskScore: number;
}

export function SimulationScreen() {
  const [formData, setFormData] = useState({
    monto: '',
    hora: '',
    tipoComercio: '',
    canalPago: '',
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const tiposComercio = [
    'Supermercado',
    'Gasolinera',
    'Restaurante',
    'Tienda en línea',
    'Farmacia',
    'Electrónica',
    'Viajes',
    'Entretenimiento',
  ];

  const canalesPago = [
    'Tarjeta de crédito',
    'Tarjeta de débito',
    'Transferencia bancaria',
    'Pago móvil',
    'E-commerce',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateRisk = (): SimulationResult => {
    const monto = parseFloat(formData.monto);
    let riskScore = 0;

    // Algoritmo simple de cálculo de riesgo
    if (monto > 5000) riskScore += 30;
    else if (monto > 2000) riskScore += 15;
    else if (monto > 1000) riskScore += 10;

    // Hora (formato HH:mm)
    const hora = parseInt(formData.hora.split(':')[0]);
    if (hora >= 0 && hora < 6) riskScore += 20; // Madrugada
    else if (hora >= 22) riskScore += 15; // Noche

    // Tipo de comercio de alto riesgo
    if (['Tienda en línea', 'Electrónica', 'Viajes'].includes(formData.tipoComercio)) {
      riskScore += 15;
    }

    // Canal de pago
    if (formData.canalPago === 'E-commerce') {
      riskScore += 10;
    }

    // Agregar algo de aleatoriedad
    riskScore += Math.random() * 15;

    // Determinar nivel de riesgo
    let riskLevel: 'Bajo' | 'Medio' | 'Alto';
    let status: 'Aprobada' | 'Sospechosa' | 'Bloqueada';

    if (riskScore >= 60) {
      riskLevel = 'Alto';
      status = 'Bloqueada';
    } else if (riskScore >= 35) {
      riskLevel = 'Medio';
      status = 'Sospechosa';
    } else {
      riskLevel = 'Bajo';
      status = 'Aprobada';
    }

    const fraudProbability = Math.min(95, riskScore * 1.3);

    return {
      riskLevel,
      fraudProbability: Math.round(fraudProbability),
      status,
      riskScore: Math.round(riskScore),
    };
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSimulating(true);
    
    // Simular procesamiento
    setTimeout(() => {
      const result = calculateRisk();
      setResult(result);
      setIsSimulating(false);
    }, 1500);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto':
        return 'bg-red-500';
      case 'Medio':
        return 'bg-yellow-500';
      case 'Bajo':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bloqueada':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Sospechosa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Aprobada':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Bloqueada':
        return <ShieldAlert className="w-8 h-8 text-red-600" />;
      case 'Sospechosa':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'Aprobada':
        return <ShieldCheck className="w-8 h-8 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold">
            Simulador del Motor de Detección de Fraude
          </h2>
        </div>
        <p className="text-blue-100">
          Prueba el modelo de inteligencia artificial ingresando datos de una transacción
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Simulación */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Datos de la Transacción
          </h3>

          <form onSubmit={handleSimulate} className="space-y-4">
            {/* Monto */}
            <div>
              <label htmlFor="monto" className="block text-sm font-semibold text-gray-700 mb-2">
                Monto de la Transacción (S/)
              </label>
              <input
                type="number"
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="1500.00"
              />
            </div>

            {/* Hora */}
            <div>
              <label htmlFor="hora" className="block text-sm font-semibold text-gray-700 mb-2">
                Hora de la Transacción
              </label>
              <input
                type="time"
                id="hora"
                name="hora"
                value={formData.hora}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Tipo de Comercio */}
            <div>
              <label htmlFor="tipoComercio" className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Comercio
              </label>
              <select
                id="tipoComercio"
                name="tipoComercio"
                value={formData.tipoComercio}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Seleccione un tipo</option>
                {tiposComercio.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Canal de Pago */}
            <div>
              <label htmlFor="canalPago" className="block text-sm font-semibold text-gray-700 mb-2">
                Canal de Pago
              </label>
              <select
                id="canalPago"
                name="canalPago"
                value={formData.canalPago}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Seleccione un canal</option>
                {canalesPago.map((canal) => (
                  <option key={canal} value={canal}>
                    {canal}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Simular */}
            <button
              type="submit"
              disabled={isSimulating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analizando...
                </span>
              ) : (
                'Simular Transacción'
              )}
            </button>
          </form>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultado del Análisis
          </h3>

          {!result ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Zap className="w-16 h-16 mb-4" />
              <p className="text-center">
                Complete el formulario y presione "Simular Transacción" para ver los resultados
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estado de la Transacción */}
              <div className={`border-2 rounded-lg p-6 text-center ${getStatusColor(result.status)}`}>
                <div className="flex justify-center mb-3">
                  {getStatusIcon(result.status)}
                </div>
                <h4 className="text-xl font-bold mb-1">Transacción {result.status}</h4>
                <p className="text-sm opacity-80">
                  {result.status === 'Bloqueada' && 'La transacción ha sido bloqueada por alto riesgo de fraude'}
                  {result.status === 'Sospechosa' && 'La transacción requiere verificación adicional'}
                  {result.status === 'Aprobada' && 'La transacción ha sido aprobada exitosamente'}
                </p>
              </div>

              {/* Nivel de Riesgo */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Nivel de Riesgo:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    result.riskLevel === 'Alto' ? 'bg-red-100 text-red-800' :
                    result.riskLevel === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {result.riskLevel}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${getRiskColor(result.riskLevel)} transition-all duration-1000`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  Score: {result.riskScore}/100
                </p>
              </div>

              {/* Probabilidad de Fraude */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Probabilidad de Fraude:
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {result.fraudProbability}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
                    style={{ width: `${result.fraudProbability}%` }}
                  />
                </div>
              </div>

              {/* Detalles de la Transacción */}
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Datos Analizados:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold text-gray-900">S/ {parseFloat(formData.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-semibold text-gray-900">{formData.hora}</span>
                  
                  <span className="text-gray-600">Comercio:</span>
                  <span className="font-semibold text-gray-900">{formData.tipoComercio}</span>
                  
                  <span className="text-gray-600">Canal:</span>
                  <span className="font-semibold text-gray-900">{formData.canalPago}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}