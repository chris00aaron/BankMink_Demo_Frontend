import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui-atm/card";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export function KPICard({ title, value, change, icon: Icon, trend }: KPICardProps) {
  const isPositive = change > 0;
  const trendColor = trend === "up" 
    ? (isPositive ? "text-green-600" : "text-red-600")
    : (isPositive ? "text-red-600" : "text-green-600");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="mt-2">{value}</h3>
            <p className={`text-sm mt-1 ${trendColor}`}>
              {isPositive ? "+" : ""}{change.toFixed(1)}% vs ayer
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
