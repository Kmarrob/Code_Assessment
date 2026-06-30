// frontend/src/pages/RepDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Users, UserPlus, ClipboardList, BarChart3, 
  CheckCircle, Clock, AlertCircle, LogOut,
  Search, ChevronLeft, ChevronRight, Plus, Loader2,
  LayoutDashboard, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { repService, RepUser, RepStats } from '../services/rep.service.js';

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

  // ============================================
  // CORREÇÃO: DASHBOARD DE MATURIDADE - ROTA SEM companyId
  // ============================================
  const handleNavigateToDashboard = () => {
    navigate('/rep/dashboard');
  };

  // 🔴 NOVO: Gerenciar Respostas
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

        {/* Cards de Navegação Rápida - 🔴 NOVO CARD ADICIONADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card existente: Dashboard de Maturidade */}
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

          {/* 🔴 NOVO - Card: Gerenciar Respostas */}
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

          {/* Card existente: Cadastrar Usuário */}
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

          {/* Card existente: Atribuir Controles */}
          <div
            onClick={() => {}}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atribuir</p>
                <p className="text-lg font-bold text-gray-900">Controles</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAssignControls(u._id)}
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Atribuir
                            </Button>
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
    </div>
  );
};

export default RepDashboard;