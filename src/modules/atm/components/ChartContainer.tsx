import styles from "../styles/Simulator.module.css";

interface ChartContainerProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

export function ChartContainer ({ title, subtitle, children, className = "" }: ChartContainerProps) {
  return ( <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden ${styles.hoverLift} ${className}`}>
    {/* Header */}
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {/* Chart Area - Increased padding and height for better legend visibility */}
    <div className="p-5 lg:p-6">
      <div className="h-[340px] lg:h-[400px] w-full">
        {children}
      </div>
    </div>
  </div>
)};