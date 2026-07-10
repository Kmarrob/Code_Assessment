// frontend/src/pages/AdminCompanyDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Activity,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Eye,
  Download,
  Printer,
  TrendingUp,
  Award,
  Target,
  ListChecks,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { companyService, Company } from '../services/company.service.js';
import { reportService } from '../services/report.service.js';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface ReportData {
  _id: string;
  projectNumber: string;
  scope: string;
  status: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  updatedAt: string;
  clientTeam: UserData[];
  consultantTeam: UserData[];
  stats?: {
    totalUsers: number;
    totalResponses: number;
    completionRate: number;
  };
  resultados?: {
    categorizacao?: {
      categories: Array<{
        name: string;
        total: number;
        na: number;
        implemented: number;
        partial: number;
        notImpl: number;
        pImpl: number;
      }>;
      totals: {
        total: number;
        na: number;
        implemented: number;
        partial: number;
        notImpl: number;
      };
    };
    capacidades?: {
      capabilities: Array<{
        name: string;
        implemented: number;
        partial: number;
        notImpl: number;
        na: number;
      }>;
      totals: {
        implemented: number;
        partial: number;
        notImpl: number;
        na: number;
      };
      radarData?: Array<{
        subject: string;
        Implementado: number;
        Recomendado: number;
        fullMark: number;
      }>;
    };
  };
}

export const AdminCompanyDetail: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [consultants, setConsultants] = useState<UserData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [reportDetail, setReportDetail] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalResponses: 0,
    completionRate: 0,
    implementedControls: 0,
    partialControls: 0,
    notImplementedControls: 0,
    naControls: 0,
    totalControls: 0,
  });

  const loadData = async () => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Carregar empresa
      const companyData = await companyService.getCompanyById(companyId);
      setCompany(companyData);

      // Carregar dashboard da empresa
      setIsLoadingReport(true);
      try {
        const dashboardData = await reportService.getAdminDashboard(companyId);
        
        const reportData = dashboardData.report;
        setReportDetail(reportData);

        if (reportData.clientTeam) {
          setUsers(reportData.clientTeam);
        }

        if (reportData.consultantTeam) {
          setConsultants(reportData.consultantTeam);
        }

        if (dashboardData.stats) {
          setStats(prev => ({
            ...prev,
            totalUsers: dashboardData.stats?.totalUsers || 0,
            totalResponses: dashboardData.stats?.totalResponses || 0,
            completionRate: dashboardData.stats?.completionRate || 0,
            totalControls: dashboardData.stats?.totalControls || 0,
          }));
        }

        if (dashboardData.resultados?.categorizacao?.totals) {
          const totals = dashboardData.resultados.categorizacao.totals;
          setStats(prev => ({
            ...prev,
            implementedControls: totals.implemented || 0,
            partialControls: totals.partial || 0,
            notImplementedControls: totals.notImpl || 0,
            naControls: totals.na || 0,
          }));
        }

        const activeUsers = reportData.clientTeam?.filter((u: UserData) => u.isActive !== false).length || 0;
        const inactiveUsers = (reportData.clientTeam?.length || 0) - activeUsers;
        setStats(prev => ({
          ...prev,
          activeUsers: activeUsers,
          inactiveUsers: inactiveUsers,
        }));

        if (reportData) {
          setReports([{
            _id: reportData._id,
            projectNumber: reportData.projectNumber,
            scope: reportData.scope,
            status: reportData.status,
            assessmentStartDate: reportData.assessmentStartDate,
            assessmentEndDate: reportData.assessmentEndDate,
            updatedAt: reportData.updatedAt,
            clientTeam: reportData.clientTeam || [],
            consultantTeam: reportData.consultantTeam || [],
            stats: dashboardData.stats,
            resultados: dashboardData.resultados,
          }]);
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard da empresa:', err);
      } finally {
        setIsLoadingReport(false);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados da empresa:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleRefresh = () => {
    loadData();
  };

  const goBack = () => {
    navigate('/admin/empresas');
  };

  // 🔴 CORREÇÃO: Usar companyId em vez de reportId
  const goToReport = (companyId: string) => {
    navigate(`/admin/relatorios/${companyId}`);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativo' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
      in_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Revisão' },
      finalized: { color: 'bg-green-100 text-green-800', label: 'Finalizado' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Arquivado' },
    };
    const config = configs[status] || configs.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      rep: 'Preposto',
      consultant: 'Consultor',
      user: 'Usuário',
    };
    return roles[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error || 'Empresa não encontrada'}</p>
            <Button className="mt-4" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminMetaTags
        title={`Empresa: ${company.name} - Admin`}
        description={`Detalhes da empresa ${company.name}`}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <AdminBreadcrumbs />

          <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
            <div className="flex items-start gap-4">
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  {getStatusBadge(company.status)}
                </div>
                <p className="text-gray-600 mt-1">
                  {company.cnpj ? `CNPJ: ${company.cnpj}` : 'CNPJ não cadastrado'}
                  {' · '}
                  Plano: <span className="font-medium capitalize">{company.plan}</span>
                  {' · '}
                  {stats.totalUsers} usuários
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
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
                    <p className="text-sm text-gray-500">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
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
                    <p className="text-sm text-gray-500">Controles Avaliados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
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
                    <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completionRate}%</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Implementados</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.implementedControls}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Parciais</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.partialControls}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Não Implementados</p>
                    <p className="text-2xl font-bold text-red-600">{stats.notImplementedControls}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Não Aplicáveis</p>
                    <p className="text-2xl font-bold text-gray-500">{stats.naControls}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Minus className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  Usuários da Empresa
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReport ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Carregando usuários...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>Nenhum usuário cadastrado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Cadastre usuários para começar a avaliação
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Nome</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">E-mail</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Perfil</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Criado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(user.isActive !== false ? 'active' : 'inactive')}</td>
                          <td className="py-3 px-4 text-gray-500">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {consultants.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    Equipe de Consultoria
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {consultants.length} {consultants.length === 1 ? 'consultor' : 'consultores'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Nome</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">E-mail</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Perfil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {consultants.map((consultant) => (
                        <tr key={consultant._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{consultant.name}</td>
                          <td className="py-3 px-4 text-gray-600">{consultant.email}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {getRoleLabel(consultant.role)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {reportDetail && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Relatório da Empresa
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {getStatusBadge(reportDetail.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Número do Projeto</p>
                    <p className="font-medium">{reportDetail.projectNumber || 'Não definido'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Período do Assessment</p>
                    <p className="font-medium">
                      {formatDate(reportDetail.assessmentStartDate)} - {formatDate(reportDetail.assessmentEndDate)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Escopo</p>
                    <p className="font-medium">{reportDetail.scope || 'Não definido'}</p>
                  </div>
                  <div className="md:col-span-2">
                    {/* 🔴 CORREÇÃO: Usar companyId em vez de reportDetail._id */}
                    <Button
                      onClick={() => goToReport(companyId)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar Relatório Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!reportDetail && !isLoadingReport && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhum relatório encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  O relatório será gerado automaticamente quando a empresa começar a responder os controles
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCompanyDetail;