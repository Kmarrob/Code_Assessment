import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import { useActionsByFinding, useCompleteAction, useValidateAction, useStartAction } from '../../../hooks/useAudit';
import { AuditActionPlan, AuditActionStatus } from '../../../types/audit.types';

const STATUS_OPTIONS: { value: AuditActionStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
  { value: 'pending', label: 'Pendente', color: 'bg-gray-100 text-gray-600' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  rejected: 'Rejeitado',
};

export function RepAuditActionPlan() {
  const navigate = useNavigate();
  const { findingId } = useParams<{ findingId: string }>();
  const [statusFilter, setStatusFilter] = useState<AuditActionStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: actions = [], isLoading, error, refetch } = useActionsByFinding(findingId || '');
  const startAction = useStartAction();
  const completeAction = useCompleteAction();
  const validateAction = useValidateAction();

  const filteredActions = actions.filter((action: AuditActionPlan) => {
    if (statusFilter !== 'all') {
      return action.status === statusFilter;
    }
    return true;
  });

  const handleStart = async (id: string) => {
    await startAction.mutateAsync(id);
    refetch();
  };

  const handleComplete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja concluir este plano de ação?')) {
      await completeAction.mutateAsync({ id });
      refetch();
    }
  };

  const handleValidate = async (id: string, status: 'completed' | 'rejected') => {
    const message = status === 'completed' 
      ? 'Confirmar que a ação foi implementada com sucesso?'
      : 'Rejeitar esta ação?';
    
    if (window.confirm(message)) {
      await validateAction.mutateAsync({ id, status });
      refetch();
    }
  };

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
        <h3 className="text-lg font-semibold text-red-800">Erro ao carregar planos de ação</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/rep/audit/findings/${findingId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planos de Ação</h1>
            <p className="text-gray-500 mt-1">
              {actions.length} plano(s) de ação registrado(s)
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/rep/audit/actions/new/${findingId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Novo Plano de Ação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuditActionStatus | 'all')}
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

      {/* Actions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredActions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum plano de ação encontrado</h3>
            <p className="text-gray-400 mt-2">
              {statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando um plano de ação para esta NC'}
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => navigate(`/rep/audit/actions/new/${findingId}`)}
                className="mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Criar primeiro plano →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActions.map((action: AuditActionPlan) => (
              <div key={action._id} className="hover:bg-gray-50 transition-colors">
                {/* Action Row */}
                <div className="flex items-start justify-between px-6 py-4">
                  <div
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => setExpandedId(prev => prev === action._id ? null : action._id)}
                  >
                    <div className={`mt-1 p-2 rounded-lg ${
                      action.status === 'completed' ? 'bg-green-50' :
                      action.status === 'rejected' ? 'bg-red-50' :
                      action.status === 'in_progress' ? 'bg-yellow-50' :
                      'bg-gray-50'
                    }`}>
                      {action.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : action.status === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : action.status === 'in_progress' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-gray-900 truncate">
                          {action.action.length > 80 ? `${action.action.substring(0, 80)}...` : action.action}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          action.status === 'completed' ? 'bg-green-100 text-green-700' :
                          action.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          action.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {STATUS_LABELS[action.status] || action.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Responsável: {action.responsible || 'Não definido'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Prazo: {new Date(action.deadline).toLocaleDateString('pt-BR')}
                        </span>
                        {action.evidenceIds && action.evidenceIds.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">📎 {action.evidenceIds.length} evidência(s)</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(action.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Ações baseadas no status */}
                    {action.status === 'pending' && (
                      <button
                        onClick={() => handleStart(action._id)}
                        disabled={startAction.isPending}
                        className="px-3 py-1 text-xs bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        Iniciar
                      </button>
                    )}
                    {action.status === 'in_progress' && (
                      <button
                        onClick={() => handleComplete(action._id)}
                        disabled={completeAction.isPending}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Concluir
                      </button>
                    )}
                    {action.status === 'completed' && (
                      <>
                        <button
                          onClick={() => handleValidate(action._id, 'completed')}
                          disabled={validateAction.isPending}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Validar
                        </button>
                        <button
                          onClick={() => handleValidate(action._id, 'rejected')}
                          disabled={validateAction.isPending}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(prev => prev === action._id ? null : action._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      {expandedId === action._id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === action._id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Descrição da Ação</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{action.action}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span><strong>Criado por:</strong> {action.createdBy || 'Não informado'}</span>
                        {action.validatedBy && (
                          <span><strong>Validado por:</strong> {action.validatedBy}</span>
                        )}
                        {action.validatedAt && (
                          <span><strong>Validação:</strong> {new Date(action.validatedAt).toLocaleDateString('pt-BR')}</span>
                        )}
                        {action.validationComment && (
                          <span className="w-full"><strong>Comentário:</strong> {action.validationComment}</span>
                        )}
                      </div>
                      {action.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Ação concluída e aguardando validação
                        </div>
                      )}
                      {action.status === 'rejected' && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          <XCircle className="w-4 h-4" />
                          Ação rejeitada. Revise e reenvie.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}