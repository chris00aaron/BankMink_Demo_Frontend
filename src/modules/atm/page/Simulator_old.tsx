import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui-atm/card";
import { Label } from "@shared/components/ui-atm/label";
import { Input } from "@shared/components/ui-atm/input";
import { Button } from "@shared/components/ui-atm/button";
import { Badge } from "@shared/components/ui-atm/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@shared/components/ui-atm/select";
import { Checkbox } from "@shared/components/ui-atm/checkbox";
import { 
  Calculator, 
  Play, 
  RotateCcw, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Cloud,
  Users,
  Sparkles
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
  AreaChart
} from "recharts";
import { Progress } from "@shared/components/ui-atm/progress";

export function Simulator() {
  const [formData, setFormData] = useState({
    fecha: "",
    atmId: "",
    location: "",
    tipo: "",
    hora: "",
    clima: "",
    esFestivo: false,
    eventoEspecial: "",
    nivelEfectivoActual: "50"
  });

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const atmOptions = [
    { value: "ATM-001", label: "ATM-001 - Plaza Norte" },
    { value: "ATM-002", label: "ATM-002 - Banco Central" },
    { value: "ATM-003", label: "ATM-003 - Aeropuerto" },
    { value: "ATM-004", label: "ATM-004 - Universidad" },
    { value: "ATM-005", label: "ATM-005 - Estación Tren" }
  ];

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Simulación con lógica de cálculo
    setTimeout(() => {
      const baseAmount = formData.tipo === "Retiro" ? 85000 : 
                        formData.tipo === "Deposito" ? 25000 : 95000;
      
      const locationMultiplier = formData.location === "Urbano" ? 1.3 : 0.7;
      const horaMultiplier = parseInt(formData.hora || "12") >= 9 && parseInt(formData.hora || "12") <= 18 ? 1.5 : 0.8;
      const festivoMultiplier = formData.esFestivo ? 1.4 : 1.0;
      const climaMultiplier = formData.clima === "Soleado" ? 1.1 : 
                             formData.clima === "Lluvioso" ? 0.9 : 1.0;
      
      const prediccion = Math.round(baseAmount * locationMultiplier * horaMultiplier * festivoMultiplier * climaMultiplier);
      const confianza = Math.round(82 + Math.random() * 10);
      
      // Generar datos históricos simulados
      const historicalData = Array.from({ length: 7 }, (_, i) => ({
        dia: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
        historico: Math.round(prediccion * (0.8 + Math.random() * 0.4)),
        predicho: prediccion + Math.round((Math.random() - 0.5) * 10000)
      }));

      // Generar datos por hora
      const hourlyData = Array.from({ length: 8 }, (_, i) => {
        const hora = i * 3;
        return {
          hora: `${hora.toString().padStart(2, '0')}:00`,
          demanda: Math.round(prediccion * (0.3 + Math.random() * 0.7))
        };
      });

      const result = {
        prediccion,
        confianza,
        riesgo: prediccion > parseInt(formData.nivelEfectivoActual) * 2000 ? "Alto" : 
                prediccion > parseInt(formData.nivelEfectivoActual) * 1000 ? "Medio" : "Bajo",
        recomendacion: prediccion > parseInt(formData.nivelEfectivoActual) * 2000 
          ? "Se recomienda reabastecer inmediatamente"
          : prediccion > parseInt(formData.nivelEfectivoActual) * 1000
          ? "Considerar reabastecimiento en las próximas 24 horas"
          : "Nivel de efectivo adecuado",
        factoresImpacto: [
          { factor: "Ubicación", impacto: Math.round((locationMultiplier - 1) * 100) },
          { factor: "Hora del día", impacto: Math.round((horaMultiplier - 1) * 100) },
          { factor: "Día festivo", impacto: Math.round((festivoMultiplier - 1) * 100) },
          { factor: "Clima", impacto: Math.round((climaMultiplier - 1) * 100) }
        ],
        historicalData,
        hourlyData
      };

      setSimulationResult(result);
      setIsSimulating(false);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      fecha: "",
      atmId: "",
      location: "",
      tipo: "",
      hora: "",
      clima: "",
      esFestivo: false,
      eventoEspecial: "",
      nivelEfectivoActual: "50"
    });
    setSimulationResult(null);
  };

  const isFormValid = formData.fecha && formData.atmId && formData.location && formData.tipo;

  const getRiesgoColor = (riesgo: string) => {
    switch (riesgo) {
      case "Alto": return "text-red-600";
      case "Medio": return "text-yellow-600";
      case "Bajo": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getRiesgoBadge = (riesgo: string) => {
    switch (riesgo) {
      case "Alto": return <Badge variant="destructive">Riesgo Alto</Badge>;
      case "Medio": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Riesgo Medio</Badge>;
      case "Bajo": return <Badge className="bg-green-500 hover:bg-green-600">Riesgo Bajo</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          Simulador de Demanda de Efectivo
        </h2>
        <p className="text-muted-foreground">
          Predice la demanda de efectivo ingresando diferentes escenarios y variables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Simulación */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Parámetros de Simulación
            </CardTitle>
            <CardDescription>
              Configure los parámetros para ejecutar la simulación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            {/* ATM ID */}
            <div className="space-y-2">
              <Label htmlFor="atmId">ID Cajero Automático</Label>
              <Select value={formData.atmId} onValueChange={(value) => setFormData({ ...formData, atmId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cajero" />
                </SelectTrigger>
                <SelectContent>
                  {atmOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación
              </Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urbano">Urbano</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tipo de Operación
              </Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retiro">Retiro</SelectItem>
                  <SelectItem value="Deposito">Depósito</SelectItem>
                  <SelectItem value="Demanda Efectivo">Demanda Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <Label htmlFor="hora" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora del Día (0-23)
              </Label>
              <Input
                id="hora"
                type="number"
                min="0"
                max="23"
                placeholder="Ej: 14"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              />
            </div>

            {/* Clima */}
            <div className="space-y-2">
              <Label htmlFor="clima" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Condiciones Climáticas
              </Label>
              <Select value={formData.clima} onValueChange={(value) => setFormData({ ...formData, clima: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione clima" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soleado">Soleado</SelectItem>
                  <SelectItem value="Nublado">Nublado</SelectItem>
                  <SelectItem value="Lluvioso">Lluvioso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Festivo */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="festivo" 
                checked={formData.esFestivo}
                onCheckedChange={(checked) => setFormData({ ...formData, esFestivo: checked as boolean })}
              />
              <label
                htmlFor="festivo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                ¿Es día festivo?
              </label>
            </div>

            {/* Evento Especial */}
            <div className="space-y-2">
              <Label htmlFor="evento" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Evento Especial (Opcional)
              </Label>
              <Select value={formData.eventoEspecial} onValueChange={(value) => setFormData({ ...formData, eventoEspecial: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguno">Ninguno</SelectItem>
                  <SelectItem value="Concierto">Concierto</SelectItem>
                  <SelectItem value="Evento Deportivo">Evento Deportivo</SelectItem>
                  <SelectItem value="Feria">Feria</SelectItem>
                  <SelectItem value="Quincena">Día de Pago (Quincena)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nivel de Efectivo Actual */}
            <div className="space-y-2">
              <Label htmlFor="nivelEfectivo">
                Nivel de Efectivo Actual: {formData.nivelEfectivoActual}%
              </Label>
              <Input
                id="nivelEfectivo"
                type="range"
                min="0"
                max="100"
                value={formData.nivelEfectivoActual}
                onChange={(e) => setFormData({ ...formData, nivelEfectivoActual: e.target.value })}
                className="w-full"
              />
              <Progress value={parseInt(formData.nivelEfectivoActual)} className="h-2" />
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSimulate} 
                disabled={!isFormValid || isSimulating}
                className="flex-1"
              >
                {isSimulating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Simulando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ejecutar Simulación
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados de la Simulación */}
        <div className="lg:col-span-2 space-y-6">
          {!simulationResult ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sin Resultados</h3>
                <p className="text-muted-foreground">
                  Complete el formulario y ejecute la simulación para ver los resultados
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* KPIs de Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-8 w-8 text-blue-600" />
                      <Badge variant="outline">
                        Confianza: {simulationResult.confianza}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Demanda Predicha</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${simulationResult.prediccion.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className={`h-8 w-8 ${getRiesgoColor(simulationResult.riesgo)}`} />
                      {getRiesgoBadge(simulationResult.riesgo)}
                    </div>
                    <p className="text-sm text-muted-foreground">Nivel de Riesgo</p>
                    <p className={`text-2xl font-bold ${getRiesgoColor(simulationResult.riesgo)}`}>
                      {simulationResult.riesgo}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Precisión del Modelo</p>
                    <p className="text-3xl font-bold text-green-600">
                      {simulationResult.confianza}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recomendación */}
              <Card>
                <CardHeader>
                  <CardTitle>Recomendación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Acción Sugerida</p>
                      <p className="text-blue-800">{simulationResult.recomendacion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Factores de Impacto */}
              <Card>
                <CardHeader>
                  <CardTitle>Factores de Impacto en la Predicción</CardTitle>
                  <CardDescription>
                    Contribución de cada variable en el resultado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {simulationResult.factoresImpacto.map((factor: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{factor.factor}</span>
                          <span className={`text-sm font-semibold ${factor.impacto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {factor.impacto >= 0 ? '+' : ''}{factor.impacto}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.abs(factor.impacto)} 
                          className={`h-2 ${factor.impacto >= 0 ? '[&>*]:bg-green-500' : '[&>*]:bg-red-500'}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gráficos de Análisis */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Comparación Histórica */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparación con Histórico Semanal</CardTitle>
                    <CardDescription>
                      Predicción vs datos históricos similares
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={simulationResult.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="historico" fill="#94a3b8" name="Histórico" />
                        <Bar dataKey="predicho" fill="#3b82f6" name="Predicción" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Distribución por Hora */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Demanda por Hora</CardTitle>
                    <CardDescription>
                      Patrón esperado durante el día
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={simulationResult.hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Area 
                          type="monotone" 
                          dataKey="demanda" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6}
                          name="Demanda"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
