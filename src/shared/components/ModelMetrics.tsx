import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui-atm/card";
import { Badge } from "./ui-atm/badge";
import { TrendingUp, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ModelMetricsProps {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export function ModelMetrics({ accuracy, precision, recall, f1Score }: ModelMetricsProps) {
  const metrics = [
    {
      name: "Exactitud (Accuracy)",
      value: accuracy,
      description: "Predicciones correctas del total",
      icon: CheckCircle2,
      color: "blue"
    },
    {
      name: "Precisión (Precision)",
      value: precision,
      description: "Predicciones positivas correctas",
      icon: TrendingUp,
      color: "green"
    },
    {
      name: "Sensibilidad (Recall)",
      value: recall,
      description: "Casos positivos detectados",
      icon: AlertCircle,
      color: "purple"
    },
    {
      name: "Puntuación F1",
      value: f1Score,
      description: "Media armónica de precisión y recall",
      icon: XCircle,
      color: "orange"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 75) return "Bueno";
    if (score >= 60) return "Regular";
    return "Necesita mejora";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Rendimiento del Modelo</CardTitle>
        <CardDescription>
          Indicadores clave de precisión del algoritmo de Machine Learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
                  <span className="font-semibold">{metric.name}</span>
                </div>
                <Badge variant="outline">{getScoreBadge(metric.value)}</Badge>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(metric.value)} mb-2`}>
                {metric.value}%
              </div>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
