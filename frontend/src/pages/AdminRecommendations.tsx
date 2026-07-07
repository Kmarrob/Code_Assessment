// frontend/src/pages/AdminRecommendations.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  List,
  BookOpen,
  Lightbulb,
  Wrench,
  Filter,
  RefreshCw,
  Check,
  AlertTriangle,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { recommendationService, ControlSearchResult } from '../services/recommendation.service.js';
import { Recommendation, CreateRecommendationData, UpdateRecommendationData } from '../types/recommendation.js';

// Interface para recomendação estruturada
interface StructuredRecommendation {
  titulo: string;
  descricao: string;
  solucoesTecnicas?: string[];
}

export const AdminRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dominioFilter, setDominioFilter] = useState<string>('all');
  const [dominios, setDominios] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para autocomplete
  const [controlSearchQuery, setControlSearchQuery] = useState('');
  const [controlSuggestions, setControlSuggestions] = useState<ControlSearchResult[]>([]);
  const [isSearchingControls, setIsSearchingControls] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ControlSearchResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Form states - incluindo campos para recomendação estruturada
  const [formData, setFormData] = useState<CreateRecommendationData & {
    recTitulo: string;
    recDescricao: string;
    recSolucoes: string[];
  }>({
    controlId: '',
    titulo: '',
    dominio: '',
    recomendacoes: [],
    solucoesTecnicas: [],
    recTitulo: '',
    recDescricao: '',
    recSolucoes: [],
  });

  const [tempSolucao, setTempSolucao] = useState('');
  const [editingRecIndex, setEditingRecIndex] = useState<number | null>(null);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await recommendationService.listRecommendations({
        page,
        limit,
        dominio: dominioFilter !== 'all' ? dominioFilter : undefined,
        search: search || undefined,
      });
      setRecommendations(response.recommendations);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar recomendações:', err);
      setError(err.response?.data?.message || 'Erro ao carregar recomendações');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, dominioFilter, search]);

  const loadDominios = useCallback(async () => {
    try {
      const data = await recommendationService.getDominios();
      setDominios(data);
    } catch (err) {
      console.error('Erro ao carregar domínios:', err);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    loadDominios();
  }, [loadDominios]);

  // ============================================
  // BUSCA DE CONTROLES PARA AUTOCOMPLETE
  // ============================================
  useEffect(() => {
    const searchControls = async () => {
      if (!controlSearchQuery || controlSearchQuery.trim().length < 1) {
        setControlSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearchingControls(true);
      try {
        const results = await recommendationService.searchControls(controlSearchQuery);
        setControlSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error('Erro ao buscar controles:', err);
        setControlSuggestions([]);
      } finally {
        setIsSearchingControls(false);
      }
    };

    const debounceTimer = setTimeout(searchControls, 300);
    return () => clearTimeout(debounceTimer);
  }, [controlSearchQuery]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selecionar um controle da lista
  const handleSelectControl = (control: ControlSearchResult) => {
    setSelectedControl(control);
    setControlSearchQuery(`${control.id} - ${control.nome}`);
    setFormData(prev => ({
      ...prev,
      controlId: control.id,
      titulo: control.nome,
    }));
    setShowSuggestions(false);
  };

  // Limpar seleção do controle
  const handleClearControl = () => {
    setSelectedControl(null);
    setControlSearchQuery('');
    setFormData(prev => ({
      ...prev,
      controlId: '',
      titulo: '',
    }));
    setShowSuggestions(false);
  };

  // ============================================
  // HANDLERS PARA RECOMENDAÇÃO ESTRUTURADA (integrado)
  // ============================================
  const editRecommendationItem = (index: number) => {
    const recStr = formData.recomendacoes[index];
    const parsed = parseRecommendationString(recStr);
    setFormData(prev => ({
      ...prev,
      recTitulo: parsed.titulo,
      recDescricao: parsed.descricao,
      recSolucoes: parsed.solucoesTecnicas || [],
    }));
    setEditingRecIndex(index);
  };

  const clearRecForm = () => {
    setFormData(prev => ({
      ...prev,
      recTitulo: '',
      recDescricao: '',
      recSolucoes: [],
    }));
    setEditingRecIndex(null);
    setTempSolucao('');
  };

  const addSolucaoTecnica = () => {
    if (tempSolucao.trim()) {
      setFormData(prev => ({
        ...prev,
        recSolucoes: [...prev.recSolucoes, tempSolucao.trim()]
      }));
      setTempSolucao('');
    }
  };

  const removeSolucaoTecnica = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recSolucoes: prev.recSolucoes.filter((_, i) => i !== index)
    }));
  };

  const saveStructuredRecommendation = () => {
    if (!formData.recTitulo.trim() || !formData.recDescricao.trim()) {
      setError('Título e descrição são obrigatórios');
      return;
    }

    const recString = formatRecommendationString({
      titulo: formData.recTitulo,
      descricao: formData.recDescricao,
      solucoesTecnicas: formData.recSolucoes,
    });

    const newRecomendacoes = [...formData.recomendacoes];

    if (editingRecIndex !== null && editingRecIndex >= 0) {
      newRecomendacoes[editingRecIndex] = recString;
    } else {
      newRecomendacoes.push(recString);
    }

    setFormData(prev => ({ ...prev, recomendacoes: newRecomendacoes }));
    clearRecForm();
    setError(null);
  };

  const removeRecomendacaoItem = (index: number) => {
    if (formData.recomendacoes.length <= 1) {
      setFormData(prev => ({ ...prev, recomendacoes: [] }));
      return;
    }
    const newRecomendacoes = formData.recomendacoes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, recomendacoes: newRecomendacoes }));
  };

  // Funções para serializar/deserializar recomendações
  const formatRecommendationString = (rec: StructuredRecommendation): string => {
    const solucoes = (rec.solucoesTecnicas || []).join('|');
    return `TITULO:${rec.titulo}|DESC:${rec.descricao}|SOL:${solucoes}`;
  };

  const parseRecommendationString = (str: string): StructuredRecommendation => {
    if (!str || !str.trim()) {
      return { titulo: '', descricao: '', solucoesTecnicas: [] };
    }
    try {
      const tituloMatch = str.match(/TITULO:(.*?)\|DESC:/);
      const descMatch = str.match(/DESC:(.*?)(?:\|SOL:|$)/);
      const solMatch = str.match(/SOL:(.*?)$/);

      return {
        titulo: tituloMatch ? tituloMatch[1] : 'Recomendação',
        descricao: descMatch ? descMatch[1] : str,
        solucoesTecnicas: solMatch ? solMatch[1].split('|').filter(s => s.trim()) : [],
      };
    } catch {
      return { titulo: 'Recomendação', descricao: str, solucoesTecnicas: [] };
    }
  };

  const getRecommendationDisplay = (str: string): { titulo: string; descricao: string; solucoes: string[] } => {
    return parseRecommendationString(str);
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRecommendations();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  // Modal handlers
  const handleOpenCreateModal = () => {
    setEditingRecommendation(null);
    setSelectedControl(null);
    setControlSearchQuery('');
    setControlSuggestions([]);
    setShowSuggestions(false);
    setFormData({
      controlId: '',
      titulo: '',
      dominio: '',
      recomendacoes: [],
      solucoesTecnicas: [],
      recTitulo: '',
      recDescricao: '',
      recSolucoes: [],
    });
    setEditingRecIndex(null);
    setTempSolucao('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: Recommendation) => {
    setEditingRecommendation(rec);
    setSelectedControl({ _id: rec.controlObjectId, id: rec.controlId, nome: rec.titulo });
    setControlSearchQuery(`${rec.controlId} - ${rec.titulo}`);
    setFormData({
      controlId: rec.controlId,
      titulo: rec.titulo,
      dominio: rec.dominio,
      recomendacoes: rec.recomendacoes.length > 0 ? rec.recomendacoes : [],
      solucoesTecnicas: rec.solucoesTecnicas && rec.solucoesTecnicas.length > 0 ? rec.solucoesTecnicas : [],
      recTitulo: '',
      recDescricao: '',
      recSolucoes: [],
    });
    setEditingRecIndex(null);
    setTempSolucao('');
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecommendation(null);
    setSelectedControl(null);
    setControlSearchQuery('');
    setControlSuggestions([]);
    setShowSuggestions(false);
    setFormData({
      controlId: '',
      titulo: '',
      dominio: '',
      recomendacoes: [],
      solucoesTecnicas: [],
      recTitulo: '',
      recDescricao: '',
      recSolucoes: [],
    });
    setEditingRecIndex(null);
    setTempSolucao('');
    setError(null);
  };

  // Form handlers
  const handleFormChange = (field: keyof CreateRecommendationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSolucaoChange = (index: number, value: string) => {
    const newSolucoes = [...(formData.solucoesTecnicas || [])];
    newSolucoes[index] = value;
    setFormData(prev => ({ ...prev, solucoesTecnicas: newSolucoes }));
  };

  const handleAddSolucao = () => {
    setFormData(prev => ({ 
      ...prev, 
      solucoesTecnicas: [...(prev.solucoesTecnicas || []), ''] 
    }));
  };

  const handleRemoveSolucao = (index: number) => {
    if (!formData.solucoesTecnicas || formData.solucoesTecnicas.length <= 1) return;
    const newSolucoes = formData.solucoesTecnicas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, solucoesTecnicas: newSolucoes }));
  };

  const handleSubmit = async () => {
    // Validar campos obrigatórios
    if (!formData.controlId.trim()) {
      setError('ID do controle é obrigatório');
      return;
    }
    if (!formData.titulo.trim()) {
      setError('Título é obrigatório');
      return;
    }
    if (!formData.dominio) {
      setError('Domínio é obrigatório');
      return;
    }
    const recomendacoesValidas = formData.recomendacoes.filter(r => r.trim());
    if (recomendacoesValidas.length === 0) {
      setError('Pelo menos uma recomendação é obrigatória');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = {
        controlId: formData.controlId,
        titulo: formData.titulo,
        dominio: formData.dominio,
        recomendacoes: recomendacoesValidas,
        solucoesTecnicas: (formData.solucoesTecnicas || []).filter(s => s.trim()),
      };

      if (editingRecommendation) {
        await recommendationService.updateRecommendation(
          editingRecommendation.controlId,
          data as UpdateRecommendationData
        );
      } else {
        await recommendationService.createRecommendation(data);
      }

      handleCloseModal();
      loadRecommendations();
    } catch (err: any) {
      console.error('Erro ao salvar recomendação:', err);
      setError(err.response?.data?.message || 'Erro ao salvar recomendação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await recommendationService.deleteRecommendation(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      loadRecommendations();
    } catch (err: any) {
      console.error('Erro ao deletar recomendação:', err);
      setError(err.response?.data?.message || 'Erro ao deletar recomendação');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && recommendations.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando recomendações...</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Recomendações por Controle</h1>
                <p className="text-sm text-gray-500">
                  Gerencie as recomendações para controles da ISO 27001
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={handleOpenCreateModal} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Recomendação
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por ID ou título..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </form>
              <div className="min-w-[180px]">
                <select
                  value={dominioFilter}
                  onChange={(e) => setDominioFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Todos os Domínios</option>
                  {dominios.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" onClick={() => {
                setSearch('');
                setDominioFilter('all');
                setPage(1);
              }}>
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recomendações Cadastradas</CardTitle>
              <span className="text-sm text-gray-500">
                {pagination?.total || 0} {pagination?.total === 1 ? 'recomendação' : 'recomendações'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={loadRecommendations}>Tentar novamente</Button>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhuma recomendação cadastrada</h3>
                <p className="text-gray-500 mt-1">
                  {search || dominioFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Clique em "Nova Recomendação" para começar'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Controle</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Título</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Domínio</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Recomendações</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Soluções</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recommendations.map((rec) => (
                      <tr key={rec._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium text-blue-600">
                            {rec.controlId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">{rec.titulo}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {rec.dominio}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{rec.recomendacoes.length}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {rec.solucoesTecnicas?.length || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditModal(rec)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleOpenDeleteModal(rec.controlId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevious}
                        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext}
                        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Criar/Editar (principal com tudo integrado) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRecommendation ? 'Editar Recomendação' : 'Nova Recomendação'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* ID do Controle com autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Controle *
                </label>
                <div className="relative">
                  <div className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={controlSearchQuery}
                      onChange={(e) => {
                        setControlSearchQuery(e.target.value);
                        if (!e.target.value) {
                          setSelectedControl(null);
                          setFormData(prev => ({ ...prev, controlId: '', titulo: '' }));
                        }
                      }}
                      onFocus={() => {
                        if (controlSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Digite o ID ou nome do controle..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!!editingRecommendation}
                    />
                    {selectedControl && !editingRecommendation && (
                      <button
                        type="button"
                        onClick={handleClearControl}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                    {isSearchingControls && (
                      <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    )}
                    {!selectedControl && !isSearchingControls && controlSuggestions.length === 0 && controlSearchQuery.length > 0 && (
                      <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Lista de sugestões */}
                  {showSuggestions && controlSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {controlSuggestions.map((control) => (
                        <div
                          key={control._id}
                          onClick={() => handleSelectControl(control)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <span className="font-mono text-sm font-medium text-blue-600">
                              {control.id}
                            </span>
                            <span className="ml-2 text-sm text-gray-700">
                              {control.nome}
                            </span>
                          </div>
                          {control.tiposDeControles && control.tiposDeControles.length > 0 && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                              {control.tiposDeControles[0]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editingRecommendation && (
                  <p className="text-xs text-gray-400 mt-1">O ID do controle não pode ser alterado durante a edição.</p>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => handleFormChange('titulo', e.target.value)}
                  placeholder="Ex: 5.18 Direitos de acesso"
                />
              </div>

              {/* Domínio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domínio *
                </label>
                <select
                  value={formData.dominio}
                  onChange={(e) => handleFormChange('dominio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione um domínio</option>
                  {dominios.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Adicionar Nova Recomendação Estruturada - Integrado */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {editingRecIndex !== null ? 'Editando Recomendação' : 'Adicionar Nova Recomendação'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Título da Recomendação *
                    </label>
                    <Input
                      value={formData.recTitulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, recTitulo: e.target.value }))}
                      placeholder="Ex: Criação e Alinhamento Estratégico da PSI"
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.recDescricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, recDescricao: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Descreva a recomendação em detalhes..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Soluções Técnicas (opcional)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={tempSolucao}
                        onChange={(e) => setTempSolucao(e.target.value)}
                        placeholder="Ex: Plataforma de GRC"
                        size="sm"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSolucaoTecnica();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSolucaoTecnica} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.recSolucoes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.recSolucoes.map((sol, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg"
                          >
                            {sol}
                            <button
                              type="button"
                              onClick={() => removeSolucaoTecnica(idx)}
                              className="text-blue-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveStructuredRecommendation}
                      disabled={!formData.recTitulo.trim() || !formData.recDescricao.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingRecIndex !== null ? 'Atualizar' : 'Adicionar'}
                    </Button>
                    {editingRecIndex !== null && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearRecForm}
                      >
                        Cancelar Edição
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de Recomendações Estruturadas já adicionadas */}
              {formData.recomendacoes.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recomendações Adicionadas *
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.recomendacoes.map((rec, index) => {
                      const display = getRecommendationDisplay(rec);
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{display.titulo}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{display.descricao}</p>
                            {display.solucoes.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                {display.solucoes.length} solução(ões) técnica(s)
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editRecommendationItem(index)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => removeRecomendacaoItem(index)}
                              disabled={formData.recomendacoes.length <= 1}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Soluções Técnicas Globais (opcional) */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soluções Técnicas de Apoio (opcional)
                </label>
                <p className="text-xs text-gray-400 mb-2">Soluções que se aplicam a todas as recomendações acima</p>
                <div className="space-y-2">
                  {(formData.solucoesTecnicas || []).map((sol, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          value={sol}
                          onChange={(e) => handleSolucaoChange(index, e.target.value)}
                          placeholder={`Solução ${index + 1}`}
                          size="sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRemoveSolucao(index)}
                        disabled={!formData.solucoesTecnicas || formData.solucoesTecnicas.length <= 1}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSolucao}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Solução Técnica Global
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting || formData.recomendacoes.filter(r => r.trim()).length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingRecommendation ? 'Atualizar' : 'Criar'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta recomendação? Esta ação não pode ser desfeita.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingId(null);
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecommendations;