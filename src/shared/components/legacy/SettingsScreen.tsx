import React, { useState } from 'react';
import { Settings, Shield, Bell, Sliders, Save } from 'lucide-react';

export function SettingsScreen() {
  const [settings, setSettings] = useState({
    alertThreshold: 60,
    autoBlock: true,
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    modelSensitivity: 'alta',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simular guardado
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold">
            Configuración del Sistema
          </h2>
        </div>
        <p className="text-gray-200">
          Ajusta los parámetros del motor de detección de fraude
        </p>
      </div>

      {/* Configuración de Alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Bell className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configuración de Alertas
          </h3>
        </div>

        <div className="space-y-6">
          {/* Umbral de Alerta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Umbral de Score de Riesgo para Alertas: {settings.alertThreshold}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.alertThreshold}
              onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (Bajo)</span>
              <span>50 (Medio)</span>
              <span>100 (Alto)</span>
            </div>
          </div>

          {/* Notificaciones por Email */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Notificaciones por Email</p>
              <p className="text-sm text-gray-600">Recibir alertas por correo electrónico</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notificaciones por SMS */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Notificaciones por SMS</p>
              <p className="text-sm text-gray-600">Recibir alertas por mensaje de texto</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Configuración del Modelo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sliders className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configuración del Modelo de IA
          </h3>
        </div>

        <div className="space-y-6">
          {/* Bloqueo Automático */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-gray-900">Bloqueo Automático</p>
              <p className="text-sm text-gray-600">Bloquear transacciones de alto riesgo automáticamente</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoBlock: !settings.autoBlock })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoBlock ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoBlock ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sensibilidad del Modelo */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sensibilidad del Modelo
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['baja', 'media', 'alta'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSettings({ ...settings, modelSensitivity: level })}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold capitalize transition-all ${
                    settings.modelSensitivity === level
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Alta sensibilidad puede generar más falsos positivos pero detecta más fraudes
            </p>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Información del Sistema
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Versión del Modelo:</p>
            <p className="font-semibold text-gray-900">v2.5.1</p>
          </div>
          <div>
            <p className="text-gray-600">Última Actualización:</p>
            <p className="font-semibold text-gray-900">05/01/2025</p>
          </div>
          <div>
            <p className="text-gray-600">Precisión Actual:</p>
            <p className="font-semibold text-green-600">94.7%</p>
          </div>
          <div>
            <p className="text-gray-600">Transacciones Analizadas:</p>
            <p className="font-semibold text-gray-900">1,847,293</p>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all font-semibold shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Configuración Guardada ✓' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}