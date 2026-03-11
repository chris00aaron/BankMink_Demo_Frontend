import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';

interface OtpVerificationScreenProps {
    emailHint: string;
    onVerify: (code: string) => Promise<void>;
    onResendCode: () => Promise<void>;
    onBack: () => void;
    error?: string;
    isLoading?: boolean;
}

const MAX_RESENDS = 3;
const RESEND_COOLDOWN_SECONDS = 30;

export function OtpVerificationScreen({
    emailHint,
    onVerify,
    onResendCode,
    onBack,
    error,
    isLoading = false
}: OtpVerificationScreenProps) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer de expiración
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Cooldown para reenvío
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        // Solo permitir dígitos
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus al siguiente input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit cuando se completan los 6 dígitos
        if (newCode.every(digit => digit !== '') && !isLoading) {
            handleSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        pastedData.split('').forEach((digit, index) => {
            if (index < 6) newCode[index] = digit;
        });
        setCode(newCode);

        // Focus en el último dígito ingresado o enviar si está completo
        if (pastedData.length === 6) {
            handleSubmit(newCode.join(''));
        } else {
            inputRefs.current[pastedData.length]?.focus();
        }
    };

    const handleSubmit = async (fullCode?: string) => {
        const codeToSubmit = fullCode || code.join('');
        if (codeToSubmit.length !== 6) return;
        await onVerify(codeToSubmit);
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || resendCount >= MAX_RESENDS) return;
        await onResendCode();
        setResendCount(prev => prev + 1);
        setTimeLeft(300);
        setCanResend(false);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    const isResendDisabled = resendCooldown > 0 || resendCount >= MAX_RESENDS || isLoading;

    const getResendText = () => {
        if (resendCount >= MAX_RESENDS) {
            return 'Máximo de reenvíos alcanzado';
        }
        if (resendCooldown > 0) {
            return `Reenviar código en ${resendCooldown}s`;
        }
        return '¿No recibiste el correo? Reenviar';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* OTP Card */}
            <div className="relative w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-gray-200 shadow-2xl p-8">
                    {/* Logo and Title */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src={bankMindLogo} alt="BankMind Logo" className="w-16 h-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificación de Identidad</h1>
                        <p className="text-gray-600 text-sm">
                            Ingresa el código de 6 dígitos enviado a
                        </p>
                        <p className="text-blue-600 font-medium">{emailHint}</p>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-gray-600'}`}>
                            {timeLeft > 0 ? `Código válido por ${formatTime(timeLeft)}` : 'Código expirado'}
                        </span>
                    </div>

                    {/* OTP Input */}
                    <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className="w-12 h-14 text-center text-2xl font-bold bg-white border-gray-300 text-gray-900 
                           focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* Verify Button */}
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={code.some(d => d === '') || isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                       text-white font-semibold py-6 shadow-lg shadow-blue-500/20 transition-all mb-4
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verificando...' : 'Verificar Código'}
                    </Button>

                    {/* Resend Code */}
                    <div className="text-center">
                        <button
                            onClick={handleResend}
                            disabled={isResendDisabled}
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 
                         disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${!isResendDisabled ? 'hover:animate-spin' : ''}`} />
                            {getResendText()}
                        </button>
                        {resendCount > 0 && resendCount < MAX_RESENDS && (
                            <p className="text-xs text-gray-400 mt-1">
                                Reenvíos restantes: {MAX_RESENDS - resendCount}
                            </p>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={onBack}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al login
                        </button>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Autenticación de dos factores activa</span>
                </div>
            </div>
        </div>
    );
}
