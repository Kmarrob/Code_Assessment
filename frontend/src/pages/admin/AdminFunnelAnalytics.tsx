/**
 * ============================================
 * ADMIN FUNNEL ANALYTICS PAGE
 * ============================================
 * 
 * Página principal do sistema de funil de conversão
 * na área administrativa.
 * 
 * @module AdminFunnelAnalytics
 * @since v30.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  RefreshCw, 
  AlertCircle,
  BarChart3,
  Users,
  DollarSign,
  UserX,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { AdminBreadcrumbs } from '../../components/admin/AdminBreadcrumbs.js';
import { AdminMetaTags } from '../../components/admin/AdminMetaTags.js';
import { 
  MetricsCards,
  PeriodSelector,
  ExportButton
} from '../admin/components/analytics/index.js';
import { analyticsService } from '../../services/analytics.service.js';
import { 
  AnalyticsPeriod, 
  AnalyticsSummary,
  FunnelStatusLabels,
  FunnelStatusColors
} from '../../types/analytics';
import { useAuth } from '../../contexts/AuthContext.js';
import { UserRole } from '../../types/index.js';

// ============================================
// COMPONENTES DE CARREGAMENTO
// ============================================

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
    </div>
  </div>
);

// ============================================
// COMPONENTES DE ESTATÍSTICAS RÁPIDAS
// ============================================

interface QuickStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTES DE GRÁFICOS (PLACEHOLDER)
// ============================================

const RevenueChartPlaceholder: React.FC = () => (
  <div className="flex h-64 items-center justify-center text-gray-400">
    <div className="text-center">
      <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-2">Gráfico de Receita</p>
      <p className="text-sm">(Em desenvolvimento - Recharts)</p>
    </div>
  </div>
);

const ConversionFunnelPlaceholder: React.FC = () => (
  <div className="flex h-64 items-center justify-center text-gray-400">
    <div className="text-center">
      <Users className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-2">Funil de Conversão</p>
      <p className="text-sm">(Em desenvolvimento - Visualização)</p>
    </div>
  </div>
);

const PlanBreakdownPlaceholder: React.FC = () => (
  <div className="flex h-64 items-center justify-center text-gray-400">
    <div className="text-center">
      <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-2">Distribuição por Plano</p>
      <p className="text-sm">(Em desenvolvimento - Gráfico)</p>
    </div>
  </div>
);

const ChurnAnalysisPlaceholder: React.FC = () => (
  <div className="flex h-64 items-center justify-center text-gray-400">
    <div className="text-center">
      <UserX className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-2">Análise de Churn</p>
      <p className="text-sm">(Em desenvolvimento - Métricas)</p>
    </div>
  </div>
);

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export const AdminFunnelAnalytics: React.FC = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário é admin (acesso total)
  const isAdmin = user?.role === UserRole.ADMIN;

  // Estado do período
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  // Query para buscar dados
  const { 
    data: summary,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics-summary', period, customStart, customEnd],
    queryFn: async () => {
      const params = {
        period,
        startDate: customStart?.toISOString(),
        endDate: customEnd?.toISOString()
      };
      return analyticsService.getSummary(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    // Só executa a query se o usuário for admin
    enabled: isAdmin
  });

  // Handler para mudança de período
  const handlePeriodChange = useCallback((
    newPeriod: AnalyticsPeriod,
    startDate?: Date,
    endDate?: Date
  ) => {
    setPeriod(newPeriod);
    setCustomStart(startDate);
    setCustomEnd(endDate);
  }, []);

  // Handler para refresh manual
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Extrair métricas para os cards
  const metrics = summary ? {
    totalRevenue: summary.revenue.totalRevenue,
    conversionRate: summary.funnel.conversionRate,
    activeClients: summary.funnel.activeSubscriptions,
    churnRate: summary.churn.churnRate
  } : undefined;

  // 🔴 CORRIGIDO: Verificação de acesso - Admin tem acesso total
  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <div className="rounded-lg bg-yellow-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Acesso Restrito</h2>
            <p className="mt-2 text-gray-600">
              Esta página é exclusiva para administradores do sistema.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Se você é administrador, verifique suas permissões.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se não for admin e estiver carregando, mostra loading
  if (!isAdmin && isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <AdminMetaTags
        title="Funil de Conversão - Code_Assessment"
        description="Análise de conversão, receita e retenção de clientes."
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <AdminBreadcrumbs />
          </nav>

          {/* Header */}
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <TrendingUp className="h-7 w-7 text-violet-600" />
                Funil de Conversão
              </h1>
              <p className="text-sm text-gray-500">
                Análise completa de conversão, receita e retenção de clientes
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PeriodSelector
                value={period}
                onChange={handlePeriodChange}
              />
              <ExportButton
                period={period}
                startDate={customStart}
                endDate={customEnd}
              />
              <button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                aria-label="Atualizar dados"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing || isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </header>

          {/* Loading State */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Erro ao carregar dados</h2>
              <p className="mt-2 text-gray-600">
                {(error as Error)?.message || 'Ocorreu um erro ao carregar os dados. Tente novamente.'}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Tentar novamente
              </button>
            </div>
          ) : summary ? (
            <>
              {/* Metrics Cards */}
              <section className="mb-6">
                <MetricsCards
                  revenue={summary.revenue}
                  funnel={summary.funnel}
                  churn={summary.churn}
                />
              </section>

              {/* Quick Stats Row */}
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <QuickStat
                  label="Período"
                  value={summary.period.label}
                  icon={<Calendar className="h-5 w-5" />}
                  color="blue"
                />
                <QuickStat
                  label="Clientes Ativos"
                  value={summary.funnel.activeSubscriptions}
                  icon={<Users className="h-5 w-5" />}
                  color="green"
                  subtitle={`${summary.funnel.totalRegistrations} cadastros`}
                />
                <QuickStat
                  label="Ticket Médio"
                  value={new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(summary.funnel.averageTicket)}
                  icon={<DollarSign className="h-5 w-5" />}
                  color="purple"
                />
                <QuickStat
                  label="Churn Rate"
                  value={`${summary.churn.churnRate.toFixed(1)}%`}
                  icon={<UserX className="h-5 w-5" />}
                  color={summary.churn.churnRate > 10 ? 'red' : 'yellow'}
                  subtitle={`${summary.churn.totalChurned} desistiram`}
                />
              </section>

              {/* Charts Row 1 */}
              <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RevenueChartPlaceholder />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Funil de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ConversionFunnelPlaceholder />
                  </CardContent>
                </Card>
              </section>

              {/* Charts Row 2 */}
              <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Plano</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlanBreakdownPlaceholder />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Churn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChurnAnalysisPlaceholder />
                  </CardContent>
                </Card>
              </section>

              {/* Status Distribution */}
              <section className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Status dos Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                      {summary.statusDistribution.map((status) => (
                        <div
                          key={status.status}
                          className="rounded-lg border p-3 text-center"
                          style={{ borderColor: status.color + '40' }}
                        >
                          <div
                            className="mx-auto h-3 w-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {status.count}
                          </p>
                          <p className="text-xs text-gray-500">
                            {status.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {status.percentage.toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Recent Clients */}
              {summary.recentClients.length > 0 && (
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle>Últimos Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 text-left">
                              <th className="pb-2 font-medium text-gray-500">Empresa</th>
                              <th className="pb-2 font-medium text-gray-500">Plano</th>
                              <th className="pb-2 font-medium text-gray-500">Status</th>
                              <th className="pb-2 font-medium text-gray-500">Entrada</th>
                              <th className="pb-2 font-medium text-gray-500">Valor</th>
                              <th className="pb-2 font-medium text-gray-500">Usuários</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.recentClients.map((client) => (
                              <tr key={client.id} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 font-medium text-gray-900">
                                  {client.name}
                                </td>
                                <td className="py-2 text-gray-600">{client.planName}</td>
                                <td className="py-2">
                                  <span
                                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{
                                      backgroundColor: FunnelStatusColors[client.funnelStatus] + '20',
                                      color: FunnelStatusColors[client.funnelStatus]
                                    }}
                                  >
                                    {FunnelStatusLabels[client.funnelStatus]}
                                  </span>
                                </td>
                                <td className="py-2 text-gray-600">
                                  {new Date(client.joinedAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-2 text-gray-600">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(client.monthlyValue)}
                                </td>
                                <td className="py-2 text-gray-600">{client.userCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Footer info */}
              <footer className="mt-8 text-center text-xs text-gray-400">
                <p>
                  Dados atualizados em {new Date(summary.generatedAt).toLocaleString('pt-BR')}
                  {' · '}
                  Período: {summary.period.label}
                </p>
                <p className="mt-1">
                  Code_Assessment v30.0 - Sistema de Funil de Conversão
                </p>
              </footer>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default AdminFunnelAnalytics;