import React, { useState } from 'react';
import { Activity, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { TransactionsChart } from './TransactionsChart';
import { TransactionsTable, Transaction } from './TransactionsTable';
import { TransactionDetail } from './TransactionDetail';
import { NotificationAlert } from '../NotificationAlert';

// Mock data para el gráfico
const chartData = [
  { time: '08:00', normales: 145, sospechosas: 3 },
  { time: '09:00', normales: 198, sospechosas: 5 },
  { time: '10:00', normales: 223, sospechosas: 8 },
  { time: '11:00', normales: 267, sospechosas: 12 },
  { time: '12:00', normales: 189, sospechosas: 7 },
  { time: '13:00', normales: 156, sospechosas: 4 },
  { time: '14:00', normales: 234, sospechosas: 15 },
  { time: '15:00', normales: 278, sospechosas: 9 },
];

// Mock data para transacciones
const mockTransactions: Transaction[] = [
  {
    id: 'TXN-2025-0001',
    hora: '15:23:45',
    monto: 8500.00,
    scoreRiesgo: 87,
    clasificacion: 'Sospechosa',
    estado: 'Pendiente',
  },
  {
    id: 'TXN-2025-0002',
    hora: '15:18:12',
    monto: 125.50,
    scoreRiesgo: 15,
    clasificacion: 'Normal',
    estado: 'Confirmado',
  },
  {
    id: 'TXN-2025-0003',
    hora: '15:12:33',
    monto: 1850.00,
    scoreRiesgo: 72,
    clasificacion: 'Sospechosa',
    estado: 'Rechazado',
  },
  {
    id: 'TXN-2025-0004',
    hora: '15:05:21',
    monto: 450.00,
    scoreRiesgo: 25,
    clasificacion: 'Normal',
    estado: 'Confirmado',
  },
  {
    id: 'TXN-2025-0005',
    hora: '14:58:09',
    monto: 3200.00,
    scoreRiesgo: 65,
    clasificacion: 'Sospechosa',
    estado: 'Pendiente',
  },
  {
    id: 'TXN-2025-0006',
    hora: '14:45:32',
    monto: 89.99,
    scoreRiesgo: 8,
    clasificacion: 'Normal',
    estado: 'Confirmado',
  },
  {
    id: 'TXN-2025-0007',
    hora: '14:32:18',
    monto: 5600.00,
    scoreRiesgo: 78,
    clasificacion: 'Sospechosa',
    estado: 'Pendiente',
  },
  {
    id: 'TXN-2025-0008',
    hora: '14:28:55',
    monto: 220.00,
    scoreRiesgo: 12,
    clasificacion: 'Normal',
    estado: 'Confirmado',
  },
];

export function DashboardScreen() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  const handleMarkAsFraud = () => {
    if (selectedTransaction) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === selectedTransaction.id 
            ? { ...t, estado: 'Rechazado' as const, clasificacion: 'Sospechosa' as const }
            : t
        )
      );
      setSelectedTransaction(null);
    }
  };

  const handleMarkAsLegitimate = () => {
    if (selectedTransaction) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === selectedTransaction.id 
            ? { ...t, estado: 'Confirmado' as const, clasificacion: 'Normal' as const }
            : t
        )
      );
      setSelectedTransaction(null);
    }
  };

  const handleNotificationConfirm = () => {
    setShowNotification(false);
    setTransactions(prev => 
      prev.map((t, idx) => 
        idx === 0 ? { ...t, estado: 'Confirmado' as const, clasificacion: 'Normal' as const } : t
      )
    );
  };

  const handleNotificationReject = () => {
    setShowNotification(false);
    setTransactions(prev => 
      prev.map((t, idx) => 
        idx === 0 ? { ...t, estado: 'Rechazado' as const } : t
      )
    );
  };

  // Calcular métricas
  const totalTransactions = 2847;
  const suspiciousTransactions = transactions.filter(t => t.clasificacion === 'Sospechosa').length;
  const confirmedFraud = transactions.filter(t => t.estado === 'Rechazado').length;
  const fraudRate = ((confirmedFraud / totalTransactions) * 100).toFixed(2);
  const modelAccuracy = 94.7;

  return (
    <div className="space-y-6">
      {/* Header con indicador de estado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              Dashboard de Monitoreo en Tiempo Real
            </h2>
            <p className="text-gray-600">
              Sistema de detección de fraude mediante inteligencia artificial
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700">
              Sistema Activo
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricsCard
          title="Total Transacciones Hoy"
          value={totalTransactions.toLocaleString('es-PE')}
          icon={<Activity className="w-6 h-6" />}
          color="blue"
          trend={{ value: '+12.5% vs ayer', isPositive: true }}
        />
        <MetricsCard
          title="Transacciones Sospechosas"
          value={suspiciousTransactions}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          trend={{ value: '+3 en última hora', isPositive: false }}
        />
        <MetricsCard
          title="Fraudes Confirmados"
          value={confirmedFraud}
          icon={<Shield className="w-6 h-6" />}
          color="red"
        />
        <MetricsCard
          title="Tasa de Fraude"
          value={`${fraudRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="gray"
        />
        <MetricsCard
          title="Precisión del Modelo IA"
          value={`${modelAccuracy}%`}
          icon={<Activity className="w-6 h-6" />}
          color="green"
          trend={{ value: 'AUPRC Score', isPositive: true }}
        />
      </div>

      {/* Chart */}
      <TransactionsChart data={chartData} />

      {/* Transactions Table */}
      <TransactionsTable 
        transactions={transactions} 
        onViewDetail={handleViewDetail}
      />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={handleCloseDetail}
          onMarkAsFraud={handleMarkAsFraud}
          onMarkAsLegitimate={handleMarkAsLegitimate}
        />
      )}

      {/* Notification Alert */}
      {showNotification && (
        <NotificationAlert
          monto={850.00}
          onConfirm={handleNotificationConfirm}
          onReject={handleNotificationReject}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}
