import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAudit } from '../../../hooks/useAudit';
import { AuditChecklist } from '../../../components/AuditChecklist';
import { AuditChecklistItem } from '../../../types/audit.types';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
export function RepAuditChecklist() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyResponses, setCompanyResponses] = useState<Array<{
    controlId: string;
    maturityLevel: string;
    scenarioDescription?: string;
    observations?: string;
  }>>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);

  // Hooks do React Query
  const {
    useChecklistsByPlan,
    useUpdateChecklist,
    useCompleteChecklist,
  } = useAudit();

  // Buscar checklists do plano
  const {
    data: checklistsData,
    isLoading,
    error,
    refetch,
  } = useChecklistsByPlan(planId || '');

  // Buscar respostas dos usuários diretamente
  useEffect(() => {
    const fetchResponses = async () => {
      if (!planId) return;
      setIsLoadingResponses(true);
      try {
        const response = await api.get(`/internal-audit/plans/${planId}/responses`);
        const data = response.data.data || [];
        const formatted = data.map((r: any) => ({
          controlId: r.controlId || r.control?.id || '',
          maturityLevel: r.maturityLevel || 'N/A',
          scenarioDescription: r.scenarioDescription || '',
          observations: r.observations || '',
        }));
        setCompanyResponses(formatted);
      } catch (err) {
        console.error('Erro ao buscar respostas:', err);
      } finally {
        setIsLoadingResponses(false);
      }
    };
    fetchResponses();
  }, [planId]);

  // Mutations
  const updateChecklistMutation = useUpdateChecklist();
  const completeChecklistMutation = useCompleteChecklist();

  // Estado local para o checklist atual
  const [currentChecklist, setCurrentChecklist] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<AuditChecklistItem[]>([]);

  // Atualizar quando os dados chegarem
  useEffect(() => {
    if (checklistsData?.data && checklistsData.data.length > 0) {
      const firstChecklist = checklistsData.data[0];
      setCurrentChecklist(firstChecklist);
      setChecklistItems(firstChecklist.questions || []);
    }
  }, [checklistsData]);

  const handleUpdateChecklist = async (questions: AuditChecklistItem[]) => {
    if (!currentChecklist) return;
    setIsSubmitting(true);
    try {
      await updateChecklistMutation.mutateAsync({
        id: currentChecklist._id,
        data: { questions },
      });
      toast.success('Checklist atualizado com sucesso!');
      await refetch();
    } catch (err) {
      toast.error('Erro ao atualizar checklist');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteChecklist = async () => {
    if (!currentChecklist) return;
    setIsSubmitting(true);
    try {
      await completeChecklistMutation.mutateAsync(currentChecklist._id);
      toast.success('Checklist concluído com sucesso!');
      await refetch();
    } catch (err) {
      toast.error('Erro ao concluir checklist');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingResponses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando checklist...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar checklist</h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          {(error as Error).message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!currentChecklist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum checklist encontrado</h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          Não há checklists disponíveis para este plano de auditoria.
        </p>
        <button onClick={() => navigate(`/rep/audit/execution/${planId}`)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Voltar para execução
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/rep/audit/execution/${planId}`)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklist de Auditoria</h1>
          <p className="text-sm text-gray-500">Plano: {currentChecklist.auditPlanId || planId}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentChecklist.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : currentChecklist.status === 'in_progress'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {currentChecklist.status === 'completed'
              ? 'Concluído'
              : currentChecklist.status === 'in_progress'
              ? 'Em andamento'
              : 'Não iniciado'}
          </span>
        </div>
      </div>

      <AuditChecklist
        checklist={currentChecklist}
        onUpdate={handleUpdateChecklist}
        onComplete={handleCompleteChecklist}
        isSubmitting={isSubmitting}
        isReadOnly={currentChecklist.status === 'completed'}
        companyResponses={companyResponses}
      />

      <div className="mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>
          Controle: {currentChecklist.controlId} • 
          Total de perguntas: {checklistItems.length} • 
          Respondidas: {checklistItems.filter((q: AuditChecklistItem) => q.answer !== undefined).length}
        </p>
        {companyResponses.length > 0 && (
          <p className="text-xs text-green-600 mt-1">
            ✅ {companyResponses.length} resposta(s) de usuários disponíveis para sincronização
          </p>
        )}
      </div>
    </div>
  );
}