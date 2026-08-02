import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, AlertCircle } from 'lucide-react';
import { useGovernanceDocument, useCreateGovernanceDocument, useUpdateGovernanceDocument } from '../../hooks/useGovernance';
import { Standard, CreateStandardDTO, UpdateGovernanceDocumentDTO } from '../../types/governance.types';

export default function AdminStandardEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';

  const { data: existingDoc, isLoading: isLoadingDoc } = useGovernanceDocument(id || '');
  const createMutation = useCreateGovernanceDocument();
  const updateMutation = useUpdateGovernanceDocument();

  const [formData, setFormData] = useState<Partial<CreateStandardDTO>>({
    code: '',
    title: '',
    category: '',
    content: '',
    summary: '',
    keywords: [],
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    policyId: '',
    mandatory: true,
    nonCompliancePenalty: '',
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
      const doc = existingDoc as Standard;
      setFormData({
        code: doc.code,
        title: doc.title,
        category: doc.category,
        content: doc.content,
        summary: doc.summary,
        keywords: doc.keywords || [],
        effectiveDate: new Date(doc.effectiveDate).toISOString().split('T')[0],
        reviewDate: new Date(doc.reviewDate).toISOString().split('T')[0],
        policyId: doc.policyId || '',
        mandatory: doc.mandatory !== undefined ? doc.mandatory : true,
        nonCompliancePenalty: doc.nonCompliancePenalty || '',
        frameworks: doc.frameworks || {},
      });
    }
  }, [existingDoc, isEditing]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data: CreateStandardDTO = {
        code: formData.code!,
        title: formData.title!,
        level: 2,
        category: formData.category!,
        content: formData.content!,
        summary: formData.summary!,
        keywords: formData.keywords || [],
        effectiveDate: new Date(formData.effectiveDate!),
        reviewDate: new Date(formData.reviewDate!),
        frameworks: formData.frameworks || {},
        policyId: formData.policyId!,
        mandatory: formData.mandatory !== undefined ? formData.mandatory : true,
        nonCompliancePenalty: formData.nonCompliancePenalty || '',
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
            {isEditing ? 'Editar Norma' : 'Nova Norma'}
          </h1>
          <p className="text-gray-500 text-sm">Nível 2 - Documento Tático</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
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
                placeholder="Ex: NOR-001"
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
                placeholder="Ex: Norma de Senhas"
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
                placeholder="Ex: Senhas, Acessos, Segurança"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Política Referenciada</label>
              <input
                type="text"
                value={formData.policyId}
                onChange={(e) => handleChange('policyId', e.target.value)}
                placeholder="ID da Política (ex: 67a1b2c3d4e5f67890123456)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
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
                placeholder="# Título do Documento..."
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Obrigatória</label>
              <select
                value={formData.mandatory ? 'true' : 'false'}
                onChange={(e) => handleChange('mandatory', e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penalidade por Não Conformidade</label>
              <input
                type="text"
                value={formData.nonCompliancePenalty || ''}
                onChange={(e) => handleChange('nonCompliancePenalty', e.target.value)}
                placeholder="Ex: Advertência por escrito"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Palavras-chave</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {(formData.keywords || []).map((k) => (
              <span key={k} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {k}
                <button type="button" onClick={() => handleChange('keywords', (formData.keywords || []).filter((kw) => kw !== k))}>
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
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  handleChange('keywords', [...(formData.keywords || []), input.value.trim()]);
                  input.value = '';
                }
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