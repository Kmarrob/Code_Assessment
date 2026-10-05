import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  ClipboardList,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Eye,
  ChevronRight,
  Users,
  Building,
  Plus,
  ListChecks,
  // 🆕 v50.1 — Ícone do botão de perguntas por controle
  ShieldCheck,
  // 🆕 v50.2.15 — Ícones do dashboard
  Activity,
  TrendingUp,
  Target,
  Minus,
  FileQuestion,
} from 'lucide-react';
// 🔧 CORREÇÃO: Caminho corrigido de '../../hooks/useAudit' para '../../../hooks/useAudit'
import { usePlans, usePlanStats, useDashboardStats } from '../../../hooks/useAudit';
import { AuditPlan } from '../../../types/audit.types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_approval: 'bg-yellow-100 text-yellow-600',
  approved: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-indigo-100 text-indigo-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

// ============================================================
// 🆕 v50.2.15 — CORES DOS GRÁFICOS
// ============================================================

const CONCLUSION_COLORS = {
  C: '#10b981',
  NC: '#ef4444',
  OB: '#f59e0b',
  OM: '#3b82f6',
  NA: '#9ca3af',
};

const DOMAIN_COLORS = {
  C: '#10b981',
  NC: '#ef4444',
  OB: '#f59e0b',
  OM: '#3b82f6',
  NA: '#9ca3af',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function AdminAuditDashboard() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans();
  const { data: stats, isLoading: isLoadingStats } = usePlanStats();

  // 🆕 v50.2.15 — Estatísticas agregadas do dashboard
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboardStats();

  // Estatísticas para exibição
  const totalPlans = stats?.totalPlans || 0;
  const inProgress = stats?.inProgress || 0;
  const completed = stats?.completed || 0;
  const approved = stats?.approved || 0;

  // Filtrar planos mais recentes (últimos 5)
  const recentPlans = plans
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Estatísticas por empresa (agrupadas)
  const companiesStats = plans.reduce((acc: Record<string, { name: string; count: number; completed: number }>, plan: AuditPlan) => {
    const companyId = plan.companyId || 'unknown';
    if (!acc[companyId]) {
      acc[companyId] = { name: `Empresa ${companyId.substring(0, 8)}`, count: 0, completed: 0 };
    }
    acc[companyId].count++;
    if (plan.status === 'completed') {
      acc[companyId].completed++;
    }
    return acc;
  }, {});

  const companyEntries = Object.entries(companiesStats);

  const isLoading = isLoadingPlans || isLoadingStats;

  // ============================================================
  // 🆕 v50.2.15 — PREPARAR DADOS DOS GRÁFICOS
  // ============================================================

  const conclusionDistribution = dashboard?.conclusionDistribution || {
    C: 0,
    NC: 0,
    OB: 0,
    OM: 0,
    NA: 0,
    pending: 0,
  };

  // Dados para o gráfico de pizza (donut)
  const pieData = [
    { name: 'Conforme', value: conclusionDistribution.C, color: CONCLUSION_COLORS.C },
    { name: 'Não Conforme', value: conclusionDistribution.NC, color: CONCLUSION_COLORS.NC },
    { name: 'Observação', value: conclusionDistribution.OB, color: CONCLUSION_COLORS.OB },
    { name: 'Oportunidade', value: conclusionDistribution.OM, color: CONCLUSION_COLORS.OM },
    { name: 'Não Aplicável', value: conclusionDistribution.NA, color: CONCLUSION_COLORS.NA },
  ].filter((item) => item.value > 0);

  const totalConclusions = pieData.reduce((acc, item) => acc + item.value, 0);

  // Dados para o gráfico de barras por domínio
  const byDomain = dashboard?.byDomain || [];

  const domainChartData = byDomain.map((d) => ({
    name: d.label.replace(/^A\.\d\s*/, '').trim() || d.domain,
    C: d.C,
    NC: d.NC,
    OB: d.OB,
    OM: d.OM,
    NA: d.NA,
  }));

  const topNonConformities = dashboard?.topNonConformities || [];

  const progress = dashboard?.progress || {
    totalChecklists: 0,
    completedChecklists: 0,
    inProgressChecklists: 0,
    pendingChecklists: 0,
    completionRate: 0,
  };

  const kpisSecondary = dashboard?.kpis || {
    totalPlans: 0,
    inProgress: 0,
    completed: 0,
    approved: 0,
    draft: 0,
    totalChecklists: 0,
    totalAuditQuestions: 0,
    totalAnswered: 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Auditoria</h1>
          <p className="text-gray-500 mt-1">
            Visão geral das auditorias internas do SGSI
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          {/* 🆕 NOVO (v47.0): Botão Gerenciar Perguntas (CLÁUSULAS 4-10) */}
          <button
            onClick={() => navigate('/admin/audit/questions')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ListChecks className="w-4 h-4" />
            Gerenciar Perguntas
          </button>

          {/* 🆕 NOVO (v50.1): Botão Perguntas de Controles (ANEXO A) */}
          <button
            onClick={() => navigate('/admin/audit/control-questions')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Perguntas de Controles
          </button>

          <button
            onClick={() => navigate('/admin/audit/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            Relatórios
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Planos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPlans}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Em Andamento</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">{completed}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <FileCheck className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{approved}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 v50.2.15 — KPIs SECUNDÁRIOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileQuestion className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Perguntas de Auditoria</p>
              <p className="text-xl font-bold text-gray-900">
                {kpisSecondary.totalAuditQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Target className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Checklists Gerados</p>
              <p className="text-xl font-bold text-gray-900">
                {kpisSecondary.totalChecklists}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Respostas Registradas</p>
              <p className="text-xl font-bold text-gray-900">
                {kpisSecondary.totalAnswered}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Conclusão</p>
              <p className="text-xl font-bold text-gray-900">
                {progress.completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 v50.2.15 — SEÇÃO DE GRÁFICOS */}
      {isLoadingDashboard ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-40 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Pizza — Distribuição C/NC/OB/OM/NA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição das Constatações
            </h2>

            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
                Nenhuma constatação registrada ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={(entry: any) =>
                      `${entry.name}: ${entry.value}`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: any, name: any) => {
                      const pct = totalConclusions > 0
                        ? Math.round((Number(value) / totalConclusions) * 100)
                        : 0;
                      return [`${value} (${pct}%)`, name];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Progresso Geral */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Progresso Geral dos Checklists
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Concluídos</span>
                  <span className="font-semibold text-gray-900">
                    {progress.completedChecklists} / {progress.totalChecklists}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${progress.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">Concluídos</p>
                  <p className="text-lg font-bold text-green-700">
                    {progress.completedChecklists}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700">Em Andamento</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {progress.inProgressChecklists}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Pendentes</p>
                  <p className="text-lg font-bold text-gray-600">
                    {progress.pendingChecklists}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Taxa de conclusão:{' '}
                  <span className="font-bold text-gray-900">
                    {progress.completionRate}%
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Barras Empilhadas por Domínio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Constatações por Domínio
            </h2>

            {domainChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
                Nenhum domínio com dados ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RechartsBarChart
                  data={domainChartData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="square"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Bar dataKey="C" name="Conforme" stackId="a" fill={DOMAIN_COLORS.C} />
                  <Bar dataKey="NC" name="Não Conforme" stackId="a" fill={DOMAIN_COLORS.NC} />
                  <Bar dataKey="OB" name="Observação" stackId="a" fill={DOMAIN_COLORS.OB} />
                  <Bar dataKey="OM" name="Oportunidade" stackId="a" fill={DOMAIN_COLORS.OM} />
                  <Bar dataKey="NA" name="Não Aplicável" stackId="a" fill={DOMAIN_COLORS.NA} />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 10 Controles com mais NC */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Controles com mais Não Conformidades
            </h2>

            {topNonConformities.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
                Nenhuma não conformidade registrada
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {topNonConformities.map((item) => (
                  <div
                    key={item.controlId}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 whitespace-nowrap">
                      {item.controlId}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {item.controlName}
                    </span>
                    <span className="text-sm font-bold text-red-600 whitespace-nowrap">
                      {item.NC} NC
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Plans */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Planos Recentes</h2>
            <button
              onClick={() => navigate('/admin/audit/plans')}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Carregando...</div>
          ) : recentPlans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Nenhum plano de auditoria criado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentPlans.map((plan: AuditPlan) => (
                <div
                  key={plan._id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/audit/plans/${plan._id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 truncate">{plan.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[plan.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[plan.status] || plan.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{plan.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(plan.period.startDate).toLocaleDateString('pt-BR')}
                          {' - '}
                          {new Date(plan.period.endDate).toLocaleDateString('pt-BR')}
                        </span>
                        <span>•</span>
                        <span>
                          {plan.scope.controls.length} controles • {plan.scope.areas.length} áreas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/audit/plans/${plan._id}`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Companies Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-500" />
              Empresas
            </h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="text-center text-gray-500">Carregando...</div>
            ) : companyEntries.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <p>Nenhuma empresa com planos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyEntries.map(([id, data]) => (
                  <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{data.name}</p>
                      <p className="text-xs text-gray-500">
                        {data.count} plano(s) • {data.completed} concluído(s)
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAuditDashboard;