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
//   rotas /auditor-lead/audit/* (novas).
//
// 🔧 v52.8 — ATALHOS OPERACIONAIS:
//   Adicionados 10 cards de atalho para todas as telas de
//   auditoria (Dashboard, Planos, Checklist, Evidências,
//   Achados, Riscos, Plano de Ação, SoA, Programa, Relatório).
//   Os cards atuais foram preservados integralmente.
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
  // ============================================================
  // 🆕 v52.8 — ÍCONES PARA OS NOVOS CARDS OPERACIONAIS
  // ============================================================
  ClipboardList,
  FileCheck,
  AlertTriangle,
  Calendar,
  Upload,
  ChevronRight,
  BookOpen,
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
const STATUS_COLORS: Record<string, string> = {
  draft: '#9CA3AF',
  pending_approval: '#FBBF24',
  approved: '#3B82F6',
  in_progress: '#8B5CF6',
  completed: '#10B981',
  rejected: '#EF4444',
  cancelled: '#6B7280',
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

  const domainNcData = useMemo(() => {
    return [
      { domain: 'A.5', label: 'Políticas', NC: 0, total: 0 },
      { domain: 'A.6', label: 'Organização', NC: 0, total: 0 },
      { domain: 'A.7', label: 'Pessoas', NC: 0, total: 0 },
      { domain: 'A.8', label: 'Tecnologia', NC: 0, total: 0 },
    ];
  }, []);

  // ============================================================
  // 🆕 v52.8 — PLANO ATIVO PARA OS ATALHOS OPERACIONAIS
  // ============================================================
  //
  // Os cards operacionais precisam de um planId para navegar
  // direto para a tela (Checklist, Evidências, Achados, etc.).
  //
  // Regra:
  //   1. Usa o primeiro plano ativo do auditor líder, se houver.
  //   2. Caso contrário, usa o primeiro plano a aprovar.
  //   3. Caso contrário, navega para a lista de planos.
  //
  // ============================================================
  const operationalPlanId = useMemo(() => {
    const activePlan = leadPlans.find(
      (p) => p.status === 'approved' || p.status === 'in_progress'
    );
    if (activePlan) return activePlan._id;

    const anyLeadPlan = leadPlans[0];
    if (anyLeadPlan) return anyLeadPlan._id;

    const anyToApprove = plansToApprove[0];
    if (anyToApprove) return anyToApprove._id;

    return null;
  }, [leadPlans, plansToApprove]);

  // Base path fixo para este role
  const basePath = '/auditor-lead/audit';

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

  const handleGoToApprovals = () => {
    const el = document.getElementById('approval-list');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGoToMyPlans = () => {
    navigate('/auditor-lead/audit/plans');
  };

  const handleGoToReports = () => {
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
  // 🆕 v52.8 — HANDLER DOS CARDS OPERACIONAIS
  // ============================================================
  //
  // Redireciona para a tela correta usando o plano ativo
  // (ou a lista de planos, se não houver plano disponível).
  //
  // ============================================================
  const handleGoToFeature = (feature: string) => {
    if (!operationalPlanId) {
      navigate(`${basePath}/plans`);
      return;
    }
    navigate(`${basePath}/${feature}/${operationalPlanId}`);
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
      const { auditService } = await import(
        '../modules/audit/services/audit.service.js'
      );

      await auditService.approvePlan(selectedPlanToApprove._id);

      toast.success('Plano aprovado com sucesso!');
      setSelectedPlanToApprove(null);

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
        {/* 🆕 v52.8 — ATALHOS OPERACIONAIS DE AUDITORIA           */}
        {/* ====================================================== */}
        {/*
          Cards de acesso rápido às telas internas da auditoria.
          Todos respeitam o basePath do Auditor Líder
          (/auditor-lead/audit/...).

          Quando há um plano ativo disponível, o card leva
          diretamente para a tela da feature com esse plano.
          Caso contrário, redireciona para a lista de planos.
        */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Atalhos de Auditoria
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Dashboard de Auditoria */}
            <div
              onClick={() => navigate(`${basePath}/dashboard`)}
              className="bg-white border-2 border-sky-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-sky-600">Visualizar</p>
                  <p className="text-sm font-bold text-sky-900">Dashboard</p>
                </div>
                <div className="p-2 bg-sky-100 rounded-full">
                  <BarChart3 className="w-5 h-5 text-sky-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400 mt-2" />
              <p className="text-xs text-gray-400 mt-1">KPIs e gráficos</p>
            </div>

            {/* Planos */}
            <div
              onClick={() => navigate(`${basePath}/plans`)}
              className="bg-white border-2 border-indigo-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600">Gerenciar</p>
                  <p className="text-sm font-bold text-indigo-900">Planos</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-full">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400 mt-2" />
            </div>

            {/* Checklist */}
            <div
              onClick={() => handleGoToFeature('checklist')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-green-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600">Executar</p>
                  <p className="text-sm font-bold text-green-900">Checklist</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <FileCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-green-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* Evidências */}
            <div
              onClick={() => handleGoToFeature('evidence')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-blue-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600">Gerenciar</p>
                  <p className="text-sm font-bold text-blue-900">Evidências</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* Achados */}
            <div
              onClick={() => handleGoToFeature('findings')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-red-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-600">Registrar</p>
                  <p className="text-sm font-bold text-red-900">Achados</p>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* Riscos */}
            <div
              onClick={() => handleGoToFeature('risks')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-yellow-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-600">Avaliar</p>
                  <p className="text-sm font-bold text-yellow-900">Riscos</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-yellow-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* Plano de Ação */}
            <div
              onClick={() => handleGoToFeature('actions')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-purple-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600">Acompanhar</p>
                  <p className="text-sm font-bold text-purple-900">Plano de Ação</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <ClipboardCheck className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* SoA */}
            <div
              onClick={() => handleGoToFeature('soa')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-teal-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-teal-600">Visualizar</p>
                  <p className="text-sm font-bold text-teal-900">SoA</p>
                </div>
                <div className="p-2 bg-teal-100 rounded-full">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* Programa */}
            <div
              onClick={() => handleGoToFeature('program')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-rose-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-rose-600">Planejar</p>
                  <p className="text-sm font-bold text-rose-900">Programa</p>
                </div>
                <div className="p-2 bg-rose-100 rounded-full">
                  <Calendar className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
            </div>

            {/* Relatório */}
            <div
              onClick={() => handleGoToFeature('reports')}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                operationalPlanId ? 'border-red-300' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-700">Consolidar</p>
                  <p className="text-sm font-bold text-red-700">Relatório</p>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 mt-2" />
              {!operationalPlanId && (
                <p className="text-xs text-gray-400 mt-1">Sem plano ativo</p>
              )}
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