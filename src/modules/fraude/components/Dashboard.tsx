import { useState, useEffect } from 'react';
import {
  AlertTriangle, CheckCircle, TrendingUp, Activity, MapPin,
  BarChart3, PieChart as PieChartIcon, Shield, Users
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

export function Dashboard() {
  const [riskRate, setRiskRate] = useState(3.2);

  // --- DATOS MOCK SIMULADOS (Más ricos) ---

  // 1. Distribución de Estado
  const transactionData = [
    { name: 'Legítimas', value: 12847, color: '#10b981' }, // Emerald-500
    { name: 'Fraudes Detectados', value: 432, color: '#ef4444' }, // Red-500
    { name: 'En Revisión Manual', value: 189, color: '#f59e0b' }, // Amber-500
  ];

  // 2. SHAP Global (¿Qué factores pesan más hoy?)
  const shapGlobalData = [
    { factor: 'Monto Elevado', impacto: 85, color: '#ef4444' },
    { factor: 'Hora Inusual', impacto: 65, color: '#f97316' },
    { factor: 'Ubicación Lejana', impacto: 45, color: '#eab308' },
    { factor: 'Categoría Riesgo', impacto: 30, color: '#3b82f6' },
    { factor: 'Dispositivo Nuevo', impacto: 20, color: '#94a3b8' },
  ];

  // 3. Tendencia Horaria (Transacciones vs Fraudes)
  const trendData = [
    { time: '00:00', total: 120, fraude: 5 },
    { time: '04:00', total: 80, fraude: 12 }, // Pico de fraude nocturno
    { time: '08:00', total: 450, fraude: 8 },
    { time: '12:00', total: 980, fraude: 15 },
    { time: '16:00', total: 850, fraude: 10 },
    { time: '20:00', total: 600, fraude: 25 }, // Pico nocturno
  ];

  // 4. Datos de Riesgo por Ubicación (Reemplaza al mapa)
  const locationRiskData = [
    { city: 'Lima', alertas: 150, riesgo: 'Alto' },
    { city: 'Arequipa', alertas: 85, riesgo: 'Medio' },
    { city: 'Trujillo', alertas: 64, riesgo: 'Medio' },
    { city: 'Cusco', alertas: 42, riesgo: 'Bajo' },
    { city: 'Piura', alertas: 38, riesgo: 'Bajo' },
  ];

  const totalTransactions = 13468; // Suma total simulada

  // Efecto de "Vivo" en el risk rate
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskRate((prev) => +(prev + (Math.random() - 0.5) * 0.4).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control de Fraude</h1>
          <p className="text-gray-600 mt-1">Monitoreo de IA y métricas de negocio en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
            <Shield className="w-4 h-4" /> Modelo v2.1 Activo
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Sistema Online
          </div>
        </div>
      </div>

      {/* KPI Cards (Resumen Ejecutivo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Transacciones Hoy"
          value="13,468"
          trend="+12.5%"
          trendUp={true}
          icon={Activity}
          color="blue"
        />
        <KpiCard
          title="Fraudes Bloqueados"
          value="432"
          trend="+8 (última hora)"
          trendUp={false} // Malo que suba mucho
          icon={AlertTriangle}
          color="red"
        />
        <KpiCard
          title="En Revisión"
          value="189"
          trend="-5% vs ayer"
          trendUp={true} // Bueno que baje
          icon={Users}
          color="amber"
        />
        <KpiCard
          title="Precisión Modelo"
          value="99.8%"
          trend="Estable"
          trendUp={true}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* --- SECCIÓN PRINCIPAL DE GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Tendencia de Tráfico (Área Chart) - Ocupa 2 columnas */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Volumen Transaccional vs Fraude</h2>
              <p className="text-sm text-gray-500">Detección de anomalías por franja horaria</p>
            </div>
            <TrendingUp className="text-gray-400 w-5 h-5" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFraude" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Tráfico Total" />
                <Area type="monotone" dataKey="fraude" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFraude)" name="Intentos de Fraude" />
                <Legend verticalAlign="top" height={36} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Distribución de Casos (Pie Chart) - Ocupa 1 columna */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Estado de Alertas</h2>
          <p className="text-sm text-gray-500 mb-6">Distribución actual del sistema</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {transactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Stats bajo el Pie */}
          <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Tasa de Fraude</p>
              <p className="text-lg font-bold text-gray-900">{riskRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Falsos Positivos</p>
              <p className="text-lg font-bold text-gray-900">0.2%</p>
            </div>
          </div>
        </div>

      </div>

      {/* --- SECCIÓN SECUNDARIA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 3. SHAP Global (Barras) - CRÍTICO PARA TU PROYECTO */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Factores de Riesgo Dominantes</h2>
              <p className="text-sm text-gray-500">¿Qué está disparando las alertas hoy? (SHAP Global)</p>
            </div>
            <BarChart3 className="text-gray-400 w-5 h-5" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapGlobalData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="factor" type="category" width={110} tick={{ fontSize: 12, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="impacto" radius={[0, 4, 4, 0]} barSize={24} name="Impacto Promedio">
                  {shapGlobalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Top Ciudades con Alertas (Reemplaza al Mapa) */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Distribución Geográfica</h2>
              <p className="text-sm text-gray-500">Ciudades con mayor volumen de alertas detectadas</p>
            </div>
            <MapPin className="text-blue-500 w-5 h-5" />
          </div>

          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="city"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="alertas" radius={[4, 4, 0, 0]} barSize={35}>
                  {locationRiskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.alertas > 100 ? '#ef4444' : entry.alertas > 50 ? '#f97316' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Leyenda Informativa */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Crítico</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Moderado</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Estable</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente auxiliar para Tarjetas KPI (Limpia el código principal)
function KpiCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}