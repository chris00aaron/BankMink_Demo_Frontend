import { useState } from "react";
import { Database, Activity, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui-atm/tabs";
import { DataLoadingView } from "../components/DataLoadingView";
import { DataStabilityView } from "../components/DataStabilityView";
import { ATMNetworkView } from "../components/ATMNetworkView";

export default function Monitoring() {
  const [activeView, setActiveView] = useState<'loading' | 'stability' | 'atms'>('stability');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header — same pattern as Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              MLOps Dashboard
            </h1>
          </div>
          <p className="text-slate-500 ml-4 lg:ml-5">
            Sistema de Monitoreo y Gestión de Modelos de Machine Learning
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as typeof activeView)}
        className="space-y-6"
      >
        <div className="flex w-full justify-center">
          <TabsList className="inline-flex gap-1 bg-white border border-slate-200 shadow-sm rounded-xl p-1">
            <TabsTrigger
              value="loading"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Database className="h-4 w-4" />
              Cargado de Datos
            </TabsTrigger>
            <TabsTrigger
              value="stability"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Activity className="h-4 w-4" />
              Estabilidad de Datos
            </TabsTrigger>
            <TabsTrigger
              value="atms"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Network className="h-4 w-4" />
              Red de ATMs
            </TabsTrigger>
          </TabsList>
        </div>

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
  );
}
