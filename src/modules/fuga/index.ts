// Módulo de Fuga (Churn Prediction)

// Types
export * from './types';
export type { FugaScreen } from './components/FugaSidebar';

// Services  
export { ChurnService } from './churn.service';

// Components
export { default as FugaSidebar } from './components/FugaSidebar';

// Pages
export { default as SimulatorPage } from './pages/SimulatorPage';
export { default as DashboardPage } from './pages/DashboardPage';
export { default as MLOpsPage } from './pages/MLOpsPage';
export { default as GeographyPage } from './pages/GeographyPage';
export { default as RiskIntelligencePage } from './pages/RiskIntelligencePage';
export { default as CustomerDetailPage } from './pages/CustomerDetailPage';
export { default as CampaignsPage } from './pages/CampaignsPage';
export { default as ExecutiveInsightsPage } from './pages/ExecutiveInsightsPage';

