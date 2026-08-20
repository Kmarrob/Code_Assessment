import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Eye,
  ChevronRight,
  FileText,
  Upload,
  AlertCircle,
  BarChart3,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
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

export function RepAuditDashboard() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans();
  const { data: stats, isLoading: isLoadingStats } = usePlanStats();

  // Estatísticas para exibição
  const totalPlans = stats?.totalPlans || 0;
  const inProgress = stats?.inProgress || 0;
  const completed = stats?.completed || 0;
  const approved = stats?.approved || 0;

  // Filtrar planos mais recentes (últimos 3)
  const recentPlans = plans
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const isLoading = isLoadingPlans || isLoadingStats;

  // Navegação para as funcionalidades (requerem um planId selecionado)
  const navigateToFeature = (feature: string, planId?: string) => {
    if (!planId) {
      navigate('/rep/audit/plans');
      return;
    }
    navigate(`/rep/audit/${feature}/${planId}`);
  };

  // Pega o primeiro plano disponível para navegação rápida
  const firstPlanId = plans.length > 0 ? plans[0]._id : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria Interna</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e acompanhe as auditorias internas do SGSI
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={() => navigate('/rep/audit/plans')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver Todos
          </button>
          <button
            onClick={() => navigate('/rep/audit/plans/new')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Plano
          </button>
        </div>
      </div>

      {/* Cards de Navegação Rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {/* Planos */}
        <div
          onClick={() => navigate('/rep/audit/plans')}
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
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/checklist/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-green-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* Evidências */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/evidence/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-blue-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* Achados (Não Conformidades) */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/findings/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-red-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* Riscos */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/risks/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-yellow-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* Plano de Ação */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/actions/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-purple-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* SoA */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/soa/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-teal-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* Programa */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/program/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-rose-200' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
        </div>

        {/* 🆕 Relatório de Auditoria */}
        <div
          onClick={() => {
            if (firstPlanId) {
              navigate(`/rep/audit/reports/${firstPlanId}`);
            } else {
              navigate('/rep/audit/plans');
            }
          }}
          className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            firstPlanId ? 'border-red-300' : 'border-gray-200 opacity-60'
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
          {!firstPlanId && (
            <p className="text-xs text-gray-400 mt-1">Crie um plano primeiro</p>
          )}
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

      {/* Recent Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Planos Recentes</h2>
          <button
            onClick={() => navigate('/rep/audit/plans')}
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
            <button
              onClick={() => navigate('/rep/audit/plans/new')}
              className="mt-3 text-indigo-600 hover:text-indigo-800"
            >
              Criar primeiro plano →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentPlans.map((plan: AuditPlan) => (
              <div
                key={plan._id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/rep/audit/plans/${plan._id}`)}
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
                        navigate(`/rep/audit/plans/${plan._id}`);
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
    </div>
  );
}