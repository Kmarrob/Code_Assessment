// frontend/src/pages/ReportView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { reportService } from '../services/report.service.js';
import { Report, ReportStats } from '../types/report.js';
import {
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Building2,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Printer,
  UserCircle,
  Mail,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';

export const ReportView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    projectNumber: '',
    scope: '',
  });

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getDashboard();
      setReport(data.report);
      setStats(data.stats);
      setFormData({
        projectNumber: data.report.projectNumber || '',
        scope: data.report.scope || '',
      });
    } catch (err: any) {
      console.error('Erro ao carregar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao carregar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleGenerate = async () => {
    if (!report) return;
    setIsGenerating(true);
    try {
      const updated = await reportService.generateReport(report.companyId);
      setReport(updated);
      setFormData({
        projectNumber: updated.projectNumber || '',
        scope: updated.scope || '',
      });
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao gerar dados do relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    try {
      const updated = await reportService.updateReport(report.companyId, {
        projectNumber: formData.projectNumber,
        scope: formData.scope,
      });
      setReport(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erro ao salvar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao salvar relatório');
    }
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
    const labels: Record<string, { label: string; color: string }> = {
      draft: { label: 'Rascunho', color: 'text-gray-500' },
      in_review: { label: 'Em Revisão', color: 'text-yellow-600' },
      finalized: { label: 'Finalizado', color: 'text-green-600' },
      archived: { label: 'Arquivado', color: 'text-gray-400' },
    };
    return labels[status] || { label: status, color: 'text-gray-500' };
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum relatório encontrado</p>
          <Button onClick={handleGenerate} className="mt-4">
            Gerar relatório
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(report.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho da página */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Relatório de Recomendações</h1>
                <p className="text-sm text-gray-500">
                  {report.projectNumber || 'Nº do projeto não definido'} · {report.scope || 'Escopo não definido'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm font-medium ${status.color}`}>
                Status: {status.label}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Gerando...' : 'Atualizar Dados'}
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
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
                  <p className="text-sm text-gray-500">Controles Avaliados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalResponses || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Período do Assessment</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(report.assessmentStartDate)} - {formatDate(report.assessmentEndDate)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de edição do relatório */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações do Projeto</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.projectNumber}
                    onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: P-2026-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escopo do Projeto
                  </label>
                  <textarea
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva o escopo do projeto..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Número do Projeto</p>
                  <p className="font-medium">{report.projectNumber || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-gray-100`}>
                    {status.label}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Escopo do Projeto</p>
                  <p className="font-medium">{report.scope || 'Não definido'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipe do Cliente */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Equipe do Cliente</CardTitle>
            <p className="text-sm text-gray-500">
              {report.clientTeam.length} {report.clientTeam.length === 1 ? 'membro' : 'membros'}
            </p>
          </CardHeader>
          <CardContent>
            {report.clientTeam.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum usuário cadastrado para esta empresa.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Nome</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Designação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Contato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.clientTeam.map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{member.role}</td>
                        <td className="py-3 px-4 text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                            {member.email}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipe da Consultoria */}
        <Card>
          <CardHeader>
            <CardTitle>Equipe de Consultoria</CardTitle>
            <p className="text-sm text-gray-500">
              {report.consultantTeam.length} {report.consultantTeam.length === 1 ? 'consultor' : 'consultores'}
            </p>
          </CardHeader>
          <CardContent>
            {report.consultantTeam.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum consultor vinculado a esta empresa.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Nome</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Designação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Contato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.consultantTeam.map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{member.role}</td>
                        <td className="py-3 px-4 text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                            {member.email}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportView;