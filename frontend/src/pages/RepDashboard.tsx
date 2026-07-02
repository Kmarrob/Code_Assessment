// frontend/src/pages/RepDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Users, UserPlus, ClipboardList, BarChart3, 
  CheckCircle, Clock, AlertCircle, LogOut,
  Search, ChevronLeft, ChevronRight, Plus, Loader2,
  LayoutDashboard, MessageSquare, Edit, Trash2, 
  X, RefreshCw, AlertTriangle, ChevronDown, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { repService, RepUser, RepStats } from '../services/rep.service.js';
import { RevokeControlModal } from '../components/rep/RevokeControlModal.js';

export const RepDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<RepUser[]>([]);
  const [stats, setStats] = useState<RepStats | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const limit = 10;

  // Estados para modais
  const [showInactivateModal, setShowInactivateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RepUser | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedControlName, setSelectedControlName] = useState<string>('');
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [inactivateReason, setInactivateReason] = useState<'Desligado' | 'Mudou de setor' | 'Outros'>('Desligado');
  const [inactivateDescription, setInactivateDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Estado para lista de atribuições do usuário
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [showAssignmentsList, setShowAssignmentsList] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await repService.listUsers({
        page,
        limit,
        search: search || undefined,
      });
      setUsers(response.items || []);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await repService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  useEffect(() => {
    loadStats();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateUser = () => {
    navigate('/rep/users/new');
  };

  const handleAssignControls = (userId: string) => {
    navigate(`/rep/users/${userId}/assign`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/rep/users/${userId}/edit`);
  };

  // Abrir modal de inativação
  const handleOpenInactivate = (user: RepUser) => {
    setSelectedUser(user);
    setInactivateReason('Desligado');
    setInactivateDescription('');
    setActionError(null);
    setShowInactivateModal(true);
  };

  // Confirmar inativação
  const handleConfirmInactivate = async () => {
    if (!selectedUser) return;

    if (inactivateReason === 'Outros' && !inactivateDescription.trim()) {
      setActionError('Descrição é obrigatória quando motivo é "Outros"');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await repService.inactivateUser(selectedUser._id, {
        reason: inactivateReason,
        description: inactivateDescription.trim(),
      });
      
      setShowInactivateModal(false);
      setSelectedUser(null);
      await loadUsers();
      await loadStats();
    } catch (err: any) {
      console.error('Erro ao inativar usuário:', err);
      setActionError(err.response?.data?.message || 'Erro ao inativar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir lista de atribuições do usuário
  const handleOpenRevokeList = async (user: RepUser) => {
    setSelectedUser(user);
    setActionError(null);
    setIsLoadingAssignments(true);
    setShowAssignmentsList(true);

    try {
      const progress = await repService.getUserProgress(user._id);
      const pendingAssignments = progress.details.filter(
        (detail: any) => detail.status === 'pending' || detail.status === 'in_progress'
      );
      setUserAssignments(pendingAssignments);
    } catch (err: any) {
      console.error('Erro ao carregar atribuições:', err);
      setActionError('Erro ao carregar lista de controles');
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  // Abrir modal de revogação com dados reais
  const handleOpenRevoke = (assignmentId: string, controlName: string, controlId: string) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedControlName(controlName);
    setSelectedControlId(controlId);
    setShowAssignmentsList(false);
    setShowRevokeModal(true);
  };

  // Confirmar revogação
  const handleConfirmRevoke = async (assignmentId: string, newUserId?: string) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      await repService.revokeControl(assignmentId, {
        confirmRevoke: true,
        newUserId: newUserId || undefined,
      });
      
      setShowRevokeModal(false);
      setSelectedUser(null);
      setUserAssignments([]);
      await loadUsers();
      await loadStats();
    } catch (err: any) {
      console.error('Erro ao revogar controle:', err);
      setActionError(err.response?.data?.message || 'Erro ao revogar controle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔴 NOVO: Navegar para página de documentos
  const handleManageDocuments = () => {
    navigate('/rep/documents');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDashboard = () => {
    navigate('/rep/dashboard');
  };

  const handleManageResponses = () => {
    navigate('/rep/responses');
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando painel...</p>
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
            <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Preposto
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Preposto</h1>
            <p className="text-gray-600 mt-1">Gerencie seus usuários e controles</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleNavigateToDashboard} variant="outline">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard de Maturidade
            </Button>
            <Button onClick={handleCreateUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Usuários</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Controles Atribuídos</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{stats?.totalAssignments || 0}</p>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Concluídos</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{stats?.totalResponses || 0}</p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats?.completionRate !== undefined && stats?.completionRate !== null
                        ? `${Math.round(stats.completionRate)}%` 
                        : '0%'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Navegação Rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={handleNavigateToDashboard}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizar</p>
                <p className="text-lg font-bold text-gray-900">Maturidade</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <LayoutDashboard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
          </div>

          <div
            onClick={handleManageResponses}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gerenciar</p>
                <p className="text-lg font-bold text-gray-900">Respostas</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
          </div>

          <div
            onClick={handleCreateUser}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cadastrar</p>
                <p className="text-lg font-bold text-gray-900">Novo Usuário</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
          </div>

          {/* 🔴 SUBSTITUÍDO: Card "Atribuir" pelo card "Documentos" */}
          <div
            onClick={handleManageDocuments}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gerenciar</p>
                <p className="text-lg font-bold text-gray-900">Documentos</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Meus Usuários</CardTitle>
              <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-48"
                  />
                </form>
                <Button size="sm" onClick={handleCreateUser}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={() => loadUsers()}>Tentar novamente</Button>
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12 text-gray-400" />}
                title="Nenhum usuário cadastrado"
                description="Comece adicionando seus usuários para atribuir controles."
                actionLabel="Adicionar usuário"
                onAction={handleCreateUser}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Nome</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Email</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Departamento</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Atribuições</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Progresso</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => {
                      const progress = u.assignmentsCount > 0 
                        ? Math.round((u.responsesCount / u.assignmentsCount) * 100) 
                        : 0;
                      
                      let barColor = 'bg-red-500';
                      if (progress >= 67) barColor = 'bg-green-500';
                      else if (progress >= 34) barColor = 'bg-yellow-500';
                      
                      return (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4 text-gray-500">{u.department || '-'}</td>
                          <td className="py-3 px-4 text-gray-500">{u.assignmentsCount || 0}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${barColor} rounded-full transition-all duration-500`} 
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">{progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAssignControls(u._id)}
                              >
                                <ClipboardList className="h-4 w-4 mr-1" />
                                Atribuir
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleEditUser(u._id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleOpenInactivate(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {u.assignmentsCount > 0 && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                  onClick={() => handleOpenRevokeList(u)}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
      </main>

      {/* Modal de Inativação */}
      {showInactivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Inativar Usuário</h2>
              <button
                onClick={() => setShowInactivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                Você está prestes a inativar o usuário <strong>{selectedUser.name}</strong>.
                Esta ação pode ser revertida a qualquer momento.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo da Inativação *
              </label>
              <select
                value={inactivateReason}
                onChange={(e) => setInactivateReason(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Desligado">Desligado</option>
                <option value="Mudou de setor">Mudou de setor</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inactivateReason === 'Outros' ? 'Descrição *' : 'Descrição (opcional)'}
              </label>
              <textarea
                value={inactivateDescription}
                onChange={(e) => setInactivateDescription(e.target.value)}
                placeholder={inactivateReason === 'Outros' ? 'Descreva o motivo da inativação...' : 'Descrição adicional (opcional)...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                required={inactivateReason === 'Outros'}
              />
              {inactivateReason === 'Outros' && (
                <p className="text-xs text-gray-500 mt-1">
                  * Descrição obrigatória para motivo "Outros"
                </p>
              )}
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowInactivateModal(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleConfirmInactivate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Inativar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lista de Atribuições para Revogação */}
      {showAssignmentsList && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Controles do Usuário</h2>
                <p className="text-sm text-gray-600">
                  {selectedUser.name} - Selecione um controle para revogar
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignmentsList(false);
                  setSelectedUser(null);
                  setUserAssignments([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingAssignments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">Carregando controles...</span>
              </div>
            ) : userAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>Este usuário não possui controles pendentes para revogar.</p>
                <p className="text-sm">Todos os controles já foram respondidos ou não há atribuições.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Controle</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userAssignments.map((assignment) => (
                      <tr key={assignment.assignmentId} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{assignment.controlName}</div>
                          <div className="text-xs text-gray-500">ID: {assignment.controlId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {assignment.status || 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => {
                              const controlId = assignment.controlId || assignment.assignmentId;
                              handleOpenRevoke(
                                assignment.assignmentId,
                                assignment.controlName,
                                controlId
                              );
                            }}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Revogar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {actionError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {actionError}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignmentsList(false);
                  setSelectedUser(null);
                  setUserAssignments([]);
                  setActionError(null);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Revogação */}
      {showRevokeModal && selectedUser && (
        <RevokeControlModal
          isOpen={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirmRevoke}
          assignmentId={selectedAssignmentId}
          controlName={selectedControlName}
          controlId={selectedControlId}
          currentUserName={selectedUser.name}
          currentUserId={selectedUser._id}
          repId={user?.id || ''}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default RepDashboard;