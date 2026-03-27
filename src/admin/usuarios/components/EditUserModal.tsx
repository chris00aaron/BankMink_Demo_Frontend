import { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { Button } from '@shared/components/ui-atm/button';
import { Input } from '@shared/components/ui-atm/input';
import { apiRequest } from '@shared/services/apiClient';

interface Role {
    id: number;
    codRole: string;
    name: string;
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
}

interface EditUserModalProps {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [error, setError] = useState('');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [formData, setFormData] = useState({
        dni: '',
        fullName: '',
        email: '',
        password: '',
        phone: '',
        roleId: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
            if (user) {
                // Determine user's role ID from roles list if loaded, otherwise we'll set it when roles load
                setFormData({
                    dni: user.dni,
                    fullName: user.fullName,
                    email: user.email,
                    password: '', // Password is empty by default
                    phone: user.phone || '',
                    roleId: '' // Will be updated below or when roles load
                });
                setShowPasswordChange(false);
            }
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (user && roles.length > 0) {
            const userRole = roles.find(r => r.name === user.roleName || r.codRole === user.roleCodRole);
            if (userRole) {
                setFormData(prev => ({ ...prev, roleId: userRole.id.toString() }));
            }
        }
    }, [roles, user]);

    const fetchRoles = async () => {
        try {
            const data = await apiRequest<{ success: boolean; data: Role[] }>('/admin/users/roles');
            if (data.success) {
                setRoles(data.data);
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        // Validation if password change is enabled
        if (showPasswordChange && formData.password && formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload: any = {
                dni: formData.dni,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                roleId: parseInt(formData.roleId)
            };

            // Only include password if the user enabled the section and typed something
            if (showPasswordChange && formData.password) {
                payload.password = formData.password;
            }

            const data = await apiRequest<{ success: boolean; message?: string }>(
                `/admin/users/${user.id}`,
                'PUT',
                payload
            );

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.message || 'Error al actualizar usuario');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* DNI */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            DNI
                        </label>
                        <Input
                            type="text"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            placeholder="12345678"
                            required
                            minLength={8}
                            maxLength={20}
                        />
                    </div>

                    {/* Nombre Completo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </label>
                        <Input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Juan Pérez García"
                            required
                            maxLength={100}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="usuario@bankmind.com"
                            required
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono
                        </label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="987654321"
                            minLength={9}
                            maxLength={15}
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rol
                        </label>
                        <select
                            value={formData.roleId}
                            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar rol...</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Expansible: Cambiar Contraseña */}
                    <div className="pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowPasswordChange(!showPasswordChange)}
                            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
                        >
                            <Key className="w-4 h-4" />
                            {showPasswordChange ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
                        </button>

                        {showPasswordChange && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Contraseña
                                </label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Dejar vacío para no cambiar"
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Si deja este campo vacío, la contraseña del usuario no será modificada.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
