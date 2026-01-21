import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  time: string;
  normales: number;
  sospechosas: number;
}

interface TransactionsChartProps {
  data: ChartDataPoint[];
}

export function TransactionsChart({ data }: TransactionsChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Detección de anomalías en tiempo real
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="normales" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Transacciones Normales"
            dot={{ fill: '#10b981', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="sospechosas" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Transacciones Sospechosas"
            dot={{ fill: '#ef4444', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
