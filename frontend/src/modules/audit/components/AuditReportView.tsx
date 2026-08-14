import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Building,
  Eye,
  Edit,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { AuditReport, AuditFinding, AuditPlan } from '../types/audit.types';

interface AuditReportViewProps {
  report: AuditReport;
  plan?: AuditPlan;
  findings?: AuditFinding[];
  onApprove?: () => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onSubmit?: () => Promise<void>;
  onDownload?: () => Promise<void>;
  isSubmitting?: boolean;
  isAdmin?: boolean;
  isRep?: boolean;
}

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600', icon: Clock },
  pending_review: { label: 'Aguardando Revisão', color: 'bg-yellow-100 text-yellow-600', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-600', icon: CheckCircle },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-600', icon: XCircle },
};

const FINDING_TYPE_CONFIG = {
  nc_a: { label: 'NC A - Maior', color: 'text-red-600 bg-red-50 border-red-200' },
  nc_b: { label: 'NC B - Menor', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  comment: { label: 'Comentário', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  opportunity: { label: 'Oportunidade de Melhoria', color: 'text-green-600 bg-green-50 border-green-200' },
  positive: { label: 'Boas Práticas', color: 'text-purple-600 bg-purple-50 border-purple-200' },
};

const FINDING_STATUS_CONFIG = {
  open: { label: 'Aberta', color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700' },
  pending_validation: { label: 'Aguardando Validação', color: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Fechada', color: 'bg-green-100 text-green-700' },
  reopened: { label: 'Reaberta', color: 'bg-orange-100 text-orange-700' },
};

export function AuditReportView({
  report,
  plan,
  findings = [],
  onApprove,
  onReject,
  onSubmit,
  onDownload,
  isSubmitting = false,
  isAdmin = false,
  isRep = false,
}: AuditReportViewProps) {
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  const handleDownload = async () => {
    if (!onDownload) return;
    setIsDownloading(true);
    try {
      await onDownload();
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectReason.trim()) return;
    await onReject(rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason('');
  };

  const getFindingTypeConfig = (type: string) => {
    return FINDING_TYPE_CONFIG[type as keyof typeof FINDING_TYPE_CONFIG] || FINDING_TYPE_CONFIG.comment;
  };

  const getFindingStatusConfig = (status: string) => {
    return FINDING_STATUS_CONFIG[status as keyof typeof FINDING_STATUS_CONFIG] || FINDING_STATUS_CONFIG.open;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Auditoria</h1>
            <p className="text-gray-500 text-sm">
              {plan?.title || 'Detalhes do relatório'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Baixar PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
        {report.status === 'rejected' && report.rejectionReason && (
          <span className="text-sm text-gray-600">
            Motivo: {report.rejectionReason}
          </span>
        )}
        <div className="ml-auto text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {report.createdBy || 'Não informado'}
          </span>
          <span className="flex items-center gap-1 ml-3">
            <Calendar className="w-4 h-4" />
            {new Date(report.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Resumo Executivo</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{report.summary}</p>
      </div>

      {/* Conclusion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Conclusão</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{report.conclusion}</p>
      </div>

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recomendações</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {report.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Findings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-500" />
            Não Conformidades e Achados ({findings.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {findings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p>Nenhuma não conformidade registrada</p>
            </div>
          ) : (
            findings.map((finding) => {
              const typeConfig = getFindingTypeConfig(finding.type);
              const statusConfig = getFindingStatusConfig(finding.status);
              return (
                <div key={finding._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`flex-1 min-w-0`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-gray-500">{finding.clause}</span>
                        <span className="text-xs text-gray-500">• {finding.area}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 mt-1">{finding.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                      {finding.evidenceIds && finding.evidenceIds.length > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          📎 {finding.evidenceIds.length} evidência(s) anexada(s)
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/rep/audit/findings/${finding._id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Actions */}
      {report.status === 'draft' && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          {isRep && (
            <button
              type="button"
              onClick={() => navigate(`/rep/audit/reports/${report._id}/edit`)}
              className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          )}
          {isRep && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar para Revisão
            </button>
          )}
        </div>
      )}

      {report.status === 'pending_review' && (isRep || isAdmin) && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Rejeitar
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Aprovar
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeitar Relatório</h3>
            <p className="text-sm text-gray-600 mb-4">
              Informe o motivo da rejeição para que o auditor possa corrigir o relatório.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Descreva o motivo da rejeição..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectReason.trim() || isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}