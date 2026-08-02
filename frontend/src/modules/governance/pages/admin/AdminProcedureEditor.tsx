import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useGovernanceDocument, useCreateGovernanceDocument, useUpdateGovernanceDocument } from '../../hooks/useGovernance';
import { Procedure, CreateProcedureDTO, UpdateGovernanceDocumentDTO, ProcedureStep } from '../../types/governance.types';

export default function AdminProcedureEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';

  const { data: existingDoc, isLoading: isLoadingDoc } = useGovernanceDocument(id || '');
  const createMutation = useCreateGovernanceDocument();
  const updateMutation = useUpdateGovernanceDocument();

  const [formData, setFormData] = useState<Partial<CreateProcedureDTO>>({
    code: '',
    title: '',
    category: '',
    content: '',
    summary: '',
    keywords: [],
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    standardId: '',
    steps: [],
    inputs: [],
    outputs: [],
    frameworks: {
      iso27001: [],
      nist: [],
      cobit: [],
      pciDss: [],
      lgpd: [],
      bacen: [],
    },
  });

  const [newStep, setNewStep] = useState<Partial<ProcedureStep>>({ order: 0, description: '', responsible: '', expectedTime: '' });
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingDoc && isEditing) {
      const doc = existingDoc as Procedure;
      setFormData({
        code: doc.code,
        title: doc.title,
        category: doc.category,
        content: doc.content,
        summary: doc.summary,
        keywords: doc.keywords || [],
        effectiveDate: new Date(doc.effectiveDate).toISOString().split('T')[0],
        reviewDate: new Date(doc.reviewDate).toISOString().split('T')[0],
        standardId: doc.standardId || '',
        steps: doc.steps || [],
        inputs: doc.inputs || [],
        outputs: doc.outputs || [],
        frameworks: doc.frameworks || {},
      });
    }
  }, [existingDoc, isEditing]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addStep = () => {
    if (newStep.description && newStep.responsible) {
      const step: ProcedureStep = {
        order: (formData.steps?.length || 0) + 1,
        description: newStep.description,
        responsible: newStep.responsible,
        expectedTime: newStep.expectedTime || '',
      };
      setFormData((prev) => ({
        ...prev,
        steps: [...(prev.steps || []), step],
      }));
      setNewStep({ order: 0, description: '', responsible: '', expectedTime: '' });
    }
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== index),
    }));
  };

  const addInput = () => {
    if (newInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        inputs: [...(prev.inputs || []), newInput.trim()],
      }));
      setNewInput('');
    }
  };

  const removeInput = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inputs: (prev.inputs || []).filter((_, i) => i !== index),
    }));
  };

  const addOutput = () => {
    if (newOutput.trim()) {
      setFormData((prev) => ({
        ...prev,
        outputs: [...(prev.outputs || []), newOutput.trim()],
      }));
      setNewOutput('');
    }
  };

  const removeOutput = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      outputs: (prev.outputs || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data: CreateProcedureDTO = {
        code: formData.code!,
        title: formData.title!,
        level: 3,
        category: formData.category!,
        content: formData.content!,
        summary: formData.summary!,
        keywords: formData.keywords || [],
        effectiveDate: new Date(formData.effectiveDate!),
        reviewDate: new Date(formData.reviewDate!),
        frameworks: formData.frameworks || {},
        standardId: formData.standardId!,
        steps: formData.steps || [],
        inputs: formData.inputs || [],
        outputs: formData.outputs || [],
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
            {isEditing ? 'Editar Procedimento' : 'Novo Procedimento'}
          </h1>
          <p className="text-gray-500 text-sm">Nível 3 - Documento Operacional</p>
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
                placeholder="Ex: PRC-001"
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
                placeholder="Ex: Concessão de Acesso"
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
                placeholder="Ex: Acessos, Incidentes, Mudanças"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Norma Referenciada</label>
              <input
                type="text"
                value={formData.standardId}
                onChange={(e) => handleChange('standardId', e.target.value)}
                placeholder="ID da Norma (ex: 67a1b2c3d4e5f67890123456)"
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
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Passos do Procedimento</h2>
          
          {/* Steps List */}
          <div className="space-y-2 mb-4">
            {(formData.steps || []).map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-mono text-sm font-semibold text-gray-600">#{step.order}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{step.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>Responsável: {step.responsible}</span>
                    {step.expectedTime && <span>Tempo: {step.expectedTime}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!formData.steps || formData.steps.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum passo adicionado</p>
            )}
          </div>

          {/* Add Step Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={newStep.description}
              onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
              placeholder="Descrição do passo"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newStep.responsible}
              onChange={(e) => setNewStep({ ...newStep, responsible: e.target.value })}
              placeholder="Responsável"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newStep.expectedTime}
              onChange={(e) => setNewStep({ ...newStep, expectedTime: e.target.value })}
              placeholder="Tempo esperado"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addStep}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Inputs & Outputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Entradas</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.inputs || []).map((input, index) => (
                  <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {input}
                    <button type="button" onClick={() => removeInput(index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value)}
                  placeholder="Digite uma entrada"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInput())}
                />
                <button
                  type="button"
                  onClick={addInput}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Saídas</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.outputs || []).map((output, index) => (
                  <span key={index} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    {output}
                    <button type="button" onClick={() => removeOutput(index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOutput}
                  onChange={(e) => setNewOutput(e.target.value)}
                  placeholder="Digite uma saída"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutput())}
                />
                <button
                  type="button"
                  onClick={addOutput}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
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
          </div>
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