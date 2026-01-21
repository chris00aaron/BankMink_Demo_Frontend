import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui-atm/card";
import { Badge } from "@shared/components/ui-atm/badge";
import { ModelMetrics } from "@shared/components/ModelMetrics";
import { HistoricalAccuracy } from "@shared/components/HistoricalAccuracy";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Clock,
  Target,
  Brain,
  Activity,
  DollarSign
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Progress } from "@shared/components/ui-atm/progress";

export function PredictionDashboard() {
  // Datos de predicción por hora para hoy
  const hourlyPrediction = [
    { hora: "00:00", real: 12000, predicho: 13200, confianza: 92 },
    { hora: "03:00", real: 8000, predicho: 8500, confianza: 94 },
    { hora: "06:00", real: 25000, predicho: 24500, confianza: 88 },
    { hora: "09:00", real: 85000, predicho: 87000, confianza: 85 },
    { hora: "12:00", real: 125000, predicho: 128000, confianza: 82 },
    { hora: "15:00", real: 95000, predicho: 93000, confianza: 86 },
    { hora: "18:00", real: 110000, predicho: 112000, confianza: 84 },
    { hora: "21:00", real: 65000, predicho: 67000, confianza: 90 },
  ];

  // Datos de predicción semanal
  const weeklyPrediction = [
    { dia: "Lun", predicho: 320000, rangoMin: 295000, rangoMax: 345000 },
    { dia: "Mar", predicho: 285000, rangoMin: 265000, rangoMax: 305000 },
    { dia: "Mié", predicho: 340000, rangoMin: 315000, rangoMax: 365000 },
    { dia: "Jue", predicho: 315000, rangoMin: 290000, rangoMax: 340000 },
    { dia: "Vie", predicho: 425000, rangoMin: 395000, rangoMax: 455000 },
    { dia: "Sáb", predicho: 380000, rangoMin: 350000, rangoMax: 410000 },
    { dia: "Dom", predicho: 195000, rangoMin: 175000, rangoMax: 215000 },
  ];

  // Precisión del modelo por métrica
  const modelAccuracy = [
    { metrica: "Precisión Global", valor: 87 },
    { metrica: "Días Laborales", valor: 92 },
    { metrica: "Fines de Semana", valor: 78 },
    { metrica: "Días Festivos", valor: 83 },
    { metrica: "Horas Pico", valor: 85 },
    { metrica: "Horas Valle", valor: 94 },
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

  // KPIs de predicción
  const predictionKPIs = [
    {
      title: "Retiros Predichos Hoy",
      value: "$2.65M",
      change: 12.3,
      confidence: 87,
      icon: DollarSign,
      color: "blue"
    },
    {
      title: "Precisión del Modelo",
      value: "87%",
      change: 2.5,
      confidence: 95,
      icon: Target,
      color: "green"
    },
    {
      title: "Alertas Activas",
      value: "3",
      change: -25,
      confidence: 92,
      icon: AlertTriangle,
      color: "orange"
    },
    {
      title: "Cajeros Optimizados",
      value: "24/28",
      change: 8.5,
      confidence: 89,
      icon: CheckCircle2,
      color: "purple"
    }
  ];

  // Recomendaciones de reabastecimiento
  const refillRecommendations = [
    {
      atmId: "ATM-001",
      ubicacion: "Centro Comercial Plaza Norte",
      prioridad: "alta",
      recomendacion: "Reabastecer antes de 12:00 PM",
      cantidadSugerida: "$145,000",
      riesgoQuiebre: 85
    },
    {
      atmId: "ATM-005",
      ubicacion: "Estación de Tren Central",
      prioridad: "alta",
      recomendacion: "Reabastecer antes de 2:00 PM",
      cantidadSugerida: "$127,000",
      riesgoQuiebre: 78
    },
    {
      atmId: "ATM-003",
      ubicacion: "Aeropuerto Internacional",
      prioridad: "media",
      recomendacion: "Reabastecer mañana AM",
      cantidadSugerida: "$186,000",
      riesgoQuiebre: 45
    },
    {
      atmId: "ATM-006",
      ubicacion: "Centro Comercial Mega Plaza",
      prioridad: "baja",
      recomendacion: "Reabastecer en 2-3 días",
      cantidadSugerida: "$132,000",
      riesgoQuiebre: 22
    }
  ];

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta": return "bg-red-500";
      case "media": return "bg-yellow-500";
      case "baja": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "alta": return <Badge variant="destructive">Alta</Badge>;
      case "media": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Media</Badge>;
      case "baja": return <Badge className="bg-green-500 hover:bg-green-600">Baja</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard de Predicción de Retiros</h2>
        <p className="text-muted-foreground">
          Análisis predictivo avanzado con inteligencia artificial para optimización de efectivo
        </p>
      </div>

      {/* KPIs de Predicción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {predictionKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                  <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  Confianza: {kpi.confidence}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <div className="flex items-center text-sm">
                  {kpi.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={kpi.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {Math.abs(kpi.change)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs promedio</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Predicción por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Predicción vs Real - Hoy
            </CardTitle>
            <CardDescription>
              Comparación de retiros predichos y reales por hora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyPrediction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="real" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Retiros Reales"
                />
                <Area 
                  type="monotone" 
                  dataKey="predicho" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.4}
                  name="Retiros Predichos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <XAxis dataKey="dia" />
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
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Precisión del Modelo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Precisión del Modelo Predictivo
            </CardTitle>
            <CardDescription>
              Métricas de rendimiento del modelo de ML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={modelAccuracy}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metrica" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Precisión %" 
                  dataKey="valor" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
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

      {/* Recomendaciones de Reabastecimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recomendaciones de Reabastecimiento
          </CardTitle>
          <CardDescription>
            Sugerencias basadas en predicciones y riesgo de quiebre de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Prioridad</th>
                  <th className="text-left p-3">ID Cajero</th>
                  <th className="text-left p-3">Ubicación</th>
                  <th className="text-left p-3">Recomendación</th>
                  <th className="text-left p-3">Cantidad Sugerida</th>
                  <th className="text-left p-3">Riesgo de Quiebre</th>
                </tr>
              </thead>
              <tbody>
                {refillRecommendations.map((rec, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      {getPrioridadBadge(rec.prioridad)}
                    </td>
                    <td className="p-3">
                      <span className="font-mono">{rec.atmId}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{rec.ubicacion}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{rec.recomendacion}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">{rec.cantidadSugerida}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPrioridadColor(rec.prioridad)} transition-all`}
                            style={{ width: `${rec.riesgoQuiebre}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{rec.riesgoQuiebre}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Métricas del Modelo y Evolución */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ModelMetrics 
          accuracy={87}
          precision={89}
          recall={85}
          f1Score={87}
        />
        <HistoricalAccuracy />
      </div>
    </div>
  );
}