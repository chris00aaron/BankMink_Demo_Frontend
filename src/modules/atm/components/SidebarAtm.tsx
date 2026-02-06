import { LayoutDashboard, Brain, Calculator, Scale } from 'lucide-react';
import { SidebarMenu } from '@shared/components/SidebarMenu';

interface ISidebarAtmProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBackToHome?: () => void;
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
}

export function SidebarAtm({ currentScreen, onNavigate, onBackToHome, isOpen, setIsOpen }: ISidebarAtmProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Retiros', icon: LayoutDashboard },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
    { id: 'model-audit', label: 'Auditoría de Modelos', icon: Scale },
  ];

  return (
    <SidebarMenu 
      items={menuItems} 
      currentScreen={currentScreen} 
      onNavigate={onNavigate}
      onBackToHome={onBackToHome}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
}