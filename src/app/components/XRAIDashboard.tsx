import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, Activity, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function XRAIDashboard() {
  const [riskRate, setRiskRate] = useState(3.2);
  const [fraudPoints, setFraudPoints] = useState<Array<{ id: number; lat: number; lng: number; severity: 'high' | 'medium' | 'low' }>>([]);

  // Simular datos de transacciones
  const transactionData = [
    { name: 'Legítimas', value: 12847, color: '#10b981' },
    { name: 'Fraudulentas', value: 432, color: '#ef4444' },
    { name: 'En Revisión', value: 189, color: '#f59e0b' },
  ];

  const totalTransactions = transactionData.reduce((acc, item) => acc + item.value, 0);

  // Generar puntos de fraude aleatorios para el mapa
  useEffect(() => {
    const generateFraudPoints = () => {
      const points = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        lat: Math.random() * 60 + 10, // 10-70% del alto
        lng: Math.random() * 80 + 10, // 10-90% del ancho
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      }));
      setFraudPoints(points);
    };

    generateFraudPoints();
    const interval = setInterval(generateFraudPoints, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animar la tasa de riesgo
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskRate((prev) => +(prev + (Math.random() - 0.5) * 0.3).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="text-gray-600 mt-1">Monitoreo en tiempo real del sistema de detección</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-600">Sistema Activo</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Transactions */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Transacciones Totales</p>
          <p className="text-3xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 mt-2">+12.5% vs ayer</p>
        </div>

        {/* Fraud Detected */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
              Alerta
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Fraudes Detectados</p>
          <p className="text-3xl font-bold text-gray-900">{transactionData[1].value}</p>
          <p className="text-xs text-red-600 mt-2">+8 en la última hora</p>
        </div>

        {/* Success Rate */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Óptimo
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Precisión del Modelo</p>
          <p className="text-3xl font-bold text-gray-900">98.7%</p>
          <p className="text-xs text-emerald-600 mt-2">+0.3% esta semana</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Heatmap */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Mapa de Fraude en Tiempo Real</h2>
          </div>
          
          <div className="relative w-full h-80 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* World Map Overlay (simplified) */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10,50 Q30,30 50,50 T90,50" stroke="currentColor" fill="none" strokeWidth="0.5" className="text-gray-400" />
                <path d="M20,30 L80,30 L80,70 L20,70 Z" stroke="currentColor" fill="none" strokeWidth="0.5" className="text-gray-400" />
              </svg>
            </div>

            {/* Fraud Points */}
            {fraudPoints.map((point) => {
              const colors = {
                high: { bg: 'bg-red-500', glow: 'shadow-red-500/50' },
                medium: { bg: 'bg-orange-500', glow: 'shadow-orange-500/50' },
                low: { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50' },
              };
              
              return (
                <div
                  key={point.id}
                  className={`absolute w-3 h-3 rounded-full ${colors[point.severity].bg} ${colors[point.severity].glow} shadow-lg animate-pulse`}
                  style={{
                    left: `${point.lng}%`,
                    top: `${point.lat}%`,
                    animationDelay: `${point.id * 0.1}s`,
                  }}
                >
                  <div className={`absolute inset-0 rounded-full ${colors[point.severity].bg} opacity-50 animate-ping`}></div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Alto Riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600">Medio Riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">Bajo Riesgo</span>
            </div>
          </div>
        </div>

        {/* Transaction Distribution Chart */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transacciones: Legítimas vs. Fraude</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {transactionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ color: '#6b7280' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Rate Indicator */}
      <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tasa de Riesgo Actual</h2>
            <p className="text-sm text-gray-600">Actualización en tiempo real cada 3 segundos</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-gray-900">{riskRate}%</p>
            <p className={`text-sm mt-1 ${riskRate > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
              {riskRate > 5 ? 'Alto' : 'Normal'}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${riskRate > 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(riskRate * 10, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}