// frontend/src/pages/RepMyControls.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { repService } from '../services/rep.service.js';
import { EmptyState } from '../components/ui/EmptyState.js';

interface MyControl {
  _id: string;
  assignmentId: string;
  controlId: string;
  controlName: string;
  status: string;
  assignedAt: string;
  response?: {
    _id: string;
    maturityLevel: string;
    scenarioDescription: string;
    observations: string;
    submittedAt: string;
  } | null;
}

export const RepMyControls: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [controls, setControls] = useState<MyControl[]>([]);
  const [filteredControls, setFilteredControls] = useState<MyControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');

  // ============================================
  // CARREGAR CONTROLES ATRIBUÍDOS AO PREPOSTO
  // ============================================
  useEffect(() => {
    const loadMyControls = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const assignments = await repService.getMyAssignments();
        
        // Mapear para o formato da interface
        const mappedControls: MyControl[] = assignments.map((a: any) => ({
          _id: a._id,
          assignmentId: a._id,
          controlId: a.controlId?._id || a.controlId,
          controlName: a.controlName || 'Controle não identificado',
          status: a.status || 'pending',
          assignedAt: a.assignedAt || new Date().toISOString(),
          response: a.response || null,
        }));

        setControls(mappedControls);
        setFilteredControls(mappedControls);
      } catch (err: any) {
        console.error('Erro ao carregar controles:', err);
        setError(err.response?.data?.message || 'Erro ao carregar seus controles');
      } finally {
        setIsLoading(false);
      }
    };

    loadMyControls();
  }, []);

  // ============================================
  // FILTROS
  // ============================================
  useEffect(() => {
    let filtered = [...controls];

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Filtro por busca
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.controlName.toLowerCase().includes(term) ||
          c.controlId.toLowerCase().includes(term)
      );
    }

    setFilteredControls(filtered);
  }, [search, statusFilter, controls]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleBack = () => {
    navigate('/rep');
  };

  const handleAnswer = (assignmentId: string) => {
    navigate(`/user/answer/${assignmentId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Concluído
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            Em andamento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3" />
            Pendente
          </span>
        );
    }
  };

  const getStatusCount = (status: string) => {
    return controls.filter((c) => c.status === status).length;
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando seus controles...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  const totalPending = getStatusCount('pending') + getStatusCount('in_progress');
  const totalCompleted = getStatusCount('completed');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Botão voltar */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
              Meus Controles
            </h1>
            <p className="text-gray-600 mt-1">
              Controles atribuídos a você para responder
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium text-gray-700">Pendentes:</span>{' '}
              <span className="text-yellow-600 font-bold">{totalPending}</span>
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium text-gray-700">Concluídos:</span>{' '}
              <span className="text-green-600 font-bold">{totalCompleted}</span>
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium text-gray-700">Total:</span>{' '}
              <span className="text-gray-900 font-bold">{controls.length}</span>
            </span>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por controle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="completed">Concluídos</option>
                </select>
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Controles */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {filteredControls.length === 0 ? (
              <div className="py-12 text-center">
                {controls.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardList className="h-12 w-12 text-gray-400" />}
                    title="Nenhum controle atribuído"
                    description="Você ainda não tem controles atribuídos. Use o card 'Atribuir Controles para Mim' para adicionar."
                    actionLabel="Atribuir Controles"
                    onAction={() => navigate('/rep')}
                  />
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum controle encontrado com os filtros selecionados</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Controle</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Data de Atribuição</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredControls.map((control) => (
                    <tr key={control._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-gray-900">{control.controlName}</span>
                          <span className="ml-2 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {control.controlId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(control.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(control.assignedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => handleAnswer(control.assignmentId)}
                          className={
                            control.status === 'completed'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-0'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }
                        >
                          {control.response ? (
                            <>
                              <FileText className="h-3 w-3 mr-1" />
                              Editar Resposta
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Responder
                            </>
                          )}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Resumo de Progresso */}
        {controls.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-indigo-700">
                  <span className="font-semibold">{totalCompleted}</span> de{' '}
                  <span className="font-semibold">{controls.length}</span> controles concluídos
                  {controls.length > 0 && (
                    <span className="ml-2 font-semibold">
                      ({Math.round((totalCompleted / controls.length) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full md:w-1/3">
                <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${controls.length > 0 ? (totalCompleted / controls.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepMyControls;