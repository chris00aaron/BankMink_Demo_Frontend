import { TrendingUp, Users, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingDown, RefreshCw, FileText, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';
import { ATMTable } from '@shared/components/ATMTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui-atm/card";
import { Badge } from "@shared/components/ui-atm/badge";
import {
  Activity, 
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar,
  Legend
} from "recharts";
import { Progress } from "@shared/components/ui-atm/progress";


// Mock Data PARA EL FLUJO DE RETIROS
const historicalWithdrawalData = [
  { atm: 'ATM-001', retiroHistorico: 4000, retiroPredicho: 4200 },
  { atm: 'ATM-002', retiroHistorico: 12000, retiroPredicho: 11500 },
  { atm: 'ATM-003', retiroHistorico: 18000, retiroPredicho: 19000 },
  { atm: 'ATM-004', retiroHistorico: 25000, retiroPredicho: 24000 },
  { atm: 'ATM-005', retiroHistorico: 22000, retiroPredicho: 23500 },
];

// Mock Data for Location Distribution
const locationData = [
  { name: 'Urbano', value: 850000, color: '#3b82f6' }, // Blue
  { name: 'Rural', value: 350000, color: '#10b981' }, // Emerald
];

  // Datos de cajeros automáticos
  const atmData = [
    {
      id: "ATM-001",
      ubicacion: "Centro Comercial Plaza Norte",
      tipo: "Centro Comercial",
      nivelEfectivo: 18,
      demandaProximoDia: 145000,
      estado: "critico" as const,
      ultimaRecarga: "Hace 2 días"
    },
    {
      id: "ATM-002",
      ubicacion: "Banco Central - Sucursal Principal",
      tipo: "Banco",
      nivelEfectivo: 72,
      demandaProximoDia: 98000,
      estado: "normal" as const,
      ultimaRecarga: "Hace 5 horas"
    },
    {
      id: "ATM-003",
      ubicacion: "Aeropuerto Internacional",
      tipo: "Aeropuerto",
      nivelEfectivo: 35,
      demandaProximoDia: 186000,
      estado: "alerta" as const,
      ultimaRecarga: "Hace 1 día"
    },
    {
      id: "ATM-004",
      ubicacion: "Universidad Nacional",
      tipo: "Universidad",
      nivelEfectivo: 88,
      demandaProximoDia: 52000,
      estado: "normal" as const,
      ultimaRecarga: "Hace 3 horas"
    },
    {
      id: "ATM-005",
      ubicacion: "Estación de Tren Central",
      tipo: "Transporte",
      nivelEfectivo: 22,
      demandaProximoDia: 127000,
      estado: "critico" as const,
      ultimaRecarga: "Hace 2 días"
    },
    {
      id: "ATM-006",
      ubicacion: "Centro Comercial Mega Plaza",
      tipo: "Centro Comercial",
      nivelEfectivo: 58,
      demandaProximoDia: 132000,
      estado: "normal" as const,
      ultimaRecarga: "Hace 8 horas"
    }
  ];

const weeklyPrediction = [
    { atm: "ATM-001", predicho: 320000, rangoMin: 295000, rangoMax: 345000 },
    { atm: "ATM-002", predicho: 285000, rangoMin: 265000, rangoMax: 305000 },
    { atm: "ATM-003", predicho: 340000, rangoMin: 315000, rangoMax: 365000 },
    { atm: "ATM-004", predicho: 315000, rangoMin: 290000, rangoMax: 340000 },
    { atm: "ATM-005", predicho: 425000, rangoMin: 395000, rangoMax: 455000 },
  ];

export default function Dashboard() {
  const kpis = [
    { 
      label: 'Escenario Pesimista', 
      value: '$1.05M', 
      icon: TrendingDown, 
      baseColor: 'orange', // Helper for logic
      hoverClass: 'hover:bg-orange-500 hover:border-orange-600',
      iconClass: 'text-orange-600 bg-orange-50 group-hover:bg-white/20 group-hover:text-white',
      textClass: 'group-hover:text-white'
    },
    { 
      label: 'Retiros Predichos Hoy', 
      value: '$1.2M', 
      icon: DollarSign, 
      baseColor: 'blue',
      hoverClass: 'hover:bg-blue-600 hover:border-blue-700',
      iconClass: 'text-blue-600 bg-blue-50 group-hover:bg-white/20 group-hover:text-white',
      textClass: 'group-hover:text-white',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Escenario Optimista', 
      value: '$1.35M', 
      icon: TrendingUp, 
      baseColor: 'green',
      hoverClass: 'hover:bg-green-600 hover:border-green-700',
      iconClass: 'text-green-600 bg-green-50 group-hover:bg-white/20 group-hover:text-white',
      textClass: 'group-hover:text-white'
    },
    { 
      label: 'ATMs Operativos', 
      value: '245/250', 
      icon: Users, 
      baseColor: 'emerald',
      hoverClass: 'hover:bg-emerald-600 hover:border-emerald-700',
      iconClass: 'text-emerald-600 bg-emerald-50 group-hover:bg-white/20 group-hover:text-white',
      textClass: 'group-hover:text-white',
      sub: '5 en mantenimiento' 
    },
    { 
      label: 'Alertas Críticas', 
      value: '3', 
      icon: AlertCircle, 
      baseColor: 'red',
      hoverClass: 'hover:bg-red-600 hover:border-red-700',
      iconClass: 'text-red-600 bg-red-50 group-hover:bg-white/20 group-hover:text-white',
      textClass: 'group-hover:text-white',
      trend: 'Requiere Atención', 
      trendUp: false 
    },
  ];

// Factores de influencia
  const influenceFactors = [
    { factor: "Día de Pago", impacto: 42, tipo: "temporal" },
    { factor: "Día de Semana", impacto: 35, tipo: "temporal" },
    { factor: "Ubicación", impacto: 28, tipo: "geográfico" },
    { factor: "Eventos", impacto: 25, tipo: "especial" },
    { factor: "Clima", impacto: 15, tipo: "ambiental" },
    { factor: "Competencia", impacto: 12, tipo: "mercado" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Operativo</h1>
          <p className="text-slate-500 mt-1">Visión general del flujo de efectivo y estado de la red.</p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <RefreshCw size={16} /> Sincronizar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <FileText size={16} /> Reporte PDF
            </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((stat, i) => (
          <div 
            key={i} 
            className={clsx(
                "group bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 cursor-default",
                stat.hoverClass
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={clsx("p-3 rounded-lg transition-colors", stat.iconClass)}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                  <div className={clsx(
                      "flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm",
                      stat.trendUp ? "text-green-700 bg-green-100 group-hover:bg-green-500/20 group-hover:text-white" : "text-red-700 bg-red-100 group-hover:bg-red-500/20 group-hover:text-white"
                  )}>
                      {stat.trendUp ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                      {stat.trend}
                  </div>
              )}
            </div>
            <div>
                <p className={clsx("text-sm font-medium text-slate-500 transition-colors", stat.textClass)}>{stat.label}</p>
                <h3 className={clsx("text-2xl font-bold text-slate-900 mt-1 transition-colors", stat.textClass)}>{stat.value}</h3>
                {stat.sub && <p className={clsx("text-xs text-slate-400 mt-1 transition-colors group-hover:text-white/80", stat.textClass)}>{stat.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Network Flow */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Flujo de Efectivo de la Red (Hoy)</h3>
                    <p className="text-sm text-slate-500">Comparativa: Retiros Historicos vs. Predicción del Modelo</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Historico</span>
                    <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-200 mr-1"></div> Predicho</span>
                </div>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalWithdrawalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="atm" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area type="monotone" dataKey="retiroPredicho"  stroke="#01ffd0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" />
                        <Area type="monotone" dataKey="retiroHistorico" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Location Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Distribución por Ubicación</h3>
            <p className="text-sm text-slate-500 mb-6">Asignación de efectivo según zona.</p>
            
            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={locationData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {locationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend / Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-center">
                       <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                       <span className="text-xs text-slate-400 font-medium">Total: $1.2M</span>
                   </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {locationData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">${(item.value / 1000).toFixed(0)}k</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Gráficos principales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Predicción Semanal con Rangos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Predicción Semanal con Rangos de Confianza
            </CardTitle>
            <CardDescription>
              Retiros predichos para la próxima semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPrediction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="atm" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="rangoMin" fill="#dbeafe" name="Mínimo" />
                <Bar dataKey="predicho" fill="#3b82f6" name="Predicción" />
                <Bar dataKey="rangoMax" fill="#1e40af" name="Máximo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Factores de Influencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Factores que Influyen en la Predicción
            </CardTitle>
            <CardDescription>
              Impacto de diferentes variables en el modelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {influenceFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{factor.factor}</span>
                      <Badge variant="outline" className="text-xs">{factor.tipo}</Badge>
                    </div>
                    <span className="text-sm font-semibold">{factor.impacto}%</span>
                  </div>
                  <Progress value={factor.impacto} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>        
      </div>

      <ATMTable atms={atmData} />
    </div>
  );
}
