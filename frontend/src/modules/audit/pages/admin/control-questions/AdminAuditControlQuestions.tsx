import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Power,
  Save,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAudit } from '../../../hooks/useAudit';
import {
  AuditControlQuestionFull,
  CreateAuditControlQuestionDTO,
  UpdateAuditControlQuestionDTO,
} from '../../../types/auditControlQuestion.types';
import controlService, { Control } from '@/services/control.service';

// ============================================================
// ADMIN AUDIT CONTROL QUESTIONS — v50.2.11
// ============================================================
//
// Tela dedicada ao ADMIN para cadastrar manualmente as perguntas
// de auditoria por CONTROLE do Anexo A (ISO 27001:2022).
//
// 🔧 v50.2.10 — Debounce de 400ms na busca e nos filtros.
// 🔧 v50.2.11 — Remove o indicador "Atualizando..." e deixa o
//               placeholderData (keepPreviousData) do React
//               Query manter a lista visível enquanto recarrega.
//               Com isso a tela para de "piscar" a cada tecla.
//
// ============================================================

// ============================================================
// Hook auxiliar: debounce de valor (400ms)
// ============================================================

function useDebouncedValue<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

interface FormState {
  controlId: string;
  controlName: string;
  controlGroup: string;
  controlDescription: string;
  text: string;
  objective: string;
  guidance: string;
  evidenceExpected: string;
  order: number;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  controlId: '',
  controlName: '',
  controlGroup: '',
  controlDescription: '',
  text: '',
  objective: '',
  guidance: '',
  evidenceExpected: '',
  order: 1,
  active: true,
};

function deriveControlGroup(controlId: string): string {
  const prefix = String(controlId || '').split('.')[0];

  switch (prefix) {
    case '5':
      return 'A.5 Organizacionais';
    case '6':
      return 'A.6 Pessoas';
    case '7':
      return 'A.7 Físicos';
    case '8':
      return 'A.8 Tecnológicos';
    default:
      return 'Anexo A';
  }
}

