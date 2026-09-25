// ============================================================
// AdminAuditQuestions.tsx
// ============================================================
//
// TELA: Gerenciamento de perguntas de auditoria (cláusulas ISO 27001)
//
// ACESSO: APENAS ADMIN (rota registrada dentro do bloco ADMIN no App.tsx)
//
// FUNCIONALIDADES:
//   - Listar perguntas com filtros (cláusula, grupo, criticidade, ativo, busca)
//   - Criar nova pergunta (modal)
//   - Editar pergunta (modal)
//   - Ativar/Desativar pergunta
//   - Excluir pergunta (soft delete)
//   - Estatísticas em tempo real
//   - Botão Voltar
//
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ListChecks,
  FileText,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Shield,
  Flag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useAuditQuestions,
  useAuditQuestionStats,
  useCreateAuditQuestion,
  useUpdateAuditQuestion,
  useDeleteAuditQuestion,
} from '../../../hooks/useAudit';
import {
  AuditQuestionFull,
  CreateAuditQuestionFullDTO,
  UpdateAuditQuestionFullDTO,
  AuditQuestionFullFilters,
  AuditQuestionCriticality,
} from '../../../types/audit.types';

// ============================================================
// CONSTANTES
// ============================================================

/**
 * Grupos de cláusulas ISO 27001:2022 (do MÓDULO-2)
 */
const CLAUSE_GROUPS = [
  '4. Contexto da organização',
  '5. Liderança',
  '6. Planejamento',
  '7. Apoio',
  '8. Operação',
  '9. Avaliação de desempenho',
  '10. Melhoria',
];

/**
 * Cláusulas específicas por grupo (sugestões para autocomplete)
 */
const CLAUSE_SUGGESTIONS: Record<string, string[]> = {
  '4. Contexto da organização': ['4.1', '4.2', '4.3', '4.4'],
  '5. Liderança': ['5.1', '5.2', '5.3'],
  '6. Planejamento': ['6.1.1', '6.1.2', '6.1.3', '6.2', '6.3'],
  '7. Apoio': ['7.1', '7.2', '7.3', '7.4', '7.5.1', '7.5.2', '7.5.3'],
  '8. Operação': ['8.1', '8.2', '8.3'],
  '9. Avaliação de desempenho': ['9.1', '9.2.1', '9.2.2', '9.3.1', '9.3.2', '9.3.3'],
  '10. Melhoria': ['10.1', '10.2'],
};

const CRITICALITY_OPTIONS: Array<{
  value: AuditQuestionCriticality;
  label: string;
  color: string;
}> = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Média', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-700' },
];

// ============================================================
// TIPOS AUXILIARES
// ============================================================

interface QuestionFormData {
  clauseId: string;
  clauseTitle: string;
  clauseGroup: string;
  text: string;
  objective: string;
  guidance: string;
  evidenceExpected: string;
  conformityCriteria: string;
  nonconformityCriteria: string;
  criticality: AuditQuestionCriticality;
  relatedControls: string;
  relatedDocuments: string;
  order: number;
  active: boolean;
}

const EMPTY_FORM: QuestionFormData = {
  clauseId: '',
  clauseTitle: '',
  clauseGroup: '',
  text: '',
  objective: '',
  guidance: '',
  evidenceExpected: '',
  conformityCriteria: '',
  nonconformityCriteria: '',
  criticality: 'medium',
  relatedControls: '',
  relatedDocuments: '',
  order: 1,
  active: true,
};

// ============================================================
// COMPONENTE
// ============================================================

