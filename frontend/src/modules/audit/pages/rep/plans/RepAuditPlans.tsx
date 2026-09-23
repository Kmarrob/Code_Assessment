import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
  User,
  Users,
  EyeIcon,
} from 'lucide-react';
import { usePlans, useDeletePlan, useCancelPlan } from '../../../hooks/useAudit';
import { AuditPlan, AuditStatus } from '../../../types/audit.types';

const STATUS_OPTIONS: { value: AuditStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'pending_approval', label: 'Aguardando Aprovação' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

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
// 🆕 v49.1 — HELPERS DE EXIBIÇÃO DA EQUIPE
// ============================================================
//
// MOTIVO:
//   O card expandido mostrava apenas os IDs brutos (ex.:
//   'manual_1790110055011'). Os nomes/emails já estão
//   persistidos no backend (BLOCO 1) e enviados pelo
//   frontend (BLOCO 2). Aqui apenas os exibimos.
//
// ESTRATÉGIA:
//   - Preferir `name` quando existir.
//   - Fallback para ID (planos antigos, criados antes da v49.1).
//   - Email é opcional (auditores manuais podem não ter).
//
// ============================================================

interface TeamMemberDisplay {
  id: string;
  name: string;
  email: string;
  isManual: boolean;
}

/**
 * Reconstrói a lista de membros da equipe a partir do
 * `plan.team` persistido (que pode vir do formato antigo — só IDs —
 * ou do formato novo — IDs + nomes + emails).
 */
function buildTeamMembers(
  ids: string[] | undefined,
  names: string[] | undefined,
  emails: string[] | undefined
): TeamMemberDisplay[] {
  const safeIds = Array.isArray(ids) ? ids : [];
  const safeNames = Array.isArray(names) ? names : [];
  const safeEmails = Array.isArray(emails) ? emails : [];

  return safeIds.map((id, index) => ({
    id,
    // Fallback: se o nome não veio, usa o ID.
    name: safeNames[index] || id,
    email: safeEmails[index] || '',
    isManual: String(id).startsWith('manual_'),
  }));
}

export function RepAuditPlans() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: plans = [], isLoading, error, refetch } = usePlans({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const deleteMutation = useDeletePlan();
  const cancelMutation = useCancelPlan();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setShowDeleteConfirm(null);
    refetch();
  };

  const handleCancel = async (id: string) => {
    await cancelMutation.mutateAsync(id);
    refetch();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredPlans = plans.filter(plan => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        plan.title.toLowerCase().includes(search) ||
        plan.description.toLowerCase().includes(search) ||
        plan.code?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800">Erro ao carregar planos</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos de Auditoria</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os planos de auditoria interna do SGSI
          </p>
        </div>
        <button
          onClick={() => navigate('/rep/audit/plans/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuditStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum plano encontrado</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando um novo plano de auditoria'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/rep/audit/plans/new')}
                className="mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Criar primeiro plano →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPlans.map((plan: AuditPlan) => {
              // ============================================================
              // 🆕 v49.1 — MONTAGEM DA EQUIPE PARA EXIBIÇÃO
              // ============================================================
              //
              // Reconstrói os membros a partir do `plan.team` persistido.
              // Compatível com:
              //   - Planos novos (v49.1+): team tem name/email
              //   - Planos antigos: team só tem IDs (fallback para ID)
              //
              // ============================================================

              const teamAny: any = plan.team || {};

              const leadAuditorDisplay: TeamMemberDisplay | null =
                teamAny.leadAuditor
                  ? {
                      id: teamAny.leadAuditor,
                      name:
                        teamAny.leadAuditorName ||
                        teamAny.leadAuditor,
                      email: teamAny.leadAuditorEmail || '',
                      isManual: String(teamAny.leadAuditor).startsWith('manual_'),
                    }
                  : null;

              const auditorsDisplay = buildTeamMembers(
                teamAny.auditors,
                teamAny.auditorNames,
                teamAny.auditorEmails
              );

              const observersDisplay = buildTeamMembers(
                teamAny.observers,
                teamAny.observerNames,
                teamAny.observerEmails
              );

              return (
                <div key={plan._id} className="hover:bg-gray-50 transition-colors">
                  {/* Plan Row */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => toggleExpand(plan._id)}
                    >
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-gray-900 truncate">{plan.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[plan.status] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[plan.status] || plan.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(plan.period.startDate).toLocaleDateString('pt-BR')}
                            {' - '}
                            {new Date(plan.period.endDate).toLocaleDateString('pt-BR')}
                          </span>
                          <span>•</span>
                          <span>{plan.scope.controls.length} controles</span>
                          <span>•</span>
                          <span>{plan.scope.areas.length} áreas</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/rep/audit/plans/${plan._id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {plan.status === 'draft' && (
                        <>
                          <button
                            onClick={() => navigate(`/rep/audit/plans/${plan._id}/edit`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(plan._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {plan.status === 'pending_approval' && (
                        <button
                          onClick={() => handleCancel(plan._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpand(plan._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      >
                        {expandedId === plan._id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === plan._id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Descrição</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Equipe</h4>

                          {/* ============================================ */}
                          {/* 🆕 v49.1 — AUDITOR LÍDER (nome em vez de ID) */}
                          {/* ============================================ */}
                          {leadAuditorDisplay ? (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                Auditor Líder
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                  <User className="w-3 h-3" />
                                  {leadAuditorDisplay.name}
                                  {leadAuditorDisplay.isManual && (
                                    <span title="Auditor manual">📝</span>
                                  )}
                                </span>
                                {leadAuditorDisplay.email && (
                                  <span className="text-xs text-gray-500">
                                    {leadAuditorDisplay.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                Auditor Líder
                              </span>
                              <p className="text-sm text-gray-400">Não definido</p>
                            </div>
                          )}

                          {/* ============================================ */}
                          {/* 🆕 v49.1 — AUDITORES (nomes em vez de IDs) */}
                          {/* ============================================ */}
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              Auditores
                            </span>
                            {auditorsDisplay.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {auditorsDisplay.map((member) => (
                                  <span
                                    key={member.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    title={member.email}
                                  >
                                    <Users className="w-3 h-3" />
                                    {member.name}
                                    {member.isManual && (
                                      <span title="Auditor manual">📝</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Nenhum</p>
                            )}
                          </div>

                          {/* ============================================ */}
                          {/* 🆕 v49.1 — OBSERVADORES (bloco novo) */}
                          {/* ============================================ */}
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              Observadores
                            </span>
                            {observersDisplay.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {observersDisplay.map((member) => (
                                  <span
                                    key={member.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
                                    title={member.email}
                                  >
                                    <EyeIcon className="w-3 h-3" />
                                    {member.name}
                                    {member.isManual && (
                                      <span title="Observador manual">📝</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Nenhum</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <h4 className="text-sm font-medium text-gray-700 w-full">Critérios:</h4>
                        {plan.criteria.map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {c}
                          </span>
                        ))}
                      </div>
                      {plan.status === 'approved' && plan.approvedAt && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Plano aprovado em {new Date(plan.approvedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir este plano de auditoria? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}