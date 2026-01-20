import React from 'react';
import { Bell, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

interface Alert {
  id: string;
  tipo: 'Crítica' | 'Alta' | 'Media';
  titulo: string;
  descripcion: string;
  hora: string;
  transaccionId: string;
  monto: number;
}

const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    tipo: 'Crítica',
    titulo: 'Transacción de alto monto detectada',
    descripcion: 'Transacción de S/ 8,500 realizada en comercio de alto riesgo',
    hora: '15:23:45',
    transaccionId: 'TXN-2025-0001',
    monto: 8500.00,
  },
  {
    id: 'ALT-002',
    tipo: 'Alta',
    titulo: 'Patrón de gasto inusual',
    descripcion: 'Cliente realizó 5 transacciones en menos de 10 minutos',
    hora: '15:12:33',
    transaccionId: 'TXN-2025-0003',
    monto: 1850.00,
  },
  {
    id: 'ALT-003',
    tipo: 'Crítica',
    titulo: 'Transacción nocturna sospechosa',
    descripcion: 'Compra realizada a las 02:34 AM en ubicación no habitual',
    hora: '14:58:09',
    transaccionId: 'TXN-2025-0005',
    monto: 3200.00,
  },
  {
    id: 'ALT-004',
    tipo: 'Alta',
    titulo: 'Comercio de alto riesgo',
    descripcion: 'Transacción en tienda en línea con historial de fraudes',
    hora: '14:32:18',
    transaccionId: 'TXN-2025-0007',
    monto: 5600.00,
  },
  {
    id: 'ALT-005',
    tipo: 'Media',
    titulo: 'Cambio en comportamiento de compra',
    descripcion: 'Primera compra en categoría "Electrónica" en 6 meses',
    hora: '13:45:22',
    transaccionId: 'TXN-2025-0012',
    monto: 2100.00,
  },
];

export function AlertsScreen() {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Crítica':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Crítica':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'Alta':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'Media':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold">
            Alertas de Fraude en Tiempo Real
          </h2>
        </div>
        <p className="text-red-100">
          Monitoreo de transacciones sospechosas detectadas por el sistema de IA
        </p>
      </div>

      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Alertas Críticas</p>
              <p className="text-3xl font-semibold text-gray-900">2</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Alertas Altas</p>
              <p className="text-3xl font-semibold text-gray-900">2</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Alertas Medias</p>
              <p className="text-3xl font-semibold text-gray-900">1</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Alertas Recientes
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className="flex-shrink-0 mt-1">
                  {getTipoIcon(alert.tipo)}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {alert.titulo}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {alert.descripcion}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTipoColor(alert.tipo)}`}>
                      {alert.tipo}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{alert.hora}</span>
                    </div>
                    <span>•</span>
                    <span>ID: {alert.transaccionId}</span>
                    <span>•</span>
                    <span className="font-semibold text-gray-900">
                      S/ {alert.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex-shrink-0">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    Revisar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}