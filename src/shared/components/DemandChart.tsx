import { Card, CardContent, CardHeader, CardTitle } from "./ui-atm/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DemandChartProps {
  data: Array<{
    hour: string;
    retiros: number;
    depositos: number;
    prediccion: number;
  }>;
}

export function DemandChart({ data }: DemandChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demanda por Hora del Día</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="hour" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => `$${Number(value).toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="retiros" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Retiros"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="depositos" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Depósitos"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="prediccion" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicción"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
