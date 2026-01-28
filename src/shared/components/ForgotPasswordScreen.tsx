import { useState } from 'react';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';

interface ForgotPasswordScreenProps {
    onSubmit: (email: string) => Promise<void>;
    onBack: () => void;
}

export function ForgotPasswordScreen({ onSubmit, onBack }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor ingresa un correo electrónico válido');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await onSubmit(email);
            setIsSubmitted(true);
        } catch {
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                <div className="relative w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-gray-200 shadow-2xl p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center mb-4">
                                <img src={bankMindLogo} alt="BankMind Logo" className="w-16 h-auto" />
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        </div>
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Solicitud Enviada</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Se ha enviado una solicitud de cambio de contraseña al administrador del sistema.
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">
                                Será contactado cuando su solicitud sea procesada.
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Importante:</strong> Por motivos de seguridad, solo el administrador puede realizar cambios de contraseña en el sistema bancario.
                            </p>
                        </div>
                        <Button onClick={onBack} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg">
                            Volver al Inicio de Sesión
                        </Button>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>Sistema de seguridad bancaria</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            <div className="relative w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-gray-200 shadow-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src={bankMindLogo} alt="BankMind Logo" className="w-16 h-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¿Olvidaste tu Contraseña?</h1>
                        <p className="text-gray-600 text-sm">
                            Ingresa tu correo electrónico y enviaremos una solicitud de cambio de contraseña al administrador.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 text-sm">Correo Electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@banco.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    disabled={isLoading}
                                    className="pl-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg disabled:opacity-50">
                            {isLoading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={onBack} disabled={isLoading} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                        </button>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Sistema de seguridad bancaria</span>
                </div>
            </div>
        </div>
    );
}