export function AdminAuditControlQuestions() {
  const navigate = useNavigate();

  const {
    useAuditControlQuestions,
    useAuditControlQuestionStats,
    useCreateAuditControlQuestion,
    useUpdateAuditControlQuestion,
    useDeleteAuditControlQuestion,
  } = useAudit;

  // ---- Estados locais dos filtros ----

  const [search, setSearch] = useState('');
  const [controlIdFilter, setControlIdFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 🔧 v50.2.10 — Valores debounced (400ms).
  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedControlId = useDebouncedValue(controlIdFilter, 400);

  // ---- Estados de UI ----

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<AuditControlQuestionFull | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [controls, setControls] = useState<Control[]>([]);
  const [isLoadingControls, setIsLoadingControls] = useState(true);

  // ---- Filtros efetivos (usam os valores debounced) ----

  const filters = useMemo(() => {
    const f: any = {};
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    if (debouncedControlId.trim()) f.controlId = debouncedControlId.trim();
    if (activeFilter !== 'all') f.active = activeFilter === 'true';
    return f;
  }, [debouncedSearch, debouncedControlId, activeFilter]);

  // ---- Queries ----

  const {
    data: questions = [],
    isLoading,
    error,
    refetch,
  } = useAuditControlQuestions(filters);

  const { data: stats } = useAuditControlQuestionStats();

  // ---- Mutations ----

  const createMutation = useCreateAuditControlQuestion();
  const updateMutation = useUpdateAuditControlQuestion();
  const deleteMutation = useDeleteAuditControlQuestion();

  // ---- Carregar controles (uma vez) ----

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingControls(true);

        const response = await controlService.listControls({
          page: 1,
          limit: 200,
        });

        const all = response.items || [];

        const sorted = [...all].sort((a, b) => {
          const [aMaj, aMin] = String(a.id || '').split('.').map(Number);
          const [bMaj, bMin] = String(b.id || '').split('.').map(Number);
          if (aMaj !== bMaj) return aMaj - bMaj;
          return (aMin || 0) - (bMin || 0);
        });

        setControls(sorted);
      } catch (err) {
        console.error('Erro ao carregar controles:', err);
        toast.error('Não foi possível carregar a lista de controles');
      } finally {
        setIsLoadingControls(false);
      }
    };
    load();
  }, []);

  // ---- Agrupamento por controlGroup ----

  const grouped = useMemo(() => {
    const map = new Map<string, AuditControlQuestionFull[]>();
    (questions || []).forEach((q) => {
      const key = q.controlGroup || 'Sem grupo';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    });

    const entries = Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    entries.forEach(([, list]) => {
      list.sort((a, b) => {
        const controlCompare = a.controlId.localeCompare(b.controlId);
        if (controlCompare !== 0) return controlCompare;
        return a.order - b.order;
      });
    });
    return entries;
  }, [questions]);

  // ---- Handlers de UI ----

  const toggleGroup = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setExpandedGroups(next);
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (q: AuditControlQuestionFull) => {
    setEditingQuestion(q);
    setFormData({
      controlId: q.controlId || '',
      controlName: q.controlName || '',
      controlGroup: q.controlGroup || '',
      controlDescription: q.controlDescription || '',
      text: q.text || '',
      objective: q.objective || '',
      guidance: q.guidance || '',
      evidenceExpected: q.evidenceExpected || '',
      order: q.order || 1,
      active: q.active ?? true,
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingQuestion(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleControlSelect = (controlId: string) => {
    const selected = controls.find((c) => c.id === controlId);

    if (!selected) {
      setFormData((prev) => ({
        ...prev,
        controlId: '',
        controlName: '',
        controlGroup: '',
        controlDescription: prev.controlDescription || '',
      }));
      return;
    }

    setFormData((prev) => {
      const currentDesc = (prev.controlDescription || '').trim();
      const descFromControl = String((selected as any).controles || '').trim();

      return {
        ...prev,
        controlId: selected.id,
        controlName: selected.nome || '',
        controlGroup: deriveControlGroup(selected.id),
        controlDescription: currentDesc !== '' ? prev.controlDescription : descFromControl,
      };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.controlId.trim()) {
      errors.controlId = 'Selecione um controle';
    }

    if (!formData.controlName.trim()) {
      errors.controlName = 'Nome do controle é obrigatório';
    }

    if (!formData.text.trim()) {
      errors.text = 'Texto da pergunta é obrigatório';
    } else if (formData.text.trim().length < 5) {
      errors.text = 'Texto da pergunta deve ter no mínimo 5 caracteres';
    }

    if (!formData.order || formData.order < 1) {
      errors.order = 'Ordem deve ser no mínimo 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveQuestion = async (closeAfter: boolean) => {
    console.log('🚀 [saveQuestion] INICIADO', {
      closeAfter,
      editingQuestion: !!editingQuestion,
      formData,
    });

    if (!validateForm()) {
      console.log('⚠️ [saveQuestion] Validação falhou — abortando');
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    createMutation.reset();
    updateMutation.reset();

    try {
      if (editingQuestion) {
        const payload: UpdateAuditControlQuestionDTO = {
          controlId: formData.controlId.trim(),
          controlName: formData.controlName.trim(),
          controlGroup: formData.controlGroup.trim(),
          controlDescription: formData.controlDescription.trim(),
          text: formData.text.trim(),
          objective: formData.objective.trim(),
          guidance: formData.guidance.trim(),
          evidenceExpected: formData.evidenceExpected.trim(),
          order: formData.order,
          active: formData.active,
        };

        console.log('📤 [saveQuestion] PUT payload:', payload);

        await updateMutation.mutateAsync({
          id: editingQuestion._id || editingQuestion.id || '',
          data: payload,
        });

        console.log('✅ [saveQuestion] PUT concluído');
        toast.success('Pergunta atualizada com sucesso!');
      } else {
        const payload: CreateAuditControlQuestionDTO = {
          controlId: formData.controlId.trim(),
          controlName: formData.controlName.trim(),
          controlGroup: formData.controlGroup.trim(),
          controlDescription: formData.controlDescription.trim(),
          text: formData.text.trim(),
          objective: formData.objective.trim(),
          guidance: formData.guidance.trim(),
          evidenceExpected: formData.evidenceExpected.trim(),
          order: formData.order,
          active: formData.active,
        };

        console.log('📤 [saveQuestion] POST payload:', payload);

        await createMutation.mutateAsync(payload);

        console.log('✅ [saveQuestion] POST concluído');
        toast.success('Pergunta criada com sucesso!');
      }

      await refetch();

      if (closeAfter) {
        closeFormModal();
      } else {
        setFormData((prev) => ({
          ...prev,
          text: '',
          objective: '',
          guidance: '',
          evidenceExpected: '',
          order: prev.order + 1,
        }));
        setFormErrors({});
      }
    } catch (err: any) {
      console.error('❌ [saveQuestion] Erro:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Erro ao salvar pergunta';
      toast.error(message);
    }
  };

  const handleToggleActive = async (q: AuditControlQuestionFull) => {
    try {
      await updateMutation.mutateAsync({
        id: q._id || q.id || '',
        data: { active: !q.active },
      });
      toast.success(q.active ? 'Pergunta desativada' : 'Pergunta ativada');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao atualizar status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmId);
      toast.success('Pergunta excluída com sucesso!');
      setDeleteConfirmId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao excluir pergunta');
    }
  };

  // ---- Render: loading / error ----
  //
  // 🔧 v50.2.11 — Só mostra o spinner grande quando:
  //   • Ainda está carregando a primeira resposta E
  //   • Não há NENHUM dado anterior (keepPreviousData vazio)
  //
  // Isso evita que a tela troque por "Carregando..." a cada
  // troca de filtro.

  const showFullSpinner = isLoading && questions.length === 0;

  if (showFullSpinner || isLoadingControls) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar perguntas
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          {(error as Error).message || 'Ocorreu um erro inesperado.'}
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/audit/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Perguntas de Auditoria — Controles (Anexo A)
          </h1>
          <p className="text-sm text-gray-500">
            Cadastro manual das perguntas de auditoria dos 93 controles da ISO 27001:2022
          </p>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.total ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Ativas</div>
          <div className="text-2xl font-bold text-green-600">
            {stats?.active ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Inativas</div>
          <div className="text-2xl font-bold text-gray-400">
            {stats?.inactive ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Controles cobertos</div>
          <div className="text-2xl font-bold text-indigo-600">
            {stats?.byControlId ? Object.keys(stats.byControlId).length : 0}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por texto, objetivo, orientação ou código do controle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Código do controle
              </label>
              <input
                type="text"
                placeholder="Ex.: 5.1, 6.2, 8.34"
                value={controlIdFilter}
                onChange={(e) => setControlIdFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) =>
                  setActiveFilter(e.target.value as 'all' | 'true' | 'false')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">Todas</option>
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista agrupada */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">
            {debouncedSearch.trim() || debouncedControlId.trim() || activeFilter !== 'all'
              ? 'Nenhuma pergunta encontrada com os filtros atuais.'
              : 'Nenhuma pergunta cadastrada.'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {debouncedSearch.trim() || debouncedControlId.trim() || activeFilter !== 'all'
              ? 'Ajuste ou limpe os filtros para ver mais resultados.'
              : 'Clique em "Nova Pergunta" para começar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([group, list]) => {
            const isExpanded = expandedGroups.has(group);
            return (
              <div
                key={group}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="font-semibold text-gray-900">{group}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {list.length} pergunta{list.length !== 1 ? 's' : ''}
                  </span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {list.map((q) => (
                      <div
                        key={q._id || q.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                {q.controlId}
                              </span>
                              <span className="text-xs text-gray-500">
                                Ordem {q.order}
                              </span>
                              {!q.active && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                                  Inativa
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {q.text}
                            </p>
                            {q.objective && (
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">Objetivo:</span>{' '}
                                {q.objective}
                              </p>
                            )}
                            {q.evidenceExpected && (
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">Evidência esperada:</span>{' '}
                                {q.evidenceExpected}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(q)}
                              title={q.active ? 'Desativar' : 'Ativar'}
                              className={`p-2 rounded-lg transition-colors ${
                                q.active
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(q)}
                              title="Editar"
                              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(q._id || q.id || '')}
                              title="Excluir"
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de formulário */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta de Auditoria'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Pergunta de auditoria para um controle do Anexo A
              </p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Controle *
                    </label>
                    <select
                      value={formData.controlId}
                      onChange={(e) => handleControlSelect(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.controlId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione um controle...</option>
                      {controls.map((c) => (
                        <option key={c._id} value={c.id}>
                          {c.id} — {c.nome}
                        </option>
                      ))}
                    </select>
                    {formErrors.controlId && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.controlId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grupo do Controle
                    </label>
                    <input
                      type="text"
                      value={formData.controlGroup}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Controle *
                  </label>
                  <input
                    type="text"
                    value={formData.controlName}
                    readOnly
                    className={`w-full px-3 py-2 border bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed ${
                      formErrors.controlName ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.controlName && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.controlName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição do Controle
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Texto oficial do controle conforme a norma ISO 27001:2022 Anexo A (preenchido automaticamente ao selecionar o controle)."
                    value={formData.controlDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, controlDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Esta descrição aparece no topo das perguntas de auditoria do checklist.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pergunta de Auditoria *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex.: As políticas de SI existem formalmente?"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.text ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.text && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.text}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo da Pergunta
                  </label>
                  <textarea
                    rows={2}
                    placeholder="O que o auditor quer confirmar com esta pergunta"
                    value={formData.objective}
                    onChange={(e) =>
                      setFormData({ ...formData, objective: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientação ao Auditor
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Dicas: documentos a solicitar, pessoas a consultar, etc."
                    value={formData.guidance}
                    onChange={(e) =>
                      setFormData({ ...formData, guidance: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidência Esperada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Cópia da política assinada pela direção"
                    value={formData.evidenceExpected}
                    onChange={(e) =>
                      setFormData({ ...formData, evidenceExpected: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordem *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 1,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.order ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.order && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.order}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Pergunta ativa
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cancelar
              </button>

              {!editingQuestion && (
                <button
                  type="button"
                  onClick={() => saveQuestion(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Salvar e Nova Pergunta
                </button>
              )}

              <button
                type="button"
                onClick={() => saveQuestion(true)}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isSaving
                  ? 'Salvando...'
                  : editingQuestion
                  ? 'Salvar Alterações'
                  : 'Criar Pergunta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir esta pergunta? A pergunta será
              removida (soft delete) e não aparecerá em novos checklists.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
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

export default AdminAuditControlQuestions;