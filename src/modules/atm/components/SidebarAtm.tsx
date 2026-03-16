import { LayoutDashboard, Calculator, Scale, Monitor } from 'lucide-react';
import { SidebarMenu } from '@shared/components/SidebarMenu';

interface ISidebarAtmProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBackToHome?: () => void;
  onLogout: () => void;
}

export function SidebarAtm({currentScreen, onNavigate, onBackToHome, onLogout }: ISidebarAtmProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Retiros', icon: LayoutDashboard },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
    { id: 'model-audit', label: 'Auditoría de Modelos', icon: Scale },
    { id: 'monitoring', label: 'Monitoreo', icon: Monitor }
  ];

  return (
    <SidebarMenu
      nameModule="Módulo de Retiros ATM"
      nameKey="Retiros ATM"
      menuItems={menuItems}
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      onBackToHome={onBackToHome}
      onLogout={onLogout}
    />
  );
}