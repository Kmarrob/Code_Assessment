import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { useFindings, useFindingStats, useDeleteFinding } from '../../hooks/useAudit';
import { AuditFinding, AuditFindingStatus, AuditFindingType } from '../../types/audit.types';

const STATUS_OPTIONS: { value: AuditFindingStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
  { value: 'open', label: 'Aberta', color: 'bg-red-100 text-red-700' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'pending_validation', label: 'Aguardando Validação', color: 'bg-blue-100 text-blue-700' },
  { value: 'closed', label: 'Fechada', color: 'bg-green-100 text-green-700' },
  { value: 'reopened', label: 'Reaberta', color: 'bg-orange-100 text-orange-700' },
];

const TYPE_OPTIONS: { value: AuditFindingType | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
  { value: 'nc_a', label: 'NC A - Maior', color: 'bg-red-100 text-red-700' },
  { value: 'nc_b', label: 'NC B - Menor', color: 'bg-orange-100 text-orange-700' },
  { value: 'comment', label: 'Comentário', color: 'bg-blue-100 text-blue-700' },
  { value: 'opportunity', label: 'Oportunidade', color: 'bg-green-100 text-green-700' },
  { value: 'positive', label: 'Boas Práticas', color: 'bg-purple-100 text-purple-700' },
];

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending_validation: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
  reopened: 'bg-orange-100 text-orange-700',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberta',
  in_progress: 'Em Andamento',
  pending_validation: 'Aguardando Validação',
  closed: 'Fechada',
  reopened: 'Reaberta',
};

const TYPE_LABELS: Record<string, string> = {
  nc_a: 'NC A - Maior',
  nc_b: 'NC B - Menor',
  comment: 'Comentário',
  opportunity: 'Oportunidade de Melhoria',
  positive: 'Boas Práticas',
};

export function RepAuditFindings() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AuditFindingType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AuditFindingStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: findings = [], isLoading, error, refetch } = useFindings(planId || '', {
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: stats, isLoading: isLoadingStats } = useFindingStats(planId || '');
  const deleteMutation = useDeleteFinding();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setShowDeleteConfirm(null);
    refetch();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredFindings = findings.filter((finding: AuditFinding) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        finding.title.toLowerCase().includes(search) ||
        finding.description.toLowerCase().includes(search) ||
        finding.clause.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (isLoading || isLoadingStats) {
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
        <h3 className="text-lg font-semibold text-red-800">Erro ao carregar não conformidades</h3>
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
            onClick={() => navigate(`/rep/audit/execution/${planId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Não Conformidades</h1>
            <p className="text-gray-500 mt-1">
              {findings.length} registro(s) encontrado(s)
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/rep/audit/findings/new/${planId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Registrar NC
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            <p className="text-xs text-gray-500">Abertas</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.ncA}</p>
            <p className="text-xs text-gray-500">NC A</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.ncB}</p>
            <p className="text-xs text-gray-500">NC B</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
            <p className="text-xs text-gray-500">Fechadas</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou cláusula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AuditFindingType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuditFindingStatus | 'all')}
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

      {/* Findings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum registro encontrado</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece registrando uma não conformidade'}
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={() => navigate(`/rep/audit/findings/new/${planId}`)}
                className="mt-4 text-red-600 hover:text-red-800"
              >
                Registrar primeira NC →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFindings.map((finding: AuditFinding) => (
              <div key={finding._id} className="hover:bg-gray-50 transition-colors">
                {/* Finding Row */}
                <div className="flex items-start justify-between px-6 py-4">
                  <div
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => toggleExpand(finding._id)}
                  >
                    <div className={`mt-1 p-2 rounded-lg ${
                      finding.type === 'nc_a' ? 'bg-red-50' :
                      finding.type === 'nc_b' ? 'bg-orange-50' :
                      finding.type === 'opportunity' ? 'bg-green-50' :
                      finding.type === 'positive' ? 'bg-purple-50' :
                      'bg-blue-50'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        finding.type === 'nc_a' ? 'text-red-600' :
                        finding.type === 'nc_b' ? 'text-orange-600' :
                        finding.type === 'opportunity' ? 'text-green-600' :
                        finding.type === 'positive' ? 'text-purple-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-gray-900 truncate">{finding.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[finding.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[finding.status] || finding.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          finding.type === 'nc_a' ? 'bg-red-100 text-red-700' :
                          finding.type === 'nc_b' ? 'bg-orange-100 text-orange-700' :
                          finding.type === 'opportunity' ? 'bg-green-100 text-green-700' :
                          finding.type === 'positive' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {TYPE_LABELS[finding.type] || finding.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>Cláusula: {finding.clause}</span>
                        <span>•</span>
                        <span>Área: {finding.area}</span>
                        {finding.evidenceIds && finding.evidenceIds.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">📎 {finding.evidenceIds.length} evidência(s)</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(finding.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/rep/audit/findings/${finding._id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {finding.status === 'open' || finding.status === 'in_progress' && (
                      <button
                        onClick={() => navigate(`/rep/audit/findings/${finding._id}/edit`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {(finding.status === 'open' || finding.status === 'in_progress') && (
                      <button
                        onClick={() => setShowDeleteConfirm(finding._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(finding._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      {expandedId === finding._id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === finding._id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Descrição</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{finding.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span><strong>Criado por:</strong> {finding.createdBy || 'Não informado'}</span>
                        {finding.validatedBy && (
                          <span><strong>Validado por:</strong> {finding.validatedBy}</span>
                        )}
                        {finding.validatedAt && (
                          <span><strong>Validação:</strong> {new Date(finding.validatedAt).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                      {finding.status === 'closed' && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          NC fechada em {new Date(finding.validatedAt!).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir esta não conformidade? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}