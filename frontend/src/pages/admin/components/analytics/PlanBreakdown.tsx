/**
 * ============================================
 * PLAN BREAKDOWN
 * ============================================
 * 
 * Componente de gráfico de distribuição por plano
 * 
 * @module PlanBreakdown
 * @since v31.0
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PlanDistribution } from '../../../../types/analytics';
import { formatCurrency } from '../../../../utils/helpers';

interface PlanBreakdownProps {
  data: PlanDistribution[];
  revenueByPlan?: {
    planName: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  isLoading?: boolean;
  height?: number;
}

export const PlanBreakdown: React.FC<PlanBreakdownProps> = ({
  data,
  revenueByPlan,
  isLoading = false,
  height = 300,
}) => {
  // 🔴 CORRIGIDO: Removida duplicata 'Enterprise'
  const planColors: Record<string, string> = {
    'Básico': '#6B7280',
    'Profissional': '#3B82F6',
    'Enterprise': '#8B5CF6',
    'Basic': '#6B7280',
    'Pro': '#3B82F6',
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Carregando distribuição...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">Nenhum dado de plano disponível</p>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico de pizza
  const chartData = data.map((item) => ({
    name: item.planName,
    value: item.count,
    percentage: item.percentage,
  }));

  // Se tiver dados de receita, usar para tooltip
  const revenueMap: Record<string, number> = {};
  if (revenueByPlan) {
    revenueByPlan.forEach((item) => {
      revenueMap[item.planName] = item.total;
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const revenue = revenueMap[data.name] || 0;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Empresas: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentual: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
          {revenue > 0 && (
            <p className="text-sm text-gray-600">
              Receita: <span className="font-semibold">{formatCurrency(revenue)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={planColors[entry.name] || '#6B7280'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlanBreakdown;