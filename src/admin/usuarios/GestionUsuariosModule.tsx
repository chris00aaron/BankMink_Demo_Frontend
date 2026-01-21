import { useState } from 'react';
import { Users, Search, Plus, Edit, Trash2, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Badge } from '@shared/components/ui/badge';

interface GestionUsuariosModuleProps {
  onBack: () => void;
}

export function GestionUsuariosModule({ onBack }: GestionUsuariosModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data
  const users = [
    {
      id: 1,
      username: 'admin',
      name: 'Administrador',
      email: 'admin@xrai.com',
      role: 'Administrador',
      status: 'active',
      lastAccess: '2026-01-20 14:35:22'
    },
    {
      id: 2,
      username: 'op-anomalias',
      name: 'Operario Anomalías',
      email: 'anomalias@xrai.com',
      role: 'Operario - Anomalías Transaccionales',
      status: 'active',
      lastAccess: '2026-01-20 14:35:22'
    },
    {
      id: 3,
      username: 'op-morosidad',
      name: 'Operario Morosidad',
      email: 'morosidad@xrai.com',
      role: 'Operario - Morosidad Detalle',
      status: 'active',
      lastAccess: '2026-01-20 12:10:08'
    },
    {
      id: 4,
      username: 'op-demanda',
      name: 'Operario Demanda Efectivo',
      email: 'demanda@xrai.com',
      role: 'Operario - Demanda Efectivo',
      status: 'active',
      lastAccess: '2026-01-20 09:30:12'
    },
    {
      id: 5,
      username: 'op-fuga',
      name: 'Operario Fuga Demanda',
      email: 'fuga@xrai.com',
      role: 'Operario - Fuga Demanda',
      status: 'active',
      lastAccess: '2026-01-20 11:45:33'
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                  <p className="text-sm text-gray-600">Administrar usuarios y permisos del sistema</p>
                </div>
              </div>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Administradores</p>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">1</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Operarios</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">4</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Activos Hoy</p>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={user.role === 'Administrador' ? 'default' : 'secondary'}
                        className={
                          user.role === 'Administrador'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.lastAccess}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={user.role === 'Administrador'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Credenciales de Prueba</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Admin:</strong> usuario: admin, contraseña: admin123</p>
                <p><strong>Operarios:</strong> op-anomalias/anom123, op-morosidad/mora123, op-demanda/dema123, op-fuga/fuga123</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
