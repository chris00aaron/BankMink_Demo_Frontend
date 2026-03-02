import React from 'react';
import {
    LayoutDashboard,
    BarChart2,
    FlaskConical,
    BrainCircuit,
    ArrowLeft,
    Shield,
    Megaphone,
    LogOut
} from 'lucide-react';

type FugaScreen = 'dashboard' | 'geografia' | 'simulador' | 'mlops' | 'cliente' | 'campañas';

interface FugaSidebarProps {
    currentScreen: FugaScreen;
    onNavigate: (screen: FugaScreen) => void;
    onBackToHome?: () => void;
    onLogout?: () => void;
}

const FugaSidebar: React.FC<FugaSidebarProps> = ({
    currentScreen,
    onNavigate,
    onBackToHome,
    onLogout
}) => {
    const menuItems = [
        { id: 'dashboard' as FugaScreen, label: 'Centro de Mando', icon: LayoutDashboard },
        { id: 'geografia' as FugaScreen, label: 'Inteligencia de Riesgo', icon: BarChart2 },
        { id: 'simulador' as FugaScreen, label: 'Simulador', icon: FlaskConical },
        { id: 'campañas' as FugaScreen, label: 'Campañas', icon: Megaphone },
        { id: 'mlops' as FugaScreen, label: 'MLOps', icon: BrainCircuit },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F172A] text-white flex flex-col z-50">
            {/* Logo Header */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">
                            <span className="text-emerald-400">Bank</span>Mind
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Predicción de Fuga</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-6 px-3">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentScreen === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onNavigate(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'
                                        }`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer - Back Button */}
            {onBackToHome && (
                <div className="p-4 border-t border-slate-700/50 space-y-2">
                    <button
                        onClick={onBackToHome}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Volver al Inicio</span>
                    </button>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Cerrar Sesión</span>
                        </button>
                    )}
                </div>
            )}

            {/* Status Badge */}
            <div className="p-4">
                <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div className="text-xs">
                        <p className="text-slate-300 font-medium">Sistema Activo</p>
                        <p className="text-slate-500">Modelo v2.3.1</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FugaSidebar;
export type { FugaScreen };
