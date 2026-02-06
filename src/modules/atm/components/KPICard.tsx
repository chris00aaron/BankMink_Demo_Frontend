import { LucideIcon } from "lucide-react";
import styles from "../styles/Simulator.module.css";

type ColorKPI = "blue" | "green" | "orange";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: ColorKPI;
  className?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  className = "" 
}: KPICardProps) => {

  const colorClasses = {
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      icon: 'bg-orange-100 text-orange-600',
      border: 'border-orange-100',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      icon: 'bg-blue-100 text-blue-600',
      border: 'border-blue-100',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      icon: 'bg-emerald-100 text-emerald-600',
      border: 'border-emerald-100',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`group ${classes.bg} p-5 rounded-xl border ${classes.border} shadow-sm ${styles.hoverLift || ''} ${className}`}>
      <div className="flex items-center gap-4">
        {/* El Icon ahora se renderiza de forma segura */}
        <div className={`p-3 ${classes.icon} rounded-xl transition-transform duration-300 ${styles.hoverScale || ''}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
};