export function AdminAuditQuestions() {
  const navigate = useNavigate();

  // ---- Estados de filtros ----
  const [search, setSearch] = useState('');
  const [clauseGroupFilter, setClauseGroupFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState<AuditQuestionCriticality | ''>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // ---- Estados de UI ----
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AuditQuestionFull | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ---- Montar filtros para a query ----
  const filters: AuditQuestionFullFilters = useMemo(() => {
    const f: AuditQuestionFullFilters = {};
    if (search.trim()) f.search = search.trim();
    if (clauseGroupFilter) f.clauseGroup = clauseGroupFilter;
    if (criticalityFilter) f.criticality = criticalityFilter;
    if (activeFilter !== 'all') f.active = activeFilter === 'true';
    return f;
  }, [search, clauseGroupFilter, criticalityFilter, activeFilter]);

  // ---- Queries e mutations ----
  const { data: questions = [], isLoading, error, refetch } = useAuditQuestions(filters);
  const { data: stats, isLoading: isLoadingStats } = useAuditQuestionStats();
  const createMutation = useCreateAuditQuestion();
  const updateMutation = useUpdateAuditQuestion();
  const deleteMutation = useDeleteAuditQuestion();

  // ---- Agrupar perguntas por grupo de cláusula ----
  const questionsByGroup = useMemo(() => {
    const groups: Record<string, AuditQuestionFull[]> = {};
    questions.forEach((q) => {
      const group = q.clauseGroup || 'Sem grupo';
      if (!groups[group]) groups[group] = [];
      groups[group].push(q);
    });
    return groups;
  }, [questions]);

  // ---- Toggle de expandir/colapsar grupo ----
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // ---- Abrir modal para criar ----
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowFormModal(true);
  };

  // ---- Abrir modal para editar ----
  const handleOpenEdit = (q: AuditQuestionFull) => {
    setEditingQuestion(q);
    setFormData({
      clauseId: q.clauseId || '',
      clauseTitle: q.clauseTitle || '',
      clauseGroup: q.clauseGroup || '',
      text: q.text || '',
      objective: q.objective || '',
      guidance: q.guidance || '',
      evidenceExpected: q.evidenceExpected || '',
      conformityCriteria: q.conformityCriteria || '',
      nonconformityCriteria: q.nonconformityCriteria || '',
      criticality: q.criticality || 'medium',
      relatedControls: Array.isArray(q.relatedControls) ? q.relatedControls.join(', ') : '',
      relatedDocuments: Array.isArray(q.relatedDocuments) ? q.relatedDocuments.join(', ') : '',
      order: q.order || 1,
      active: q.active !== false,
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // ---- Fechar modal ----
  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingQuestion(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  // ---- Validação ----
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.clauseId.trim()) errors.clauseId = 'ID da cláusula é obrigatório';
    if (!formData.text.trim()) errors.text = 'Texto da pergunta é obrigatório';
    else if (formData.text.trim().length < 5) errors.text = 'Texto muito curto (mín. 5 caracteres)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: CreateAuditQuestionFullDTO = {
      clauseId: formData.clauseId.trim(),
      clauseTitle: formData.clauseTitle.trim(),
      clauseGroup: formData.clauseGroup.trim(),
      text: formData.text.trim(),
      objective: formData.objective.trim(),
      guidance: formData.guidance.trim(),
      evidenceExpected: formData.evidenceExpected.trim(),
      conformityCriteria: formData.conformityCriteria.trim(),
      nonconformityCriteria: formData.nonconformityCriteria.trim(),
      criticality: formData.criticality,
      relatedControls: formData.relatedControls
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      relatedDocuments: formData.relatedDocuments
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      order: formData.order,
      active: formData.active,
    };

    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({
          id: editingQuestion._id,
          data: payload as UpdateAuditQuestionFullDTO,
        });
        toast.success('Pergunta atualizada com sucesso');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Pergunta criada com sucesso');
      }
      handleCloseModal();
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar pergunta');
    }
  };

  // ---- Excluir ----
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Pergunta excluída com sucesso');
      setDeleteConfirmId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao excluir pergunta');
    }
  };

  // ---- Toggle ativo/inativo ----
  const handleToggleActive = async (q: AuditQuestionFull) => {
    try {
      await updateMutation.mutateAsync({
        id: q._id,
        data: { active: !q.active },
      });
      toast.success(q.active ? 'Pergunta desativada' : 'Pergunta ativada');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao alterar status');
    }
  };

  // ---- Limpar filtros ----
  const handleClearFilters = () => {
    setSearch('');
    setClauseGroupFilter('');
    setCriticalityFilter('');
    setActiveFilter('all');
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ======================================================== */}
      {/* HEADER */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/audit/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Voltar para o dashboard de auditoria"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-purple-600" />
              Perguntas de Auditoria
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie as perguntas para auditoria de cláusulas ISO 27001:2022 (SGSI)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Nova Pergunta
        </button>
      </div>

      {/* ======================================================== */}
      {/* ESTATÍSTICAS */}
      {/* ======================================================== */}
      {!isLoadingStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Ativas</p>
                <p className="text-xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Inativas</p>
                <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">Críticas</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.byCriticality?.critical || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FILTROS */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por texto, cláusula ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Grupo</label>
              <select
                value={clauseGroupFilter}
                onChange={(e) => setClauseGroupFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos</option>
                {CLAUSE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Criticidade</label>
              <select
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todas</option>
                {CRITICALITY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas</option>
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* LISTA DE PERGUNTAS */}
      {/* ======================================================== */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800">Erro ao carregar perguntas</h3>
          <p className="text-red-600 mt-2">{(error as Error).message}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Nenhuma pergunta cadastrada</h3>
          <p className="text-gray-400 mt-2">
            {search || clauseGroupFilter || criticalityFilter || activeFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando a primeira pergunta de auditoria.'}
          </p>
          {!search && !clauseGroupFilter && !criticalityFilter && activeFilter === 'all' && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
            >
              <Plus className="w-4 h-4" />
              Criar primeira pergunta
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(questionsByGroup)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, groupQuestions]) => {
              const isExpanded = expandedGroups.has(group);
              return (
                <div key={group} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Header do grupo */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">{group}</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {groupQuestions.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {/* Perguntas do grupo */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {groupQuestions
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((q) => {
                          const criticalityMeta = CRITICALITY_OPTIONS.find(
                            (c) => c.value === q.criticality
                          );
                          return (
                            <div key={q._id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                      {q.clauseId}
                                    </span>
                                    {q.clauseTitle && (
                                      <span className="text-xs text-gray-500 truncate">
                                        {q.clauseTitle}
                                      </span>
                                    )}
                                    {criticalityMeta && (
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${criticalityMeta.color}`}
                                      >
                                        {criticalityMeta.label}
                                      </span>
                                    )}
                                    {!q.active && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                        Inativa
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-900 font-medium">{q.text}</p>
                                  {q.objective && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      <strong>Objetivo:</strong> {q.objective}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(q)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      q.active
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-gray-400 hover:bg-gray-100'
                                    }`}
                                    title={q.active ? 'Desativar' : 'Ativar'}
                                  >
                                    {q.active ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <XCircle className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(q)}
                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(q._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {/* ======================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta de Auditoria'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Linha 1: Grupo + Cláusula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grupo de Cláusula <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.clauseGroup}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clauseGroup: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {CLAUSE_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID da Cláusula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="clause-suggestions"
                    value={formData.clauseId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clauseId: e.target.value }))
                    }
                    placeholder="Ex: 4.1, 5.2, 9.2.1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.clauseId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <datalist id="clause-suggestions">
                    {(CLAUSE_SUGGESTIONS[formData.clauseGroup] || []).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  {formErrors.clauseId && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.clauseId}</p>
                  )}
                </div>
              </div>

              {/* Título da cláusula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Cláusula
                </label>
                <input
                  type="text"
                  value={formData.clauseTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clauseTitle: e.target.value }))
                  }
                  placeholder="Ex: Compreender a organização e seu contexto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Texto da pergunta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pergunta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, text: e.target.value }))
                  }
                  placeholder="Ex: A organização determinou as questões internas e externas relevantes para o SGSI?"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.text ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.text && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.text}</p>
                )}
              </div>

              {/* Objetivo + Orientação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo
                  </label>
                  <textarea
                    value={formData.objective}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, objective: e.target.value }))
                    }
                    placeholder="O que a pergunta visa verificar?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientação ao Auditor
                  </label>
                  <textarea
                    value={formData.guidance}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, guidance: e.target.value }))
                    }
                    placeholder="Como avaliar?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Critérios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidência Esperada
                </label>
                <input
                  type="text"
                  value={formData.evidenceExpected}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, evidenceExpected: e.target.value }))
                  }
                  placeholder="Ex: Documento de análise de contexto assinado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critério de Conformidade (C)
                  </label>
                  <textarea
                    value={formData.conformityCriteria}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, conformityCriteria: e.target.value }))
                    }
                    placeholder="O que caracteriza CONFORMIDADE?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critério de Não Conformidade (NC)
                  </label>
                  <textarea
                    value={formData.nonconformityCriteria}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nonconformityCriteria: e.target.value }))
                    }
                    placeholder="O que caracteriza NÃO CONFORMIDADE?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Criticidade + Ordem + Ativa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criticidade
                  </label>
                  <select
                    value={formData.criticality}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, criticality: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {CRITICALITY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, active: e.target.checked }))
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Ativa</span>
                  </label>
                </div>
              </div>

              {/* Controles e Documentos relacionados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Controles Relacionados (Anexo A)
                  </label>
                  <input
                    type="text"
                    value={formData.relatedControls}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, relatedControls: e.target.value }))
                    }
                    placeholder="Ex: A.5.1, A.5.2 (separados por vírgula)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documentos SGSI Esperados
                  </label>
                  <input
                    type="text"
                    value={formData.relatedDocuments}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, relatedDocuments: e.target.value }))
                    }
                    placeholder="Ex: Política de SI, Manual SGSI (separados por vírgula)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : editingQuestion
                      ? 'Atualizar'
                      : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ======================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita
              (soft delete — o registro permanece no banco para auditoria).
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
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

export default AdminAuditQuestions;