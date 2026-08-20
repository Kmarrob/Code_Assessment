import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ListChecks,
  ChevronRight,
  Send,
  Play,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import {
  usePlan,
  useChecklists,
  useUpdateChecklist,
  useCompleteChecklist,
  useSubmitPlan,
  useApprovePlan,
  useStartPlan,
  useCompletePlan,
} from '../../../hooks/useAudit';
import { AuditChecklistItem } from '../../../types/audit.types';
import { AuditChecklist } from '../../../components/AuditChecklist';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function RepAuditExecution() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId?: string }>();
  const effectivePlanId = planId || '';
  const [selectedControl, setSelectedControl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: plan, isLoading: isLoadingPlan } = usePlan(effectivePlanId);
  const { data: checklists = [], isLoading: isLoadingChecklists } = useChecklists(effectivePlanId);
  const updateChecklist = useUpdateChecklist();
  const completeChecklist = useCompleteChecklist();
  const submitPlan = useSubmitPlan();
  const approvePlan = useApprovePlan();
  const startPlan = useStartPlan();
  const completePlan = useCompletePlan();

  useEffect(() => {
    if (!selectedControl && checklists.length > 0) {
      setSelectedControl(checklists[0].controlId);
    }
  }, [checklists, selectedControl]);

  const isLoading = isLoadingPlan || isLoadingChecklists;
  const selectedChecklist = checklists.find((c) => c.controlId === selectedControl);
  const completedChecklists = checklists.filter((c) => c.status === 'completed').length;
  const totalChecklists = checklists.length;
  const progress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível executar a operação.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800">Plano não encontrado</h3>
          <button onClick={() => navigate('/rep/audit/plans')} className="mt-4 text-indigo-600 hover:text-indigo-800">Voltar para lista</button>
        </div>
      </div>
    );
  }

  const isPendingAction = submitPlan.isPending || approvePlan.isPending || startPlan.isPending || completePlan.isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <button onClick={() => navigate('/rep/audit/plans')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-start">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[plan.status] || STATUS_COLORS.draft}`}>
              {STATUS_LABELS[plan.status] || plan.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.status === 'draft' && (
            <button onClick={() => runAction(() => submitPlan.mutateAsync(effectivePlanId))} disabled={isPendingAction} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Send className="w-4 h-4" /> Enviar para aprovação
            </button>
          )}
          {plan.status === 'pending_approval' && (
            <button onClick={() => runAction(() => approvePlan.mutateAsync(effectivePlanId))} disabled={isPendingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <ShieldCheck className="w-4 h-4" /> Aprovar plano
            </button>
          )}
          {plan.status === 'approved' && (
            <button onClick={() => runAction(() => startPlan.mutateAsync(effectivePlanId))} disabled={isPendingAction} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Play className="w-4 h-4" /> Iniciar auditoria
            </button>
          )}
          {plan.status === 'in_progress' && (
            <button onClick={() => runAction(() => completePlan.mutateAsync(effectivePlanId))} disabled={isPendingAction || completedChecklists < totalChecklists} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" title={completedChecklists < totalChecklists ? 'Conclua todos os checklists antes de encerrar a auditoria' : ''}>
              <CheckCircle className="w-4 h-4" /> Concluir auditoria
            </button>
          )}
          {plan.status === 'draft' && (
            <button onClick={() => navigate(`/rep/audit/plans/${effectivePlanId}/edit`)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Editar plano</button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck className="w-5 h-5 text-indigo-600" /><div><p className="text-xs text-gray-500">Controles</p><p className="text-xl font-bold">{totalChecklists}</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" /><div><p className="text-xs text-gray-500">Concluídos</p><p className="text-xl font-bold">{completedChecklists}</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-600" /><div><p className="text-xs text-gray-500">Progresso</p><p className="text-xl font-bold">{progress.toFixed(0)}%</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-600" /><div><p className="text-xs text-gray-500">Critérios</p><p className="text-xl font-bold">{plan.criteria.length}</p></div></div></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Progresso da auditoria</span><span className="text-sm text-gray-500">{completedChecklists}/{totalChecklists} controles concluídos</span></div>
        <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-6 flex flex-wrap gap-2">
        <button onClick={() => navigate(`/rep/audit/execution/${effectivePlanId}`)} className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">Checklist</button>
        <button onClick={() => navigate(`/rep/audit/findings/${effectivePlanId}`)} className="px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">Achados</button>
        <button onClick={() => navigate(`/rep/audit/reports/${effectivePlanId}`)} className="px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">Relatório</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-200 bg-gray-50"><h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><ListChecks className="w-4 h-4" /> Controles ({totalChecklists})</h2></div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {checklists.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">Nenhum checklist foi gerado para os controles deste plano.</div>
            ) : checklists.map((checklist) => {
              const isSelected = selectedControl === checklist.controlId;
              const isCompleted = checklist.status === 'completed';
              return (
                <button key={checklist._id} onClick={() => setSelectedControl(checklist.controlId)} className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <span className="text-sm font-medium text-gray-700 truncate">{checklist.controlId}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 ${isSelected ? 'rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedChecklist ? (
            <AuditChecklist
              checklist={selectedChecklist}
              isSubmitting={completeChecklist.isPending}
              onUpdate={async (questions: AuditChecklistItem[]) => {
                await updateChecklist.mutateAsync({ id: selectedChecklist._id, planId: effectivePlanId, questions });
              }}
              onComplete={async () => {
                await completeChecklist.mutateAsync({ id: selectedChecklist._id, planId: effectivePlanId });
              }}
              isReadOnly={plan.status === 'completed' || plan.status === 'cancelled'}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Nenhum controle selecionado</h3>
              <p className="text-gray-400 mt-2">Selecione um controle para iniciar a avaliação.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
