import React from 'react';
import {
    LayoutDashboard,
    BarChart2,
    FlaskConical,
    BrainCircuit,
    ArrowLeft,
    Megaphone,
    LogOut,
    Zap
} from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';

type FugaScreen = 'dashboard' | 'geografia' | 'simulador' | 'mlops' | 'cliente' | 'campañas' | 'executive';

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
        { id: 'executive' as FugaScreen, label: 'Visión Ejecutiva', icon: Zap },
        { id: 'simulador' as FugaScreen, label: 'Simulador', icon: FlaskConical },
        { id: 'campañas' as FugaScreen, label: 'Campañas', icon: Megaphone },
        { id: 'mlops' as FugaScreen, label: 'MLOps', icon: BrainCircuit },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 text-gray-900 flex flex-col z-50 shadow-lg">
            {/* Logo Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                        <img src={bankMindLogo} alt="BankMind" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">BankMind</h1>
                        <p className="text-xs text-gray-500">Predicción de Fuga</p>
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
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'
                                        }`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer - Back Button */}
            {onBackToHome && (
                <div className="p-4 border-t border-gray-200 space-y-2">
                    <button
                        onClick={onBackToHome}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200 hover:border-blue-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Volver al Inicio</span>
                    </button>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Cerrar Sesión</span>
                        </button>
                    )}
                </div>
            )}

            {/* Status Badge */}
            <div className="p-4">
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="text-xs">
                        <p className="text-gray-700 font-medium">Sistema Activo</p>
                        <p className="text-gray-400">Modelo v2.3.1</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FugaSidebar;
export type { FugaScreen };
