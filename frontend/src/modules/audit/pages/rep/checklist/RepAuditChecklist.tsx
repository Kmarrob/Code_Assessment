import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Shield,
  Cpu,
  FileText,
  Paperclip,
  ListChecks,
  Filter,
} from 'lucide-react';
import { useAudit } from '../../../hooks/useAudit';
import { AuditChecklist } from '../../../components/AuditChecklist';
import {
  AuditChecklistItem,
  AuditChecklistAuditQuestion,
  AuditChecklistAnswer,
  AuditEvidence,
  AuditChecklist as AuditChecklistType,
} from '../../../types/audit.types';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

// ============================================================
// RepAuditChecklist — v51.4 (Página Viva)
// ============================================================
//
// 🔧 v51.4 — REESCRITA COMPLETA DA TELA
// ----------------------------------------------------------------
// ANTES:
//   - Mostrava apenas o PRIMEIRO checklist do plano.
//   - Sem navegação, sem KPIs, sem agrupamento.
//   - Sem cards, sem filtros, sem vida.
//
// AGORA:
//   - Lista TODOS os checklists do plano.
//   - Agrupa por domínio (A.5, A.6, A.7, A.8) em cards colapsáveis.
//   - KPIs no header: total, concluídos, em andamento, pendentes.
//   - Barra de progresso global.
//   - Filtros por status (Todos / Concluído / Em andamento / Pendente).
//   - Cada controle mostra badge de status + contador de evidências.
//   - Ao clicar num controle, expande o <AuditChecklist /> inline
//     (modo leitura), no próprio card.
//   - Botão "Voltar" para a tela de execução.
//   - Estados vazios e de loading tratados.
//
// COMPATIBILIDADE:
//   - Todas as props e hooks do v51.1 foram mantidos.
//   - Nenhuma funcionalidade existente foi removida.
//   - Nenhuma rota mudou.
//
// ============================================================

// ============================================================
// METADADOS DOS DOMÍNIOS (Anexo A ISO 27001:2022)
// ============================================================

interface DomainMeta {
  prefix: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

const DOMAINS: DomainMeta[] = [
  {
    prefix: '5',
    label: 'A.5 — Organizacionais',
    description: 'Controles organizacionais (políticas, ativos, fornecedores, incidentes)',
    icon: Building2,
    accentColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    prefix: '6',
    label: 'A.6 — Pessoas',
    description: 'Controles de pessoas (triagem, treinamento, trabalho remoto)',
    icon: Users,
    accentColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    prefix: '7',
    label: 'A.7 — Físicos',
    description: 'Controles físicos (perímetros, entrada, equipamentos, descarte)',
    icon: Shield,
    accentColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    prefix: '8',
    label: 'A.8 — Tecnológicos',
    description: 'Controles tecnológicos (autenticação, logs, criptografia, redes)',
    icon: Cpu,
    accentColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
];

// ============================================================
// HELPERS DE DOMÍNIO
// ============================================================

/**
 * Extrai o prefixo de domínio do código ISO do controle.
 *
 * Ex.: "5.1" → "5" ; "8.34" → "8" ; "6.7" → "6"
 *
 * Retorna "" quando o código não segue o padrão.
 */
function getDomainPrefix(controlCode: string): string {
  const code = String(controlCode || '').trim();
  if (!code) return '';
  const [prefix] = code.split('.');
  return prefix || '';
}

/**
 * Resolve os metadados do domínio a partir do código ISO.
 */
function getDomainMeta(controlCode: string): DomainMeta | null {
  const prefix = getDomainPrefix(controlCode);
  return DOMAINS.find((d) => d.prefix === prefix) || null;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'pending';

interface StatusMeta {
  key: StatusFilter;
  label: string;
  color: string;
  bgColor: string;
}

const STATUS_FILTERS: StatusMeta[] = [
  { key: 'all', label: 'Todos', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { key: 'completed', label: 'Concluídos', color: 'text-green-700', bgColor: 'bg-green-100' },
  { key: 'in_progress', label: 'Em andamento', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { key: 'pending', label: 'Pendentes', color: 'text-gray-500', bgColor: 'bg-gray-100' },
];

export function RepAuditChecklist() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  // ============================================================
  // ESTADOS (nomes preservados do v51.1 onde possível)
  // ============================================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companyResponses, setCompanyResponses] = useState<Array<{
    controlId: string;
    maturityLevel: string;
    scenarioDescription?: string;
    observations?: string;
  }>>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);

  const [controls, setControls] = useState<Array<any>>([]);

  // 🆕 v51.4 — Filtros e navegação
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(DOMAINS.map((d) => d.prefix))  // todos expandidos por padrão
  );
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);

