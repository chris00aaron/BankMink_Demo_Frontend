import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui-atm/card";
import { Badge } from "@shared/components/ui-atm/badge";
import { MapPin, Filter, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useState, useMemo } from "react";
import type { EstadoAtmDTO } from "@/modules/atm/services/atmService";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@shared/components/ui-atm/select";
import { Button } from "@shared/components/ui-atm/button";
import clsx from "clsx";


interface ATMTableProps {
  atms: EstadoAtmDTO[];
}

export function ATMTable({ atms }: ATMTableProps) {
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [nivelFiltro, setNivelFiltro] = useState<string>("todos");

  // Formatear números a moneda peruana
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getEstadoBadge = (estado: string, porcentaje: number) => {
    const estadoUpper = estado.toUpperCase();
    
    if (estadoUpper === "CRITICO" || porcentaje < 0.2) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Crítico
        </Badge>
      );
    } else if (estadoUpper === "ALERTA" || (porcentaje >= 0.2 && porcentaje < 0.4)) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Alerta
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Normal
        </Badge>
      );
    }
  };

  const getNivelColor = (nivel: number) => {
    if (nivel < 0.2) return "bg-red-500";
    if (nivel < 0.4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRowBackground = (estado: string, porcentaje: number) => {
    const estadoUpper = estado.toUpperCase();
    
    if (estadoUpper === "CRITICO" || porcentaje < 0.2) {
      return "bg-red-50/50 hover:bg-red-50";
    } else if (estadoUpper === "ALERTA" || (porcentaje >= 0.2 && porcentaje < 0.4)) {
      return "bg-yellow-50/50 hover:bg-yellow-50";
    } else {
      return "hover:bg-slate-50";
    }
  };

  // Filtrar cajeros según los filtros seleccionados
  const atmsFiltered = useMemo(() => {
    return atms.filter((atm) => {
      const estadoUpper = atm.estado.toUpperCase();
      
      // Filtro por estado
      if (estadoFiltro !== "todos") {
        if (estadoFiltro === "critico" && estadoUpper !== "CRITICO" && atm.porcentaje >= 0.2) return false;
        if (estadoFiltro === "alerta" && estadoUpper !== "ALERTA" && (atm.porcentaje < 0.2 || atm.porcentaje >= 0.4)) return false;
        if (estadoFiltro === "normal" && estadoUpper !== "NORMAL" && atm.porcentaje < 0.4) return false;
      }
      
      // Filtro por tipo
      if (tipoFiltro !== "todos" && atm.tipoLugar !== tipoFiltro) {
        return false;
      }
      
      // Filtro por nivel de efectivo
      if (nivelFiltro !== "todos") {
        if (nivelFiltro === "bajo" && atm.porcentaje >= 0.4) return false;
        if (nivelFiltro === "medio" && (atm.porcentaje < 0.4 || atm.porcentaje >= 0.7)) return false;
        if (nivelFiltro === "alto" && atm.porcentaje < 0.7) return false;
      }
      
      return true;
    });
  }, [atms, estadoFiltro, tipoFiltro, nivelFiltro]);

  // Obtener tipos únicos de cajeros
  const tiposUnicos = useMemo(() => 
    Array.from(new Set(atms.map(atm => atm.tipoLugar))),
    [atms]
  );

  const resetFiltros = () => {
    setEstadoFiltro("todos");
    setTipoFiltro("todos");
    setNivelFiltro("todos");
  };

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const criticos = atms.filter(a => a.estado.toUpperCase() === "CRITICO" || a.porcentaje < 0.2).length;
    const alertas = atms.filter(a => {
      const estadoUpper = a.estado.toUpperCase();
      return (estadoUpper === "ALERTA" || (a.porcentaje >= 0.2 && a.porcentaje < 0.4)) && estadoUpper !== "CRITICO";
    }).length;
    const normales = atms.filter(a => {
      const estadoUpper = a.estado.toUpperCase();
      return (estadoUpper === "NORMAL" || a.porcentaje >= 0.4) && estadoUpper !== "ALERTA" && estadoUpper !== "CRITICO";
    }).length;

    return { criticos, alertas, normales };
  }, [atms]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <CardTitle className="text-xl">Estado de Cajeros Automáticos</CardTitle>
            <div className="flex gap-6 mt-2">
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-red-600">{stats.criticos}</span> Críticos
              </span>
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-yellow-600">{stats.alertas}</span> Alertas
              </span>
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-green-600">{stats.normales}</span> Normales
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros:</span>
            </div>
            
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposUnicos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={nivelFiltro} onValueChange={setNivelFiltro}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los niveles</SelectItem>
                <SelectItem value="bajo">Bajo (&lt;40%)</SelectItem>
                <SelectItem value="medio">Medio (40-70%)</SelectItem>
                <SelectItem value="alto">Alto (&gt;70%)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFiltros}
              className="text-xs"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-700 whitespace-nowrap">ID Cajero</th>
                <th className="text-left p-4 font-semibold text-slate-700 min-w-[150px]">Ubicación</th>
                <th className="text-left p-4 font-semibold text-slate-700 hidden md:table-cell">Tipo</th>
                <th className="text-left p-4 font-semibold text-slate-700 hidden lg:table-cell whitespace-nowrap">Balance Actual</th>
                <th className="text-left p-4 font-semibold text-slate-700 hidden sm:table-cell min-w-[180px]">Nivel Efectivo</th>
                <th className="text-left p-4 font-semibold text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {atmsFiltered.length > 0 ? (
                atmsFiltered.map((atm) => (
                  <tr 
                    key={atm.idAtm} 
                    className={clsx(
                      "border-b border-slate-100 transition-colors",
                      getRowBackground(atm.estado, atm.porcentaje)
                    )}
                  >
                    <td className="p-4">
                      <span className="font-mono font-semibold text-slate-900">{'ATM-' + atm.idAtm.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{atm.direccion}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge variant="outline" className="font-medium">
                        {atm.tipoLugar}
                      </Badge>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrency(atm.balanceActual)}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              "h-full transition-all duration-500",
                              getNivelColor(atm.porcentaje)
                            )}
                            style={{ width: `${(atm.porcentaje*100).toFixed(2)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 min-w-[45px]">
                          {(atm.porcentaje*100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getEstadoBadge(atm.estado, atm.porcentaje)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500 font-medium">
                        No se encontraron cajeros con los filtros seleccionados
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resetFiltros}
                        className="mt-2"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
          <span>
            Mostrando <span className="font-semibold text-slate-900">{atmsFiltered.length}</span> de{" "}
            <span className="font-semibold text-slate-900">{atms.length}</span> cajeros
          </span>
          {atmsFiltered.length !== atms.length && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={resetFiltros}
              className="text-blue-600 hover:text-blue-700"
            >
              Ver todos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
