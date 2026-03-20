import { useState } from 'react';
import { Shield, Activity, Brain, ArrowRight, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { ServiceType } from '@shared/types/index';
import bankMindLogo from '@shared/assets/logo_BankMind.png';

interface HomePageProps {
  onNavigateToService: (service: ServiceType) => void;
  onLogout: () => void;
}

export function HomePage({ onNavigateToService, onLogout }: HomePageProps) {
  const { user, isAdmin } = useAuth();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  const services: Array<{
    id: ServiceType;
    title: string;
    description: string;
    icon: typeof Shield;
    color: string;
  }> = [
      {
        id: 'anomalias-transaccionales',
        title: 'Anomalías Transaccionales',
        description: 'Sistema avanzado de ML con XGBoost e Isolation Forest para identificar transacciones fraudulentas en tiempo real',
        icon: Shield,
        color: 'blue'
      },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img src={bankMindLogo} alt="BankMind" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  BankMind
                </h1>
                <p className="text-xs text-gray-500">DETECCIÓN DE FRAUDE EN TIEMPO REAL</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-8">
              {/* Servicios Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Servicios
                  <ChevronDown className={`w-4 h-4 transition-transform ${showServicesDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showServicesDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowServicesDropdown(false)}
                    ></div>
                    <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                      {services.map((service) => {
                        const Icon = service.icon;
                        return (
                          <button
                            key={service.id}
                            onClick={() => {
                              setShowServicesDropdown(false);
                              onNavigateToService(service.id);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${service.color}-500 to-${service.color}-700 flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{service.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Admin-only menu items */}
              {isAdmin() && (
                <>
                  <button
                    onClick={() => onNavigateToService('auditoria')}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Auditoría
                  </button>
                  <button
                    onClick={() => onNavigateToService('gestion-usuarios')}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Gestión de Usuarios
                  </button>
                </>
              )}

              <button className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Soporte
              </button>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {isAdmin() ? 'Administrador' : 'Operario'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 border border-blue-200/50 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Detección de Fraude con IA</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
              Protección Inteligente<br />contra el Fraude Bancario
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Detecta transacciones fraudulentas en tiempo real con nuestro sistema de IA avanzado,
              combinando XGBoost e Isolation Forest para una protección bancaria de última generación.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onNavigateToService('anomalias-transaccionales')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center gap-2 group"
              >
                Acceder al Módulo de Fraude
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                Ver Demo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                99.8%
              </div>
              <div className="text-sm text-gray-600">Precisión de Detección</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                &lt;100ms
              </div>
              <div className="text-sm text-gray-600">Tiempo de Respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600">Monitoreo Activo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
                2
              </div>
              <div className="text-sm text-gray-600">Modelos IA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Card */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Módulo de Detección de Fraude
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accede a las herramientas de inteligencia artificial diseñadas para proteger
              las operaciones bancarias contra transacciones fraudulentas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="group relative rounded-2xl p-8 backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => onNavigateToService(service.id)}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h4>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <button
                    className="flex items-center gap-2 font-semibold text-sm text-blue-600 group-hover:gap-3 transition-all"
                  >
                    Acceder Ahora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Seguridad de Nivel Bancario</h4>
              <p className="text-gray-600">
                Protección de datos con encriptación de grado militar y cumplimiento total de normativas internacionales
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">IA de Última Generación</h4>
              <p className="text-gray-600">
                Modelos XGBoost e Isolation Forest entrenados con millones de transacciones para máxima precisión
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Tiempo Real 24/7</h4>
              <p className="text-gray-600">
                Procesamiento y análisis instantáneo con monitoreo continuo y alertas automáticas de fraude
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p className="mb-2">© 2026 BankMind. Todos los derechos reservados.</p>
          <p>Módulo de Detección de Anomalías Transaccionales</p>
        </div>
      </footer>
    </div>
  );
}