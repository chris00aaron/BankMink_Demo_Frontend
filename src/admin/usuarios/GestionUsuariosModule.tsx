import { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, Shield, ArrowLeft, Key } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Badge } from '@shared/components/ui/badge';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserModal } from './components/EditUserModal';
import { PasswordRequestsTab } from './components/PasswordRequestsTab';
import { apiRequest } from '@shared/services/apiClient';

interface GestionUsuariosModuleProps {
  onBack: () => void;
}

interface User {
  id: number;
  dni: string;
  fullName: string;
  email: string;
  phone?: string;
  roleCodRole: string;
  roleName: string;
  enable: boolean;
  lastAccess?: string;
  createdAt: string;
}

type TabType = 'users' | 'password-requests';

export function GestionUsuariosModule({ onBack }: GestionUsuariosModuleProps) {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest<{ success: boolean; data: User[] }>('/admin/users');
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      const data = await apiRequest<{ success: boolean; message?: string }>(
        `/admin/users/${userId}`,
        'DELETE'
      );
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dni.includes(searchTerm)
  );

  const adminCount = users.filter(u => u.roleCodRole === 'ADMIN').length;
  const operatorCount = users.filter(u => u.roleCodRole !== 'ADMIN').length;
  const activeToday = users.filter(u => u.enable).length;

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
            {activeTab === 'users' && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuarios
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password-requests')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'password-requests'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Solicitudes de Contraseña
              </div>
            </button>
          </div>

          {/* Search - only for users tab */}
          {activeTab === 'users' && (
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
          )}
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {activeTab === 'users' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Administradores</p>
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{adminCount}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Operarios</p>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{operatorCount}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Activos</p>
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{activeToday}</p>
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
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          Cargando usuarios...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                <div className="text-xs text-gray-500">DNI: {user.dni}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={user.roleCodRole === 'ADMIN' ? 'default' : 'secondary'}
                              className={
                                user.roleCodRole === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }
                            >
                              {user.roleName}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.enable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                              }`}>
                              {user.enable ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {user.lastAccess ? new Date(user.lastAccess).toLocaleString('es-ES') : 'Nunca'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* Edit Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => setEditingUser(user)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                              </Button>

                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={user.roleCodRole === 'ADMIN'}
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <PasswordRequestsTab />
        )}
      </main>

      {/* Modals */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
