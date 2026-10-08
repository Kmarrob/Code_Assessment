// frontend/src/pages/AuditorLeadDashboard.tsx
// ============================================================
// 🆕 v52.1 — DASHBOARD DO AUDITOR LÍDER
// ============================================================
//
// MOTIVO:
//   O role auditor_lead precisa de uma tela própria após o
//   login, com:
//     - Planos aguardando sua aprovação (pending_approval)
//     - Planos ativos onde ele é o líder (approved/in_progress)
//     - Relatórios de auditoria que ele participa
//     - Atalho para o dashboard de maturidade (somente leitura)
//
// DECISÕES DE DESIGN:
//   - Reaproveita o padrão visual do RepDashboard (cards,
//     header sticky, modais, cores, tipografia).
//   - Botão "Voltar" no topo (Compromisso C10).
//   - KPIs calculados no frontend a partir dos planos.
//   - 2 mini-gráficos Recharts (Donut de status + Barras de NCs).
//   - Lista detalhada com ações inline (Aprovar/Rejeitar/Ver).
//   - Modais de confirmação para ações destrutivas.
//
// 🔧 v52.5 — CORREÇÃO DE NAVEGAÇÃO:
//   Os 3 handlers de planos/relatórios agora apontam para as
//   rotas /auditor-lead/audit/* (novas), que têm whitelist
//   correta para o role auditor_lead.
//
//   Os cards "Maturidade" e "Documentos" continuam apontando
//   para suas rotas atuais. Serão migrados em rodada futura.
//
// SEGURANÇA:
//   - companyId e userId sempre vêm do AuthContext (token).
//   - Backend filtra por ambos, garantindo isolamento.
//
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  ShieldCheck,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  BarChart3,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  LogOut,
  TrendingUp,
  Clock,
  Activity,
  FolderOpen,
  User as UserIcon,
  RefreshCw,
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
import { Input } from '../components/ui/Input.js';
import { EmptyState } from '../components/ui/EmptyState.js';

// ============================================================
// IMPORTS DE HOOKS DO MÓDULO DE AUDITORIA
// ============================================================
import {
  usePlansToApprove,
  useLeadAuditorPlans,
  useReports,
} from '../modules/audit/hooks/useAudit.js';

// ============================================================
// IMPORTS DE TIPOS
// ============================================================
import type { AuditPlan } from '../modules/audit/types/audit.types.js';

// ============================================================
// PALETA DE CORES PARA GRÁFICOS
// ============================================================
//
// Mapeadas pelo status de auditoria. Mantemos consistência
// visual com as badges de status do sistema.
//
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

