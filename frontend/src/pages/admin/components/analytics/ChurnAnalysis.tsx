/**
 * ============================================
 * CHURN ANALYSIS
 * ============================================
 * 
 * Componente de análise de churn
 * 
 * @module ChurnAnalysis
 * @since v31.0
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { ChurnMetrics } from '../../../../types/analytics';

interface ChurnAnalysisProps {
  churnMetrics: ChurnMetrics;
  retentionData?: {
    months: number[];
    retentionRates: number[];
    churnRates: number[];
  };
  isLoading?: boolean;
  height?: number;
}

export const ChurnAnalysis: React.FC<ChurnAnalysisProps> = ({
  churnMetrics,
  retentionData,
  isLoading = false,
  height = 300,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Carregando análise...</p>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico de retenção
  let chartData: any[] = [];
  if (retentionData && retentionData.months.length > 0) {
    chartData = retentionData.months.map((month, index) => ({
      mes: `${month}m`,
      retencao: retentionData.retentionRates[index] || 0,
      churn: retentionData.churnRates[index] || 0,
      sobreviventes: retentionData.survivingClients[index] || 0,
    }));
  }

  // Se não houver dados de retenção, usar dados estáticos
  if (chartData.length === 0) {
    const months = ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m'];
    const retentionBase = 100 - churnMetrics.churnRate;
    chartData = months.map((month, index) => ({
      mes: month,
      retencao: Math.max(retentionBase - (churnMetrics.churnRate * (index + 1) * 0.3), 0),
      churn: Math.min(churnMetrics.churnRate + (churnMetrics.churnRate * index * 0.1), 100),
      sobreviventes: Math.floor(churnMetrics.totalActive * (1 - (churnMetrics.churnRate / 100) * (index + 1))),
    }));
  }

  // 🔴 CORRIGIDO: Métricas de resumo com nomes amigáveis
  const metrics = [
    {
      // 🔴 CORRIGIDO: "Churn Rate" → "Clientes que saíram"
      label: 'Clientes que saíram',
      value: `${churnMetrics.churnRate.toFixed(1)}%`,
      color: churnMetrics.churnRate > 10 ? '#EF4444' : '#10B981',
    },
    {
      // 🔴 CORRIGIDO: "Retenção" → "Clientes que ficaram"
      label: 'Clientes que ficaram',
      value: `${churnMetrics.retentionRate.toFixed(1)}%`,
      color: churnMetrics.retentionRate > 80 ? '#10B981' : '#F59E0B',
    },
    {
      label: 'Tempo Médio',
      value: `${churnMetrics.averageLifetimeMonths.toFixed(0)} meses`,
      color: '#3B82F6',
    },
    {
      label: 'Clientes Ativos',
      value: churnMetrics.totalActive,
      color: '#8B5CF6',
    },
  ];

  return (
    <div>
      {/* Métricas resumidas */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center"
          >
            <p className="text-xs text-gray-500">{metric.label}</p>
            <p className="text-lg font-bold" style={{ color: metric.color }}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico de retenção */}
      {chartData.length > 0 && (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="retencao"
                // 🔴 CORRIGIDO: "Retenção" → "Clientes que ficaram"
                name="Clientes que ficaram"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="churn"
                // 🔴 CORRIGIDO: "Churn" → "Clientes que saíram"
                name="Clientes que saíram"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444' }}
              />
              <Area
                type="monotone"
                dataKey="retencao"
                name="Área de Retenção"
                fill="#10B98120"
                stroke="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChurnAnalysis;