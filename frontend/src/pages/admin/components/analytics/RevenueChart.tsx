/**
 * ============================================
 * REVENUE CHART
 * ============================================
 * 
 * Componente de gráfico de receita mensal usando Recharts
 * 
 * @module RevenueChart
 * @since v31.0
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { RevenueByPeriod } from '../../../../types/analytics';
import { formatCurrency } from '../../../../utils/helpers';

interface RevenueChartProps {
  data: RevenueByPeriod[];
  isLoading?: boolean;
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  isLoading = false,
  height = 300,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Carregando gráfico...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">Nenhum dado de receita disponível</p>
        </div>
      </div>
    );
  }

  // Formatar os dados para o gráfico
  const chartData = data.map((item) => ({
    mes: item.period,
    receita: item.total,
  }));

  // Formatar valor para tooltip
  const formatTooltip = (value: number) => {
    return formatCurrency(value);
  };

  // Cores MRS
  const colors = {
    primary: '#122A40',
    secondary: '#1E5359',
    accent: '#30736C',
    background: '#F2F2F2',
  };

  return (
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
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            formatter={(value: number) => [formatTooltip(value), 'Receita']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Bar
            dataKey="receita"
            name="Receita Mensal"
            fill={colors.accent}
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
          <Area
            type="monotone"
            dataKey="receita"
            name="Tendência"
            stroke={colors.primary}
            fill={`${colors.primary}20`}
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;