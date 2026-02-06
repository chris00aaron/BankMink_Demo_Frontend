
import {
  Calendar,
  CloudSun,
  Search,
  BarChart3,
  Sparkles,
  ArrowRight,
  Activity,
} from "lucide-react";

import styles from "../styles/EmptyStateSimulator.module.css";

interface EmptyStateSimulatorProps {
  onSimulate: () => void;
  isDisabled: boolean;
}

export const EmptyStateSimulator = ({ onSimulate, isDisabled }: EmptyStateSimulatorProps) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/50 rounded-2xl border border-slate-200/60 p-8 lg:p-12">
    {/* Background Pattern */}
    <div className={`absolute inset-0 opacity-[0.03] ${styles.bgDotsPattern}`} />
    
    {/* Floating Elements */}
    <div className="absolute top-8 right-8 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl" />
    <div className="absolute bottom-8 left-8 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
    
    <div className="relative flex flex-col items-center text-center max-w-lg mx-auto">
      {/* Icon Container */}
      <div className="relative mb-6">
        <div className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform rotate-3 ${styles.emptyStateIcon}`}>
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">
        Inicia tu Primera Simulación
      </h3>
      <p className="text-slate-500 mb-8 leading-relaxed">
        Configura los parámetros de fecha, clima y nivel de carga para obtener 
        predicciones precisas de demanda de efectivo en tu red de ATMs.
      </p>
      
      {/* Steps */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-slate-600">
          <Calendar size={14} className="text-blue-500" />
          <span>Selecciona fecha</span>
        </div>
        <ArrowRight size={14} className="text-slate-300 hidden sm:block" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-slate-600">
          <CloudSun size={14} className="text-amber-500" />
          <span>Elige clima</span>
        </div>
        <ArrowRight size={14} className="text-slate-300 hidden sm:block" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-slate-600">
          <Activity size={14} className="text-emerald-500" />
          <span>Ejecuta</span>
        </div>
      </div>
      
      {/* CTA Button */}
      <button
        onClick={onSimulate}
        disabled={isDisabled}
        className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] disabled:shadow-none disabled:scale-100"
      >
        <Search size={18} />
        Ejecutar Simulación
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);