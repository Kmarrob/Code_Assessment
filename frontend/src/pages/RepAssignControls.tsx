// frontend/src/pages/RepAssignControls.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ClipboardList, Loader2, CheckCircle, 
  AlertCircle, Search, Filter, X, ChevronLeft, ChevronRight,
  Plus, Minus, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { repService } from '../services/rep.service.js';
import api from '../services/api.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';

interface Control {
  _id: string;
  id: string;
  nome: string;
  dominioDeSI: string[];
  tipoDeControle: string[];
  nota?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  department?: string;
}

export const RepAssignControls: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  
  const [user, setUser] = useState<User | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [allControls, setAllControls] = useState<Control[]>([]);
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterDominio, setFilterDominio] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const limit = 10;

  // Estados para modal de conflito
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictControls, setConflictControls] = useState<string[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState<{ controlIds: string[] } | null>(null);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadUser = async () => {
    try {
      const response = await api.get(`/rep/users`);
      const users = response.data.data;
      const foundUser = users.find((u: User) => u._id === userId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        setError('Usuário não encontrado');
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      setError('Erro ao carregar usuário');
    }
  };

  const loadControls = async (pageToLoad: number) => {
    try {
      const params = new URLSearchParams();
      params.append('page', String(pageToLoad));
      params.append('limit', String(limit));
      params.append('sort', 'id');
      if (search) params.append('search', search);
      if (filterDominio) params.append('dominio', filterDominio);
      
      const response = await api.get(`/rep/controls?${params.toString()}`);
      const data = response.data;
      setAllControls(data.data || []);
      setPagination(null);
    } catch (err) {
      console.error('Erro ao carregar controles:', err);
      setError('Erro ao carregar controles');
    }
  };

  const loadUserAssignments = async () => {
    try {
      const progress = await repService.getUserProgress(userId!);
      const assignedIds = progress.details
        .filter(d => d.assignmentId)
        .map(d => d.controlId);
      setSelectedControls(assignedIds);
    } catch (err) {
      console.log('Nenhuma atribuição encontrada para este usuário');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        loadUser(),
        loadControls(1),
        loadUserAssignments(),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!isLoading) {
      loadControls(page);
    }
  }, [page, search, filterDominio]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleBack = () => {
    navigate('/rep');
  };

  const handleToggleControl = (controlId: string) => {
    setSelectedControls(prev => {
      if (prev.includes(controlId)) {
        return prev.filter(id => id !== controlId);
      } else {
        return [...prev, controlId];
      }
    });
  };

  const handleSelectAll = () => {
    const controlIds = allControls.map(c => c._id);
    const allSelected = controlIds.every(id => selectedControls.includes(id));
    if (allSelected) {
      setSelectedControls(prev => prev.filter(id => !controlIds.includes(id)));
    } else {
      setSelectedControls(prev => {
        const newIds = controlIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  // ============================================
  // SUBMIT COM TRATAMENTO DE CONFLITOS - CORRIGIDO FINAL
  // ============================================
  const handleSubmit = async () => {
    if (selectedControls.length === 0) {
      setError('Selecione pelo menos um controle para atribuir');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // FORÇAR conversão para array de strings
      const controlIdsArray = Array.isArray(selectedControls) 
        ? selectedControls.map(id => String(id))
        : Object.values(selectedControls).map(id => String(id));
      
      console.log('📤 controlIdsArray:', controlIdsArray);
      
      const result = await repService.assignControls({
        userId: userId!,
        controlIds: controlIdsArray,
      });

      if (result.conflicts && result.conflicts.length > 0) {
        setConflictControls(result.conflicts);
        setPendingSubmit({ controlIds: controlIdsArray });
        setConflictModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      setSuccess(`${result.assigned} controles atribuídos com sucesso!`);
      await loadUserAssignments();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao atribuir controles:', err);
      console.error('Resposta do erro:', err.response?.data);
      const message = err.response?.data?.message || 'Erro ao atribuir controles. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmForce = async () => {
    setConflictModalOpen(false);
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // FORÇAR conversão para array de strings
      const controlIdsArray = Array.isArray(selectedControls) 
        ? selectedControls.map(id => String(id))
        : Object.values(selectedControls).map(id => String(id));
      
      console.log('📤 FORCE - controlIdsArray:', controlIdsArray);
      
      const result = await repService.assignControls({
        userId: userId!,
        controlIds: controlIdsArray,
        force: true,
      });

      setSuccess(`${result.assigned} controles atribuídos com sucesso! (${result.removed} substituições realizadas)`);
      await loadUserAssignments();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao atribuir controles com força:', err);
      console.error('Resposta do erro:', err.response?.data);
      const message = err.response?.data?.message || 'Erro ao atribuir controles. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
      setPendingSubmit(null);
    }
  };

  const handleCancelForce = () => {
    setConflictModalOpen(false);
    setPendingSubmit(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <Button className="mt-4" onClick={handleBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const dominios = Array.from(
    new Set(allControls.flatMap(c => c.dominioDeSI || []))
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atribuir Controles</h1>
            <p className="text-gray-600 mt-1">
              {user ? (
                <>Selecionar controles para <span className="font-semibold">{user.name}</span></>
              ) : (
                'Selecionar controles para o usuário'
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              Selecionados: <span className="font-bold text-blue-600">{selectedControls.length}</span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedControls.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Atribuir {selectedControls.length > 0 ? `(${selectedControls.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID ou nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="w-48">
                <select
                  value={filterDominio}
                  onChange={(e) => setFilterDominio(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os domínios</option>
                  {dominios.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {allControls.every(c => selectedControls.includes(c._id)) ? (
                    <>Desselecionar Todos</>
                  ) : (
                    <>Selecionar Todos</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {allControls.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Nenhum controle encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={allControls.every(c => selectedControls.includes(c._id))}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">ID</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Nome</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Domínio</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Tipo</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allControls.map((control) => {
                    const isSelected = selectedControls.includes(control._id);
                    return (
                      <tr 
                        key={control._id} 
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleControl(control._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600 cursor-pointer" onClick={() => handleToggleControl(control._id)}>
                          {control.id}
                        </td>
                        <td className="py-3 px-4 text-gray-900 max-w-xs truncate cursor-pointer" onClick={() => handleToggleControl(control._id)} title={control.nome}>
                          {control.nome}
                        </td>
                        <td className="py-3 px-4 text-gray-600 cursor-pointer" onClick={() => handleToggleControl(control._id)}>
                          {control.dominioDeSI?.join(', ') || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 cursor-pointer" onClick={() => handleToggleControl(control._id)}>
                          {control.tipoDeControle?.join(', ') || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 cursor-pointer" onClick={() => handleToggleControl(control._id)}>
                          {control.nota || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasPrevious
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasNext
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedControls.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  <span className="font-semibold">{selectedControls.length}</span> controles selecionados
                  {user && (
                    <> para <span className="font-semibold">{user.name}</span></>
                  )}
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atribuindo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Atribuição
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 flex items-start gap-2">
            <span className="font-semibold">💡 Dica:</span>
            <span>
              Os controles já atribuídos ao usuário aparecem pré-selecionados. 
              Você pode adicionar ou remover controles conforme necessário. 
              A atribuição é inteligente e evita duplicação.
            </span>
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={conflictModalOpen}
        title="Conflito de Atribuição"
        message={
          <>
            <p className="mb-2">
              Os seguintes controles já estão atribuídos a <strong>outros usuários</strong>:
            </p>
            <ul className="list-disc pl-5 mb-3 text-sm">
              {conflictControls.map((id) => {
                const control = allControls.find(c => c._id === id);
                return (
                  <li key={id} className="text-gray-700">
                    {control ? `${control.id} - ${control.nome}` : id}
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-red-600 font-medium">
              Ao confirmar, estes controles serão <strong>removidos</strong> dos usuários atuais e <strong>atribuídos</strong> a este usuário.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Deseja continuar?
            </p>
          </>
        }
        confirmLabel="Sim, substituir"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleConfirmForce}
        onCancel={handleCancelForce}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default RepAssignControls;