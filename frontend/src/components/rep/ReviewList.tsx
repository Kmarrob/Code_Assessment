// frontend/src/components/rep/ReviewList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { IReviewRequest } from '../../types/review.js';
import { reviewService } from '../../services/review.service.js';

interface ReviewListProps {
  companyId: string;
  userId?: string; // Se fornecido, filtra por usuário específico
  onReviewStatusChange?: () => void;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_BADGES = {
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' },
};

const STATUS_ICONS = {
  pending: <Clock className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
};

export const ReviewList: React.FC<ReviewListProps> = ({
  companyId,
  userId,
  onReviewStatusChange,
}) => {
  const [reviews, setReviews] = useState<IReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const limit = 10;

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (userId) {
        response = await reviewService.getReviewRequestsByUser(userId, page, limit);
      } else {
        response = await reviewService.getReviewRequests(
          page,
          limit,
          statusFilter !== 'all' ? statusFilter : undefined
        );
      }

      setReviews(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, statusFilter, userId]);

  const handleStatusUpdate = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setUpdatingStatus(reviewId);
      await reviewService.updateReviewStatus({
        reviewId,
        status: newStatus,
        companyId,
      });
      await loadReviews();
      if (onReviewStatusChange) {
        onReviewStatusChange();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return;

    try {
      await reviewService.deleteReviewRequest(reviewId);
      await loadReviews();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir solicitação');
    }
  };

  const toggleExpand = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_BADGES[status as keyof typeof STATUS_BADGES];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {STATUS_ICONS[status as keyof typeof STATUS_ICONS]}
        {config.label}
      </span>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          Total: {total} solicitação(ões)
        </span>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Lista de revisões */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Nenhuma solicitação encontrada</p>
          <p className="text-sm">As solicitações de revisão aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cabeçalho do card */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleExpand(review._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {review.control?.name || 'Controle não identificado'}
                    </span>
                    {getStatusBadge(review.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>
                      Usuário: {review.user?.name || 'N/A'}
                    </span>
                    <span>
                      Preposto: {review.rep?.name || 'N/A'}
                    </span>
                    <span>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(review._id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {review.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(review._id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conteúdo expandido */}
              {expandedReview === review._id && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Justificativa */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Justificativa</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {review.justification}
                    </p>
                  </div>

                  {/* Anexos */}
                  {review.attachments && review.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Anexos</h4>
                      <div className="space-y-1">
                        {review.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={`/api/review/attachment/${review._id}/${attachment.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="w-4 h-4" />
                            {attachment.originalName}
                            <span className="text-xs text-gray-400">
                              ({(attachment.size / 1024).toFixed(1)} KB)
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resposta original */}
                  {review.response && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Resposta Original</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Nível:</span>{' '}
                          {review.response.maturityLevel !== undefined ? review.response.maturityLevel : 'Não informado'}
                        </p>
                        {review.response.scenario && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Cenário:</span> {review.response.scenario}
                          </p>
                        )}
                        {review.response.observations && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Observações:</span> {review.response.observations}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  {review.status === 'pending' && (
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleStatusUpdate(review._id, 'rejected')}
                        disabled={updatingStatus === review._id}
                        className="px-4 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {updatingStatus === review._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Rejeitar'
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(review._id, 'approved')}
                        disabled={updatingStatus === review._id}
                        className="px-4 py-1.5 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        {updatingStatus === review._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Aprovar'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};