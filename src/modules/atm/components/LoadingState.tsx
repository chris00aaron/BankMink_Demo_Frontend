// Loading State Component

import styles from "../styles/Simulator.module.css";

export const SkeletonPulse = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <div className={`${styles.skeletonPulse} ${className}`} style={style} />
);

export const LoadingState = () => (
  <div className={`space-y-6 ${styles.fadeIn}`}>
    {/* KPI Skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <SkeletonPulse className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-7 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Chart Skeletons */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <SkeletonPulse className="h-5 w-48 mb-6" />
          <div className="h-96 flex items-end justify-around gap-3 px-4">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="flex-1 flex flex-col items-center gap-2">
                <SkeletonPulse 
                  className="w-full rounded-t" 
                  style={{ height: '200px' }} 
                />
                <SkeletonPulse className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    {/* Recommendation Skeleton */}
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <SkeletonPulse className="h-5 w-56 mb-4" />
      <SkeletonPulse className="h-4 w-full mb-2" />
      <SkeletonPulse className="h-4 w-3/4" />
    </div>
    
    {/* Centered Loading Indicator */}
    <div className={`fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center z-50 ${styles.loadingOverlay}`}>
      <div className={`bg-white rounded-2xl p-8 shadow-2xl border border-slate-200 flex flex-col items-center gap-4 ${styles.loadingModal}`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
          <div className={`absolute inset-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent ${styles.spinner}`} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-900">Calculando predicciones</p>
          <p className="text-sm text-slate-500 mt-1">Analizando patrones de demanda...</p>
        </div>
      </div>
    </div>
  </div>
);