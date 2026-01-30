import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "red" | "slate" | "orange";
  className?: string;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = "slate",
  className,
}: KPICardProps) {
  const colorStyles = {
    blue: { text: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    green: { text: "text-green-600", bg: "bg-green-50 border-green-100" },
    red: { text: "text-red-600", bg: "bg-red-50 border-red-100" },
    orange: { text: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
    slate: { text: "text-slate-600", bg: "bg-slate-50 border-slate-100" },
  };

  return (
    <div
      className={clsx(
        "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3
            className={clsx(
              "text-2xl font-bold mt-1",
              colorStyles[color].text,
            )}
          >
            {value}</h3>
        </div>
        {Icon && (
          <div className={clsx("p-2 rounded-lg", colorStyles[color].bg, colorStyles[color].text)}>
            <Icon size={25} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium">
          <span
            className={clsx(
              trendUp ? "text-green-600" : "text-red-600",
              "mr-1",
            )}
          >
            {trend}
          </span>
          <span className="text-slate-400">vs ayer</span>
        </div>
      )}
    </div>
  );
}
