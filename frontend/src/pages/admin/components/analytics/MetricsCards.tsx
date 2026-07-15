/**
 * ============================================
 * METRICS CARDS
 * ============================================
 * 
 * Componente que exibe cards com métricas principais
 * do sistema de analytics.
 * 
 * @module MetricsCards
 * @since v30.0
 */

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  UserX,
  Clock,
  Percent,
  Calendar
} from 'lucide-react';
import { RevenueMetrics, FunnelMetrics, ChurnMetrics } from '../../../../types/analytics';

interface MetricsCardsProps {
  revenue?: RevenueMetrics;
  funnel?: FunnelMetrics;
  churn?: ChurnMetrics;
  isLoading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`rounded-lg border p-4 ${colorClass} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs opacity-70">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
              <span className="text-xs opacity-70">vs período anterior</span>
            </div>
          )}
        </div>
        <div className="rounded-full bg-white p-2 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  revenue,
  funnel,
  churn,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border bg-gray-50 p-4"
          />
        ))}
      </div>
    );
  }

  const cards: MetricCardProps[] = [];

  // Card de Receita Total
  if (revenue) {
    cards.push({
      title: 'Receita Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(revenue.totalRevenue),
      subtitle: `MRR: ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(revenue.mrr)}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'green',
      trend: revenue.growthPercent !== 0 ? {
        value: revenue.growthPercent,
        isPositive: revenue.growthPercent >= 0
      } : undefined
    });

    // Card de ARPU
    cards.push({
      title: 'ARPU Médio',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(revenue.arpu),
      subtitle: `${revenue.revenueByPlan?.length || 0} planos ativos`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'blue'
    });
  }

  // Card de Conversão
  if (funnel) {
    cards.push({
      title: 'Taxa de Conversão',
      value: `${funnel.conversionRate.toFixed(1)}%`,
      subtitle: `${funnel.convertedToPaid} conversões de ${funnel.totalRegistrations} cadastros`,
      icon: <Users className="h-5 w-5" />,
      color: 'purple'
    });
  }

  // Card de Churn
  if (churn) {
    cards.push({
      title: 'Taxa de Churn',
      value: `${churn.churnRate.toFixed(1)}%`,
      subtitle: `${churn.totalChurned} clientes desistiram`,
      icon: <UserX className="h-5 w-5" />,
      color: churn.churnRate > 10 ? 'red' : 'yellow'
    });

    // Card de Retenção
    cards.push({
      title: 'Clientes Ativos',
      value: churn.totalActive,
      subtitle: `${churn.totalClients} total de clientes`,
      icon: <UserCheck className="h-5 w-5" />,
      color: churn.retentionRate > 80 ? 'emerald' : 'yellow'
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  );
};

export default MetricsCards;