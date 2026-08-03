import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { governanceService } from '../../services/governance.service';
import { useGovernanceViewDocument } from '../../hooks/useGovernance';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { GovernanceDocument } from '../../types/governance.types';

const levelLabels = {
  1: 'Política',
  2: 'Norma',
  3: 'Procedimento',
  4: 'Instrução de Trabalho',
  5: 'Registro',
};

export default function RepPolicyView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  // Determinar se o usuário é Admin ou Rep
  const isAdmin = user?.role === 'ADMIN';

  // Usar o hook de visualização com substituição
  const { data: document, isLoading, error } = useGovernanceViewDocument(id || '', isAdmin);

  const handleDownload = async (format: 'doc' | 'pdf') => {
    if (!document) return;
    setIsDownloading(true);
    try {
      if (isAdmin) {
        if (format === 'pdf') {
          await governanceService.downloadDocumentPdf(document.id);
        } else {
          await governanceService.downloadDocumentDoc(document.id);
        }
      } else {
        if (format === 'pdf') {
          await governanceService.repDownloadDocumentPdf(document.id);
        } else {
          await governanceService.repDownloadDocumentDoc(document.id);
        }
      }
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(await (format === 'pdf' 
        ? (isAdmin ? governanceService.downloadDocumentPdf(document.id) : governanceService.repDownloadDocumentPdf(document.id))
        : (isAdmin ? governanceService.downloadDocumentDoc(document.id) : governanceService.repDownloadDocumentDoc(document.id))
      ));
      link.download = `${document.code}_${document.title.replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Erro ao baixar documento');
      console.error('Erro no download:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800">Documento não encontrado</h3>
        <p className="text-red-600 mt-2">{error?.message || 'O documento solicitado não está disponível'}</p>
        <button
          onClick={() => navigate(isAdmin ? '/admin/governance' : '/rep/governance')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Voltar para biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(isAdmin ? '/admin/governance' : '/rep/governance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
            <span className="font-mono font-semibold">{document.code}</span>
            <span>•</span>
            <span>{levelLabels[document.level as keyof typeof levelLabels]}</span>
            <span>•</span>
            <span>Versão {document.version}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              document.status === 'approved' ? 'bg-green-100 text-green-600' :
              document.status === 'review' ? 'bg-yellow-100 text-yellow-600' :
              document.status === 'draft' ? 'bg-gray-100 text-gray-600' :
              'bg-red-100 text-red-600'
            }`}>
              {document.status === 'approved' ? 'Aprovado' :
               document.status === 'review' ? 'Em Revisão' :
               document.status === 'draft' ? 'Rascunho' : 'Arquivado'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Baixando...' : 'PDF'}
          </button>
          <button
            onClick={() => handleDownload('doc')}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {isDownloading ? 'Baixando...' : 'DOC'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Efetivação:</span>
            <span className="font-medium">{new Date(document.effectiveDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Revisão:</span>
            <span className="font-medium">{new Date(document.reviewDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Categoria:</span>
            <span className="font-medium">{document.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Palavras-chave:</span>
            <span className="font-medium">{document.keywords?.join(', ') || '-'}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Resumo</h2>
        <p className="text-gray-600">{document.summary}</p>
      </div>

      {/* Content - o conteúdo já vem com os placeholders substituídos pelo backend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: document.content }} />
      </div>
    </div>
  );
}