import { Shield, Activity, Brain, ArrowRight, LogOut, Lock } from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { ServiceType } from '@shared/types/index';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import '@shared/styles/HomePage.css';

interface HomePageProps {
  onNavigateToService: (service: ServiceType) => void;
  onLogout: () => void;
}

export function HomePage({ onNavigateToService, onLogout }: HomePageProps) {
  const { user, isAdmin } = useAuth();

  return (
    <div className="hp-root">

      {/* ── Navbar ── */}
      <nav className="hp-nav">
        <div className="hp-nav__inner">

          {/* Logo */}
          <div className="hp-nav__logo">
            <div className="hp-nav__logo-img-wrap">
              <img src={bankMindLogo} alt="BankMind" />
            </div>
            <div className="hp-nav__logo-text">
              <span className="hp-nav__logo-name">BankMind</span>
              <span className="hp-nav__logo-tag">Inteligencia Financiera</span>
            </div>
          </div>

          {/* Admin links */}
          <div className="hp-nav__links">
            {isAdmin() && (
              <>
                <button
                  onClick={() => onNavigateToService('auditoria')}
                  className="hp-nav__link"
                >
                  Auditoría
                </button>
                <button
                  onClick={() => onNavigateToService('gestion-usuarios')}
                  className="hp-nav__link"
                >
                  Gestión de Usuarios
                </button>
              </>
            )}
          </div>

          {/* User section */}
          <div className="hp-nav__user">
            <div className="hp-nav__user-info">
              <span className="hp-nav__user-name">{user?.name}</span>
              <span className="hp-nav__user-role">
                {isAdmin() ? 'Administrador' : 'Operario'}
              </span>
            </div>
            <div className="hp-nav__avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={onLogout}
              className="hp-nav__logout"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
              <span className="hp-nav__logout-label">Cerrar sesión</span>
            </button>
          </div>

        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero__bg-glow" />
        <div className="hp-hero__bg-grid" />

        <div className="hp-hero__inner">
          <div className="hp-hero__badge">
            <span className="hp-hero__badge-dot" />
            Plataforma Analítica Impulsada por IA
          </div>

          <h1 className="hp-hero__title">
            Predicción de Demanda<br />
            de Efectivo en{' '}
            <span className="hp-hero__title-accent">ATMs</span>
          </h1>

          <p className="hp-hero__subtitle">
            Optimiza la liquidez de tu red de cajeros automáticos con modelos de
            machine learning entrenados sobre datos transaccionales reales.
            Reduce el desabastecimiento y mejora la eficiencia operativa.
          </p>

          <div className="hp-hero__cta-wrap">
            <button
              onClick={() => onNavigateToService('demanda-efectivo')}
              className="hp-btn-primary"
            >
              Acceder al Módulo
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features / Pillars ── */}
      <section className="hp-features">
        <div className="hp-features__inner">
          <div className="hp-section-header">
            <span className="hp-section-header__eyebrow">Fundamentos de la Plataforma</span>
            <h2 className="hp-section-header__title">Construido para entornos bancarios exigentes</h2>
          </div>

          <div className="hp-features__grid">
            <div className="hp-feature-card">
              <div className="hp-feature-card__icon hp-feature-card__icon--blue">
                <Shield size={22} />
              </div>
              <div className="hp-feature-card__title">Seguridad Bancaria</div>
              <div className="hp-feature-card__desc">
                Acceso con autenticación multifactor, control de roles y trazabilidad
                de auditoría en cada operación.
              </div>
            </div>

            <div className="hp-feature-card">
              <div className="hp-feature-card__icon hp-feature-card__icon--gold">
                <Brain size={22} />
              </div>
              <div className="hp-feature-card__title">Modelos Adaptativos</div>
              <div className="hp-feature-card__desc">
                Entrenamiento continuo sobre datos transaccionales reales. El modelo
                se actualiza y valida automáticamente en producción.
              </div>
            </div>

            <div className="hp-feature-card">
              <div className="hp-feature-card__icon hp-feature-card__icon--green">
                <Activity size={22} />
              </div>
              <div className="hp-feature-card__title">Monitoreo en Tiempo Real</div>
              <div className="hp-feature-card__desc">
                Supervisión continua del rendimiento predictivo con alertas automáticas
                ante desviaciones estadísticas relevantes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-footer__inner">
          <div className="hp-footer__brand">
            <img src={bankMindLogo} alt="BankMind" className="hp-footer__brand-img" />
            <span className="hp-footer__brand-name">BankMind</span>
          </div>
          <div className="hp-footer__right">
            <span className="hp-footer__copy">© 2026 BankMind. Todos los derechos reservados.</span>
            <span className="hp-footer__classification">
              <Lock size={9} />
              Uso Interno — Restringido
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}