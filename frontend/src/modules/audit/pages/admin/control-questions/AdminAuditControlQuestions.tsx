import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAudit } from '../../../hooks/useAudit';
import {
  AuditControlQuestionFull,
  CreateAuditControlQuestionDTO,
  UpdateAuditControlQuestionDTO,
} from '../../../types/auditControlQuestion.types';

// ============================================================
// ADMIN AUDIT CONTROL QUESTIONS — v50.1
// ============================================================
//
// Tela dedicada ao ADMIN para cadastrar manualmente as perguntas
// de auditoria por CONTROLE do Anexo A (ISO 27001:2022).
//
// DIFERENÇA DE AdminAuditQuestions:
//   AdminAuditQuestions       → perguntas por CLÁUSULA (4-10)
//   AdminAuditControlQuestions → perguntas por CONTROLE (5.1..8.34)
//
// SEM SEED. Cadastro 100% manual, uma pergunta por vez.
//
// ============================================================

interface FormState {
  controlId: string;
  controlName: string;
  controlGroup: string;
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
  text: '',
  objective: '',
  guidance: '',
  evidenceExpected: '',
  order: 1,
  active: true,
};

export function AdminAuditControlQuestions() {
  const navigate = useNavigate();

  // ---- Hooks React Query ----

  const {
    useAuditControlQuestions,
    useAuditControlQuestionStats,
    useCreateAuditControlQuestion,
    useUpdateAuditControlQuestion,
    useDeleteAuditControlQuestion,
  } = useAudit;

  // ---- Estados locais ----

  const [search, setSearch] = useState('');
  const [controlIdFilter, setControlIdFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<AuditControlQuestionFull | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ---- Filtros efetivos ----

  const filters = useMemo(() => {
    const f: any = {};
    if (search.trim()) f.search = search.trim();
    if (controlIdFilter.trim()) f.controlId = controlIdFilter.trim();
    if (activeFilter !== 'all') f.active = activeFilter === 'true';
    return f;
  }, [search, controlIdFilter, activeFilter]);

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

  // ---- Agrupamento por controlGroup ----

  const grouped = useMemo(() => {
    const map = new Map<string, AuditControlQuestionFull[]>();
    (questions || []).forEach((q) => {
      const key = q.controlGroup || 'Sem grupo';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    });

    // Ordenar por grupo e, dentro, por controlId e order
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.controlId.trim()) {
      errors.controlId = 'Código do controle é obrigatório';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingQuestion) {
        const payload: UpdateAuditControlQuestionDTO = {
          controlId: formData.controlId.trim(),
          controlName: formData.controlName.trim(),
          controlGroup: formData.controlGroup.trim(),
          text: formData.text.trim(),
          objective: formData.objective.trim(),
          guidance: formData.guidance.trim(),
          evidenceExpected: formData.evidenceExpected.trim(),
          order: formData.order,
          active: formData.active,
        };
        await updateMutation.mutateAsync({
          id: editingQuestion._id || editingQuestion.id || '',
          data: payload,
        });
        toast.success('Pergunta atualizada com sucesso!');
      } else {
        const payload: CreateAuditControlQuestionDTO = {
          controlId: formData.controlId.trim(),
          controlName: formData.controlName.trim(),
          controlGroup: formData.controlGroup.trim(),
          text: formData.text.trim(),
          objective: formData.objective.trim(),
          guidance: formData.guidance.trim(),
          evidenceExpected: formData.evidenceExpected.trim(),
          order: formData.order,
          active: formData.active,
        };
        await createMutation.mutateAsync(payload);
        toast.success('Pergunta criada com sucesso!');
      }

      closeFormModal();
      refetch();
    } catch (err: any) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando perguntas...</span>
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

  // ---- Render principal ----

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
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
              placeholder="Buscar por texto, objetivo, orientação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
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
          <p className="text-gray-500">Nenhuma pergunta cadastrada.</p>
          <p className="text-xs text-gray-400 mt-1">
            Clique em "Nova Pergunta" para começar.
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
                              onClick={() => openEditModal(q)}
                              title="Editar"
                              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
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

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Controle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Controle *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: 5.1"
                      value={formData.controlId}
                      onChange={(e) =>
                        setFormData({ ...formData, controlId: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.controlId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
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
                      placeholder="Ex.: A.5 Organizacionais"
                      value={formData.controlGroup}
                      onChange={(e) =>
                        setFormData({ ...formData, controlGroup: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Controle *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Políticas de segurança da informação"
                    value={formData.controlName}
                    onChange={(e) =>
                      setFormData({ ...formData, controlName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.controlName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.controlName && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.controlName}
                    </p>
                  )}
                </div>

                {/* Pergunta */}
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

                {/* Ordem e Ativa */}
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

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                {createMutation.isPending || updateMutation.isPending
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
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
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