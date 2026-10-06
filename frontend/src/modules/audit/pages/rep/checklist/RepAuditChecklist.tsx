import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAudit } from '../../../hooks/useAudit';
import { AuditChecklist } from '../../../components/AuditChecklist';
import {
  AuditChecklistItem,
  AuditChecklistAuditQuestion,
  AuditChecklistAnswer,
  // 🆕 v51.1 — Tipo da evidência para o mapa de exibição
  AuditEvidence,
} from '../../../types/audit.types';
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

  // ============================================================
  // 🆕 v49.1.2 — CONTROLES DA EMPRESA (exibição código + nome)
  // ============================================================

  const [controls, setControls] = useState<Array<any>>([]);

  // Hooks do React Query
  const {
    useChecklists,
    useUpdateChecklist,
    useCompleteChecklist,
    // 🆕 v51.1 — Hooks para upload e listagem de evidências
    useUploadEvidence,
    useEvidenceByPlan,
  } = useAudit;

  // Buscar checklists do plano
  const {
    data: checklistsData,
    isLoading,
    error,
    refetch,
  } = useChecklists(planId || '');

  // 🆕 v49.1.2 — Buscar controles da empresa (para exibição)
  useEffect(() => {
    const fetchControls = async () => {
      try {
        const res = await api.get('/rep/controls');
        const list = res.data.data || res.data || [];
        setControls(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('⚠️ Não foi possível carregar controles para exibição:', err);
      }
    };
    fetchControls();
  }, []);

  // 🆕 v49.1.2 — Mapa { controlId -> { code, name } }
  const controlsMap = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    (controls || []).forEach((c: any) => {
      const id = String(c._id || c.id || c.controlId || '');
      const code = String(c.id || c.controlId || c.code || '');
      const name = String(c.nome || c.name || c.title || '');
      if (id) {
        map.set(id, { code, name });
      }
    });
    return map;
  }, [controls]);

  // 🆕 v49.1.2 — Helper: rótulo amigável
  const getControlLabel = (controlId: string): string => {
    const entry = controlsMap.get(String(controlId));
    if (!entry) return controlId;
    const { code, name } = entry;
    if (code && name) return `${code} - ${name}`;
    return code || name || controlId;
  };

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

  // ============================================================
  // 🆕 v51.1 — EVIDÊNCIAS DO PLANO
  // ============================================================
  //
  // MOTIVO:
  //   O <AuditChecklist /> precisa de um `evidenceMap` para
  //   renderizar o nome amigável dos arquivos anexados a cada
  //   pergunta de auditoria e à constatação final.
  //
  // ESTRATÉGIA:
  //   - `useEvidenceByPlan(planId)` já existe no hook useAudit
  //     e usa React Query (cache automático por planId).
  //   - Derivamos o `Map<id, {filename, size}>` via useMemo para
  //     evitar re-render desnecessário.
  //   - `useUploadEvidence()` é a mutation já existente que faz
  //     POST /api/internal-audit/evidence/upload.
  //
  // IMPACTO:
  //   - Zero regressão (hooks já existiam).
  //   - A lista de evidências é invalidada automaticamente após
  //     cada upload (comportamento padrão do hook).
  //
  // ============================================================

  const { data: planEvidences = [] } = useEvidenceByPlan(planId || '');
  const uploadEvidence = useUploadEvidence();

  /**
   * 🆕 v51.1 — Mapa de evidências para exibição.
   *
   * Chave: evidenceId (string).
   * Valor: { filename, size }.
   *
   * O <AuditChecklist /> usa este mapa para exibir o nome do
   * arquivo em vez do ID bruto.
   */
  const evidenceMap = useMemo(() => {
    const map = new Map<string, { filename: string; size: number }>();
    (planEvidences || []).forEach((ev: AuditEvidence) => {
      const id = String(ev._id || ev.id || '');
      if (!id) return;
      map.set(id, {
        filename: ev.filename || id,
        size: Number(ev.size) || 0,
      });
    });
    return map;
  }, [planEvidences]);

  /**
   * 🆕 v51.1 — Callback de upload de evidência por pergunta.
   *
   * Recebe o arquivo + contexto do <AuditChecklist />, dispara a
   * mutation de upload (com `questionRef`) e retorna o `_id`
   * (string) da evidência criada. O componente então faz push em
   * `evidenceIds[]`.
   *
   * @param file     - Arquivo escolhido pelo auditor.
   * @param context  - { controlId, questionIndex? }.
   *                   questionIndex undefined = constatação final.
   */
  const handleUploadEvidence = async (
    file: File,
    context: { controlId: string; questionIndex?: number }
  ): Promise<string> => {
    const description =
      context.questionIndex !== undefined
        ? `Controle ${context.controlId} — Pergunta ${context.questionIndex + 1}`
        : `Controle ${context.controlId} — Constatação final`;

    const result = await uploadEvidence.mutateAsync({
      auditPlanId: planId || '',
      file,
      // findingId fica undefined: a evidência é vinculada à pergunta,
      // não a uma NC. A vinculação fina é feita via evidenceIds[] no
      // próprio checklist.
      findingId: undefined,
      description,
      // 🆕 v51.1 — Repassa o vínculo com a pergunta ao backend.
      // Se `questionIndex` for undefined, o backend entende como
      // constatação final do controle.
      questionRef: {
        controlId: context.controlId,
        questionIndex: context.questionIndex,
      },
    });

    const evidenceId = String(result?._id || result?.id || '');
    if (!evidenceId) {
      throw new Error('O servidor não retornou o ID da evidência.');
    }
    return evidenceId;
  };

  // Estado local para o checklist atual
  const [currentChecklist, setCurrentChecklist] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<AuditChecklistItem[]>([]);

  // ============================================================
  // 🔧 CORREÇÃO v50.1 — Acesso ao array de checklists
  // ============================================================
  //
  // PROBLEMA:
  //   O `useChecklists` do React Query retorna o array DIRETO
  //   (já passou por `response.data.data` no service).
  //
  //   MAS o código abaixo acessava `checklistsData.data[0]`,
  //   esperando um objeto `{ data: [...] }`.
  //
  //   Resultado: `checklistsData.data` era undefined, e o
  //   checklist nunca era setado → tela "Nenhum checklist
  //   encontrado" mesmo com o checklist existindo no banco.
  //
  // SOLUÇÃO:
  //   Usar `Array.isArray(checklistsData)` para acessar o array
  //   diretamente. Fallback seguro para [] se não for array.
  //
  // ============================================================

  useEffect(() => {
    const checklistsArray = Array.isArray(checklistsData)
      ? checklistsData
      : [];

    if (checklistsArray.length > 0) {
      const firstChecklist = checklistsArray[0];
      setCurrentChecklist(firstChecklist);
      setChecklistItems(firstChecklist.questions || []);
    }
  }, [checklistsData]);

  // ============================================================
  // HANDLER LEGADO — Atualização só das perguntas do Assessment
  // ============================================================
  //
  // MANTIDO para compatibilidade. Não é mais chamado pelo
  // componente quando `onUpdateFull` está presente, mas fica
  // aqui como fallback / referência histórica.

  const handleUpdateChecklist = async (questions: AuditChecklistItem[]) => {
    if (!currentChecklist) return;
    setIsSubmitting(true);
    try {
      await updateChecklistMutation.mutateAsync({
        id: currentChecklist._id,
        planId: planId || '',
        questions,
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

  // ============================================================
  // 🆕 v50.1 — HANDLER COMPLETO
  // ============================================================
  //
  // Recebe o payload inteiro do componente:
  //   - questions           (Assessment)
  //   - auditQuestions      (perguntas de auditoria)
  //   - finalConclusion     (constatação final do controle)
  //   - finalObservation
  //   - finalEvidenceIds
  //   - finalJustification
  //
  // Envia o payload via `payload` para o hook `useUpdateChecklist`,
  // que agora aceita as DUAS formas (questions ou payload).

  const handleUpdateChecklistFull = async (payload: {
    questions: AuditChecklistItem[];
    auditQuestions: AuditChecklistAuditQuestion[];
    finalConclusion: AuditChecklistAnswer;
    finalObservation: string;
    finalEvidenceIds: string[];
    finalJustification: string;
  }) => {
    if (!currentChecklist) return;
    setIsSubmitting(true);
    try {
      await updateChecklistMutation.mutateAsync({
        id: currentChecklist._id,
        planId: planId || '',
        payload,
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
      await completeChecklistMutation.mutateAsync({
        id: currentChecklist._id,
        planId: planId || '',
      });
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

  // 🆕 v50.1 — Contadores de auditoria (para o rodapé)

  const auditQuestions = currentChecklist.auditQuestions || [];
  const totalAudit = auditQuestions.length;
  const answeredAudit = auditQuestions.filter(
    (q: AuditChecklistAuditQuestion) => q.answer && q.answer !== '--'
  ).length;

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
        onUpdateFull={handleUpdateChecklistFull}
        onComplete={handleCompleteChecklist}
        isSubmitting={isSubmitting}
        isReadOnly={currentChecklist.status === 'completed'}
        companyResponses={companyResponses}
        controlsMap={controlsMap}
        /* 🆕 v51.1 — Upload de evidência por pergunta + constatação final */
        onUploadEvidence={handleUploadEvidence}
        /* 🆕 v51.1 — Mapa id → {filename, size} para exibição amigável */
        evidenceMap={evidenceMap}
      />

      <div className="mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>
          {/* 🆕 v49.1.2 — Usa rótulo amigável do controle */}
          Controle: {getControlLabel(String(currentChecklist.controlId))} • 
          Total de perguntas do Assessment: {checklistItems.length} • 
          Respondidas: {checklistItems.filter((q: AuditChecklistItem) => q.answer !== undefined).length}
        </p>

        {/* 🆕 v50.1 — Linha de auditoria (só quando houver) */}
        {totalAudit > 0 && (
          <p className="mt-1">
            Perguntas de auditoria: {totalAudit} • Respondidas: {answeredAudit}
          </p>
        )}

        {companyResponses.length > 0 && (
          <p className="text-xs text-green-600 mt-1">
            ✅ {companyResponses.length} resposta(s) de usuários disponíveis para sincronização
          </p>
        )}
      </div>
    </div>
  );
}