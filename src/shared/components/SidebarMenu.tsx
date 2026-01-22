import { Home, X} from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';

// Definimos la interfaz de cada item del menú
export interface ISidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ISidebarMenu {
  items: ISidebarItem[];         // Los items ahora son dinámicos
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBackToHome?: () => void;
  isOpen: boolean;               // Controla visibilidad en móvil
  setIsOpen: (open: boolean) => void; 
}

export function SidebarMenu({ 
  items, 
  currentScreen, 
  onNavigate, 
  onBackToHome, 
  isOpen, 
  setIsOpen,
}: ISidebarMenu) {

  return (
    <>
      {/* OVERLAY: Fondo oscuro cuando el menú está abierto en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 
        flex flex-col shadow-lg z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        
        {/* Header con Botón de Cerrar (Solo Móvil) */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={bankMindLogo} alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">BankMind</h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Fraud Detection</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {onBackToHome && (
            <button
              onClick={() => { onBackToHome(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all mb-4 group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Página Principal</span>
            </button>
          )}

          <div className="text-[10px] font-bold text-gray-400 uppercase px-4 mb-2 tracking-widest">
            Menú del Módulo
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer (Versión) */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-medium text-gray-400">STATUS: ACTIVE</span>
            <span className="text-[10px] font-bold text-blue-500">V2.1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}