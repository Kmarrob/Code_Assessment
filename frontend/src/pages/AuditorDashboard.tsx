// frontend/src/pages/AuditorDashboard.tsx
// ============================================================
// 🆕 v52.1 — DASHBOARD DO AUDITOR
// ============================================================
//
// MOTIVO:
//   O role auditor precisa de uma tela própria após o login,
//   com:
//     - Planos em que ele participa como auditor (team.auditors[])
//     - Atalho direto para executar a auditoria de cada plano
//     - Relatórios de auditoria que ele participa
//     - Atalho para o dashboard de maturidade (somente leitura)
//     - Acesso aos documentos da empresa
//
// DIFERENÇA EM RELAÇÃO AO AUDITOR LÍDER:
//   - O auditor NÃO aprova planos (isso é papel do lead).
//   - O foco é EXECUTAR a auditoria (checklists, evidências).
//   - A lista principal é de planos EM EXECUÇÃO, não de aprovações.
//
// DECISÕES DE DESIGN:
//   - Reaproveita o padrão visual do RepDashboard / AuditorLeadDashboard.
//   - Botão "Voltar" no topo (Compromisso C10).
//   - KPIs calculados no frontend a partir dos planos.
//   - 2 mini-gráficos Recharts (Donut de status + Barras de checklists).
//   - Lista detalhada com ação principal "Executar Auditoria".
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
  UserCheck,
  ClipboardCheck,
  CheckCircle2,
  Eye,
  FileText,
  BarChart3,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  LogOut,
  Activity,
  Clock,
  FolderOpen,
  User as UserIcon,
  RefreshCw,
  Play,
  Target,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
import {
  useAuditorPlans,
  useReports,
  useChecklistStats,
} from '../modules/audit/hooks/useAudit.js';

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

