// frontend/src/pages/AdminQuestions.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, Paperclip, X, Loader2,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { questionService, Question } from '../services/question.service.js';
import { QuestionFormModal } from '../components/admin/QuestionFormModal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Controles Organizacionais',
  'Controles de Pessoas',
  'Controles Físicos',
  'Controles Tecnológicos'
];

export const AdminQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Estados para modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await questionService.listQuestions({
        search: search || undefined,
        category: filterCategory === 'Todas' ? undefined : filterCategory,
      });
      setQuestions(data);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      toast.error('Erro ao carregar perguntas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [search, filterCategory]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleBack = () => {
    navigate('/admin');
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (question: Question) => {
    setDeletingQuestion(question);
    setIsDeleteModalOpen(true);
  };

  const handleToggleActive = async (question: Question) => {
    try {
      await questionService.toggleActive(question._id);
      toast.success(`Pergunta ${question.active ? 'desativada' : 'ativada'} com sucesso`);
      await loadQuestions();
    } catch (error) {
      console.error('Erro ao alternar status:', error);
      toast.error('Erro ao alternar status');
    }
  };

  const handleSaveQuestion = async (data: Partial<Question>) => {
    setIsSubmitting(true);
    try {
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion._id, data);
        toast.success('Pergunta atualizada com sucesso');
      } else {
        await questionService.createQuestion(data);
        toast.success('Pergunta criada com sucesso');
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (error: any) {
      console.error('Erro ao salvar pergunta:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar pergunta');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    setIsDeleting(true);
    try {
      await questionService.deleteQuestion(deletingQuestion._id);
      toast.success('Pergunta deletada com sucesso');
      setIsDeleteModalOpen(false);
      setDeletingQuestion(null);
      await loadQuestions();
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      toast.error('Erro ao deletar pergunta');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleGroup = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ============================================
  // AGRUPAR POR CONTROLE
  // ============================================
  const groups = questions.reduce((acc, q) => {
    const key = `${q.controlId}||${q.controlName || ''}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminMetaTags
        title="Perguntas - Admin"
        description="Gerenciamento de perguntas por controle"
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <AdminBreadcrumbs />

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banco de Perguntas</h1>
            <p className="text-gray-600 mt-1">
              {questions.length} perguntas vinculadas aos controles
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Pergunta
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID ou texto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="w-56">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todas">Todas as categorias</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('Controles ', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Perguntas */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </div>
        ) : Object.keys(groups).length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500 text-sm mb-4">Nenhuma pergunta cadastrada ainda.</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira pergunta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groups)
              .sort(([a], [b]) => {
                const aId = a.split('||')[0];
                const bId = b.split('||')[0];
                return aId.localeCompare(bId, undefined, { numeric: true });
              })
              .map(([key, qs]) => {
                const [controlId, controlName] = key.split('||');
                const isOpen = expanded[key];
                return (
                  <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleGroup(key)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                      )}
                      <span className="font-mono text-sm font-bold text-blue-600 w-12 shrink-0">
                        {controlId}
                      </span>
                      <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                        {controlName || '—'}
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {qs.length} pergunta{qs.length !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-gray-100">
                        {qs
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((q, index) => (
                            <div key={q._id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <span className="text-xs font-mono text-gray-400 w-5 shrink-0 pt-0.5">
                                  {q.order || index + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${q.active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                    {q.text}
                                  </p>
                                  {q.objective && (
                                    <p className="text-xs text-blue-600/70 mt-0.5">
                                      🎯 {q.objective}
                                    </p>
                                  )}
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {q.answerImplemented && (
                                      <div className="text-[10px] bg-green-50 border border-green-200 rounded-md p-2">
                                        <span className="font-semibold text-green-600 block mb-0.5">
                                          ✓ Implementado
                                        </span>
                                        <span className="text-gray-600">{q.answerImplemented}</span>
                                      </div>
                                    )}
                                    {q.answerPartial && (
                                      <div className="text-[10px] bg-yellow-50 border border-yellow-200 rounded-md p-2">
                                        <span className="font-semibold text-yellow-600 block mb-0.5">
                                          ◐ Parcial
                                        </span>
                                        <span className="text-gray-600">{q.answerPartial}</span>
                                      </div>
                                    )}
                                    {q.answerNotImplemented && (
                                      <div className="text-[10px] bg-red-50 border border-red-200 rounded-md p-2">
                                        <span className="font-semibold text-red-600 block mb-0.5">
                                          ✗ Não Implementado
                                        </span>
                                        <span className="text-gray-600">{q.answerNotImplemented}</span>
                                      </div>
                                    )}
                                  </div>
                                  {q.attachmentUrl && (
                                    <a
                                      href={q.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 mt-2 hover:underline"
                                    >
                                      <Paperclip className="h-3 w-3" />
                                      {q.attachmentName || 'Anexo'}
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleToggleActive(q)}
                                    title={q.active ? 'Desativar' : 'Ativar'}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {q.active ? (
                                      <ToggleRight className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleEdit(q)}
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100"
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(q)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
      </div>

      {/* ============================================
          MODAIS
          ============================================ */}

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        question={editingQuestion}
        title={editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
        isLoading={isSubmitting}
        categories={CATEGORIES}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingQuestion(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Pergunta"
        message={`Tem certeza que deseja excluir a pergunta "${deletingQuestion?.text}"?`}
        confirmText="Excluir"
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
};

export default AdminQuestions;