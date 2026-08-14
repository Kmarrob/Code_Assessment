import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ListChecks,
  Plus,
  Eye,
  ChevronRight,
} from 'lucide-react';
// 🔧 CORREÇÃO: Caminho corrigido de '../../hooks/useAudit' para '../../../hooks/useAudit'
import { usePlan, useChecklists, useCompletePlan } from '../../../hooks/useAudit';
import { AuditChecklist } from '../../components/AuditChecklist';
import { AuditChecklistItem } from '../../../types/audit.types';

export function RepAuditExecution() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [selectedControl, setSelectedControl] = useState<string | null>(null);

  const { data: plan, isLoading: isLoadingPlan } = usePlan(planId || '');
  const { data: checklists = [], isLoading: isLoadingChecklists } = useChecklists(planId || '');
  const completePlan = useCompletePlan();

  const isLoading = isLoadingPlan || isLoadingChecklists;

  const handleCompletePlan = async () => {
    if (!planId) return;
    if (window.confirm('Tem certeza que deseja concluir esta auditoria?')) {
      await completePlan.mutateAsync(planId);
      navigate('/rep/audit/plans');
    }
  };

  const selectedChecklist = checklists.find((c) => c.controlId === selectedControl);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800">Plano não encontrado</h3>
          <p className="text-red-600 mt-2">O plano de auditoria não foi encontrado.</p>
          <button
            onClick={() => navigate('/rep/audit/plans')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  const completedChecklists = checklists.filter((c) => c.status === 'completed').length;
  const totalChecklists = checklists.length;
  const progress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/rep/audit/plans')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          <p className="text-gray-500 text-sm">
            Executando auditoria • {progress.toFixed(0)}% concluído
          </p>
        </div>
        {plan.status === 'in_progress' && (
          <button
            onClick={handleCompletePlan}
            disabled={completePlan.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {completePlan.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Concluir Auditoria
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso da Auditoria</span>
          <span className="text-sm font-medium text-gray-700">
            {completedChecklists}/{totalChecklists} checklists concluídos
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{plan.period.startDate ? new Date(plan.period.startDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
          <span>{progress.toFixed(0)}%</span>
          <span>{plan.period.endDate ? new Date(plan.period.endDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Controles */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Controles ({totalChecklists})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {checklists.map((checklist) => {
              const isSelected = selectedControl === checklist.controlId;
              const isCompleted = checklist.status === 'completed';
              return (
                <button
                  key={checklist._id}
                  onClick={() => setSelectedControl(checklist.controlId)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {checklist.controlId}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    isSelected ? 'rotate-90' : ''
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2">
          {selectedChecklist ? (
            <AuditChecklist
              checklist={selectedChecklist}
              onUpdate={async (questions: AuditChecklistItem[]) => {
                // TODO: Implementar atualização do checklist
                console.log('Atualizando checklist:', selectedChecklist._id, questions);
              }}
              onComplete={async () => {
                // TODO: Implementar conclusão do checklist
                console.log('Concluindo checklist:', selectedChecklist._id);
              }}
              isReadOnly={plan.status === 'completed' || plan.status === 'cancelled'}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Selecione um controle</h3>
              <p className="text-gray-400 mt-2">
                Escolha um controle na lista ao lado para visualizar o checklist
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}