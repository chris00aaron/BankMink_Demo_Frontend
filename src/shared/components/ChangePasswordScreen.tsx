import { useState, useMemo } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Check, X, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Button } from '@shared/components/ui-atm/button';
import { Input } from '@shared/components/ui-atm/input';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import { useAuth } from '@shared/contexts/AuthContext';

interface ChangePasswordScreenProps {
    onPasswordChanged: () => void;
}

interface PasswordChecks {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
    noConsecutive: boolean;
}

type PasswordStrength = 'weak' | 'normal' | 'strong' | 'very-strong';

const validatePassword = (password: string): { checks: PasswordChecks; score: number; strength: PasswordStrength } => {
    const checks: PasswordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
        noConsecutive: !/012|123|234|345|456|567|678|789|890/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    let strength: PasswordStrength;
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'normal';
    else if (score === 5) strength = 'strong';
    else strength = 'very-strong';

    return { checks, score, strength };
};

const strengthConfig = {
    'weak': {
        label: 'Débil',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        bars: 1,
        icon: ShieldAlert
    },
    'normal': {
        label: 'Normal',
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        bars: 2,
        icon: Shield
    },
    'strong': {
        label: 'Fuerte',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        bars: 3,
        icon: ShieldCheck
    },
    'very-strong': {
        label: 'Muy Seguro',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bars: 4,
        icon: ShieldCheck
    },
};

export function ChangePasswordScreen({ onPasswordChanged }: ChangePasswordScreenProps) {
    const { tempToken } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validación en tiempo real
    const validation = useMemo(() => validatePassword(newPassword), [newPassword]);
    const strengthInfo = strengthConfig[validation.strength];
    const StrengthIcon = strengthInfo.icon;

    // Requisitos mínimos para enviar (al menos 5 de 6 criterios)
    const canSubmit = validation.score >= 5 && newPassword === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (validation.score < 5) {
            setError('La contraseña no cumple con los requisitos mínimos de seguridad');
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
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <img src={bankMindLogo} alt="BankMind" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Cambiar Contraseña</h1>
                    <p className="text-gray-600 mt-2 text-sm">
                        Tu contraseña ha sido reseteada. Crea una nueva contraseña segura.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
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
                                placeholder="Ingresa tu nueva contraseña"
                                required
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

                    {/* Medidor de Seguridad */}
                    {newPassword.length > 0 && (
                        <div className="space-y-3">
                            {/* Barra de progreso */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex gap-1">
                                    {[1, 2, 3, 4].map((bar) => (
                                        <div
                                            key={bar}
                                            className={`h-2 flex-1 rounded-full transition-colors ${bar <= strengthInfo.bars ? strengthInfo.color : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className={`flex items-center gap-1 ${strengthInfo.textColor}`}>
                                    <StrengthIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{strengthInfo.label}</span>
                                </div>
                            </div>

                            {/* Lista de requisitos */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                                <p className="text-xs font-medium text-gray-500 mb-2">Requisitos de seguridad:</p>
                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                    <RequirementItem met={validation.checks.length} text="8+ caracteres" />
                                    <RequirementItem met={validation.checks.uppercase} text="Una mayúscula" />
                                    <RequirementItem met={validation.checks.lowercase} text="Una minúscula" />
                                    <RequirementItem met={validation.checks.number} text="Un número" />
                                    <RequirementItem met={validation.checks.special} text="Carácter especial" />
                                    <RequirementItem met={validation.checks.noConsecutive} text="Sin números consecutivos" />
                                </div>
                            </div>
                        </div>
                    )}

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
                                className={`pr-10 ${confirmPassword.length > 0 && newPassword !== confirmPassword
                                        ? 'border-red-300 focus:border-red-500'
                                        : confirmPassword.length > 0 && newPassword === confirmPassword
                                            ? 'border-green-300 focus:border-green-500'
                                            : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                Las contraseñas no coinciden
                            </p>
                        )}
                        {confirmPassword.length > 0 && newPassword === confirmPassword && (
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Las contraseñas coinciden
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

// Componente auxiliar para requisitos
function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-gray-400'}`}>
            {met ? (
                <Check className="w-3.5 h-3.5" />
            ) : (
                <X className="w-3.5 h-3.5" />
            )}
            <span>{text}</span>
        </div>
    );
}
