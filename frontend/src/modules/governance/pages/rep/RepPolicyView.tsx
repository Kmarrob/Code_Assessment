import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { governanceService } from '../../services/governance.service';
import { useGovernanceViewDocument } from '../../hooks/useGovernance';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { GovernanceDocument } from '../../types/governance.types';
import api from '../../../../services/api';

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
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  // Determinar se o usuário é Admin ou Rep
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  // Usar o hook de visualização com substituição
  const { data: document, isLoading, error } = useGovernanceViewDocument(id || '', isAdmin);

  // Buscar o nome da empresa para substituir o placeholder
  useEffect(() => {
    const fetchCompanyName = async () => {
      setIsLoadingCompany(true);
      try {
        // Se for ADMIN, não tem empresa associada, usar fallback
        if (isAdmin) {
          console.log('🏢 [RepPolicyView] ADMIN - usando fallback');
          setCompanyName('Empresa');
          return;
        }

        const companyId = (user as any)?.companyId;
        console.log('🏢 [RepPolicyView] companyId:', companyId);

        if (!companyId) {
          console.log('🏢 [RepPolicyView] Sem companyId - usando fallback');
          setCompanyName('Empresa');
          return;
        }

        // 🆕 USAR ROTA QUE O REP TEM ACESSO (não admin)
        // Buscar dados da empresa via rota /api/rep/company/:id
        try {
          const response = await api.get(`/rep/company/${companyId}`);
          console.log('🏢 [RepPolicyView] Resposta da API:', response.data);
          
          if (response.data?.name) {
            setCompanyName(response.data.name);
          } else {
            setCompanyName('Empresa');
          }
        } catch (apiError) {
          console.warn('🏢 [RepPolicyView] Erro na API rep, tentando fallback com dados do user');
          // Fallback: usar o nome da empresa do próprio usuário se disponível
          const userCompanyName = (user as any)?.companyName || (user as any)?.company?.name;
          if (userCompanyName) {
            setCompanyName(userCompanyName);
          } else {
            setCompanyName('Empresa');
          }
        }
      } catch (error) {
        console.error('🏢 [RepPolicyView] Erro ao buscar empresa:', error);
        setCompanyName('Empresa');
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompanyName();
  }, [user, isAdmin]);

  // 🆕 Função para substituir placeholders no conteúdo
  const replacePlaceholders = (content: string): string => {
    if (!content) return content;
    const companyNameToUse = companyName || 'Empresa';
    
    console.log('🔍 [RepPolicyView] Substituindo placeholders:');
    console.log('🔍 [RepPolicyView] companyNameToUse:', companyNameToUse);
    console.log('🔍 [RepPolicyView] Conteúdo original (primeiros 200 chars):', content.substring(0, 200));
    
    // Substituir TODAS as variações do placeholder
    const placeholders = [
      /<NOME DO CLIENTE>/g,
      /&lt;NOME DO CLIENTE&gt;/g,
      /\[NOME DO CLIENTE\]/g,
      /{{NOME_DO_CLIENTE}}/g,
      /NOME_DO_CLIENTE/g,
    ];

    let replaced = content;
    placeholders.forEach((regex) => {
      replaced = replaced.replace(regex, companyNameToUse);
    });
    
    console.log('🔍 [RepPolicyView] Conteúdo substituído (primeiros 200 chars):', replaced.substring(0, 200));
    
    return replaced;
  };

  // 🔧 CORREÇÃO: handleDownload ajustado para usar window.document explicitamente evitando conflito com a prop document
  const handleDownload = async (format: 'doc' | 'pdf') => {
    if (!document) return;
    
    // 🔧 CORREÇÃO: Obter o ID correto (_id ou id)
    const docId = (document as any)._id || document.id;
    if (!docId) {
      console.error('❌ Documento sem ID:', document);
      alert('Erro: Documento sem identificador');
      return;
    }
    
    setIsDownloading(true);
    try {
      let blob: Blob;
      
      // 🔧 CORREÇÃO: Chamar o serviço UMA ÚNICA VEZ e armazenar o blob
      if (isAdmin) {
        if (format === 'pdf') {
          blob = await governanceService.downloadDocumentPdf(docId);
        } else {
          blob = await governanceService.downloadDocumentDoc(docId);
        }
      } else {
        if (format === 'pdf') {
          blob = await governanceService.repDownloadDocumentPdf(docId);
        } else {
          blob = await governanceService.repDownloadDocumentDoc(docId);
        }
      }
      
      // 🆕 CORREÇÃO: Usar o objeto global window.document para manipular o DOM com segurança
      if (typeof window !== 'undefined' && window.document) {
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${document.code}_${document.title.replace(/\s+/g, '_')}.${format}`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        // Liberar a URL após o download
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // Fallback para ambiente não-navegador (SSR)
        console.warn('⚠️ Download não disponível neste ambiente');
      }
    } catch (err) {
      console.error('Erro no download:', err);
      alert('Erro ao baixar documento. Verifique o console para mais detalhes.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || isLoadingCompany) {
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

  // 🆕 Substituir placeholders no conteúdo antes de renderizar
  const contentWithPlaceholders = replacePlaceholders(document.content);

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

      {/* Content - com placeholders substituídos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: contentWithPlaceholders }} />
      </div>
    </div>
  );
}