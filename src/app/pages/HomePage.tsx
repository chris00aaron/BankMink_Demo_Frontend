import { useState, useEffect, useRef } from 'react';
import {
  Shield, Brain, ArrowRight, Sparkles, ChevronDown,
  TrendingDown, AlertTriangle, DollarSign, LogOut,
  ChevronLeft, ChevronRight, BarChart3, Cpu, Zap,
  Users, LineChart, Target
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { ServiceType } from '@shared/types/index';
import bankMindLogo from '@shared/assets/logo_BankMind.png';

interface HomePageProps {
  onNavigateToService: (service: ServiceType) => void;
  onLogout: () => void;
}

/* ─── Banner slide data ─── */
const bannerSlides = [
  {
    title: 'Inteligencia Artificial\nal Servicio de la Banca',
    subtitle: 'Plataforma integral de Machine Learning para la toma de decisiones financieras inteligentes, con modelos predictivos de última generación.',
    accent: 'from-blue-500 via-cyan-400 to-teal-400',
    bgGradient: 'from-slate-900 via-blue-950 to-slate-900',
    icon: Brain,
    particles: 'bg-blue-400',
  },
  {
    title: 'Predicción de Riesgos\nen Tiempo Real',
    subtitle: 'Detecta morosidad, fraudes y fugas de clientes antes de que impacten tu negocio. Modelos entrenados con datos reales del sector bancario.',
    accent: 'from-violet-500 via-purple-400 to-fuchsia-400',
    bgGradient: 'from-slate-900 via-purple-950 to-slate-900',
    icon: Target,
    particles: 'bg-purple-400',
  },
  {
    title: 'Optimización Financiera\nBasada en Datos',
    subtitle: 'Mejora la eficiencia operativa con simulaciones y estrategias automatizadas respaldadas por modelos de Machine Learning avanzados.',
    accent: 'from-emerald-500 via-green-400 to-teal-400',
    bgGradient: 'from-slate-900 via-emerald-950 to-slate-900',
    icon: LineChart,
    particles: 'bg-emerald-400',
  },
];

/* ─── 4 Model Definitions (static info only) ─── */
const models: Array<{
  id: ServiceType;
  title: string;
  description: string;
  techStack: string;
  icon: typeof Shield;
  gradient: string;
  shadowColor: string;
  features: string[];
}> = [
    {
      id: 'morosidad-detalle',
      title: 'Morosidad',
      description: 'Predicción del riesgo de incumplimiento de pagos mediante análisis de patrones crediticios y comportamiento financiero del cliente.',
      techStack: 'XGBoost · SHAP · Auto-reentrenamiento',
      icon: TrendingDown,
      gradient: 'from-rose-500 to-red-600',
      shadowColor: 'shadow-rose-500/20',
      features: ['Predicción Individual y Lote', 'Campañas de Cobranza', 'Simulación de Escenarios'],
    },
    {
      id: 'anomalias-transaccionales',
      title: 'Anomalías Transaccionales',
      description: 'Detección inteligente de transacciones fraudulentas o anómalas utilizando modelos supervisados y no supervisados en tiempo real.',
      techStack: 'XGBoost · Isolation Forest · Scoring',
      icon: Shield,
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
      features: ['Análisis en Tiempo Real', 'Scoring de Riesgo', 'Monitoreo de Modelo'],
    },
    {
      id: 'demanda-efectivo',
      title: 'Demanda de Efectivo',
      description: 'Pronóstico de la demanda de efectivo en cajeros automáticos y sucursales para optimizar la gestión de liquidez y reducir costos operativos.',
      techStack: 'Series Temporales · LSTM · Prophet',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      shadowColor: 'shadow-emerald-500/20',
      features: ['Predicción por Sucursal', 'Optimización de Rutas', 'Alertas de Reabastecimiento'],
    },
    {
      id: 'fuga-demanda',
      title: 'Fuga de Clientes',
      description: 'Detección temprana de clientes con riesgo de abandonar productos o servicios bancarios, permitiendo acciones de retención preventivas.',
      techStack: 'Random Forest · Gradient Boosting',
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
      features: ['Segmentación de Riesgo', 'Campañas de Retención', 'Análisis de Churn'],
    },
  ];

/* ─── Floating Particle Component ─── */
function FloatingParticles({ colorClass }: { colorClass: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${colorClass} opacity-20`}
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 8}s ease-in-out ${Math.random() * 5}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HomePage Component
   ═══════════════════════════════════════════════════ */
export function HomePage({ onNavigateToService, onLogout }: HomePageProps) {
  const { user, isAdmin } = useAuth();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  /* Auto-play banner */
  const startAutoPlay = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      goToSlide((prev: number) => (prev + 1) % bannerSlides.length);
    }, 6000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, []);

  const goToSlide = (indexOrFn: number | ((prev: number) => number)) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      const next = typeof indexOrFn === 'function' ? indexOrFn(prev) : indexOrFn;
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 700);
    startAutoPlay();
  };

  const nextSlide = () => goToSlide((prev: number) => (prev + 1) % bannerSlides.length);
  const prevSlide = () => goToSlide((prev: number) => (prev - 1 + bannerSlides.length) % bannerSlides.length);

  const slide = bannerSlides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ CSS Animations (injected inline) ═══ */}
      <style>{`
        @keyframes floatParticle {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -40px) scale(1.5); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbit {
          0%   { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        .banner-text-enter {
          animation: slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .card-hover-lift {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
        }
        .card-hover-lift:hover {
          transform: translateY(-8px);
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
      `}</style>

      {/* ═══ Navigation Bar ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={bankMindLogo} alt="BankMind" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  BankMind
                </h1>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  Inteligencia Financiera
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {/* Servicios dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50/60"
                >
                  Modelos IA
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showServicesDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showServicesDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowServicesDropdown(false)} />
                    <div className="absolute top-full mt-2 left-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-200/60 py-2 z-20 overflow-hidden">
                      {models.map((model) => {
                        const Icon = model.icon;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setShowServicesDropdown(false);
                              onNavigateToService(model.id);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all text-left group"
                          >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-800 block">{model.title}</span>
                              <span className="text-xs text-gray-400">{model.techStack.split(' · ')[0]}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Admin links */}
              {isAdmin() && (
                <>
                  <button
                    onClick={() => onNavigateToService('auditoria')}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50/60"
                  >
                    Auditoría
                  </button>
                  <button
                    onClick={() => onNavigateToService('gestion-usuarios')}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50/60"
                  >
                    Usuarios
                  </button>
                </>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-1">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {isAdmin() ? 'Administrador' : 'Operario'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Banner ═══ */}
      <section className="pt-16">
        <div className={`relative overflow-hidden bg-gradient-to-br ${slide.bgGradient} gradient-animate transition-all duration-700`} style={{ minHeight: '480px' }}>
          {/* Particles */}
          <FloatingParticles colorClass={slide.particles} />

          {/* Decorative orbiting elements */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div className="relative w-[300px] h-[300px] opacity-10">
              <div className="absolute inset-0" style={{ animation: 'orbit 20s linear infinite' }}>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${slide.accent}`} />
              </div>
              <div className="absolute inset-0" style={{ animation: 'orbit 25s linear infinite reverse' }}>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${slide.accent}`} />
              </div>
            </div>
          </div>

          {/* Large background glow */}
          <div
            className={`absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br ${slide.accent} opacity-10 blur-3xl`}
            style={{ animation: 'pulseGlow 6s ease-in-out infinite' }}
            aria-hidden
          />
          <div
            className={`absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${slide.accent} opacity-5 blur-3xl`}
            aria-hidden
          />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex items-center" style={{ minHeight: '480px' }}>
            <div className="flex-1 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8 banner-text-enter" key={`badge-${currentSlide}`}>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">Plataforma IA Empresarial</span>
              </div>

              {/* Title */}
              <h2
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white leading-[1.15] mb-6 banner-text-enter whitespace-pre-line"
                key={`title-${currentSlide}`}
                style={{ animationDelay: '0.1s' }}
              >
                {slide.title}
              </h2>

              {/* Subtitle */}
              <p
                className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl banner-text-enter"
                key={`sub-${currentSlide}`}
                style={{ animationDelay: '0.2s' }}
              >
                {slide.subtitle}
              </p>

              {/* CTA */}
              <div
                className="flex items-center gap-4 banner-text-enter"
                key={`cta-${currentSlide}`}
                style={{ animationDelay: '0.3s' }}
              >
                <button
                  onClick={() => {
                    const el = document.getElementById('models-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-7 py-3.5 bg-gradient-to-r ${slide.accent} text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group text-sm`}
                >
                  Explorar Modelos
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right decorative icon */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="relative">
                <div className={`w-48 h-48 rounded-3xl bg-gradient-to-br ${slide.accent} opacity-15 blur-2xl absolute inset-0`} style={{ animation: 'pulseGlow 4s ease-in-out infinite' }} />
                <div className="relative w-40 h-40 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <SlideIcon className="w-20 h-20 text-white/30" strokeWidth={1} />
                </div>
                {/* Floating mini-cards */}
                <div className="absolute -top-8 -right-8 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center" style={{ animation: 'floatParticle 6s ease-in-out infinite alternate' }}>
                  <BarChart3 className="w-7 h-7 text-white/40" />
                </div>
                <div className="absolute -bottom-6 -left-10 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center" style={{ animation: 'floatParticle 8s ease-in-out 2s infinite alternate' }}>
                  <Cpu className="w-6 h-6 text-white/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Banner controls */}
          <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-4">
            <button onClick={prevSlide} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {bannerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide
                    ? `w-8 bg-gradient-to-r ${slide.accent}`
                    : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                />
              ))}
            </div>

            <button onClick={nextSlide} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="relative -mt-8 z-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '4', label: 'Modelos IA', icon: Brain, color: 'text-blue-600' },
              { value: 'ML/DL', label: 'Tecnología', icon: Cpu, color: 'text-purple-600' },
              { value: '24/7', label: 'Monitoreo', icon: Zap, color: 'text-emerald-600' },
              { value: 'Auto', label: 'Reentrenamiento', icon: BarChart3, color: 'text-amber-600' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Models Section ═══ */}
      <section id="models-section" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Modelos Disponibles</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Suite de Modelos Predictivos
            </h3>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Cuatro modelos de Machine Learning especializados en el análisis de riesgo financiero, cada uno diseñado para resolver problemas específicos del sector bancario.
            </p>
          </div>

          {/* Model cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model) => {
              const Icon = model.icon;
              const isHovered = hoveredCard === model.id;
              return (
                <div
                  key={model.id}
                  className={`group relative rounded-2xl p-7 bg-white border border-gray-200/70 cursor-pointer card-hover-lift ${model.shadowColor} ${isHovered ? 'shadow-2xl' : 'shadow-lg shadow-gray-100'}`}
                  onClick={() => onNavigateToService(model.id)}
                  onMouseEnter={() => setHoveredCard(model.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Gradient stripe on top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${model.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${model.gradient} flex items-center justify-center shadow-lg ${model.shadowColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-bold text-gray-900 mb-1.5 group-hover:text-gray-800">
                        {model.title}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        {model.description}
                      </p>

                      {/* Tech badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100">
                          <Cpu className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] font-semibold text-gray-500 tracking-wide">{model.techStack}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {model.features.map((f, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="absolute bottom-7 right-7 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-white border-t border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={bankMindLogo} alt="BankMind" className="w-8 h-8 object-contain opacity-60" />
            <div>
              <p className="text-sm font-semibold text-gray-400">BankMind</p>
              <p className="text-xs text-gray-300">Inteligencia Artificial Empresarial</p>
            </div>
          </div>
          <p className="text-xs text-gray-300">
            © 2026 BankMind · Plataforma de IA para el Sector Financiero
          </p>
        </div>
      </footer>
    </div>
  );
}