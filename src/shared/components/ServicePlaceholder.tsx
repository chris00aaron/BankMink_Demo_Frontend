import { LucideIcon, Construction, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@shared/contexts/AuthContext';

interface ServicePlaceholderProps {
  serviceName: string;
  icon: LucideIcon;
  description: string;
  onBack: () => void;
}

export function ServicePlaceholder({ serviceName, icon: Icon, description, onBack }: ServicePlaceholderProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-gray-200 shadow-2xl p-12 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg shadow-blue-500/20">
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Service Name */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{serviceName}</h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Construction Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Construction className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Módulo en Desarrollo</h3>
            </div>
            <p className="text-sm text-blue-700">
              Este módulo está actualmente en desarrollo. Pronto estará disponible con todas sus funcionalidades.
            </p>
          </div>

          {/* Back Button - Solo para admins */}
          {isAdmin() && (
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}