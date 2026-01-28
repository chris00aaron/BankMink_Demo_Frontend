import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import { useAuth } from '@shared/contexts/AuthContext';

interface ChangePasswordScreenProps {
    onPasswordChanged: () => void;
}

export function ChangePasswordScreen({ onPasswordChanged }: ChangePasswordScreenProps) {
    const { tempToken } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (tempToken) {
                headers['Authorization'] = `Bearer ${tempToken}`;
            }

            const response = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                // Esperar un momento y luego redirigir al login
                setTimeout(() => {
                    onPasswordChanged();
                }, 2000);
            } else {
                setError(data.message || 'Error al cambiar contraseña');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Contraseña Actualizada!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Tu contraseña ha sido cambiada exitosamente.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirigiendo al login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <img src={bankMindLogo} alt="BankMind" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Cambiar Contraseña</h1>
                    <p className="text-gray-600 mt-2">
                        Tu contraseña ha sido reseteada. Por seguridad, debes crear una nueva contraseña.
                    </p>
                </div>

                {/* Alert */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-800">
                                <strong>Importante:</strong> Elige una contraseña segura que no hayas usado antes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Nueva Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                                minLength={6}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                    >
                        {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
