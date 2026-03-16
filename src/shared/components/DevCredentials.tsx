/**
 * ==========================================
 * 🔧 COMPONENTE DE DESARROLLO - ELIMINAR EN PRODUCCIÓN
 * ==========================================
 * 
 * Este componente muestra las credenciales de prueba.
 * Para eliminar: borrar este archivo y quitar el import/uso en FraudeLoginScreen.tsx
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Key } from 'lucide-react';

interface TestCredential {
    email: string;
    password: string;
    role: string;
    name: string;
}

const TEST_CREDENTIALS: TestCredential[] = [
    { email: 'investigacioncognitech@gmail.com', password: 'admin123', role: 'ADMIN', name: 'Administrador' },
    { email: 'aaron17650@gmail.com', password: '123456', role: 'Operario Morosidad', name: 'Ana García' },
    { email: 'angelomejia970@gmail.com', password: '123456', role: 'Operario Anomalías', name: 'Carlos Pérez' },
    { email: 'escorpioyvirgo18@gmail.com', password: '123456', role: 'Operario Demanda', name: 'María Rodríguez' },
    { email: 'polociprianouns@gmail.com', password: '123456', role: 'Operario Fuga', name: 'Juan Martínez' },
];

interface DevCredentialsProps {
    onSelect?: (email: string, password: string) => void;
}

export function DevCredentials({ onSelect }: DevCredentialsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (cred: TestCredential, index: number) => {
        const text = `${cred.email} / ${cred.password}`;
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSelect = (cred: TestCredential) => {
        if (onSelect) {
            onSelect(cred.email, cred.password);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Botón colapsado */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-lg transition-all"
            >
                <Key className="w-4 h-4" />
                <span className="text-sm font-medium">Credenciales Dev</span>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Panel expandido */}
            {isExpanded && (
                <div className="absolute bottom-12 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="bg-amber-500 px-4 py-2">
                        <p className="text-white text-xs font-medium">🔧 Solo Desarrollo - Eliminar en Producción</p>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                        {TEST_CREDENTIALS.map((cred, index) => (
                            <div
                                key={cred.email}
                                className="p-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-500">{cred.role}</span>
                                    <span className="text-xs text-gray-400">{cred.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 text-sm">
                                        <span className="text-gray-900 font-mono">{cred.email}</span>
                                        <span className="text-gray-400 mx-1">/</span>
                                        <span className="text-blue-600 font-mono">{cred.password}</span>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(cred, index)}
                                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                        title="Copiar"
                                    >
                                        {copiedIndex === index ? (
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                                        )}
                                    </button>
                                    {onSelect && (
                                        <button
                                            onClick={() => handleSelect(cred)}
                                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                                        >
                                            Usar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
