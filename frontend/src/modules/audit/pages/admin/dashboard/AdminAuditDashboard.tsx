import React from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
// 🔧 CORREÇÃO: Caminho corrigido de '../../hooks/useAudit' para '../../../hooks/useAudit'
import { usePlans, usePlanStats } from '../../../hooks/useAudit';
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

export function AdminAuditDashboard() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans();
  const { data: stats, isLoading: isLoadingStats } = usePlanStats();

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
          {/* 🆕 NOVO (v47.0): Botão Gerenciar Perguntas */}
          <button
            onClick={() => navigate('/admin/audit/questions')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ListChecks className="w-4 h-4" />
            Gerenciar Perguntas
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