export const AuditorLeadDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // ESTADO LOCAL
  // ============================================================

  const [selectedPlanToApprove, setSelectedPlanToApprove] = useState<AuditPlan | null>(null);
  const [selectedPlanToReject, setSelectedPlanToReject] = useState<AuditPlan | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================================
  // QUERIES — VIA HOOKS DO MÓDULO DE AUDITORIA
  // ============================================================

  const {
    data: plansToApprove = [],
    isLoading: isLoadingToApprove,
    error: errorToApprove,
    refetch: refetchToApprove,
  } = usePlansToApprove();

  const {
    data: leadPlans = [],
    isLoading: isLoadingLeadPlans,
    error: errorLeadPlans,
    refetch: refetchLeadPlans,
  } = useLeadAuditorPlans();

  const {
    data: reports = [],
    isLoading: isLoadingReports,
  } = useReports();

  // ============================================================
  // KPIs — CALCULADOS NO FRONTEND
  // ============================================================

  const kpis = useMemo(() => {
    const pendingApproval = plansToApprove.length;
    const activePlans = leadPlans.filter(
      (p) => p.status === 'approved' || p.status === 'in_progress'
    ).length;
    const completedExecutions = leadPlans.filter(
      (p) => p.status === 'completed'
    ).length;
    const totalLeadPlans = leadPlans.length;
    const approvalRate =
      totalLeadPlans > 0
        ? Math.round((completedExecutions / totalLeadPlans) * 100)
        : 0;

    return {
      pendingApproval,
      activePlans,
      completedExecutions,
      approvalRate,
    };
  }, [plansToApprove, leadPlans]);

  // ============================================================
  // DISTRIBUIÇÃO DE STATUS (DONUT)
  // ============================================================

  const statusDistribution = useMemo(() => {
    const allPlans = [...plansToApprove, ...leadPlans];

    // Deduplicar por _id (um plano em pending pode estar em ambas listas?)
    const seen = new Set<string>();
    const unique: AuditPlan[] = [];
    for (const plan of allPlans) {
      if (!seen.has(plan._id)) {
        seen.add(plan._id);
        unique.push(plan);
      }
    }

    const counts: Record<string, number> = {};
    for (const plan of unique) {
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
  }, [plansToApprove, leadPlans]);

  // ============================================================
  // NCs POR DOMÍNIO (BARRAS) — MOCK DATA
  // ============================================================
  //
  // NOTA:
  //   Este gráfico é alimentado por um endpoint futuro de
  //   estatísticas. Por enquanto, exibimos dados zerados
  //   para manter o layout. Quando o backend expor o
  //   `AuditDashboardStats`, substituiremos por dados reais.
  //
  const domainNcData = useMemo(() => {
    return [
      { domain: 'A.5', label: 'Políticas', NC: 0, total: 0 },
      { domain: 'A.6', label: 'Organização', NC: 0, total: 0 },
      { domain: 'A.7', label: 'Pessoas', NC: 0, total: 0 },
      { domain: 'A.8', label: 'Tecnologia', NC: 0, total: 0 },
    ];
  }, []);

  // ============================================================
  // HANDLERS — NAVEGAÇÃO
  // ============================================================
  //
  // 🔧 v52.5 — Os handlers de planos e relatórios apontam
  // para as rotas /auditor-lead/audit/* (novas).
  //
  // Os handlers de Maturidade e Documentos continuam apontando
  // para /rep/* (serão migrados em rodada futura).
  //
  // ============================================================

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBack = () => {
    // Volta para a tela anterior; se não houver histórico,
    // redireciona para o dashboard padrão.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToApprovals = () => {
    // Scroll suave até a lista de planos aguardando aprovação
    const el = document.getElementById('approval-list');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGoToMyPlans = () => {
    // 🔧 v52.5 — Corrigido para a rota do Auditor Líder
    navigate('/auditor-lead/audit/plans');
  };

  const handleGoToReports = () => {
    // 🔧 v52.5 — Corrigido para a rota do Auditor Líder
    navigate('/auditor-lead/audit/reports');
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

  // ============================================================
  // HANDLERS — AÇÕES DE APROVAÇÃO / REJEIÇÃO
  // ============================================================

  const handleOpenApprove = (plan: AuditPlan) => {
    setSelectedPlanToApprove(plan);
    setSelectedPlanToReject(null);
  };

  const handleOpenReject = (plan: AuditPlan) => {
    setSelectedPlanToReject(plan);
    setSelectedPlanToApprove(null);
    setRejectionReason('');
  };

  const handleConfirmApprove = async () => {
    if (!selectedPlanToApprove) return;

    setIsSubmitting(true);
    try {
      // Importação dinâmica para evitar dependência circular
      const { auditService } = await import(
        '../modules/audit/services/audit.service.js'
      );

      await auditService.approvePlan(selectedPlanToApprove._id);

      toast.success('Plano aprovado com sucesso!');
      setSelectedPlanToApprove(null);

      // Refetch das duas listas afetadas
      await Promise.all([
        refetchToApprove(),
        refetchLeadPlans(),
      ]);
    } catch (error: any) {
      console.error('Erro ao aprovar plano:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao aprovar plano';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedPlanToReject) return;

    if (!rejectionReason.trim()) {
      toast.error('O motivo da rejeição é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      const { auditService } = await import(
        '../modules/audit/services/audit.service.js'
      );

      await auditService.rejectPlan(
        selectedPlanToReject._id,
        rejectionReason.trim()
      );

      toast.success('Plano rejeitado. O criador será notificado.');
      setSelectedPlanToReject(null);
      setRejectionReason('');

      // Refetch
      await Promise.all([
        refetchToApprove(),
        refetchLeadPlans(),
      ]);
    } catch (error: any) {
      console.error('Erro ao rejeitar plano:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao rejeitar plano';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (planId: string) => {
    // 🔧 v52.5 — Corrigido para a rota do Auditor Líder
    navigate(`/auditor-lead/audit/plans/${planId}`);
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchToApprove(),
        refetchLeadPlans(),
      ]);
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
        hour: '2-digit',
        minute: '2-digit',
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

  const isInitialLoading = isLoadingToApprove && isLoadingLeadPlans;

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
            <ShieldCheck className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-900">
              Code_Assessment
            </span>
            <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Auditor Líder
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
              Painel do Auditor Líder
            </h1>
            <p className="text-gray-600 mt-1">
              Aprove planos, execute auditorias e acompanhe os relatórios
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* KPIs                                                    */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI 1 — Planos para Aprovar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Planos p/ Aprovar</p>
                  {isLoadingToApprove ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-amber-600">
                      {kpis.pendingApproval}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 2 — Planos Ativos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Planos Ativos</p>
                  {isLoadingLeadPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">
                      {kpis.activePlans}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 3 — Execuções Concluídas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Execuções Concluídas</p>
                  {isLoadingLeadPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-emerald-600">
                      {kpis.completedExecutions}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 4 — Taxa de Conclusão */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                  {isLoadingLeadPlans ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-violet-600">
                      {kpis.approvalRate}%
                    </p>
                  )}
                </div>
                <div className="p-3 bg-violet-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-violet-600" />
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

          {/* Barras — NCs por Domínio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Não Conformidades por Domínio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={domainNcData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="domain"
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      formatter={(value: any) => [value, 'NCs']}
                      labelFormatter={(label: any) => {
                        const item = domainNcData.find(
                          (d) => d.domain === label
                        );
                        return item ? `${label} — ${item.label}` : label;
                      }}
                    />
                    <Bar
                      dataKey="NC"
                      fill="#EF4444"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Aguardando endpoint de estatísticas agregadas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================== */}
        {/* CARDS DE NAVEGAÇÃO                                      */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Card 1 — Aprovar Planos */}
          <div
            onClick={handleGoToApprovals}
            className="bg-white border-2 border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Analisar
                </p>
                <p className="text-lg font-bold text-amber-900">
                  Aprovar Planos
                </p>
                {kpis.pendingApproval > 0 && (
                  <span className="inline-block mt-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {kpis.pendingApproval} pendente
                    {kpis.pendingApproval !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <ClipboardCheck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Card 2 — Executar Auditoria */}
          <div
            onClick={handleGoToMyPlans}
            className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Executar
                </p>
                <p className="text-lg font-bold text-blue-900">
                  Minhas Auditorias
                </p>
                {kpis.activePlans > 0 && (
                  <span className="inline-block mt-1 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {kpis.activePlans} ativo
                    {kpis.activePlans !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 3 — Relatórios */}
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

          {/* Card 4 — Dashboard de Maturidade */}
          <div
            onClick={handleGoToMaturity}
            className="bg-white border-2 border-violet-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-600">
                  Analisar
                </p>
                <p className="text-lg font-bold text-violet-900">
                  Maturidade
                </p>
                <span className="inline-block mt-1 text-xs font-medium text-violet-600">
                  Somente leitura
                </span>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <LayoutDashboard className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </div>

          {/* Card 5 — Documentos */}
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

          {/* Card 6 — Meu Perfil */}
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
        {/* LISTA: PLANOS AGUARDANDO APROVAÇÃO                      */}
        {/* ====================================================== */}
        <Card id="approval-list">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                Planos Aguardando Aprovação
                {kpis.pendingApproval > 0 && (
                  <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {kpis.pendingApproval}
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Erro */}
            {errorToApprove ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 mb-4">
                  Erro ao carregar planos aguardando aprovação.
                </p>
                <Button onClick={() => refetchToApprove()}>
                  Tentar novamente
                </Button>
              </div>
            ) : isLoadingToApprove ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">
                  Carregando planos...
                </span>
              </div>
            ) : plansToApprove.length === 0 ? (
              <EmptyState
                icon={
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                }
                title="Nenhum plano aguardando aprovação 🎉"
                description="Você está em dia com todas as aprovações pendentes."
              />
            ) : (
              <div className="space-y-3">
                {plansToApprove.map((plan) => (
                  <div
                    key={plan._id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
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
                            Enviado em {formatDate(plan.updatedAt)}
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
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenApprove(plan)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleOpenReject(plan)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(plan._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
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

      {/* ====================================================== */}
      {/* MODAL — CONFIRMAR APROVAÇÃO                             */}
      {/* ====================================================== */}
      {selectedPlanToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Aprovação
              </h2>
              <button
                onClick={() => setSelectedPlanToApprove(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Você está prestes a aprovar o seguinte plano:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                    {selectedPlanToApprove.code}
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedPlanToApprove.title}
                </p>
                {selectedPlanToApprove.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {selectedPlanToApprove.description}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Após aprovar, a auditoria poderá ser iniciada pelos
                auditores designados.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedPlanToApprove(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleConfirmApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Aprovação
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* MODAL — CONFIRMAR REJEIÇÃO                              */}
      {/* ====================================================== */}
      {selectedPlanToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Rejeitar Plano
              </h2>
              <button
                onClick={() => {
                  setSelectedPlanToReject(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-3">
                Você está rejeitando o seguinte plano:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                    {selectedPlanToReject.code}
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedPlanToReject.title}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="rejection-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motivo da Rejeição *
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva detalhadamente por que está rejeitando este plano..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-24"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Este motivo será enviado ao criador do plano.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedPlanToReject(null);
                  setRejectionReason('');
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleConfirmReject}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejeitando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirmar Rejeição
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditorLeadDashboard;