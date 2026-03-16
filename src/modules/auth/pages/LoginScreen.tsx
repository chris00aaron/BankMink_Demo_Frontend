import { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import bankMindLogo from '@shared/assets/logo_BankMind.png';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
// 🔧 DEV ONLY - Eliminar en producción
import { DevCredentials } from '@shared/components/DevCredentials';

//Interfaz para las props del componente LoginScreen -> Se define que tipo de datos va a recibir el componente
interface XRAILoginScreenProps {
  onLogin: (username: string, password: string) => void;
  onForgotPassword?: () => void;
  loginError?: string;
  isLoading?: boolean;
}

export function LoginScreen({ onLogin, onForgotPassword, loginError, isLoading = false }: XRAILoginScreenProps) {
  const [username, setUsername] = useState('');
  //Estado para guardar la contraseña
  const [password, setPassword] = useState('');
  //Estado para mostrar u ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  //Función que se ejecuta cuando se hace clic en el botón de iniciar sesión
  //React.FormEvent es el tipo de evento que se produce cuando se envía un formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-gray-200 shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={bankMindLogo} alt="BankMind Logo" className="w-24 h-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BankMind</h1>
            <p className="text-gray-600 text-sm">INTELIGENCIA FINANCIERA EN TIEMPO REAL</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 text-sm">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Ingresar al Sistema'
              )}
            </Button>

            {/* Forgot Password Link */}
            {onForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Acceso seguro mediante cifrado AES-256
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Protegido por tecnología de seguridad avanzada</span>
        </div>
      </div>
      {/* 🔧 DEV ONLY - Credenciales de prueba - Eliminar en producción */}
      <DevCredentials onSelect={(email, pass) => { setUsername(email); setPassword(pass); }} />
    </div>
  );
}