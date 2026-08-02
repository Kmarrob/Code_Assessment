import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useGovernanceDocument, useCreateGovernanceDocument, useUpdateGovernanceDocument } from '../../hooks/useGovernance';
import { Policy, CreatePolicyDTO, UpdateGovernanceDocumentDTO } from '../../types/governance.types';

const levelLabels = {
  1: 'Política',
  2: 'Norma',
  3: 'Procedimento',
  4: 'Instrução de Trabalho',
  5: 'Registro',
};

export default function AdminPolicyEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';

  const { data: existingDoc, isLoading: isLoadingDoc } = useGovernanceDocument(id || '');
  const createMutation = useCreateGovernanceDocument();
  const updateMutation = useUpdateGovernanceDocument();

  const [formData, setFormData] = useState<Partial<CreatePolicyDTO>>({
    code: '',
    title: '',
    category: '',
    content: '',
    summary: '',
    keywords: [],
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    scope: 'all',
    strategicObjective: '',
    responsible: '',
    frameworks: {
      iso27001: [],
      nist: [],
      cobit: [],
      pciDss: [],
      lgpd: [],
      bacen: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingDoc && isEditing) {
      const doc = existingDoc as Policy;
      setFormData({
        code: doc.code,
        title: doc.title,
        category: doc.category,
        content: doc.content,
        summary: doc.summary,
        keywords: doc.keywords || [],
        effectiveDate: new Date(doc.effectiveDate).toISOString().split('T')[0],
        reviewDate: new Date(doc.reviewDate).toISOString().split('T')[0],
        scope: doc.scope || 'all',
        strategicObjective: doc.strategicObjective || '',
        responsible: doc.responsible || '',
        frameworks: doc.frameworks || {},
      });
    }
  }, [existingDoc, isEditing]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !formData.keywords?.includes(keyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keyword.trim()],
      }));
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((k) => k !== keyword),
    }));
  };

  const handleFrameworkAdd = (framework: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      frameworks: {
        ...prev.frameworks,
        [framework]: [...(prev.frameworks?.[framework as keyof typeof prev.frameworks] || []), value],
      },
    }));
  };

  const handleFrameworkRemove = (framework: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      frameworks: {
        ...prev.frameworks,
        [framework]: (prev.frameworks?.[framework as keyof typeof prev.frameworks] || []).filter((v) => v !== value),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data: CreatePolicyDTO = {
        code: formData.code!,
        title: formData.title!,
        level: 1,
        category: formData.category!,
        content: formData.content!,
        summary: formData.summary!,
        keywords: formData.keywords || [],
        effectiveDate: new Date(formData.effectiveDate!),
        reviewDate: new Date(formData.reviewDate!),
        frameworks: formData.frameworks || {},
        scope: formData.scope as any || 'all',
        strategicObjective: formData.strategicObjective!,
        responsible: formData.responsible!,
      };

      if (isEditing && id) {
        const updateData: UpdateGovernanceDocumentDTO = {
          title: data.title,
          content: data.content,
          summary: data.summary,
          keywords: data.keywords,
          effectiveDate: data.effectiveDate,
          reviewDate: data.reviewDate,
          frameworks: data.frameworks,
          version: formData.version,
          versionChanges: formData.versionChanges,
        };
        await updateMutation.mutateAsync({ id, data: updateData });
      } else {
        await createMutation.mutateAsync(data);
      }

      navigate('/admin/governance');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoc && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/governance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Política' : 'Nova Política'}
          </h1>
          <p className="text-gray-500 text-sm">Nível 1 - Documento Estratégico</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Erro ao salvar</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="Ex: POL-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Política de Segurança da Informação"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Ex: Estratégia, Acessos, Riscos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escopo</label>
              <select
                value={formData.scope}
                onChange={(e) => handleChange('scope', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="all">Toda a Empresa</option>
                <option value="it">Tecnologia da Informação</option>
                <option value="security">Segurança da Informação</option>
                <option value="privacy">Privacidade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Resumo executivo do documento..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (Markdown/HTML)</label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="# Título do Documento

## 1. OBJETIVO
...
"
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Frameworks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frameworks de Referência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISO 27001</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.frameworks?.iso27001 || []).map((f) => (
                  <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {f}
                    <button
                      type="button"
                      onClick={() => handleFrameworkRemove('iso27001', f)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ex: A.5.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFrameworkAdd('iso27001', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIST</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.frameworks?.nist || []).map((f) => (
                  <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {f}
                    <button
                      type="button"
                      onClick={() => handleFrameworkRemove('nist', f)}
                      className="hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ex: ID.AM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFrameworkAdd('nist', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGPD</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.frameworks?.lgpd || []).map((f) => (
                  <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {f}
                    <button
                      type="button"
                      onClick={() => handleFrameworkRemove('lgpd', f)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ex: Art. 6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFrameworkAdd('lgpd', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Efetivação</label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange('effectiveDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Revisão</label>
              <input
                type="date"
                value={formData.reviewDate}
                onChange={(e) => handleChange('reviewDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <input
                type="text"
                value={formData.responsible}
                onChange={(e) => handleChange('responsible', e.target.value)}
                placeholder="Ex: Diretoria, Comitê de Segurança"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Estratégico</label>
            <input
              type="text"
              value={formData.strategicObjective}
              onChange={(e) => handleChange('strategicObjective', e.target.value)}
              placeholder="Ex: Garantir a proteção das informações da empresa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Palavras-chave</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {(formData.keywords || []).map((k) => (
              <span key={k} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {k}
                <button
                  type="button"
                  onClick={() => handleKeywordRemove(k)}
                  className="hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Digite uma palavra-chave e pressione Enter"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleKeywordAdd((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/governance')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Atualizar' : 'Criar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}