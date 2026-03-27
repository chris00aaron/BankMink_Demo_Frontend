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
    { email: 'escorpioyvirgo18@gmail.com', password: '123456', role: 'Operario Demanda', name: 'Tester 1' },
];

interface DevCredentialsProps {
    onSelect?: (email: string, password: string) => void;
}

export function DevCredentials({ onSelect }: DevCredentialsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedField, setCopiedField] = useState<{ index: number; field: 'email' | 'password' | 'all' } | null>(null);

    const handleCopy = (text: string, index: number, field: 'email' | 'password' | 'all') => {
        navigator.clipboard.writeText(text);
        setCopiedField({ index, field });
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSelect = (cred: TestCredential) => {
        if (onSelect) {
            onSelect(cred.email, cred.password);
            // Opcional: Cerrar credenciales al seleccionar
            // setIsExpanded(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col items-end pointer-events-none">
            {/* Panel expandido */}
            {isExpanded && (
                <div className="mb-2 w-full sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto transition-all">
                    <div className="bg-amber-500 px-4 py-2 flex items-center justify-between">
                        <p className="text-white text-xs font-semibold uppercase tracking-wider">🔧 Solo Desarrollo</p>
                        <span className="text-amber-100 text-[10px] hidden sm:inline-block">Eliminar en Producción</span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto w-full">
                        {TEST_CREDENTIALS.map((cred, index) => (
                            <div
                                key={cred.email}
                                className="p-3.5 hover:bg-gray-50 transition-colors flex flex-col gap-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{cred.role}</span>
                                    <span className="text-xs text-gray-500 font-medium">{cred.name}</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                                    <div className="flex-1 min-w-0 flex flex-col gap-1 border border-gray-100 rounded-md p-1.5 bg-white shadow-sm">
                                        <div 
                                            className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                                            onClick={() => handleCopy(cred.email, index, 'email')}
                                            title="Copiar email individualmente"
                                        >
                                            <span className="text-gray-900 font-mono truncate text-xs flex-1 selection:bg-amber-100">{cred.email}</span>
                                            {copiedField?.index === index && copiedField.field === 'email' ? (
                                                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-gray-400 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="h-px bg-gray-100 mx-1"></div>
                                        <div 
                                            className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                                            onClick={() => handleCopy(cred.password, index, 'password')}
                                            title="Copiar contraseña individualmente"
                                        >
                                            <span className="text-blue-600 font-mono truncate text-xs flex-1 selection:bg-blue-100">{cred.password}</span>
                                            {copiedField?.index === index && copiedField.field === 'password' ? (
                                                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-gray-400 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col gap-2">
                                        <button
                                            onClick={() => handleCopy(`${cred.email}\n${cred.password}`, index, 'all')}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:px-2 sm:py-1.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-md transition-colors"
                                            title="Copiar ambos"
                                        >
                                            {copiedField?.index === index && copiedField.field === 'all' ? (
                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-gray-600" />
                                            )}
                                            <span className="sm:hidden font-medium">Copiar todo</span>
                                        </button>
                                        
                                        {onSelect && (
                                            <button
                                                onClick={() => handleSelect(cred)}
                                                className="flex-1 sm:flex-none px-3 py-2 sm:px-2 sm:py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors font-semibold whitespace-nowrap border border-blue-200"
                                            >
                                                Auto-llenar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Botón colapsado */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-xl shadow-amber-500/20 transition-all pointer-events-auto border border-amber-400 w-full sm:w-auto"
            >
                <Key className="w-4 h-4" />
                <span className="text-sm font-bold tracking-wide">Credenciales Dev</span>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
        </div>
    );
}