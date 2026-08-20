import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
  RefreshCw,
  Clock,
  ListChecks,
  BookOpen,
  Shield,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../../../../services/api';

// ============================================================
// TIPOS
// ============================================================

interface IAuditQuestion {
  _id: string;
  text: string;
  clause: string;
  category: 'clause' | 'control';
  controlId?: string;
  controlName?: string;
  isActive: boolean;
  answerType: 'C_NC_NA' | 'C_NC_OB_OM_NA';
  order: number;
  section: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// OPÇÕES
// ============================================================

const ANSWER_TYPE_LABELS: Record<string, string> = {
  C_NC_NA: 'C / NC / NA',
  C_NC_OB_OM_NA: 'C / NC / OB / OM / NA',
};

const ANSWER_TYPE_DESCRIPTIONS: Record<string, string> = {
  C_NC_NA: 'Conforme, Não Conforme, Não Aplicável',
  C_NC_OB_OM_NA: 'Conforme, Não Conforme, Observação, Oportunidade, Não Aplicável',
};

const CATEGORY_LABELS: Record<string, string> = {
  clause: 'Cláusula',
  control: 'Controle',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  clause: <BookOpen className="w-4 h-4 text-blue-500" />,
  control: <Shield className="w-4 h-4 text-purple-500" />,
};

// ============================================================
// SERVICE
// ============================================================

const fetchQuestions = async (filters?: { search?: string; category?: string; isActive?: boolean }): Promise<IAuditQuestion[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  
  const response = await api.get(`/admin/audit/questions?${params.toString()}`);
  return response.data.data;
};

const toggleQuestionStatus = async (id: string, isActive: boolean): Promise<IAuditQuestion> => {
  const response = await api.patch(`/admin/audit/questions/${id}/toggle`, { isActive });
  return response.data.data;
};

const deleteQuestion = async (id: string): Promise<void> => {
  await api.delete(`/admin/audit/questions/${id}`);
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function AdminAuditQuestions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'clause' | 'control'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ============================================================
  // QUERIES
  // ============================================================

  const { data: questions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-audit-questions', searchTerm, categoryFilter, statusFilter],
    queryFn: () => fetchQuestions({
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    }),
  });

  // ============================================================
  // MUTATIONS
  // ============================================================

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleQuestionStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audit-questions'] });
      toast.success('Status da pergunta atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audit-questions'] });
      setShowDeleteConfirm(null);
      toast.success('Pergunta excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir pergunta');
    },
  });

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleNavigateToEdit = (id: string) => {
    navigate(`/admin/audit/questions/${id}/edit`);
  };

  const handleNavigateToNew = () => {
    navigate('/admin/audit/questions/new');
  };

  // ============================================================
  // FILTERS
  // ============================================================

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Busca
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          q.text.toLowerCase().includes(search) ||
          q.clause.toLowerCase().includes(search) ||
          q.section.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [questions, searchTerm]);

  // Estatísticas
  const totalActive = questions.filter((q) => q.isActive).length;
  const totalInactive = questions.filter((q) => !q.isActive).length;

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Carregando perguntas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800">Erro ao carregar perguntas</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
        <button onClick={() => refetch()} className="mt-4 text-indigo-600 hover:text-indigo-800">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Perguntas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as perguntas utilizadas nos checklists de auditoria
          </p>
        </div>
        <button
          onClick={handleNavigateToNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Nova Pergunta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg"><FileText className="w-5 h-5 text-indigo-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{questions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Ativas</p>
              <p className="text-xl font-bold text-green-600">{totalActive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><XCircle className="w-5 h-5 text-gray-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Inativas</p>
              <p className="text-xl font-bold text-gray-600">{totalInactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><ListChecks className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Tipos de Resposta</p>
              <p className="text-xl font-bold">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por texto, cláusula ou seção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'clause' | 'control')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            <option value="clause">Cláusulas</option>
            <option value="control">Controles</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhuma pergunta encontrada</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando uma nova pergunta para o checklist'}
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={handleNavigateToNew}
                className="mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Criar primeira pergunta →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuestions.map((question) => (
              <div key={question._id} className="hover:bg-gray-50 transition-colors">
                {/* Question Row */}
                <div className="flex items-start justify-between px-6 py-4">
                  <div
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => setExpandedId(prev => prev === question._id ? null : question._id)}
                  >
                    <div className="mt-1">
                      {CATEGORY_ICONS[question.category] || <FileText className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {question.clause}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {question.text}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {CATEGORY_LABELS[question.category] || question.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>
                          Respostas: <span className="font-medium">{ANSWER_TYPE_LABELS[question.answerType] || question.answerType}</span>
                        </span>
                        {question.controlName && (
                          <>
                            <span>•</span>
                            <span>Controle: {question.controlName}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Ordem: {question.order}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        question.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {question.isActive ? '✅ Ativa' : '⏸️ Inativa'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleNavigateToEdit(question._id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(question._id, question.isActive)}
                      disabled={toggleMutation.isPending}
                      className={`p-2 rounded-lg transition-colors ${
                        question.isActive
                          ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={question.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {question.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(question._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(prev => prev === question._id ? null : question._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      {expandedId === question._id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === question._id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Detalhes da Pergunta</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{question.text}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <p><span className="font-medium">Cláusula:</span> {question.clause}</p>
                          <p><span className="font-medium">Categoria:</span> {CATEGORY_LABELS[question.category] || question.category}</p>
                          <p><span className="font-medium">Tipo de Resposta:</span> {ANSWER_TYPE_DESCRIPTIONS[question.answerType] || question.answerType}</p>
                          {question.controlName && (
                            <p><span className="font-medium">Controle:</span> {question.controlName}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Metadados</h4>
                        <div className="space-y-1 text-sm text-gray-500">
                          <p><span className="font-medium">Seção:</span> {question.section}</p>
                          <p><span className="font-medium">Ordem:</span> {question.order}</p>
                          <p><span className="font-medium">Criada em:</span> {new Date(question.createdAt).toLocaleDateString('pt-BR')}</p>
                          <p><span className="font-medium">Última atualização:</span> {new Date(question.updatedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            question.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {question.isActive ? '✅ Ativa' : '⏸️ Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
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