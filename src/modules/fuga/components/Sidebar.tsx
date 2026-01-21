import { BarChart3, MapPin, Sliders, LogOut, Home } from 'lucide-react';

interface SidebarProps {
    currentView: 'dashboard' | 'geography' | 'simulator';
    onNavigate: (view: 'dashboard' | 'geography' | 'simulator') => void;
    onLogout: () => void;
    userRole: string;
}

export function Sidebar({ currentView, onNavigate, onLogout, userRole }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard' as const, label: 'Centro de Mando', icon: BarChart3 },
        { id: 'geography' as const, label: 'Geografía & Segmentos', icon: MapPin },
        { id: 'simulator' as const, label: 'Simulador What-If', icon: Sliders },
    ];

    return (
        <div className="w-64 h-screen flex flex-col border-r border-gray-200" style={{ backgroundColor: '#0F172A' }}>
            {/* Logo / Header */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white mb-1">Fuga de Clientes</h1>
                <p className="text-xs text-gray-400">XRAI Framework</p>
            </div>

            {/* Usuario */}
            <div className="px-6 py-4 border-b border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Usuario</p>
                <p className="text-sm font-semibold text-white">{userRole}</p>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-white text-gray-900 shadow-lg'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-700 space-y-2">
                {userRole === 'admin' && (
                    <button
                        onClick={() => window.history.back()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-sm font-medium">Volver al Inicio</span>
                    </button>
                )}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
