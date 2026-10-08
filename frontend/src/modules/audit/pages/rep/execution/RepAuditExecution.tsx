import React, { useEffect, useState, useMemo } from 'react';
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
  Info,
  Lightbulb,
  XCircle,
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
  useUploadEvidence,
  useEvidenceByPlan,
} from '../../../hooks/useAudit';
import {
  AuditChecklistItem,
  AuditChecklistAuditQuestion,
  AuditChecklistAnswer,
  AuditEvidence,
} from '../../../types/audit.types';
import { AuditChecklist } from '../../../components/AuditChecklist';
import api from '@/services/api';

// ============================================================
// 🆕 v52.7 — IMPORTS PARA DETECÇÃO DE ROLE
// ============================================================
//
// MOTIVO:
//   Este componente é compartilhado entre REP, AUDITOR_LEAD,
//   AUDITOR e OBSERVER. Precisamos detectar o role para:
//     1. Ajustar o base path de navegação (execution, findings,
//        reports)
//     2. Exibir/esconder botões de ação (Enviar/Aprovar/
//        Iniciar/Concluir/Editar)
//     3. Ajustar o lookup de controles (fallback)
//
// ============================================================
import { useAuth } from '../../../../../contexts/AuthContext.js';

// ============================================================
// RepAuditExecution — v51.7 / v52.7
// ============================================================
//
// 🔧 v51.6 — RESTAURAÇÃO
//   Reentregue completo após corrupção por cópia cruzada.
//
// 🆕 v51.7 — MELHORIAS DE UX
//   Adicionado banner contextual de fluxo de aprovação + dica
//   por status. Ajuda o usuário a entender em que etapa do
//   workflow o plano está e qual o próximo passo.
//
// 🔧 v52.7 — NAVEGAÇÃO POR ROLE + LABEL DE CONTROLE
//   1) Navegação passa a respeitar o role do usuário logado
//      (basePath dinâmico: /rep, /auditor-lead, /auditor,
//      /observer).
//   2) getControlLabel passa a preferir `controlId.id` e
//      `controlId.nome` do objeto populado (backend v52.7).
//      O lookup via /rep/controls permanece como FALLBACK —
//      não é removido.
//   3) Botões de ação são escondidos para roles sem permissão.
//
// ============================================================

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

// ============================================================
// 🆕 v51.7 — METADADOS DO BANNER POR STATUS
// ============================================================
//
// Cada status tem:
//   - Título (o que está acontecendo)
//   - Descrição (o que fazer agora)
//   - Estilo (cor de fundo, borda, ícone)
//
// ============================================================

interface BannerMeta {
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const getBannerMeta = (status: string): BannerMeta | null => {
  switch (status) {
    case 'draft':
      return {
        title: 'Este plano está em rascunho',
        description:
          'Quando estiver pronto, clique em "Enviar para aprovação". O Auditor Líder designado irá receber o plano para revisão.',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-500',
        Icon: Info,
      };

    case 'pending_approval':
      return {
        title: 'Aguardando aprovação do Auditor Líder',
        description:
          'O plano foi enviado para revisão. Ele só poderá ser iniciado após a aprovação do Auditor Líder designado.',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600',
        Icon: Clock,
      };

    case 'approved':
      return {
        title: 'Plano aprovado — pronto para iniciar',
        description:
          'O Auditor Líder aprovou o plano. Clique em "Iniciar auditoria" para começar a preencher os checklists.',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600',
        Icon: ShieldCheck,
      };

    case 'in_progress':
      return {
        title: 'Auditoria em andamento',
        description:
          'Preencha os checklists, anexe evidências e marque constatações. Quando todos os controles estiverem concluídos, você poderá encerrar a auditoria.',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-900',
        iconColor: 'text-indigo-600',
        Icon: Lightbulb,
      };

    case 'completed':
      return {
        title: 'Auditoria concluída',
        description:
          'Esta auditoria foi finalizada. Você pode revisar os checklists, evidências e gerar o relatório consolidado.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        Icon: CheckCircle,
      };

    case 'cancelled':
      return {
        title: 'Auditoria cancelada',
        description:
          'Este plano foi cancelado e não pode mais ser executado.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-600',
        Icon: XCircle,
      };

    default:
      return null;
  }
};

// ============================================================
// 🆕 v51.7 — DICA CONTEXTUAL POR STATUS (texto curto)
// ============================================================

const getStatusHint = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'Próximo passo: enviar para aprovação';
    case 'pending_approval':
      return 'Aguardando o Auditor Líder';
    case 'approved':
      return 'Próximo passo: iniciar auditoria';
    case 'in_progress':
      return 'Em execução — preencha os checklists';
    case 'completed':
      return 'Finalizada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return '';
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function RepAuditExecution() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId?: string }>();
  const effectivePlanId = planId || '';

  // ============================================================
  // 🆕 v52.7 — DETECÇÃO DE ROLE
  // ============================================================
  //
  // MOTIVO:
  //   O componente é compartilhado por REP, AUDITOR_LEAD,
  //   AUDITOR e OBSERVER. Precisamos saber o role para:
  //     1. Definir o base path de navegação (execution,
  //        findings, reports)
  //     2. Esconder botões que o role não pode usar
  //
  // REGRAS DE PERMISSÃO:
  //   - REP / ADMIN: pode tudo
  //   - AUDITOR_LEAD: aprova, inicia, conclui, executa
  //   - AUDITOR: executa checklists (não aprova/conclui)
  //   - OBSERVER: somente leitura
  //
  // ============================================================
  const { user } = useAuth();

  const isRep = user?.role === 'rep';
  const isAdmin = user?.role === 'admin';
  const isAuditorLead = user?.role === 'auditor_lead';
  const isAuditor = user?.role === 'auditor';
  const isObserver = user?.role === 'observer';

  // Permissões consolidadas
