// frontend/src/components/admin/QuestionFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Paperclip } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

interface Question {
  _id?: string;
  controlId: string;
  controlName: string;
  controlCategory: string;
  text: string;
  objective: string;
  answerImplemented: string;
  answerPartial: string;
  answerNotImplemented: string;
  guidance: string;
  attachmentUrl: string;
  attachmentName: string;
  order: number;
  active: boolean;
}

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Question>) => Promise<void>;
  question?: Question | null;
  title: string;
  isLoading?: boolean;
  categories: string[];
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
  title,
  isLoading = false,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    controlId: '',
    controlName: '',
    controlCategory: categories[0] || '',
    text: '',
    objective: '',
    answerImplemented: '',
    answerPartial: '',
    answerNotImplemented: '',
    guidance: '',
    attachmentUrl: '',
    attachmentName: '',
    order: 1,
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (question) {
      setFormData({
        controlId: question.controlId || '',
        controlName: question.controlName || '',
        controlCategory: question.controlCategory || categories[0] || '',
        text: question.text || '',
        objective: question.objective || '',
        answerImplemented: question.answerImplemented || '',
        answerPartial: question.answerPartial || '',
        answerNotImplemented: question.answerNotImplemented || '',
        guidance: question.guidance || '',
        attachmentUrl: question.attachmentUrl || '',
        attachmentName: question.attachmentName || '',
        order: question.order || 1,
        active: question.active !== undefined ? question.active : true,
      });
    } else {
      setFormData({
        controlId: '',
        controlName: '',
        controlCategory: categories[0] || '',
        text: '',
        objective: '',
        answerImplemented: '',
        answerPartial: '',
        answerNotImplemented: '',
        guidance: '',
        attachmentUrl: '',
        attachmentName: '',
        order: 1,
        active: true,
      });
    }
    setErrors({});
  }, [question, isOpen, categories]);

  const handleChange = (field: keyof Question, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.controlId?.trim()) newErrors.controlId = 'ID do controle é obrigatório';
    if (!formData.text?.trim()) newErrors.text = 'Pergunta é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      // Erro já tratado no pai
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Control info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">ID do Controle *</label>
              <Input
                value={formData.controlId}
                onChange={(e) => handleChange('controlId', e.target.value)}
                placeholder="ex: 5.1"
                className={errors.controlId ? 'border-red-500' : ''}
              />
              {errors.controlId && <p className="text-xs text-red-500 mt-1">{errors.controlId}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Nome do Controle</label>
              <Input
                value={formData.controlName}
                onChange={(e) => handleChange('controlName', e.target.value)}
                placeholder="ex: Políticas de segurança da informação"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Categoria</label>
              <select
                value={formData.controlCategory}
                onChange={(e) => handleChange('controlCategory', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ordem</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => handleChange('order', Number(e.target.value))}
                className="bg-white"
              />
            </div>
          </div>

          {/* Pergunta */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pergunta de Avaliação *</label>
            <textarea
              value={formData.text}
              onChange={(e) => handleChange('text', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.text ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="A organização possui...?"
            />
            {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Objetivo da Pergunta</label>
            <textarea
              value={formData.objective}
              onChange={(e) => handleChange('objective', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Verificar se a organização..."
            />
          </div>

          {/* Critérios de Resposta */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Critérios de Resposta</p>
            <div>
              <label className="block text-xs font-medium text-green-600 mb-1">✓ Implementado — Critério</label>
              <textarea
                value={formData.answerImplemented}
                onChange={(e) => handleChange('answerImplemented', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-xs"
                placeholder="Descreva o que caracteriza implementação completa..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-yellow-600 mb-1">◐ Parcialmente Implementado — Critério</label>
              <textarea
                value={formData.answerPartial}
                onChange={(e) => handleChange('answerPartial', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-xs"
                placeholder="Descreva o que caracteriza implementação parcial..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-red-600 mb-1">✗ Não Implementado — Critério</label>
              <textarea
                value={formData.answerNotImplemented}
                onChange={(e) => handleChange('answerNotImplemented', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-xs"
                placeholder="Descreva o que caracteriza não implementado..."
              />
            </div>
          </div>

          {/* Orientação */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Orientação / Evidência Esperada</label>
            <textarea
              value={formData.guidance}
              onChange={(e) => handleChange('guidance', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Documentos ou evidências que comprovam a implementação..."
            />
          </div>

          {/* Anexo */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Anexo (Documento de Referência)</label>
            <div className="flex gap-2 items-center">
              <Input
                type="file"
                className="hidden"
                // Implementar upload depois
              />
              <Button type="button" variant="outline" size="sm" className="border-gray-200 text-xs">
                <Paperclip className="h-3.5 w-3.5 mr-1" />
                Anexar arquivo
              </Button>
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm text-gray-600">Pergunta ativa</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Pergunta
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};