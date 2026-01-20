import React from 'react';
import { Shield, LayoutDashboard, Zap, Bell, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function Sidebar({ currentScreen, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulation', label: 'Simulación de Transacciones', icon: Zap },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50">
      {/* Logo y Título */}
      <div className="p-6 border-b border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">FraudGuard AI</h1>
            <p className="text-xs text-blue-300">Detección en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-blue-900 shadow-lg transform scale-105'
                  : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="p-4 border-t border-blue-800/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-red-600/90 rounded-lg transition-all hover:translate-x-1"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}