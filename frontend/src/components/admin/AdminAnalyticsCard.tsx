/**
 * ============================================
 * ADMIN ANALYTICS CARD
 * ============================================
 * 
 * Card de navegação para o Funil de Conversão
 * na área administrativa.
 * 
 * @module AdminAnalyticsCard
 * @since v30.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowRight, 
  Users, 
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';

interface AdminAnalyticsCardProps {
  className?: string;
  metrics?: {
    totalRevenue?: number;
    conversionRate?: number;
    activeClients?: number;
    churnRate?: number;
  };
}

export const AdminAnalyticsCard: React.FC<AdminAnalyticsCardProps> = ({
  className = '',
  metrics
}) => {
  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Link
      to="/admin/analytics"
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300 ${className}`}
    >
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Ícone decorativo */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl" />

      <div className="relative">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Novo
          </div>
        </div>

        {/* Título */}
        <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
          Funil de Conversão
        </h3>
        
        {/* Descrição */}
        <p className="mt-1 text-sm text-gray-500">
          Análise de conversão, receita e retenção de clientes
        </p>

        {/* Métricas rápidas */}
        {metrics && (
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">Receita</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-xs text-gray-500">Conversão</p>
              <p className="text-sm font-semibold text-gray-900">
                {metrics.conversionRate?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Ativos</p>
              <p className="text-sm font-semibold text-gray-900">
                {metrics.activeClients || 0}
              </p>
            </div>
          </div>
        )}

        {/* Seta de ação */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
            Ver análise completa
          </span>
          <div className="rounded-full bg-blue-50 p-1.5 transition-all duration-300 group-hover:bg-blue-100 group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {/* Barra inferior animada */}
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 group-hover:w-full" />
      </div>
    </Link>
  );
};

export default AdminAnalyticsCard;