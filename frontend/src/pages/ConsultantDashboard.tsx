// frontend/src/pages/ConsultantDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  LayoutDashboard, BarChart3, FileText, Users,
  TrendingUp, TrendingDown, PieChart, Download, AlertTriangle,
  Building2, ClipboardList, CheckCircle, LogOut, Search,
  ChevronLeft, ChevronRight, Loader2, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { consultantService, ConsultantCompany, ConsultantStats } from '../services/consultant.service.js';
import toast from 'react-hot-toast';

export const ConsultantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<ConsultantCompany[]>([]);
  const [stats, setStats] = useState<ConsultantStats | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await consultantService.listCompanies({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setCompanies(response.items || []);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await consultantService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleViewCompany = (companyId: string) => {
    navigate(`/consultant/companies/${companyId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
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
  if (isLoading && companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando painel do consultor...</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativa' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativa' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspensa' },
    };
    const config = configs[status as keyof typeof configs] || configs.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
            <span className="ml-2 text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Consultor
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
        <div className="flex flex-wrap items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Consultor</h1>
            <p className="text-gray-600 mt-1">
              Análise e relatórios de maturidade em Segurança da Informação
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Empresas</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalCompanies || 0}</p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Atribuições</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-3xl font-bold text-orange-600">{stats?.totalAssignments || 0}</p>
                  )}
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Respostas</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{stats?.totalResponses || 0}</p>
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
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats?.completionRate || 0}%
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Domínio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Organizacional</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Pessoas</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Físico</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tecnológico</span>
                    <span className="font-medium">55%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="p-1 bg-red-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Política de Segurança</p>
                    <p className="text-xs text-gray-600">PSI não aprovada pela alta direção</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="p-1 bg-yellow-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Gestão de Incidentes</p>
                    <p className="text-xs text-gray-600">Plano de resposta não documentado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="p-1 bg-yellow-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Controle de Acesso</p>
                    <p className="text-xs text-gray-600">Revisão de acessos não realizada</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Minhas Empresas</CardTitle>
              <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar empresas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-48"
                  />
                </form>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                  <option value="suspended">Suspensas</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={() => loadCompanies()}>Tentar novamente</Button>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Nenhuma empresa atribuída a você ainda.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Aguarde o administrador atribuir empresas ao seu perfil.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresa</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Usuários</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Controles</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Atribuições</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Progresso</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companies.map((company) => (
                      <tr key={company._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{company.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{company.userCount}</td>
                        <td className="py-3 px-4 text-gray-600">{company.assignedControlsCount}</td>
                        <td className="py-3 px-4 text-gray-600">{company.totalAssignments}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${company.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">{company.completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(company.status)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleViewCompany(company._id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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
      </main>
    </div>
  );
};

export default ConsultantDashboard;