import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Check,
  X,
} from 'lucide-react';
import { useGovernanceDocuments, useDeleteGovernanceDocument, useApproveGovernanceDocument } from '../../hooks/useGovernance';
import { GovernanceDocument, DocumentLevel, DocumentStatus } from '../../types/governance.types';
import { useAuth } from '../../../../contexts/AuthContext.js';

const levelLabels: Record<DocumentLevel, string> = {
  1: 'Política',
  2: 'Norma',
  3: 'Procedimento',
  4: 'Instrução de Trabalho',
  5: 'Registro',
};

const statusColors: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-yellow-100 text-yellow-600',
  approved: 'bg-green-100 text-green-600',
  archived: 'bg-red-100 text-red-600',
};

const statusLabels: Record<DocumentStatus, string> = {
  draft: 'Rascunho',
  review: 'Em Revisão',
  approved: 'Aprovado',
  archived: 'Arquivado',
};

const levelColors: Record<DocumentLevel, string> = {
  1: 'border-blue-500 bg-blue-50',
  2: 'border-indigo-500 bg-indigo-50',
  3: 'border-purple-500 bg-purple-50',
  4: 'border-teal-500 bg-teal-50',
  5: 'border-gray-500 bg-gray-50',
};

export default function AdminGovernance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<DocumentLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // 🔧 CORREÇÃO: Verificar tanto 'ADMIN' quanto 'admin'
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  // Usar o hook com a função correta baseada no perfil
  const { data: documents = [], isLoading, error, refetch } = useGovernanceDocuments({
    search: searchTerm || undefined,
    level: selectedLevel !== 'all' ? selectedLevel : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    isAdmin,
  });

  const deleteMutation = useDeleteGovernanceDocument();
  const approveMutation = useApproveGovernanceDocument();

  const toggleExpand = (id: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o documento "${title}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // 🆕 FUNÇÃO DE APROVAÇÃO
  const handleApprove = async (id: string, title: string) => {
    if (window.confirm(`Aprovar o documento "${title}"?`)) {
      setApprovingId(id);
      try {
        await approveMutation.mutateAsync(id);
        // Recarregar a lista para atualizar o status
        await refetch();
      } catch (error) {
        console.error('Erro ao aprovar documento:', error);
        alert('Erro ao aprovar documento. Verifique o console.');
      } finally {
        setApprovingId(null);
      }
    }
  };

  const getLevelIcon = (level: DocumentLevel) => {
    switch (level) {
      case 1:
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 2:
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 3:
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 4:
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 5:
        return <FileText className="w-4 h-4 text-gray-600" />;
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
        <h3 className="text-lg font-semibold text-red-800">Erro ao carregar documentos</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Governança</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin 
              ? 'Gerencie políticas, normas, procedimentos e instruções' 
              : 'Visualize os documentos da biblioteca de governança'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate('/admin/governance/policy/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Política
            </button>
            <button
              onClick={() => navigate('/admin/governance/policy/new-v2')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Política (Estruturada)
            </button>
            <button
              onClick={() => navigate('/admin/governance/standard/new')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Norma
            </button>
            <button
              onClick={() => navigate('/admin/governance/procedure/new')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Procedimento
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código, título ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as DocumentLevel | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Todos os Níveis</option>
            <option value="1">Políticas</option>
            <option value="2">Normas</option>
            <option value="3">Procedimentos</option>
            <option value="4">Instruções de Trabalho</option>
            <option value="5">Registros</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="review">Em Revisão</option>
            <option value="approved">Aprovado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum documento encontrado</h3>
            <p className="text-gray-400 mt-2">
              {isAdmin 
                ? 'Comece criando uma nova política, norma ou procedimento'
                : 'Não há documentos disponíveis no momento'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => {
              // 🔧 CORREÇÃO: Obter o ID correto (prioridade para _id)
              const docId = (doc as any)._id || doc.id;
              // 🆕 CORREÇÃO v41.5: Mostrar botão também quando status não estiver definido
              const canApprove = doc.status === 'draft' || doc.status === 'review' || !doc.status;
              
              return (
                <div key={docId} className="hover:bg-gray-50 transition-colors">
                  {/* Document Row */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(docId)}>
                      <div className={`p-2 rounded-lg border-2 ${levelColors[doc.level]}`}>
                        {getLevelIcon(doc.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-gray-600">{doc.code}</span>
                          <span className="text-sm font-medium text-gray-900 truncate">{doc.title}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{levelLabels[doc.level]}</span>
                          <span>•</span>
                          <span>Versão {doc.version}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                            {statusLabels[doc.status] || 'Rascunho'}
                          </span>
                          {doc.status === 'approved' && doc.approvedBy && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                Aprovado
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          if (isAdmin) {
                            navigate(`/admin/governance/document/${docId}`);
                          } else {
                            navigate(`/rep/governance/document/${docId}`);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <>
                          {/* 🆕 BOTÃO APROVAR - Agora aparece também quando status não está definido */}
                          {canApprove && (
                            <button
                              onClick={() => handleApprove(docId, doc.title)}
                              disabled={approvingId === docId}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Aprovar documento"
                            >
                              {approvingId === docId ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (!docId) {
                                console.error('❌ Documento sem ID:', doc);
                                alert('Erro: Documento sem identificador');
                                return;
                              }
                              navigate(`/admin/governance/document/${docId}/edit`);
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(docId, doc.title)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleExpand(docId)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      >
                        {expandedDocs.has(docId) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedDocs.has(docId) && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Resumo</h4>
                          <p className="text-sm text-gray-600">{doc.summary || 'Sem resumo definido'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Frameworks</h4>
                          <div className="flex flex-wrap gap-2">
                            {doc.frameworks?.iso27001?.map((f) => (
                              <span key={f} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                ISO 27001: {f}
                              </span>
                            ))}
                            {doc.frameworks?.nist?.map((f) => (
                              <span key={f} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                NIST: {f}
                              </span>
                            ))}
                            {doc.frameworks?.lgpd?.map((f) => (
                              <span key={f} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                LGPD: {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span>Data de Efetivação: {new Date(doc.effectiveDate).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>Revisão: {new Date(doc.reviewDate).toLocaleDateString('pt-BR')}</span>
                        {doc.attachments && doc.attachments.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {doc.attachments.length} anexo(s)
                            </span>
                          </>
                        )}
                        {doc.versionHistory && doc.versionHistory.length > 1 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {doc.versionHistory.length} versões
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}