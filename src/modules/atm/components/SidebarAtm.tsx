import { LayoutDashboard, Brain, Calculator } from 'lucide-react';
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
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'prediction-withdrawal', label: 'Predicción de Retiros', icon: Brain },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
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