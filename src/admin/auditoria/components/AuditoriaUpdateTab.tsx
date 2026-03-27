import { useState, useEffect } from 'react';
import { apiRequest } from '@shared/services/apiClient';
import { Edit3, Search } from 'lucide-react';
import { Input } from '@shared/components/ui-atm/input';

interface AuditUserUpdate {
    id: number;
    updatedUserId: number;
    updatedUserEmail: string;
    adminUserId: number;
    adminEmail: string;
    fieldChanged: string;
    oldValue: string;
    newValue: string;
    ipAddress: string;
    updatedAt: string;
}

export function AuditoriaUpdateTab() {
    const [logs, setLogs] = useState<AuditUserUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await apiRequest<{ success: boolean; data: AuditUserUpdate[] }>('/admin/audit/user-update');
            if (response.success) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error('Error fetching user update audits:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        (log.updatedUserEmail && log.updatedUserEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.adminEmail && log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.fieldChanged && log.fieldChanged.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-w-sm">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-600">Total Actualizaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Buscar por email o campo modificado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha/Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin Responsable</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario Editado</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Campo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor Anterior</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor Nuevo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando registros...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No se encontraron registros</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(log.updatedAt).toLocaleString('es-ES')}</div>
                                            <div className="text-xs text-gray-500 font-mono">IP: {log.ipAddress}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{log.adminEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{log.updatedUserEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 uppercase tracking-wider">
                                                {log.fieldChanged}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500" title={log.oldValue}>
                                            {log.oldValue || '-'}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900 font-medium" title={log.newValue}>
                                            {log.newValue || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
