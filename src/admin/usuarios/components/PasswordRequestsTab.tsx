import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { apiRequest } from '@shared/services/apiClient';

interface PasswordRequest {
    id: number;
    userEmail: string;
    userName: string;
    userDni: string;
    requestedAt: string;
    status: string;
}

export function PasswordRequestsTab() {
    const [requests, setRequests] = useState<PasswordRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await apiRequest<{ success: boolean; data: PasswordRequest[] }>(
                '/admin/password-requests'
            );
            if (data.success) {
                setRequests(data.data);
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('¿Resetear la contraseña a "admin123"? El usuario deberá cambiarla en su próximo login.')) {
            return;
        }

        setProcessingId(id);
        try {
            const data = await apiRequest<{ success: boolean; message?: string }>(
                `/admin/password-requests/${id}/approve`,
                'POST'
            );
            if (data.success) {
                alert('Contraseña reseteada a "admin123". El usuario deberá cambiarla al iniciar sesión.');
                fetchRequests();
            } else {
                alert(data.message || 'Error al aprobar solicitud');
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('¿Está seguro de rechazar esta solicitud?')) return;

        setProcessingId(id);
        try {
            const data = await apiRequest<{ success: boolean; message?: string }>(
                `/admin/password-requests/${id}/reject`,
                'POST',
                { notes: 'Rechazado por administrador' }
            );
            if (data.success) {
                alert('Solicitud rechazada');
                fetchRequests();
            } else {
                alert(data.message || 'Error al rechazar solicitud');
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Cargando solicitudes...</div>
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'PENDING');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                    Solicitudes de Cambio de Contraseña
                </h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {pendingRequests.length} pendiente(s)
                </Badge>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Al aprobar, la contraseña se reseteará a <code className="bg-amber-100 px-1 rounded">admin123</code>.
                    El usuario deberá cambiarla obligatoriamente en su próximo inicio de sesión.
                </p>
            </div>

            {/* Requests List */}
            {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay solicitudes pendientes</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                        {request.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {request.userName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                                        <p className="text-xs text-gray-500">DNI: {request.userDni}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Solicitado:</p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {new Date(request.requestedAt).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleApprove(request.id)}
                                    disabled={processingId === request.id}
                                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {processingId === request.id ? 'Procesando...' : 'Resetear a admin123'}
                                </Button>
                                <Button
                                    onClick={() => handleReject(request.id)}
                                    disabled={processingId === request.id}
                                    variant="outline"
                                    className="flex-1 text-red-600 hover:bg-red-50 gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rechazar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