  // ============================================================
  // HOOKS REACT QUERY
  // ============================================================

  const {
    useChecklists,
    useUpdateChecklist,
    useCompleteChecklist,
    useUploadEvidence,
    useEvidenceByPlan,
  } = useAudit;

  const {
    data: checklistsData,
    isLoading,
    error,
    refetch,
  } = useChecklists(planId || '');

  // Buscar controles da empresa (para exibição de código+nome)
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

  // Mapa { controlId -> { code, name } }
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

  const getControlLabel = (controlId: string): string => {
    const entry = controlsMap.get(String(controlId));
    if (!entry) return controlId;
    const { code, name } = entry;
    if (code && name) return `${code} - ${name}`;
    return code || name || controlId;
  };

  // Buscar respostas dos usuários (usadas para sincronizar maturidade)
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

  const updateChecklistMutation = useUpdateChecklist();
  const completeChecklistMutation = useCompleteChecklist();

  // Evidências do plano (para o evidenceMap)
  const { data: planEvidences = [] } = useEvidenceByPlan(planId || '');
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

  // ============================================================
  // LISTA DE CHECKLISTS NORMALIZADA
  // ============================================================

  const allChecklists: AuditChecklistType[] = useMemo(() => {
    if (!Array.isArray(checklistsData)) return [];
    return checklistsData;
  }, [checklistsData]);

  // ============================================================
  // KPIs (contadores)
  // ============================================================

