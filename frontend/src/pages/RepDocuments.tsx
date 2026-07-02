// frontend/src/pages/RepDocuments.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Search, Filter, X, Download, 
  Archive, RotateCcw, Trash2, Eye, Plus, Loader2,
  File, FilePdf, FileWord, FileSpreadsheet, FileImage,
  AlertCircle, CheckCircle, Clock, FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { documentService, CompanyDocument, DocumentCategory, DocumentStats } from '../services/document.service.js';
import { DocumentUploadModal } from '../components/rep/DocumentUploadModal.js';

export const RepDocuments: React.FC = () => {
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await documentService.getDocuments({
        page,
        limit,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar documentos:', err);
      setError('Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, categoryFilter, statusFilter, search]);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await documentService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDocuments();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadDocuments();
    loadStats();
  };

  const handleDownload = async (doc: CompanyDocument) => {
    try {
      const blob = await documentService.downloadDocument(doc._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
      alert('Erro ao baixar o documento');
    }
  };

  const handleArchive = async (doc: CompanyDocument) => {
    if (!confirm(`Deseja arquivar o documento "${doc.title}"?`)) return;
    try {
      await documentService.archiveDocument(doc._id);
      loadDocuments();
      loadStats();
    } catch (err) {
      console.error('Erro ao arquivar:', err);
      alert('Erro ao arquivar o documento');
    }
  };

  const handleRestore = async (doc: CompanyDocument) => {
    try {
      await documentService.restoreDocument(doc._id);
      loadDocuments();
      loadStats();
    } catch (err) {
      console.error('Erro ao restaurar:', err);
      alert('Erro ao restaurar o documento');
    }
  };

  const handleDelete = async (doc: CompanyDocument) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente "${doc.title}"?`)) return;
    try {
      await documentService.deleteDocument(doc._id);
      loadDocuments();
      loadStats();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir o documento');
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && documents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📄 Documentos da Empresa</h1>
            <p className="text-gray-600 mt-1">Gerencie políticas, procedimentos e evidências</p>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900">{stats?.total || 0}</p>
                  )}
                </div>
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          {stats?.byCategory.map((item) => (
            <Card key={item.category}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{documentService.getCategoryLabel(item.category as DocumentCategory)}</p>
                    <p className="text-xl font-bold text-gray-900">{item.count}</p>
                  </div>
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas categorias</option>
                <option value="policy">📋 Políticas</option>
                <option value="procedure">📄 Procedimentos</option>
                <option value="evidence">📎 Evidências</option>
                <option value="other">📁 Outros</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos status</option>
                <option value="active">✅ Ativos</option>
                <option value="archived">📦 Arquivados</option>
              </select>

              {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de documentos */}
        <Card>
          <CardContent className="p-0">
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={() => loadDocuments()}>Tentar novamente</Button>
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12 text-gray-400" />}
                title="Nenhum documento cadastrado"
                description="Comece adicionando documentos como políticas, procedimentos ou evidências."
                actionLabel="Adicionar documento"
                onAction={() => setShowUploadModal(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Documento</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Categoria</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Tamanho</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Enviado por</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {doc.mimeType.includes('pdf') ? (
                              <FilePdf className="h-5 w-5 text-red-500" />
                            ) : doc.mimeType.includes('word') ? (
                              <FileWord className="h-5 w-5 text-blue-500" />
                            ) : doc.mimeType.includes('excel') || doc.mimeType.includes('sheet') ? (
                              <FileSpreadsheet className="h-5 w-5 text-green-500" />
                            ) : doc.mimeType.includes('image') ? (
                              <FileImage className="h-5 w-5 text-purple-500" />
                            ) : (
                              <File className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-500">{doc.fileName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${documentService.getCategoryColor(doc.category)}`}>
                            {documentService.getCategoryLabel(doc.category)}
                          </span>
                          {doc.subcategory && (
                            <span className="text-xs text-gray-400 ml-1">({doc.subcategory})</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {documentService.formatFileSize(doc.fileSize)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {doc.status === 'active' ? '✅ Ativo' : '📦 Arquivado'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {doc.uploadedBy?.name || 'Desconhecido'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(doc)}
                              title="Baixar"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {doc.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                onClick={() => handleArchive(doc)}
                                title="Arquivar"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleRestore(doc)}
                                title="Restaurar"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(doc)}
                              title="Excluir permanentemente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de upload */}
      {showUploadModal && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default RepDocuments;