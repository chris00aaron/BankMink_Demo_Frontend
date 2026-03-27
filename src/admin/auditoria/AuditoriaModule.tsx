import { useState } from 'react';
import { FileText, ArrowLeft, LogIn, UserPlus, Edit3 } from 'lucide-react';
import { Button } from '@shared/components/ui-atm/button';
import { AuditoriaLoginTab } from './components/AuditoriaLoginTab';
import { AuditoriaCreationTab } from './components/AuditoriaCreationTab';
import { AuditoriaUpdateTab } from './components/AuditoriaUpdateTab';

interface AuditoriaModuleProps {
  onBack: () => void;
}

type TabType = 'login' | 'creation' | 'update';

export function AuditoriaModule({ onBack }: AuditoriaModuleProps) {
  const [activeTab, setActiveTab] = useState<TabType>('login');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
                  <p className="text-sm text-gray-600">Registro de actividades y accesos con enmascaramiento de datos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'login'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <LogIn className="w-4 h-4" />
              Logins y Accesos
            </button>
            <button
              onClick={() => setActiveTab('creation')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'creation'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              Creación de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('update')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'update'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Edit3 className="w-4 h-4" />
              Actualización de Datos
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {activeTab === 'login' && <AuditoriaLoginTab />}
        {activeTab === 'creation' && <AuditoriaCreationTab />}
        {activeTab === 'update' && <AuditoriaUpdateTab />}
      </main>
    </div>
  );
}