export const AuditorDashboard: React.FC = () => {
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
    data: myPlans = [],
    isLoading: isLoadingMyPlans,
    error: errorMyPlans,
    refetch: refetchMyPlans,
  } = useAuditorPlans();

  const {
    data: reports = [],
    isLoading: isLoadingReports,
  } = useReports();

  // ============================================================
  // KPIs — CALCULADOS NO FRONTEND
  // ============================================================

  const kpis = useMemo(() => {
    const totalPlans = myPlans.length;
    const inProgress = myPlans.filter(
      (p) => p.status === 'in_progress'
    ).length;
    const completed = myPlans.filter(
      (p) => p.status === 'completed'
    ).length;
    const activeOrCompleted = myPlans.filter(
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
  }, [myPlans]);

  // ============================================================
  // DISTRIBUIÇÃO DE STATUS (DONUT)
  // ============================================================

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const plan of myPlans) {
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
  }, [myPlans]);

  // ============================================================
  // STATUS DOS CHECKLISTS (BARRAS)
  // ============================================================
  //
  // NOTA:
  //   Este gráfico é um resumo visual de quantos planos
  //   estão em cada estágio. Quando o endpoint agregado
  //   estiver disponível, substituiremos por dados
  //   detalhados de checklists.
  //
  const checklistBarData = useMemo(() => {
    return [
      {
        status: 'Aprovados',
        total: myPlans.filter((p) => p.status === 'approved').length,
        fill: '#3B82F6',
      },
      {
        status: 'Em Execução',
        total: myPlans.filter((p) => p.status === 'in_progress').length,
        fill: '#8B5CF6',
      },
      {
        status: 'Concluídos',
        total: myPlans.filter((p) => p.status === 'completed').length,
        fill: '#10B981',
      },
    ];
  }, [myPlans]);

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

  const handleGoToReports = () => {
    navigate('/rep/audit/reports');
  };

  const handleGoToMaturity = () => {
    navigate('/rep/dashboard');
  };

  const handleGoToDocuments = () => {
    navigate('/rep/documents');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleExecutePlan = (planId: string) => {
    // Atalho direto para a execução da auditoria
    navigate(`/rep/audit/execution/${planId}`);
  };

  const handleViewDetails = (planId: string) => {
    navigate(`/rep/audit/plans/${planId}`);
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refetchMyPlans();
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

  const isInitialLoading = isLoadingMyPlans;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando painel do auditor...</p>
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
            <UserCheck className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-900">
              Code_Assessment
            </span>
            <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Auditor
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
              Painel do Auditor
            </h1>
            <p className="text-gray-600 mt-1">
              Execute auditorias, preencha checklists e anexe evidências
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* KPIs                                                    */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI 1 — Planos que Participo */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Planos que Participo</p>
                  {isLoadingMyPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">
                      {kpis.totalPlans}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
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
                  {isLoadingMyPlans ? (
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
                  {isLoadingMyPlans ? (
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
                  {isLoadingMyPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">
                      {kpis.averageProgress}%
                    </p>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================== */}
        {/* MINI-GRÁFICOS                                           */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Donut — Distribuição por Status */}
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

          {/* Barras — Status dos Planos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-violet-600" />
                Status dos Meus Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={checklistBarData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="status"
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      formatter={(value: any) => [value, 'Planos']}
                    />
                    <Bar
                      dataKey="total"
                      fill="#8B5CF6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================== */}
        {/* CARDS DE NAVEGAÇÃO                                      */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Card 1 — Executar Auditoria */}
          <div
            onClick={handleGoToMyPlans}
            className="bg-white border-2 border-violet-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-600">
                  Executar
                </p>
                <p className="text-lg font-bold text-violet-900">
                  Minhas Auditorias
                </p>
                {kpis.inProgress > 0 && (
                  <span className="inline-block mt-1 text-xs font-semibold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                    {kpis.inProgress} em andamento
                  </span>
                )}
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <ClipboardCheck className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </div>

          {/* Card 2 — Relatórios */}
          <div
            onClick={handleGoToReports}
            className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Visualizar
                </p>
                <p className="text-lg font-bold text-emerald-900">
                  Relatórios
                </p>
                {reports.length > 0 && (
                  <span className="inline-block mt-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {reports.length} relatório
                    {reports.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 3 — Dashboard de Maturidade */}
          <div
            onClick={handleGoToMaturity}
            className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Analisar
                </p>
                <p className="text-lg font-bold text-blue-900">
                  Maturidade
                </p>
                <span className="inline-block mt-1 text-xs font-medium text-blue-600">
                  Somente leitura
                </span>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 4 — Documentos */}
          <div
            onClick={handleGoToDocuments}
            className="bg-white border-2 border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Gerenciar
                </p>
                <p className="text-lg font-bold text-indigo-900">
                  Documentos
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Card 5 — Meu Perfil */}
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
        {/* LISTA: PLANOS QUE PARTICIPO                             */}
        {/* ====================================================== */}
        <Card id="my-plans-list">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-violet-600" />
                Planos em que Participo
                {kpis.totalPlans > 0 && (
                  <span className="ml-2 text-xs font-semibold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                    {kpis.totalPlans}
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Erro */}
            {errorMyPlans ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 mb-4">
                  Erro ao carregar planos.
                </p>
                <Button onClick={() => refetchMyPlans()}>
                  Tentar novamente
                </Button>
              </div>
            ) : isLoadingMyPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">
                  Carregando planos...
                </span>
              </div>
            ) : myPlans.length === 0 ? (
              <EmptyState
                icon={
                  <ClipboardCheck className="h-12 w-12 text-gray-400" />
                }
                title="Nenhum plano de auditoria"
                description="Você ainda não foi designado como auditor em nenhum plano. Aguarde o convite do Auditor Líder."
              />
            ) : (
              <div className="space-y-3">
                {myPlans.map((plan) => {
                  const isExecutable =
                    plan.status === 'in_progress' ||
                    plan.status === 'approved';

                  return (
                    <div
                      key={plan._id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
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
                          {isExecutable ? (
                            <Button
                              size="sm"
                              className="bg-violet-600 hover:bg-violet-700 text-white"
                              onClick={() => handleExecutePlan(plan._id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Executar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(plan._id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AuditorDashboard;