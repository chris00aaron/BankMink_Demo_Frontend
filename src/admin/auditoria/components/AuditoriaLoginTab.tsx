import { useState, useEffect } from 'react';
import { apiRequest } from '@shared/services/apiClient';
import { Activity, Search } from 'lucide-react';
import { Input } from '@shared/components/ui-atm/input';

interface AuditLogin {
    id: number;
    userId: number;
    email: string;
    roleName: string;
    ipAddress: string;
    userAgent: string;
    loginStatus: string;
    failureReason: string;
    loginAt: string;
}

export function AuditoriaLoginTab() {
    const [logs, setLogs] = useState<AuditLogin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await apiRequest<{ success: boolean; data: AuditLogin[] }>('/admin/audit/login');
            if (response.success) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error('Error fetching login audits:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.ipAddress && log.ipAddress.includes(searchTerm))
    );

    const successCount = logs.filter(l => l.loginStatus === 'SUCCESS').length;
    const failedCount = logs.length - successCount;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Logins</p>
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Exitosos</p>
                        <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{successCount}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Fallidos</p>
                        <Activity className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-600">{failedCount}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Buscar por email o IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha/Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IP / Dispositivo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando registros...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No se encontraron registros</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(log.loginAt).toLocaleString('es-ES')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{log.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{log.roleName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-mono">{log.ipAddress}</div>
                                            <div className="text-xs text-gray-500 max-w-xs truncate" title={log.userAgent}>
                                                {log.userAgent}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${log.loginStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {log.loginStatus === 'SUCCESS' ? 'Exitoso' : 'Fallido'}
                                            </span>
                                            {log.failureReason && (
                                                <div className="text-xs text-red-600 mt-1">{log.failureReason}</div>
                                            )}
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
