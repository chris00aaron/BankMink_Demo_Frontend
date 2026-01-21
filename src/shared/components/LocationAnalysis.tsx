import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip} from "recharts";

interface LocationData {
  tipo: string;
  demanda: number;
  cajeros: number;
}

interface LocationAnalysisProps {
  data: LocationData[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function LocationAnalysis({ data }: LocationAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis por Tipo de Ubicación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="demanda"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p>{item.tipo}</p>
                    <p className="text-sm text-muted-foreground">{item.cajeros} cajeros</p>
                  </div>
                </div>
                <div className="text-right">
                  <p>${item.demanda.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">demanda diaria</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