  const kpis = useMemo(() => {
    const total = allChecklists.length;
    const completed = allChecklists.filter((c) => c.status === 'completed').length;
    const inProgress = allChecklists.filter((c) => c.status === 'in_progress').length;
    const pending = allChecklists.filter((c) => c.status === 'pending').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, progress };
  }, [allChecklists]);

  // ============================================================
  // CONTAGEM POR STATUS (para os pills de filtro)
  // ============================================================

  const filterCounts = useMemo(() => {
    const total = allChecklists.length;
    const completed = allChecklists.filter((c) => c.status === 'completed').length;
    const inProgress = allChecklists.filter((c) => c.status === 'in_progress').length;
    const pending = allChecklists.filter((c) => c.status === 'pending').length;
    return {
      all: total,
      completed,
      in_progress: inProgress,
      pending,
    };
  }, [allChecklists]);

  // ============================================================
  // AGRUPAMENTO POR DOMÍNIO (com filtro aplicado)
  // ============================================================

  const groupedByDomain = useMemo(() => {
    // Aplica filtro de status
    const filtered = allChecklists.filter((c) => {
      if (statusFilter === 'all') return true;
      return c.status === statusFilter;
    });

    // Agrupa por domínio
    const groups: Record<string, AuditChecklistType[]> = {
      '5': [],
      '6': [],
      '7': [],
      '8': [],
      'outros': [],
    };

    filtered.forEach((checklist) => {
      const entry = controlsMap.get(String(checklist.controlId));
      const code = entry?.code || '';
      const prefix = getDomainPrefix(code);

      if (prefix === '5' || prefix === '6' || prefix === '7' || prefix === '8') {
        groups[prefix].push(checklist);
      } else {
        groups['outros'].push(checklist);
      }
    });

    return groups;
  }, [allChecklists, statusFilter, controlsMap]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const toggleDomain = (prefix: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(prefix)) {
        next.delete(prefix);
      } else {
        next.add(prefix);
      }
      return next;
    });
  };

  const toggleChecklist = (checklistId: string) => {
    setExpandedChecklistId((prev) => (prev === checklistId ? null : checklistId));
  };

  const handleUpdateChecklist = async (questions: AuditChecklistItem[]) => {
    if (!expandedChecklistId) return;
    setIsSubmitting(true);
    try {
      await updateChecklistMutation.mutateAsync({
        id: expandedChecklistId,
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

  const handleUpdateChecklistFull = async (payload: {
    questions: AuditChecklistItem[];
    auditQuestions: AuditChecklistAuditQuestion[];
    finalConclusion: AuditChecklistAnswer;
    finalObservation: string;
    finalEvidenceIds: string[];
    finalJustification: string;
  }) => {
    if (!expandedChecklistId) return;
    setIsSubmitting(true);
    try {
      await updateChecklistMutation.mutateAsync({
        id: expandedChecklistId,
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
    if (!expandedChecklistId) return;
    setIsSubmitting(true);
    try {
      await completeChecklistMutation.mutateAsync({
        id: expandedChecklistId,
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

  // ============================================================
  // RENDER — LOADING
  // ============================================================

  if (isLoading || isLoadingResponses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando checklists...</span>
      </div>
    );
  }

  // ============================================================
  // RENDER — ERRO
  // ============================================================

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar checklists
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          {(error as Error).message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER — VAZIO (sem checklists no plano)
  // ============================================================

  if (allChecklists.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/rep/audit/execution/${planId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Checklists do Plano
            </h1>
            <p className="text-sm text-gray-500">Plano: {planId}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum checklist encontrado
          </h3>
          <p className="text-gray-500 text-sm">
            Este plano de auditoria ainda não possui checklists gerados.
          </p>
          <button
            onClick={() => navigate(`/rep/audit/execution/${planId}`)}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ir para a execução
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  const expandedChecklist = expandedChecklistId
    ? allChecklists.find((c) => c._id === expandedChecklistId) || null
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ============================================================
          HEADER — voltar + título + status geral
          ============================================================ */}

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/rep/audit/execution/${planId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Checklists do Plano
          </h1>
          <p className="text-sm text-gray-500">Plano: {planId}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* ============================================================
          KPIs — 4 cards de contadores
          ============================================================ */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ListChecks className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total de controles</p>
              <p className="text-xl font-bold text-gray-900">{kpis.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Concluídos</p>
              <p className="text-xl font-bold text-gray-900">{kpis.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Em andamento</p>
              <p className="text-xl font-bold text-gray-900">{kpis.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Circle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pendentes</p>
              <p className="text-xl font-bold text-gray-900">{kpis.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BARRA DE PROGRESSO GLOBAL
          ============================================================ */}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso da auditoria
          </span>
          <span className="text-sm text-gray-500">
            {kpis.completed}/{kpis.total} controles concluídos ({kpis.progress}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${kpis.progress}%` }}
          />
        </div>
      </div>

      {/* ============================================================
          FILTROS POR STATUS
          ============================================================ */}

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-500 mr-2">
          <Filter className="w-4 h-4" />
          <span>Filtrar:</span>
        </div>
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter.key;
          const count = filterCounts[filter.key];
          return (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${filter.bgColor} ${filter.color} ring-2 ring-offset-1 ring-indigo-300`
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
              <span
                className={`ml-2 text-xs font-bold ${
                  isActive ? '' : 'text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================
          CARDS POR DOMÍNIO
          ============================================================ */}

      <div className="space-y-4">
        {DOMAINS.map((domain) => {
          const checklistsInDomain = groupedByDomain[domain.prefix] || [];
          const isExpanded = expandedDomains.has(domain.prefix);

          const domainTotal = checklistsInDomain.length;
          const domainCompleted = checklistsInDomain.filter(
            (c) => c.status === 'completed'
          ).length;
          const domainProgress =
            domainTotal > 0 ? Math.round((domainCompleted / domainTotal) * 100) : 0;

          // Se não há checklists neste domínio E o filtro não é "all",
          // esconde o card (evita poluição visual).
          if (domainTotal === 0 && statusFilter !== 'all') {
            return null;
          }

          const Icon = domain.icon;

          return (
            <div
              key={domain.prefix}
              className={`bg-white rounded-xl border ${domain.borderColor} overflow-hidden transition-all`}
            >
              {/* Header do card */}
              <button
                type="button"
                onClick={() => toggleDomain(domain.prefix)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${domain.bgColor}`}
              >
                {isExpanded ? (
                  <ChevronDown className={`w-5 h-5 ${domain.accentColor}`} />
                ) : (
                  <ChevronRight className={`w-5 h-5 ${domain.accentColor}`} />
                )}
                <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                  <Icon className={`w-5 h-5 ${domain.accentColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold text-sm ${domain.accentColor}`}>
                    {domain.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {domain.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Progresso</p>
                    <p className={`text-sm font-bold ${domain.accentColor}`}>
                      {domainCompleted}/{domainTotal}
                    </p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-current h-1.5 rounded-full transition-all"
                      style={{
                        width: `${domainProgress}%`,
                        color:
                          domain.accentColor.includes('indigo')
                            ? '#4f46e5'
                            : domain.accentColor.includes('emerald')
                            ? '#059669'
                            : domain.accentColor.includes('amber')
                            ? '#d97706'
                            : '#2563eb',
                      }}
                    />
                  </div>
                </div>
              </button>

              {/* Lista de controles do domínio */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {checklistsInDomain.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400 italic">
                      Nenhum controle neste domínio para o filtro atual.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {checklistsInDomain.map((checklist) => {
                        const isChecklistExpanded =
                          expandedChecklistId === checklist._id;
                        const evidenceCount = [
                          ...(checklist.finalEvidenceIds || []),
                          ...((checklist.auditQuestions || []).flatMap(
                            (q) => q.evidenceIds || []
                          )),
                          ...((checklist.questions || []).flatMap(
                            (q) => q.evidenceIds || []
                          )),
                        ].length;

                        const statusMeta =
                          checklist.status === 'completed'
                            ? {
                                label: 'Concluído',
                                color: 'text-green-700',
                                bgColor: 'bg-green-100',
                                icon: CheckCircle,
                              }
                            : checklist.status === 'in_progress'
                            ? {
                                label: 'Em andamento',
                                color: 'text-yellow-700',
                                bgColor: 'bg-yellow-100',
                                icon: Clock,
                              }
                            : {
                                label: 'Pendente',
                                color: 'text-gray-500',
                                bgColor: 'bg-gray-100',
                                icon: Circle,
                              };

                        const StatusIcon = statusMeta.icon;

                        return (
                          <div key={checklist._id}>
                            {/* Linha do controle */}
                            <button
                              type="button"
                              onClick={() => toggleChecklist(checklist._id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              {isChecklistExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <StatusIcon
                                className={`w-4 h-4 flex-shrink-0 ${statusMeta.color}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {getControlLabel(checklist.controlId)}
                                </p>
                              </div>
                              {evidenceCount > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex-shrink-0">
                                  <Paperclip className="w-3 h-3" />
                                  {evidenceCount}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusMeta.bgColor} ${statusMeta.color}`}
                              >
                                {statusMeta.label}
                              </span>
                            </button>

                            {/* Conteúdo expandido */}
                            {isChecklistExpanded && (
                              <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                                <AuditChecklist
                                  key={checklist._id}
                                  checklist={checklist}
                                  isSubmitting={isSubmitting}
                                  onUpdate={handleUpdateChecklist}
                                  onUpdateFull={handleUpdateChecklistFull}
                                  onComplete={handleCompleteChecklist}
                                  isReadOnly={true}
                                  companyResponses={companyResponses}
                                  controlsMap={controlsMap}
                                  onUploadEvidence={handleUploadEvidence}
                                  evidenceMap={evidenceMap}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================
          FOOTER — dica de navegação
          ============================================================ */}

      <div className="mt-6 text-xs text-gray-400 text-center">
        Clique em um domínio para expandir/recolher. Clique em um controle
        para ver o checklist.
      </div>
    </div>
  );
}