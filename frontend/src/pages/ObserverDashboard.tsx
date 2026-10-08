// frontend/src/pages/ObserverDashboard.tsx
// ============================================================
// 🆕 v52.1 — DASHBOARD DO OBSERVADOR
// ============================================================
//
// MOTIVO:
//   O role observer precisa de uma tela própria após o login,
//   com:
//     - Planos que ele acompanha como observador (team.observers[])
//     - Atalho em MODO SOMENTE LEITURA para visualizar a auditoria
//     - Atalho para o dashboard de maturidade (somente leitura)
//
// DIFERENÇA EM RELAÇÃO AOS DEMAIS DASHBOARDS:
//   - O observador NÃO executa auditoria (isso é papel do auditor).
//   - O observador NÃO aprova planos (isso é papel do lead).
//   - O observador APENAS VISUALIZA em modo somente leitura.
//   - NÃO há botões de ação (Aprovar, Rejeitar, Executar).
//
// DECISÕES DE DESIGN:
//   - Reaproveita o padrão visual dos demais dashboards.
//   - Botão "Voltar" no topo (Compromisso C10).
//   - KPIs calculados no frontend a partir dos planos.
//   - 1 mini-gráfico Recharts (Donut de status).
//   - Lista detalhada com ação única "Visualizar" (modo leitura).
//   - Banner informativo "Modo Somente Leitura" no topo da lista.
//
// SEGURANÇA:
//   - companyId e userId sempre vêm do AuthContext (token).
//   - Backend filtra por ambos, garantindo isolamento.
//
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  Eye,
  ClipboardCheck,
  CheckCircle2,
  FileText,
  BarChart3,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  LogOut,
  Activity,
  Clock,
  User as UserIcon,
  RefreshCw,
  BookOpen,
  Lock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

// ============================================================
// IMPORTS DE UI
// ============================================================
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';

// ============================================================
// IMPORTS DE HOOKS DO MÓDULO DE AUDITORIA
// ============================================================
import { useObserverPlans } from '../modules/audit/hooks/useAudit.js';

// ============================================================
// IMPORTS DE TIPOS
// ============================================================
import type { AuditPlan } from '../modules/audit/types/audit.types.js';

// ============================================================
// PALETA DE CORES PARA GRÁFICOS
// ============================================================

