import { useState } from "react";
import { Database, Activity, Network, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui-atm/tabs";
import { DataLoadingView } from "../components/DataLoadingView";
import { DataStabilityView } from "../components/DataStabilityView";
import { ATMNetworkView } from "../components/ATMNetworkView";

export default function Monitoring() {
  const [activeView, setActiveView] = useState<'loading' | 'stability' | 'atms'>('stability');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 p-2 shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                MLOps Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Sistema de Monitoreo y Gestión de Modelos de Machine Learning
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="loading" 
              className="flex items-center gap-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
            >
              <Database className="h-4 w-4" />
              Cargado de Datos
            </TabsTrigger>
            <TabsTrigger 
              value="stability" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700"
            >
              <Activity className="h-4 w-4" />
              Estabilidad de Datos
            </TabsTrigger>
            <TabsTrigger 
              value="atms" 
              className="flex items-center gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <Network className="h-4 w-4" />
              Red de ATMs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loading" className="space-y-6">
            <DataLoadingView />
          </TabsContent>

          <TabsContent value="stability" className="space-y-6">
            <DataStabilityView />
          </TabsContent>

          <TabsContent value="atms" className="space-y-6">
            <ATMNetworkView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
