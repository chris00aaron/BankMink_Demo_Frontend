import { useState, useEffect, useRef } from 'react';
import { Shield, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import { Button } from '@shared/components/ui/button';

interface OtpVerificationScreenProps {
    phoneHint: string;
    onVerify: (code: string) => Promise<void>;
    onResendCode: () => Promise<void>;
    onBack: () => void;
    error?: string;
    isLoading?: boolean;
}

export function OtpVerificationScreen({
    phoneHint,
    onVerify,
    onResendCode,
    onBack,
    error,
    isLoading = false
}: OtpVerificationScreenProps) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        if (newCode.every(digit => digit !== '') && !isLoading) {
            handleSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (fullCode?: string) => {
        const codeToSubmit = fullCode || code.join('');
        if (codeToSubmit.length !== 6) return;
        await onVerify(codeToSubmit);
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        await onResendCode();
        setTimeLeft(300);
        setResendCooldown(60);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificación de Identidad</h1>
                        <p className="text-gray-600 text-sm">Ingresa el código de 6 dígitos enviado a</p>
                        <p className="text-blue-600 font-medium">{phoneHint}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-gray-600'}`}>
                            {timeLeft > 0 ? `Código válido por ${formatTime(timeLeft)}` : 'Código expirado'}
                        </span>
                    </div>

                    <div className="flex justify-center gap-3 mb-6">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className="w-12 h-14 text-center text-2xl font-bold bg-white border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <Button
                        onClick={() => handleSubmit()}
                        disabled={code.some(d => d === '') || isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg mb-4 disabled:opacity-50"
                    >
                        {isLoading ? 'Verificando...' : 'Verificar Código'}
                    </Button>

                    <div className="text-center">
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || isLoading}
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {resendCooldown > 0 ? `Reenviar código en ${resendCooldown}s` : '¿No recibiste el código? Reenviar'}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button onClick={onBack} disabled={isLoading} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-4 h-4" /> Volver al login
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Autenticación de dos factores activa</span>
                </div>
            </div>
        </div>
    );
}