const STATUS_COLORS: Record<string, string> = {
  draft: '#9CA3AF',              // gray-400
  pending_approval: '#FBBF24',   // amber-400
  approved: '#3B82F6',           // blue-500
  in_progress: '#8B5CF6',        // violet-500
  completed: '#10B981',          // emerald-500
  rejected: '#EF4444',           // red-500
  cancelled: '#6B7280',          // gray-500
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const ObserverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // ESTADO LOCAL
  // ============================================================

  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================================
  // QUERIES — VIA HOOKS DO MÓDULO DE AUDITORIA
  // ============================================================

  const {
    data: observedPlans = [],
    isLoading: isLoadingObservedPlans,
    error: errorObservedPlans,
    refetch: refetchObservedPlans,
  } = useObserverPlans();

  // ============================================================
  // KPIs — CALCULADOS NO FRONTEND
  // ============================================================

  const kpis = useMemo(() => {
    const totalPlans = observedPlans.length;
    const inProgress = observedPlans.filter(
      (p) => p.status === 'in_progress'
    ).length;
    const completed = observedPlans.filter(
      (p) => p.status === 'completed'
    ).length;
    const activeOrCompleted = observedPlans.filter(
      (p) => p.status === 'in_progress' || p.status === 'completed'
    ).length;
    const averageProgress =
      activeOrCompleted > 0
        ? Math.round((completed / activeOrCompleted) * 100)
        : 0;

    return {
      totalPlans,
      inProgress,
      completed,
      averageProgress,
    };
  }, [observedPlans]);

  // ============================================================
  // DISTRIBUIÇÃO DE STATUS (DONUT)
  // ============================================================

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const plan of observedPlans) {
      counts[plan.status] = (counts[plan.status] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([status, count]) => ({
        status,
        label: STATUS_LABELS[status] || status,
        count,
        color: STATUS_COLORS[status] || '#9CA3AF',
      }))
      .sort((a, b) => b.count - a.count);
  }, [observedPlans]);

  // ============================================================
  // HANDLERS — NAVEGAÇÃO
  // ============================================================

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToMyPlans = () => {
    navigate('/rep/audit/plans');
  };

  const handleGoToMaturity = () => {
    navigate('/rep/dashboard');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleViewPlan = (planId: string) => {
    // Modo somente leitura: vai para a tela de execução
    // que deve detectar o role observer e desabilitar inputs.
    navigate(`/rep/audit/execution/${planId}`);
  };

  const handleViewDetails = (planId: string) => {
    navigate(`/rep/audit/plans/${planId}`);
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refetchObservedPlans();
      toast.success('Dados atualizados');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ============================================================
  // HELPERS DE FORMATAÇÃO
  // ============================================================

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-violet-100 text-violet-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ============================================================
  // LOADING STATE INICIAL
  // ============================================================

  const isInitialLoading = isLoadingObservedPlans;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando painel do observador...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================================================== */}
      {/* HEADER STICKY                                          */}
      {/* ====================================================== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-900">
              Code_Assessment
            </span>
            <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Observador
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* ====================================================== */}
        {/* BREADCRUMB + VOLTAR                                    */}
        {/* ====================================================== */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1"
            aria-label="Atualizar dados"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>

        {/* ====================================================== */}
        {/* TÍTULO                                                  */}
        {/* ====================================================== */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Painel do Observador
            </h1>
            <p className="text-gray-600 mt-1">
              Acompanhe as auditorias em modo somente leitura
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* BANNER — MODO SOMENTE LEITURA                           */}
        {/* ====================================================== */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Modo Somente Leitura
            </p>
            <p className="text-sm text-blue-700 mt-0.5">
              Como observador, você pode visualizar todas as auditorias em que
              foi designado, mas não pode executar, aprovar ou modificar
              planos. Todas as ações são restritas aos papéis de Auditor
              Líder, Auditor e Preposto.
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* KPIs                                                    */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI 1 — Planos que Observo */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Planos que Observo</p>
                  {isLoadingObservedPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">
                      {kpis.totalPlans}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 2 — Em Execução */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Em Execução</p>
                  {isLoadingObservedPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-violet-600">
                      {kpis.inProgress}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-violet-100 rounded-lg">
                  <Activity className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 3 — Concluídos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Concluídos</p>
                  {isLoadingObservedPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-emerald-600">
                      {kpis.completed}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 4 — Progresso Médio */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Progresso Médio</p>
                  {isLoadingObservedPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">
                      {kpis.averageProgress}%
                    </p>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================== */}
        {/* MINI-GRÁFICO — DONUT                                    */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Distribuição de Planos por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusDistribution.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Nenhum plano para exibir.
                </div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        label={(entry: any) =>
                          `${entry.label}: ${entry.count}`
                        }
                        labelLine={false}
                      >
                        {statusDistribution.map((entry) => (
                          <Cell
                            key={`cell-${entry.status}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          value,
                          name,
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card informativo — Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Sobre o Papel de Observador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Visualizar auditorias
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Acompanhe o progresso de todas as auditorias em que foi
                      designado como observador.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Acompanhar resultados
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Veja o andamento das auditorias e as conclusões finais
                      em tempo real.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Lock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Sem permissão de edição
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ações de execução, aprovação e modificação são
                      restritas a outros papéis.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================== */}
        {/* CARDS DE NAVEGAÇÃO                                      */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Card 1 — Visualizar Auditorias */}
          <div
            onClick={handleGoToMyPlans}
            className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Visualizar
                </p>
                <p className="text-lg font-bold text-blue-900">
                  Auditorias
                </p>
                {kpis.inProgress > 0 && (
                  <span className="inline-block mt-1 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {kpis.inProgress} em andamento
                  </span>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 2 — Dashboard de Maturidade */}
          <div
            onClick={handleGoToMaturity}
            className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Analisar
                </p>
                <p className="text-lg font-bold text-emerald-900">
                  Maturidade
                </p>
                <span className="inline-block mt-1 text-xs font-medium text-emerald-600">
                  Somente leitura
                </span>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <LayoutDashboard className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 3 — Meu Perfil */}
          <div
            onClick={handleGoToProfile}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ver
                </p>
                <p className="text-lg font-bold text-gray-900">
                  Meu Perfil
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* LISTA: PLANOS QUE OBSERVO                               */}
        {/* ====================================================== */}
        <Card id="observed-plans-list">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Planos que Observo
                {kpis.totalPlans > 0 && (
                  <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {kpis.totalPlans}
                  </span>
                )}
              </CardTitle>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Somente leitura
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Erro */}
            {errorObservedPlans ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 mb-4">
                  Erro ao carregar planos.
                </p>
                <Button onClick={() => refetchObservedPlans()}>
                  Tentar novamente
                </Button>
              </div>
            ) : isLoadingObservedPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">
                  Carregando planos...
                </span>
              </div>
            ) : observedPlans.length === 0 ? (
              <EmptyState
                icon={<Eye className="h-12 w-12 text-gray-400" />}
                title="Nenhum plano para observar"
                description="Você ainda não foi designado como observador em nenhum plano. Aguarde o convite do Auditor Líder."
              />
            ) : (
              <div className="space-y-3">
                {observedPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Coluna esquerda — Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {plan.code}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(
                              plan.status
                            )}`}
                          >
                            {STATUS_LABELS[plan.status] || plan.status}
                          </span>
                          <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Leitura
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {plan.title}
                        </h3>
                        {plan.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {plan.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Período: {formatDate(plan.period?.startDate)} —{' '}
                            {formatDate(plan.period?.endDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {plan.scope?.controls?.length || 0} controle
                            {(plan.scope?.controls?.length || 0) !== 1
                              ? 's'
                              : ''}
                          </span>
                        </div>
                      </div>

                      {/* Coluna direita — Ações */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleViewPlan(plan._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ObserverDashboard;