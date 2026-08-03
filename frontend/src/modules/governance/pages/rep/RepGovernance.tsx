import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  File,
  BookOpen,
  ClipboardList,
  ListChecks,
  FileCheck,
} from 'lucide-react';
import { governanceService } from '../../services/governance.service';
import { GovernanceDocument, DocumentLevel, DocumentStatus } from '../../types/governance.types';

const levelLabels: Record<DocumentLevel, string> = {
  1: 'Política',
  2: 'Norma',
  3: 'Procedimento',
  4: 'Instrução de Trabalho',
  5: 'Registro',
};

const levelIcons: Record<DocumentLevel, React.ReactNode> = {
  1: <BookOpen className="w-5 h-5 text-blue-600" />,
  2: <ClipboardList className="w-5 h-5 text-indigo-600" />,
  3: <ListChecks className="w-5 h-5 text-purple-600" />,
  4: <FileCheck className="w-5 h-5 text-teal-600" />,
  5: <File className="w-5 h-5 text-gray-600" />,
};

const levelColors: Record<DocumentLevel, string> = {
  1: 'border-blue-500 bg-blue-50',
  2: 'border-indigo-500 bg-indigo-50',
  3: 'border-purple-500 bg-purple-50',
  4: 'border-teal-500 bg-teal-50',
  5: 'border-gray-500 bg-gray-50',
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

export default function RepGovernance() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<DocumentLevel | 'all'>('all');
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  // Buscar documentos
  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const filters: any = {};
        if (searchTerm) filters.search = searchTerm;
        if (selectedLevel !== 'all') filters.level = selectedLevel;
        
        const data = await governanceService.repListDocuments(filters);
        
        // 🔧 LOG DE DIAGNÓSTICO - Estrutura completa dos documentos
        console.log('📋 TOTAL DE DOCUMENTOS:', data?.length || 0);
        console.log('📋 DOCUMENTOS RECEBIDOS (JSON):', JSON.stringify(data, null, 2));
        
        if (data && data.length > 0) {
          console.log('📋 PRIMEIRO DOCUMENTO:', data[0]);
          console.log('📋 CAMPOS DO PRIMEIRO:', Object.keys(data[0] || {}));
          console.log('📋 VALORES IMPORTANTES:', {
            _id: (data[0] as any)._id,
            id: (data[0] as any).id,
            code: data[0].code,
            title: data[0].title,
            level: data[0].level,
            status: data[0].status,
          });
        }
        
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [searchTerm, selectedLevel]);

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

  const handleDownload = async (doc: GovernanceDocument, format: 'doc' | 'pdf') => {
    // TODO: Implementar download
    console.log(`📥 Download ${format} para ${doc.code} - ${doc.title}`);
    alert(`Download ${format} para ${doc.code} - ${doc.title}`);
  };

  // 🔧 FUNÇÃO PARA OBTER O IDENTIFICADOR ÚNICO DO DOCUMENTO
  // Prioridade: _id > id > code > fallback usando índice + código
  const getDocumentIdentifier = (doc: GovernanceDocument, index: number): string => {
    // Tenta obter o identificador de várias fontes
    const identifier = 
      (doc as any)._id || 
      (doc as any).id || 
      doc.code || 
      `doc-${index}-${Date.now()}`;

    console.log('🔎 IDENTIFICADOR ENCONTRADO:', {
      identifier,
      _id: (doc as any)._id,
      id: (doc as any).id,
      code: doc.code,
      title: doc.title,
      level: doc.level,
      index,
    });

    return identifier;
  };

  // Estatísticas
  const totalDocs = documents.length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const pendingDocs = documents.filter(d => d.status !== 'approved' && d.status !== 'archived').length;

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
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Governança</h1>
          <p className="text-gray-500 mt-1">
            Consulte políticas, normas, procedimentos e instruções da empresa
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total de Documentos</p>
          <p className="text-2xl font-bold text-gray-900">{totalDocs}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Aprovados</p>
          <p className="text-2xl font-bold text-green-600">{approvedDocs}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Em Revisão</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingDocs}</p>
        </div>
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
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum documento encontrado</h3>
            <p className="text-gray-400 mt-2">Não há documentos disponíveis no momento</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc, index) => {
              // 🔧 OBTÉM O IDENTIFICADOR COM O ÍNDICE COMO FALLBACK
              const docId = getDocumentIdentifier(doc, index);
              
              // 🔧 LOG DE DIAGNÓSTICO PARA CADA DOCUMENTO
              console.log(`📄 DOCUMENTO [${docId}]:`, {
                code: doc.code,
                _id: (doc as any)._id,
                id: (doc as any).id,
                title: doc.title,
                level: doc.level,
                status: doc.status,
                version: doc.version,
                index,
              });

              return (
                <div key={docId} className="hover:bg-gray-50 transition-colors">
                  {/* Document Row */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(docId)}>
                      <div className={`p-2 rounded-lg border-2 ${levelColors[doc.level]}`}>
                        {levelIcons[doc.level]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-gray-600">{doc.code}</span>
                          <span className="text-sm font-medium text-gray-900 truncate">{doc.title}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span>{levelLabels[doc.level]}</span>
                          <span>•</span>
                          <span>Versão {doc.version}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>
                            {statusLabels[doc.status]}
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
                      {/* 🔧 CORREÇÃO: Usar getDocumentIdentifier com índice no botão de navegação */}
                      <button
                        onClick={() => {
                          const identifier = getDocumentIdentifier(doc, index);
                          if (!identifier) {
                            console.error('❌ DOCUMENTO INVÁLIDO - SEM IDENTIFICADOR:', doc);
                            alert('Erro: Documento sem identificador. Verifique o console para mais detalhes.');
                            return;
                          }
                          console.log(`✅ NAVEGANDO PARA: /rep/governance/document/${identifier}`);
                          navigate(`/rep/governance/document/${identifier}`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc, 'pdf')}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Baixar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc, 'doc')}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Baixar DOC"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
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
                          <p className="text-sm text-gray-600">{doc.summary}</p>
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
                        {doc.attachments.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{doc.attachments.length} anexo(s)</span>
                          </>
                        )}
                        {doc.versionHistory.length > 1 && (
                          <>
                            <span>•</span>
                            <span>{doc.versionHistory.length} versões</span>
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