import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sublabel: string;
  delay: number;
}

export const MetricCard = ({ icon: Icon, iconBg, iconColor, label, value, sublabel, delay }: MetricCardProps) => (
  <div 
    className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3.5 ${iconBg} ${iconColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{value}</h3>
        <p className="text-xs text-slate-400 mt-1 truncate">{sublabel}</p>
      </div>
    </div>
  </div>
);