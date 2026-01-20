import React from 'react';
import { Bell, CheckCircle, CircleX } from 'lucide-react';

interface NotificationAlertProps {
  monto: number;
  onConfirm: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function NotificationAlert({ monto, onConfirm, onReject, onClose }: NotificationAlertProps) {
  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl border-2 border-red-500 max-w-sm w-full z-50 animate-in slide-in-from-top-5">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <Bell className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              Alerta de Transacción Sospechosa
            </h4>
            <p className="text-gray-700 mb-3">
              ¿Reconoces esta transacción de{' '}
              <span className="font-bold text-red-600">
                S/ {monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
              ?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CircleX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <CheckCircle className="w-4 h-4" />
            Sí, soy yo
          </button>
          <button
            onClick={onReject}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <CircleX className="w-4 h-4" />
            No, es fraude
          </button>
        </div>
      </div>
    </div>
  );
}
