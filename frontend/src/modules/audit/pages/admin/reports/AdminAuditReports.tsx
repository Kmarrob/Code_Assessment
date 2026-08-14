import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Search,
  Filter,
} from 'lucide-react';
// 🔧 CORREÇÃO: Caminho corrigido de '../../hooks/useAudit' para '../../../hooks/useAudit'
import { useReports, useApproveReport, useRejectReport } from '../../../hooks/useAudit';
import { AuditReport, AuditReportStatus } from '../../../types/audit.types';

const STATUS_OPTIONS: { value: AuditReportStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
  { value: 'draft', label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
  { value: 'pending_review', label: 'Aguardando Revisão', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'approved', label: 'Aprovado', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending_review: 'Aguardando Revisão',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export function AdminAuditReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditReportStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: reports = [], isLoading, error, refetch } = useReports();
  const approveReport = useApproveReport();
  const rejectReport = useRejectReport();

  const filteredReports = reports.filter((report: AuditReport) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        report.summary.toLowerCase().includes(search) ||
        report.conclusion.toLowerCase().includes(search) ||
        (report.recommendations && report.recommendations.some(r => r.toLowerCase().includes(search)))
      );
    }
    if (statusFilter !== 'all') {
      return report.status === statusFilter;
    }
    return true;
  });

  const handleApprove = async (id: string) => {
    if (window.confirm('Confirmar aprovação deste relatório?')) {
      await approveReport.mutateAsync(id);
      refetch();
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Informe o motivo da rejeição:');
    if (reason) {
      await rejectReport.mutateAsync({ id, reason });
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800">Erro ao carregar relatórios</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/audit/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios de Auditoria</h1>
            <p className="text-gray-500 mt-1">
              {reports.length} relatório(s) no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por resumo, conclusão ou recomendações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuditReportStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum relatório encontrado</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há relatórios gerados no sistema'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report: AuditReport) => (
              <div key={report._id} className="hover:bg-gray-50 transition-colors">
                {/* Report Row */}
                <div className="flex items-start justify-between px-6 py-4">
                  <div
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => setExpandedId(prev => prev === report._id ? null : report._id)}
                  >
                    <div className={`mt-1 p-2 rounded-lg ${
                      report.status === 'approved' ? 'bg-green-50' :
                      report.status === 'rejected' ? 'bg-red-50' :
                      report.status === 'pending_review' ? 'bg-yellow-50' :
                      'bg-gray-50'
                    }`}>
                      {report.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : report.status === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : report.status === 'pending_review' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-gray-900 truncate">
                          Relatório de Auditoria
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'approved' ? 'bg-green-100 text-green-700' :
                          report.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          report.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {STATUS_LABELS[report.status] || report.status}
                        </span>
                        {report.findings && (
                          <span className="text-xs text-gray-500">
                            {report.findings.length} NC(s)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Criado em: {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Criado por: {report.createdBy || 'Não informado'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {report.status === 'approved' && report.approvedAt && (
                        `Aprovado em ${new Date(report.approvedAt).toLocaleDateString('pt-BR')}`
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/admin/audit/reports/${report._id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {report.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleApprove(report._id)}
                          disabled={approveReport.isPending}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(report._id)}
                          disabled={rejectReport.isPending}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Rejeitar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(prev => prev === report._id ? null : report._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      {expandedId === report._id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === report._id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Resumo</h4>
                        <p className="text-sm text-gray-600">{report.summary}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Conclusão</h4>
                        <p className="text-sm text-gray-600">{report.conclusion}</p>
                      </div>
                    </div>
                    {report.recommendations && report.recommendations.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Recomendações</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {report.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.status === 'rejected' && report.rejectionReason && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Motivo da rejeição: {report.rejectionReason}</span>
                      </div>
                    )}
                    {report.status === 'approved' && report.approvedBy && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Aprovado por {report.approvedBy} em {new Date(report.approvedAt!).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}