const canApproveOrConclude = isRep || isAdmin || isAuditorLead;
const canExecute = isRep || isAdmin || isAuditorLead || isAuditor;
const isReadOnly = isObserver;

  // Base path dinâmico
  const basePath = isAuditorLead
    ? '/auditor-lead/audit'
    : isAuditor
      ? '/auditor/audit'
      : isObserver
        ? '/observer/audit'
        : '/rep/audit';

  const [selectedControl, setSelectedControl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ============================================================
  // 🆕 v49.1.2 — CONTROLES PARA EXIBIÇÃO DE CÓDIGO + NOME
  // ============================================================
  //
  // 🔧 v52.7 — IMPORTANTE:
  //   Este lookup é FALLBACK. Agora o `checklist.controlId` vem
  //   populado pelo backend (com `id` e `nome`) e é usado como
  //   fonte primária. O lookup abaixo só entra em cena se o
  //   populate falhar (ex: controlId órfão em dados antigos).
  //
  //   Isso permite que o componente funcione tanto para REP
  //   (que pode acessar /rep/controls) quanto para o Auditor
  //   Líder/Auditor/Observer (que NÃO podem).
  //
  // ============================================================

  const [controls, setControls] = useState<Array<any>>([]);

  useEffect(() => {
    const fetchControls = async () => {
      try {
const res = await api.get('/internal-audit/controls');
        const list = res.data.data || res.data || [];
        setControls(Array.isArray(list) ? list : []);
      } catch (err) {
        // 🔧 v52.7 — Silencioso por design.
        // Para roles não-REP, este endpoint retorna 403.
        // O componente funciona sem ele — o populate do backend
        // já entrega controlId.id + controlId.nome.
        console.warn(
          '⚠️ Não foi possível carregar controles via /rep/controls (esperado para roles não-REP):',
          err
        );
      }
    };
    fetchControls();
  }, []);

  const controlsMap = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    (controls || []).forEach((c: any) => {
      const id = String(c._id || c.id || c.controlId || '');
      const code = String(c.id || c.controlId || c.code || '');
      const name = String(c.nome || c.name || c.title || '');
      if (id) map.set(id, { code, name });
    });
    return map;
  }, [controls]);

  // ============================================================
  // 🆕 v52.7 — GET CONTROL LABEL (PREFERE POPULATE)
  // ============================================================
  //
  // Prioridade:
  //   1. Se `checklist.controlId` for OBJETO (populado), usa
  //      `controlId.id` (código ISO) + `controlId.nome` (título).
  //   2. Senão, procura no controlsMap (via /rep/controls).
  //   3. Fallback: retorna o ID/hash cru.
  //
  // ============================================================
  const getControlLabelFromChecklist = (
    controlId: any
  ): string => {
    // Caso 1: controlId é objeto populado
    if (controlId && typeof controlId === 'object') {
      const code = String(controlId.id || '');
      const name = String(controlId.nome || '');

      if (code && name) return `${code} - ${name}`;
      if (code) return code;
      if (name) return name;

      // Se for objeto mas sem id/nome, tenta _id
      const fallbackId = String(controlId._id || '');
      if (fallbackId) {
        return getControlLabel(fallbackId);
      }
    }

    // Caso 2: controlId é string (fallback antigo)
    return getControlLabel(String(controlId || ''));
  };

  // Função auxiliar antiga (mantida para fallback)
  const getControlLabel = (controlId: string): string => {
    const entry = controlsMap.get(String(controlId));
    if (!entry) return controlId;
    const { code, name } = entry;
    if (code && name) return `${code} - ${name}`;
    return code || name || controlId;
  };

  const { data: plan, isLoading: isLoadingPlan } = usePlan(effectivePlanId);
  const { data: checklists = [], isLoading: isLoadingChecklists } = useChecklists(effectivePlanId);
  const updateChecklist = useUpdateChecklist();
  const completeChecklist = useCompleteChecklist();
  const submitPlan = useSubmitPlan();
  const approvePlan = useApprovePlan();
  const startPlan = useStartPlan();
  const completePlan = useCompletePlan();

  const { data: planEvidences = [] } = useEvidenceByPlan(effectivePlanId);
  const uploadEvidence = useUploadEvidence();

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

  const handleUploadEvidence = async (
    file: File,
    context: { controlId: string; questionIndex?: number }
  ): Promise<string> => {
    const description =
      context.questionIndex !== undefined
        ? `Controle ${context.controlId} — Pergunta ${context.questionIndex + 1}`
        : `Controle ${context.controlId} — Constatação final`;

    const result = await uploadEvidence.mutateAsync({
      auditPlanId: effectivePlanId,
      file,
      findingId: undefined,
      description,
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

  const handleOpenEvidence = async (evidenceId: string): Promise<void> => {
    if (!evidenceId) return;

    try {
      const response = await api.get(
        `/internal-audit/evidence/${evidenceId}/file`,
        { responseType: 'blob' }
      );

      const contentType =
        (response.headers?.['content-type'] as string) ||
        'application/octet-stream';

      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(blobUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err: any) {
      console.error('Erro ao abrir evidência:', err);

      const status = err?.response?.status;

      if (status === 401) {
        setActionError('Sessão expirada. Faça login novamente para abrir a evidência.');
      } else if (status === 404) {
        setActionError('Arquivo não encontrado no servidor.');
      } else {
        setActionError('Não foi possível abrir a evidência. Tente novamente.');
      }
    }
  };

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

  const handleUpdateFull = async (payload: {
    questions: AuditChecklistItem[];
    auditQuestions: AuditChecklistAuditQuestion[];
    finalConclusion: AuditChecklistAnswer;
    finalObservation: string;
    finalEvidenceIds: string[];
    finalJustification: string;
  }) => {
    if (!selectedChecklist) return;

    await updateChecklist.mutateAsync({
      id: selectedChecklist._id,
      planId: effectivePlanId,
      payload,
    } as any);
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
          <button onClick={() => navigate(`${basePath}/plans`)} className="mt-4 text-indigo-600 hover:text-indigo-800">Voltar para lista</button>
        </div>
      </div>
    );
  }

  const isPendingAction = submitPlan.isPending || approvePlan.isPending || startPlan.isPending || completePlan.isPending;

  // 🆕 v51.7 — Metadados do banner para o status atual
  const bannerMeta = getBannerMeta(plan.status);
  const statusHint = getStatusHint(plan.status);

  // 🔧 v52.7 — Cálculo final de "somente leitura" (por role + status)
  const isPlanLocked =
    plan.status === 'completed' || plan.status === 'cancelled';
  const isReadOnlyFinal = isObserver || isPlanLocked;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <button onClick={() => navigate(`${basePath}/plans`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-start">
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
          {/* 🔧 v52.7 — Botões de ação respeitam o role */}

          {plan.status === 'draft' && (isRep || isAdmin) && (
            <button onClick={() => runAction(() => submitPlan.mutateAsync(effectivePlanId))} disabled={isPendingAction} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Send className="w-4 h-4" /> Enviar para aprovação
            </button>
          )}

          {plan.status === 'pending_approval' && canApproveOrConclude && (
            <button onClick={() => runAction(() => approvePlan.mutateAsync(effectivePlanId))} disabled={isPendingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <ShieldCheck className="w-4 h-4" /> Aprovar plano
            </button>
          )}

          {plan.status === 'approved' && canApproveOrConclude && (
            <button onClick={() => runAction(() => startPlan.mutateAsync(effectivePlanId))} disabled={isPendingAction} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Play className="w-4 h-4" /> Iniciar auditoria
            </button>
          )}

          {plan.status === 'in_progress' && canApproveOrConclude && (
            <button onClick={() => runAction(() => completePlan.mutateAsync(effectivePlanId))} disabled={isPendingAction || completedChecklists < totalChecklists} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" title={completedChecklists < totalChecklists ? 'Conclua todos os checklists antes de encerrar a auditoria' : ''}>
              <CheckCircle className="w-4 h-4" /> Concluir auditoria
            </button>
          )}

          {plan.status === 'draft' && (isRep || isAdmin) && (
            <button onClick={() => navigate(`/rep/audit/plans/${effectivePlanId}/edit`)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Editar plano</button>
          )}
        </div>
      </div>

      {/* ============================================================
          🆕 v51.7 — BANNER CONTEXTUAL DE FLUXO DE APROVAÇÃO
          ============================================================
          Mostra ao usuário em que etapa do workflow o plano está
          e qual o próximo passo esperado. O conteúdo, cor e ícone
          variam conforme o status do plano.
          ============================================================ */}

      {bannerMeta && (
        <div
          className={`mb-6 flex items-start gap-3 ${bannerMeta.bgColor} border ${bannerMeta.borderColor} rounded-xl p-4`}
        >
          <div className={`p-1.5 bg-white rounded-lg shadow-sm flex-shrink-0`}>
            <bannerMeta.Icon className={`w-5 h-5 ${bannerMeta.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${bannerMeta.textColor}`}>
              {bannerMeta.title}
            </h3>
            <p className={`text-sm mt-0.5 ${bannerMeta.textColor} opacity-90`}>
              {bannerMeta.description}
            </p>
            {statusHint && (
              <p className={`text-xs mt-1.5 ${bannerMeta.iconColor} font-medium`}>
                → {statusHint}
              </p>
            )}
          </div>
        </div>
      )}

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
        {/* 🔧 v52.7 — Navegação usa basePath dinâmico */}
        <button onClick={() => navigate(`${basePath}/execution/${effectivePlanId}`)} className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">Checklist</button>
        <button onClick={() => navigate(`${basePath}/findings/${effectivePlanId}`)} className="px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">Achados</button>
        <button onClick={() => navigate(`${basePath}/reports/${effectivePlanId}`)} className="px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">Relatório</button>
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
              // 🔧 v52.7 — Passa o OBJETO inteiro para aproveitar o populate
              const controlLabel = getControlLabelFromChecklist(
                (checklist as any).controlId
              );
              return (
                <button key={checklist._id} onClick={() => setSelectedControl(checklist.controlId)} className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <span className="text-sm font-medium text-gray-700 truncate">{controlLabel}</span>
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
              key={selectedChecklist._id}
              checklist={selectedChecklist}
              isSubmitting={completeChecklist.isPending}
              onUpdate={async (questions: AuditChecklistItem[]) => {
                await updateChecklist.mutateAsync({ id: selectedChecklist._id, planId: effectivePlanId, questions });
              }}
              onUpdateFull={handleUpdateFull}
              onComplete={async () => {
                await completeChecklist.mutateAsync({ id: selectedChecklist._id, planId: effectivePlanId });
              }}
              isReadOnly={isReadOnlyFinal}
              controlsMap={controlsMap}
              onUploadEvidence={handleUploadEvidence}
              evidenceMap={evidenceMap}
              onOpenEvidence={handleOpenEvidence}
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