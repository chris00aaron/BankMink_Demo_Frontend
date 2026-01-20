import { useState } from 'react';
import { FileText, Search, Filter, Download, Calendar, User, Activity, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AuditoriaModuleProps {
  onBack: () => void;
}

export function AuditoriaModule({ onBack }: AuditoriaModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock audit data
  const auditLogs = [
    {
      id: 1,
      user: 'op-anomalias',
      userName: 'Operario Anomalías',
      action: 'Acceso al módulo Anomalías Transaccionales',
      timestamp: '2026-01-20 14:35:22',
      ipAddress: '192.168.1.45',
      status: 'success'
    },
    {
      id: 2,
      user: 'admin',
      userName: 'Administrador',
      action: 'Creó nuevo usuario: op-demanda',
      timestamp: '2026-01-20 13:22:15',
      ipAddress: '192.168.1.10',
      status: 'success'
    },
    {
      id: 3,
      user: 'op-morosidad',
      userName: 'Operario Morosidad',
      action: 'Generó reporte de morosidad mensual',
      timestamp: '2026-01-20 12:10:08',
      ipAddress: '192.168.1.52',
      status: 'success'
    },
    {
      id: 4,
      user: 'op-fuga',
      userName: 'Operario Fuga Demanda',
      action: 'Intentó acceder a módulo no autorizado',
      timestamp: '2026-01-20 11:45:33',
      ipAddress: '192.168.1.67',
      status: 'failed'
    },
    {
      id: 5,
      user: 'admin',
      userName: 'Administrador',
      action: 'Modificó permisos de usuario op-anomalias',
      timestamp: '2026-01-20 10:15:44',
      ipAddress: '192.168.1.10',
      status: 'success'
    },
    {
      id: 6,
      user: 'op-demanda',
      userName: 'Operario Demanda Efectivo',
      action: 'Ejecutó predicción de demanda para sucursal 001',
      timestamp: '2026-01-20 09:30:12',
      ipAddress: '192.168.1.89',
      status: 'success'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
                  <p className="text-sm text-gray-600">Registro de actividades y accesos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar en auditoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Rango de Fecha
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Eventos</p>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">1,247</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% vs ayer</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Accesos Exitosos</p>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">1,198</p>
            <p className="text-xs text-gray-500 mt-1">96.1% tasa éxito</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Accesos Fallidos</p>
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">49</p>
            <p className="text-xs text-red-600 mt-1">Requiere atención</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500 mt-1">Hoy</p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.timestamp}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {log.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.user}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.action}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono">{log.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status === 'success' ? 'Exitoso' : 'Fallido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-medium">1-6</span> de <span className="font-medium">1,247</span> registros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Anterior</Button>
              <Button variant="outline" size="sm">Siguiente</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
