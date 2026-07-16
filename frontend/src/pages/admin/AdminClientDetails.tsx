/**
 * ============================================
 * ADMIN CLIENT DETAILS PAGE
 * ============================================
 * 
 * Página de detalhamento completo de um cliente específico.
 * Acessível via /admin/analytics/clients/:clientId
 * 
 * @module AdminClientDetails
 * @since v30.0 (FASE 8)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Users,
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  FileText,
  History,
  Activity,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { AdminBreadcrumbs } from '../../components/admin/AdminBreadcrumbs.js';
import { AdminMetaTags } from '../../components/admin/AdminMetaTags.js';
import { analyticsService } from '../../services/analytics.service.js';
import { ClientDetailsResponse } from '../../services/analytics.service.js';
import { FunnelStatusLabels, FunnelStatusColors } from '../../types/analytics';
import { useAuth } from '../../contexts/AuthContext.js';
import { UserRole } from '../../types/index.js';

// ============================================
// SUBCOMPONENTES
// ============================================

interface InfoCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white p-2 shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium opacity-70">{label}</p>
          <p className="text-lg font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE CARREGAMENTO
// ============================================

const LoadingState: React.FC = () => (
  <div className="flex h-96 items-center justify-center">
    <div className="text-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-4 text-gray-500">Carregando detalhes do cliente...</p>
    </div>
  </div>
);

// ============================================
// COMPONENTE DE ERRO
// ============================================

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-lg bg-red-50 p-8 text-center">
    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
    <h3 className="mt-4 text-lg font-semibold text-red-700">Erro ao carregar dados</h3>
    <p className="mt-2 text-red-600">{message}</p>
    <button
      onClick={onRetry}
      className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Tentar novamente
    </button>
  </div>
);

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export const AdminClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.role === UserRole.ADMIN;

  // Buscar dados do cliente
  const {
    data: clientData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['client-details', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('ID do cliente não fornecido');
      return analyticsService.getClientDetails(clientId);
    },
    enabled: !!clientId && isAdmin,
    retry: 2
  });

  // Verificar acesso
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <div className="rounded-lg bg-yellow-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Acesso Restrito</h2>
            <p className="mt-2 text-gray-600">
              Esta página é exclusiva para administradores do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Voltar para a lista
  const handleBack = () => {
    navigate('/admin/analytics');
  };

  if (isLoading) {
    return (
      <>
        <AdminMetaTags
          title="Detalhes do Cliente - Code_Assessment"
          description="Detalhamento completo do cliente"
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="container mx-auto">
            <LoadingState />
          </div>
        </div>
      </>
    );
  }

  if (error || !clientData) {
    return (
      <>
        <AdminMetaTags
          title="Detalhes do Cliente - Code_Assessment"
          description="Detalhamento completo do cliente"
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="container mx-auto">
            <ErrorState
              message={(error as Error)?.message || 'Cliente não encontrado'}
              onRetry={() => refetch()}
            />
          </div>
        </div>
      </>
    );
  }

  const { client, engagement, payments, planHistory } = clientData;

  // 🔴 CORRIGIDO: Verificar se há pagamentos registrados
  const hasPayments = payments && payments.length > 0;
  const hasPlanHistory = planHistory && planHistory.length > 0;

  return (
    <>
      <AdminMetaTags
        title={`${client.name} - Detalhes do Cliente`}
        description={`Detalhamento completo da empresa ${client.name}`}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <AdminBreadcrumbs />

          {/* Header */}
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                onClick={handleBack}
                className="mb-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Funil de Conversão
              </button>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <Building2 className="h-8 w-8 text-blue-600" />
                {client.name}
              </h1>
              <p className="text-sm text-gray-500">
                {client.document ? `CNPJ: ${client.document} · ` : ''}
                Entrada: {formatDate(client.joinedAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: FunnelStatusColors[client.funnelStatus] + '20',
                  color: FunnelStatusColors[client.funnelStatus]
                }}
              >
                {FunnelStatusLabels[client.funnelStatus]}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {client.planName}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {client.userCount} usuários
              </span>
            </div>
          </header>

          {/* Cards de Informações Rápidas */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Valor Mensal"
              value={formatCurrency(client.monthlyValue)}
              icon={<DollarSign className="h-5 w-5" />}
              color="green"
            />
            <InfoCard
              label="Total Pago"
              value={formatCurrency(client.totalPaid)}
              icon={<CreditCard className="h-5 w-5" />}
              color="blue"
              subtitle={hasPayments ? `${payments.length} pagamentos` : 'Nenhum pagamento registrado'}
            />
            <InfoCard
              label="Usuários"
              value={client.userCount}
              icon={<Users className="h-5 w-5" />}
              color="purple"
            />
            <InfoCard
              label="Tempo de Cliente"
              value={engagement.subscriptionMonths > 0 ? `${engagement.subscriptionMonths} meses` : 'Novo cliente'}
              icon={<Clock className="h-5 w-5" />}
              color="orange"
              subtitle={`${engagement.subscriptionDays} dias`}
            />
          </section>

          {/* Métricas de Engajamento */}
          <section className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Métricas de Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-500">Último Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {engagement.lastLogin ? formatDate(engagement.lastLogin) : 'Nunca'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-500">Usuários Ativos</p>
                    <p className="text-sm font-medium text-gray-900">
                      {client.userCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-500">Dias como Cliente</p>
                    <p className="text-sm font-medium text-gray-900">
                      {engagement.subscriptionDays}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-500">Status da Assinatura</p>
                    <p className="text-sm font-medium text-gray-900">
                      {client.subscriptionStatus === 'active' ? '✅ Ativo' : 
                       client.subscriptionStatus === 'trialing' ? '🔄 Trial' :
                       client.subscriptionStatus === 'cancelled' ? '❌ Cancelado' :
                       client.subscriptionStatus === 'past_due' ? '⚠️ Em atraso' :
                       client.subscriptionStatus || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Histórico de Pagamentos */}
          <section className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  Histórico de Pagamentos
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {hasPayments ? 'Últimos pagamentos realizados pela empresa' : 'Nenhum pagamento registrado ainda'}
                </p>
              </CardHeader>
              <CardContent>
                {hasPayments ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left">
                          <th className="pb-2 font-medium text-gray-500">Data</th>
                          <th className="pb-2 font-medium text-gray-500">Valor</th>
                          <th className="pb-2 font-medium text-gray-500">Método</th>
                          <th className="pb-2 font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 text-gray-600">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="py-2 font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-2 text-gray-600">
                              {payment.method || 'Não informado'}
                            </td>
                            <td className="py-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                payment.status === 'paid' 
                                  ? 'bg-green-100 text-green-700' 
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {payment.status === 'paid' ? '✅ Pago' : 
                                 payment.status === 'pending' ? '⏳ Pendente' : 
                                 payment.status === 'refunded' ? '↩️ Estornado' :
                                 '❌ Falhou'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <CreditCard className="mx-auto h-12 w-12" />
                    <p className="mt-2">Nenhum pagamento registrado</p>
                    <p className="text-xs">Os pagamentos aparecerão aqui quando forem processados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Evolução do Plano */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Evolução do Plano
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {hasPlanHistory ? 'Histórico de mudanças de plano' : 'Nenhuma mudança de plano registrada'}
                </p>
              </CardHeader>
              <CardContent>
                {hasPlanHistory ? (
                  <div className="space-y-4">
                    {planHistory.map((plan, index) => (
                      <div key={index} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{plan.planName}</p>
                          <p className="text-xs text-gray-500">
                            Início: {formatDate(plan.startDate)}
                            {plan.endDate && ` · Fim: ${formatDate(plan.endDate)}`}
                          </p>
                        </div>
                        {index === 0 && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Plano Atual
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <TrendingUp className="mx-auto h-12 w-12" />
                    <p className="mt-2">Nenhuma mudança de plano registrada</p>
                    <p className="text-xs">Plano atual: {client.planName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="mt-8 text-center text-xs text-gray-400">
            <p>
              Dados atualizados em {new Date().toLocaleString('pt-BR')}
            </p>
            <p className="mt-1">
              Code_Assessment v30.0 - Detalhamento de Cliente
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AdminClientDetails;