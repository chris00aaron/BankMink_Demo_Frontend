import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Clock, Filter } from "lucide-react";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Button } from "./ui/button";

interface ATM {
  id: string;
  ubicacion: string;
  tipo: string;
  nivelEfectivo: number;
  demandaProximoDia: number;
  estado: "normal" | "critico" | "alerta";
  ultimaRecarga: string;
}

interface ATMTableProps {
  atms: ATM[];
}

export function ATMTable({ atms }: ATMTableProps) {
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [nivelFiltro, setNivelFiltro] = useState<string>("todos");

  const getEstadoBadge = (estado: string, nivelEfectivo: number) => {
    if (nivelEfectivo < 20) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (nivelEfectivo < 40) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Alerta</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Normal</Badge>;
    }
  };

  const getNivelColor = (nivel: number) => {
    if (nivel < 20) return "bg-red-500";
    if (nivel < 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Filtrar cajeros según los filtros seleccionados
  const atmsFiltered = atms.filter((atm) => {
    // Filtro por estado
    if (estadoFiltro !== "todos") {
      if (estadoFiltro === "critico" && atm.nivelEfectivo >= 20) return false;
      if (estadoFiltro === "alerta" && (atm.nivelEfectivo < 20 || atm.nivelEfectivo >= 40)) return false;
      if (estadoFiltro === "normal" && atm.nivelEfectivo < 40) return false;
    }
    
    // Filtro por tipo
    if (tipoFiltro !== "todos" && atm.tipo !== tipoFiltro) {
      return false;
    }
    
    // Filtro por nivel de efectivo
    if (nivelFiltro !== "todos") {
      if (nivelFiltro === "bajo" && atm.nivelEfectivo >= 40) return false;
      if (nivelFiltro === "medio" && (atm.nivelEfectivo < 40 || atm.nivelEfectivo >= 70)) return false;
      if (nivelFiltro === "alto" && atm.nivelEfectivo < 70) return false;
    }
    
    return true;
  });

  // Obtener tipos únicos de cajeros
  const tiposUnicos = Array.from(new Set(atms.map(atm => atm.tipo)));

  const resetFiltros = () => {
    setEstadoFiltro("todos");
    setTipoFiltro("todos");
    setNivelFiltro("todos");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Estado de Cajeros Automáticos</CardTitle>
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
              <SelectTrigger className="w-[160px]">
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
              <tr className="border-b">
                <th className="text-left p-3">ID Cajero</th>
                <th className="text-left p-3">Ubicación</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Nivel Efectivo</th>
                <th className="text-left p-3">Demanda Próximo Día</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Última Recarga</th>
              </tr>
            </thead>
            <tbody>
              {atmsFiltered.length > 0 ? (
                atmsFiltered.map((atm) => (
                  <tr key={atm.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono">{atm.id}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{atm.ubicacion}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{atm.tipo}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getNivelColor(atm.nivelEfectivo)} transition-all`}
                            style={{ width: `${atm.nivelEfectivo}%` }}
                          />
                        </div>
                        <span className="text-sm">{atm.nivelEfectivo}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span>${atm.demandaProximoDia.toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      {getEstadoBadge(atm.estado, atm.nivelEfectivo)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{atm.ultimaRecarga}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No se encontraron cajeros con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {atmsFiltered.length} de {atms.length} cajeros
        </div>
      </CardContent>
    </Card>
  );
}