import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  FileText,
  Search,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAudit } from '../../hooks/useAudit';
import { toast } from 'react-hot-toast';

interface DocumentReviewItem {
  clause: string;
  requirement: string;
  status: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel' | 'pendente';
  observations: string;
  evidenceIds: string[];
}

interface DocumentReview {
  _id: string;
  companyId: string;
  auditPlanId: string;
  documents: DocumentReviewItem[];
  summary: {
    total: number;
    conforme: number;
    naoConforme: number;
    parcial: number;
    naoAplicavel: number;
    pendente: number;
  };
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export function RepAuditDocumentReview() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<{ clause: string; observations: string } | null>(null);

  // Hooks do React Query
  const {
    useDocumentReviewByPlan,
    useUpdateDocumentReview,
    useCompleteDocumentReview,
  } = useAudit();

  // Buscar revisão documental do plano
  const {
    data: reviewData,
    isLoading,
    error,
    refetch,
  } = useDocumentReviewByPlan(planId || '');

  // Mutations
  const updateDocumentMutation = useUpdateDocumentReview();
  const completeDocumentReviewMutation = useCompleteDocumentReview();

  const review = reviewData?.data;

  // Estado local para documentos
  const [documents, setDocuments] = useState<DocumentReviewItem[]>([]);

  useEffect(() => {
    if (review?.documents) {
      setDocuments(review.documents);
    }
  }, [review]);

  // Handler para atualizar status de um documento
  const handleUpdateStatus = async (clause: string, status: DocumentReviewItem['status']) => {
    try {
      await updateDocumentMutation.mutateAsync({
        reviewId: review?._id || '',
        clause,
        data: { status },
      });
      toast.success('Status do documento atualizado!');
      await refetch();
    } catch (err) {
      toast.error('Erro ao atualizar status');
      console.error(err);
    }
  };

  // Handler para atualizar observações
  const handleUpdateObservations = async (clause: string, observations: string) => {
    try {
      await updateDocumentMutation.mutateAsync({
        reviewId: review?._id || '',
        clause,
        data: { observations },
      });
      toast.success('Observações salvas!');
      setEditingItem(null);
      await refetch();
    } catch (err) {
      toast.error('Erro ao salvar observações');
      console.error(err);
    }
  };

  // Handler para concluir revisão
  const handleCompleteReview = async () => {
    if (!review) return;
    try {
      await completeDocumentReviewMutation.mutateAsync(review._id);
      toast.success('Revisão documental concluída!');
      await refetch();
    } catch (err) {
      toast.error('Erro ao concluir revisão');
      console.error(err);
    }
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.requirement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Estatísticas
  const stats = review?.summary || {
    total: 0,
    conforme: 0,
    naoConforme: 0,
    parcial: 0,
    naoAplicavel: 0,
    pendente: 0,
  };

  // Badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conforme':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"><CheckCircle className="w-3 h-3" /> Conforme</span>;
      case 'nao_conforme':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"><XCircle className="w-3 h-3" /> Não Conforme</span>;
      case 'parcial':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"><MinusCircle className="w-3 h-3" /> Parcial</span>;
      case 'nao_aplicavel':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"><MinusCircle className="w-3 h-3" /> Não Aplicável</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">Pendente</span>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando revisão documental...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar revisão documental
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          {(error as Error).message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Empty state
  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma revisão documental encontrada
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          Não há revisão documental para este plano de auditoria.
        </p>
        <button
          onClick={() => navigate(`/rep/audit/execution/${planId}`)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Voltar para execução
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/rep/audit/execution/${planId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Revisão Documental
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(review.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          {review.status === 'in_progress' && (
            <button
              onClick={handleCompleteReview}
              disabled={completeDocumentReviewMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
            >
              {completeDocumentReviewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Concluir Revisão
            </button>
          )}
          {review.status === 'completed' && (
            <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              Revisão Concluída
            </span>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Conformes</p>
          <p className="text-xl font-bold text-green-600">{stats.conforme}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Não Conformes</p>
          <p className="text-xl font-bold text-red-600">{stats.naoConforme}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Parciais</p>
          <p className="text-xl font-bold text-yellow-600">{stats.parcial}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Pendentes</p>
          <p className="text-xl font-bold text-gray-600">{stats.pendente}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cláusula ou requisito..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="conforme">Conforme</option>
          <option value="nao_conforme">Não Conforme</option>
          <option value="parcial">Parcial</option>
          <option value="nao_aplicavel">Não Aplicável</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      {/* Lista de Documentos */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum documento encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.clause}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                doc.status === 'nao_conforme' ? 'border-red-200' :
                doc.status === 'conforme' ? 'border-green-200' :
                doc.status === 'parcial' ? 'border-yellow-200' :
                'border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-indigo-600">
                      {doc.clause}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {doc.requirement}
                    </span>
                  </div>
                  {doc.observations && (
                    <p className="text-sm text-gray-600 mt-1">
                      {doc.observations}
                    </p>
                  )}
                  {doc.evidenceIds && doc.evidenceIds.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                      <Eye className="w-3 h-3" />
                      <span>{doc.evidenceIds.length} evidência(s) vinculada(s)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {review.status === 'in_progress' && (
                    <select
                      value={doc.status || 'pendente'}
                      onChange={(e) => handleUpdateStatus(doc.clause, e.target.value as DocumentReviewItem['status'])}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="conforme">Conforme</option>
                      <option value="nao_conforme">Não Conforme</option>
                      <option value="parcial">Parcial</option>
                      <option value="nao_aplicavel">Não Aplicável</option>
                    </select>
                  )}
                  {getStatusBadge(doc.status || 'pendente')}
                  {review.status === 'in_progress' && (
                    <button
                      onClick={() => setEditingItem({ clause: doc.clause, observations: doc.observations || '' })}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                      title="Adicionar observação"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal de Observações (inline) */}
              {editingItem && editingItem.clause === doc.clause && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <textarea
                      value={editingItem.observations}
                      onChange={(e) => setEditingItem({ ...editingItem, observations: e.target.value })}
                      placeholder="Adicione observações sobre este documento..."
                      rows={2}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleUpdateObservations(doc.clause, editingItem.observations)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Informações adicionais */}
      <div className="mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>
          Total de documentos: {stats.total} • 
          Conformes: {stats.conforme} • 
          Não Conformes: {stats.naoConforme} • 
          Pendentes: {stats.pendente}
        </p>
      </div>
    </div>
  );
}