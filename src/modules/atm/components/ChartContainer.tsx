import styles from "../styles/Simulator.module.css";

interface ChartContainerProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

export function ChartContainer ({ title, subtitle, children, className = "" }: ChartContainerProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${styles.hoverLift} ${className}`}>
      {/* Header with subtle left accent */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {/* Chart Area */}
      <div className="p-4 lg:p-5">
        <div className="h-[320px] lg:h-[380px] w-full">
          {children}
        </div>
      </div>
    </div>
  );
}