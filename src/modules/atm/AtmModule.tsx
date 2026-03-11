import { SidebarAtm } from "./components/SidebarAtm";
import Dashboard from "./page/Dashboard";
import { Simulator } from "./page/Simulator";
import ModelAudit from "./page/ModelAudit";
import Monitoring from "./page/Monitoring";

interface IAtmModule {
    currentScreen: string;
    onNavigate: (screen: string) => void;
    onBackToHome?: () => void;
    onLogout: () => void;
}

export function AtmModule({currentScreen, onNavigate, onBackToHome, onLogout }: IAtmModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarAtm
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          onBackToHome={onBackToHome}
          onLogout={onLogout}
        />
        <div className="flex-1 ml-64">
          {/* Page Content */}
          <main className="p-8">
            {/* El Layout inyectará esto en {children} */}
            {currentScreen === "dashboard" && <Dashboard />}
            {currentScreen === "simulator" && <Simulator />}
            {currentScreen === "model-audit" && <ModelAudit />}
            {currentScreen === "monitoring" && <Monitoring />}
          </main>
        </div>
      </div>
    );
}
