import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export function HistoricalAccuracy() {
  const historicalData = [
    { mes: "Jul", precision: 78, errorMedio: 12.5 },
    { mes: "Ago", precision: 81, errorMedio: 11.2 },
    { mes: "Sep", precision: 83, errorMedio: 10.8 },
    { mes: "Oct", precision: 85, errorMedio: 9.5 },
    { mes: "Nov", precision: 86, errorMedio: 8.9 },
    { mes: "Dic", precision: 87, errorMedio: 8.2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolución de Precisión del Modelo
        </CardTitle>
        <CardDescription>
          Mejora continua en los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" domain={[70, 100]} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 15]} />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="precision" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Precisión (%)"
              dot={{ fill: '#10b981', r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="errorMedio" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Error Medio (%)"
              dot={{ fill: '#ef4444', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Tendencia positiva:</strong> La precisión del modelo ha mejorado un 11.5% en los últimos 6 meses gracias al reentrenamiento continuo con datos actualizados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
