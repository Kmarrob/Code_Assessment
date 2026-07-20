// frontend/src/pages/AdminReports.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Download,
  Printer,
  Plus,
  Building2,
  Calendar,
  Users,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { reportService } from '../services/report.service.js';
import { Report } from '../types/report.js';

export const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const limit = 10;

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportService.listReports({
        page,
        limit,
        status: statusFilter,
        search: search || undefined,
      });
      
      // 🔴 CORREÇÃO 1: Filtrar relatórios que têm empresa válida
      const validReports = (response.reports || []).filter((report: Report) => {
        const company = (report as any).companyId as any;
        return company && company._id && company.name;
      });
      
      setReports(validReports);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar relatórios:', err);
      setError(err.response?.data?.message || 'Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page, statusFilter, search]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadReports();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔴 CORREÇÃO 2: Usar a rota que funciona (/rep/report com companyId)
  const goToReport = (companyId: string) => {
    navigate(`/rep/report?companyId=${companyId}`);
  };

  const handleRefresh = () => {
    loadReports();
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string; bg: string }> = {
      draft: { label: 'Rascunho', color: 'text-gray-700', bg: 'bg-gray-100' },
      in_review: { label: 'Em Revisão', color: 'text-yellow-700', bg: 'bg-yellow-100' },
      finalized: { label: 'Finalizado', color: 'text-green-700', bg: 'bg-green-100' },
      archived: { label: 'Arquivado', color: 'text-gray-500', bg: 'bg-gray-100' },
    };
    return labels[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100' };
  };

  const getStatusOptions = () => {
    return [
      { value: 'all', label: 'Todos' },
      { value: 'draft', label: 'Rascunho' },
      { value: 'in_review', label: 'Em Revisão' },
      { value: 'finalized', label: 'Finalizado' },
      { value: 'archived', label: 'Arquivado' },
    ];
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && reports.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando relatórios...</p>
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
      {/* Cabeçalho da página */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Relatórios de Recomendações</h1>
                <p className="text-sm text-gray-500">
                  Gerencie todos os relatórios gerados pelas empresas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </form>
              <div className="min-w-[150px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {getStatusOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="outline" onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPage(1);
              }}>
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Relatórios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Relatórios</CardTitle>
              <span className="text-sm text-gray-500">
                {reports.length} {reports.length === 1 ? 'relatório' : 'relatórios'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={loadReports}>Tentar novamente</Button>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum relatório encontrado</h3>
                <p className="text-gray-500 mt-1">
                  {search || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Os relatórios serão gerados automaticamente quando as empresas começarem a responder os controles'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresa</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Projeto</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Período</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Equipe</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Atualizado</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => {
                      const status = getStatusLabel(report.status);
                      const company = (report as any).companyId as any;
                      const companyId = report.companyId?._id || report.companyId;
                      const companyName = company?.name || 'Empresa não identificada';
                      
                      return (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {companyName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="text-sm text-gray-900">{report.projectNumber || '-'}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                {report.scope || 'Sem escopo definido'}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {formatDate(report.assessmentStartDate)} - {formatDate(report.assessmentEndDate)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{report.clientTeam?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{report.consultantTeam?.length || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(report.updatedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {/* 🔴 CORREÇÃO: Todos os botões usam goToReport com /rep/report?companyId= */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => goToReport(companyId)}
                                title="Visualizar relatório"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Visualizar
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => goToReport(companyId)}
                                title="Visualizar para exportar PDF"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => goToReport(companyId)}
                                title="Visualizar para imprimir"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
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
      </div>
    </div>
  );
};

export default AdminReports;