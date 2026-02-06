import { ModuleLayout } from "@shared/Layout/ModuleLayout";
import { SidebarAtm } from "./components/SidebarAtm";
import Dashboard from "./page/Dashboard";
import { Simulator } from "./page/Simulator";
import ModelAudit from "./page/ModelAudit";

interface IAtmModule {
  title: string;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBack?: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function AtmModule({
  title,
  currentScreen,
  onNavigate,
  onBack,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: IAtmModule) {
  return (
    <ModuleLayout
      title={title}
      sidebar={
        <SidebarAtm
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          onBackToHome={onBack}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
      }
      chanceStateMenuOpen={setIsMobileMenuOpen}
    >
      {/* El Layout inyectará esto en {children} */}
      {currentScreen === "dashboard" && <Dashboard />}
      {currentScreen === "simulator" && <Simulator />}
      {currentScreen === "model-audit" && <ModelAudit />}
    </ModuleLayout>
  );
}
