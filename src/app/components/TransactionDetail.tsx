import React from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Transaction } from './TransactionsTable';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onMarkAsFraud: () => void;
  onMarkAsLegitimate: () => void;
}

export function TransactionDetail({ 
  transaction, 
  onClose, 
  onMarkAsFraud, 
  onMarkAsLegitimate 
}: TransactionDetailProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'Alto', color: 'bg-red-500' };
    if (score >= 40) return { level: 'Medio', color: 'bg-yellow-500' };
    return { level: 'Bajo', color: 'bg-green-500' };
  };

  const risk = getRiskLevel(transaction.scoreRiesgo);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Detalle de Transacción Sospechosa
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ID de Transacción:</span>
              <span className="font-semibold text-gray-900">{transaction.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hora:</span>
              <span className="font-semibold text-gray-900">{transaction.hora}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monto:</span>
              <span className="text-2xl font-semibold text-gray-900">
                S/ {transaction.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Risk Score */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Score de Riesgo:</span>
              <span className="text-xl font-semibold text-gray-900">
                {transaction.scoreRiesgo}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${risk.color} transition-all duration-300`}
                style={{ width: `${transaction.scoreRiesgo}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nivel de Riesgo:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                risk.color === 'bg-red-500' ? 'bg-red-100 text-red-800' :
                risk.color === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {risk.level}
              </span>
            </div>
          </div>

          {/* Alert Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Se notificó al cliente para confirmación de la transacción
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onMarkAsLegitimate}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <ShieldCheck className="w-5 h-5" />
              Marcar como legítima
            </button>
            <button
              onClick={onMarkAsFraud}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <AlertTriangle className="w-5 h-5" />
              Marcar como fraude
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
