import { Menu } from 'lucide-react';

interface IModuleLayout {
  children: React.ReactNode; // El contenido de la página (Dashboard, etc.)
  sidebar: React.ReactNode;  // El Sidebar específico del módulo
  title: string;
  chanceStateMenuOpen: (open: boolean) => void; // Que hace al cambiar el estado del menu
}

export function ModuleLayout({ children, sidebar, title, chanceStateMenuOpen }: IModuleLayout) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Renderizamos el Sidebar pasándole el estado móvil */}
      {/* Usamos cloneElement si necesitamos inyectar props, pero lo más limpio es pasarlo como componente ya configurado */}
      <div className="z-50">
        {sidebar}
      </div>

      {/* 2. Área de Contenido */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        
        {/* Header Estándar (UX Bancaria: siempre saber dónde estás) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Botón hamburguesa: visible solo en móvil */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              onClick={() => chanceStateMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
          </div>

          {/* Aquí podrías poner el componente de Perfil de Usuario o Notificaciones */}
        </header>

        {/* 3. Main Content: Donde se cargan tus pantallas */}
        <main className="p-4 md:p-4 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}