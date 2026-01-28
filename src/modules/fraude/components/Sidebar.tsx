import { LayoutDashboard, FileUp, FileSearch, Activity, Home, LogOut } from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';

interface XRAISidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBackToHome?: () => void;
  onLogout: () => void;
}

export function Sidebar({ currentScreen, onNavigate, onBackToHome, onLogout }: XRAISidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batch', label: 'Predicción por Lotes', icon: FileUp },
    { id: 'individual', label: 'Predicción Individual', icon: FileSearch },
    { id: 'risk-analysis', label: 'Análisis de Riesgo', icon: Activity },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src={bankMindLogo} alt="BankMind" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BankMind</h1>
            <p className="text-xs text-gray-500">Fraud Detection System</p>
          </div>
        </div>
      </div>

      {/* Back to Home Button - Solo para Admin */}
      {onBackToHome && (
        <div className="px-4 pt-4">
          <button
            onClick={onBackToHome}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Página Principal</span>
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Section with Logout */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>

        {/* System Status */}
        <div className="px-4 py-3 rounded-lg bg-gray-50 backdrop-blur-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Sistema Activo</p>
              <p className="text-sm font-medium text-blue-600">v2.1.0</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}