import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple
    if (!email || !password) {
      setError('Por favor ingrese todos los campos');
      return;
    }

    // Simulación de login exitoso
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4 transform hover:scale-105 transition-transform">
            <Shield className="w-12 h-12 text-blue-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FraudGuard AI</h1>
          <p className="text-blue-200 text-lg">Sistema de Detección de Fraude en Tiempo Real</p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="usuario@banco.com"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón de Iniciar Sesión */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-4 rounded-lg hover:from-blue-800 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 transition-all font-semibold shadow-lg transform hover:scale-[1.02]"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Sistema protegido con autenticación multi-factor</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-blue-200">
          <p>© 2025 FraudGuard AI - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}