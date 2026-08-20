import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';

// ============================================================
// TIPOS
// ============================================================

interface IAuditQuestion {
  _id: string;
  text: string;
  clause: string;
  category: 'clause' | 'control';
  controlId?: string;
  isActive: boolean;
  answerType: 'C_NC_NA' | 'C_NC_OB_OM_NA';
  order: number;
  section: string;
  createdAt: string;
  updatedAt: string;
}

interface IControl {
  _id: string;
  id: string;
  nome: string;
}

// ============================================================
// OPÇÕES
// ============================================================

const CATEGORY_OPTIONS = [
  { value: 'clause', label: 'Cláusula' },
  { value: 'control', label: 'Controle' },
];

const ANSWER_TYPE_OPTIONS = [
  { value: 'C_NC_NA', label: 'Conforme / Não Conforme / Não Aplicável' },
  { value: 'C_NC_OB_OM_NA', label: 'Conforme / Não Conforme / Observação / Oportunidade / Não Aplicável' },
];

const SECTION_OPTIONS = [
  { value: '4 Contexto', label: '4 - Contexto da Organização' },
  { value: '5 Liderança', label: '5 - Liderança' },
  { value: '6 Planejamento', label: '6 - Planejamento' },
  { value: '7 Apoio', label: '7 - Apoio' },
  { value: '8 Operação', label: '8 - Operação' },
  { value: '9 Avaliação', label: '9 - Avaliação de Desempenho' },
  { value: '10 Melhoria', label: '10 - Melhoria' },
  { value: 'A.5 Organizacionais', label: 'A.5 - Controles Organizacionais' },
  { value: 'A.6 Pessoas', label: 'A.6 - Controles de Pessoas' },
  { value: 'A.7 Físicos', label: 'A.7 - Controles Físicos' },
  { value: 'A.8 Tecnológicos', label: 'A.8 - Controles Tecnológicos' },
];

const CLAUSE_OPTIONS = [
  // Cláusulas 4 a 10
  '4.1', '4.2', '4.3', '4.4',
  '5.1', '5.2', '5.3',
  '6.1.1', '6.1.2', '6.1.3', '6.2', '6.3',
  '7.1', '7.2', '7.3', '7.4', '7.5.1', '7.5.2', '7.5.3',
  '8.1', '8.2', '8.3',
  '9.1', '9.2.1', '9.2.2', '9.3.1', '9.3.2', '9.3.3',
  '10.1', '10.2',
  // Controles A.5
  'A.5.1', 'A.5.2', 'A.5.3', 'A.5.4', 'A.5.5', 'A.5.6', 'A.5.7', 'A.5.8',
  'A.5.9', 'A.5.10', 'A.5.11', 'A.5.12', 'A.5.13', 'A.5.14', 'A.5.15',
  'A.5.16', 'A.5.17', 'A.5.18', 'A.5.19', 'A.5.20', 'A.5.21', 'A.5.22',
  'A.5.23', 'A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28', 'A.5.29',
  'A.5.30', 'A.5.31', 'A.5.32', 'A.5.33', 'A.5.34', 'A.5.35', 'A.5.36',
  'A.5.37',
  // Controles A.6
  'A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6', 'A.6.7', 'A.6.8',
  // Controles A.7
  'A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'A.7.5', 'A.7.6', 'A.7.7', 'A.7.8',
  'A.7.9', 'A.7.10', 'A.7.11', 'A.7.12', 'A.7.13', 'A.7.14',
  // Controles A.8
  'A.8.1', 'A.8.2', 'A.8.3', 'A.8.4', 'A.8.5', 'A.8.6', 'A.8.7', 'A.8.8',
  'A.8.9', 'A.8.10', 'A.8.11', 'A.8.12', 'A.8.13', 'A.8.14', 'A.8.15',
  'A.8.16', 'A.8.17', 'A.8.18', 'A.8.19', 'A.8.20', 'A.8.21', 'A.8.22',
  'A.8.23', 'A.8.24', 'A.8.25', 'A.8.26', 'A.8.27', 'A.8.28', 'A.8.29',
  'A.8.30', 'A.8.31', 'A.8.32', 'A.8.33', 'A.8.34',
];

// ============================================================
// SERVICE
// ============================================================

const fetchQuestion = async (id: string): Promise<IAuditQuestion> => {
  const response = await api.get(`/admin/audit/questions/${id}`);
  return response.data.data;
};

const fetchControls = async (): Promise<IControl[]> => {
  const response = await api.get('/admin/controls/all');
  return response.data.data.controls || [];
};

const createQuestion = async (data: Partial<IAuditQuestion>): Promise<IAuditQuestion> => {
  const response = await api.post('/admin/audit/questions', data);
  return response.data.data;
};

const updateQuestion = async (id: string, data: Partial<IAuditQuestion>): Promise<IAuditQuestion> => {
  const response = await api.put(`/admin/audit/questions/${id}`, data);
  return response.data.data;
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function AdminAuditQuestionForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id && id !== 'new';

  const [formData, setFormData] = useState<Partial<IAuditQuestion>>({
    text: '',
    clause: '',
    category: 'clause',
    controlId: '',
    isActive: true,
    answerType: 'C_NC_OB_OM_NA',
    order: 0,
    section: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ============================================================
  // QUERIES
  // ============================================================

  const { data: question, isLoading: isLoadingQuestion } = useQuery({
    queryKey: ['admin-audit-question', id],
    queryFn: () => fetchQuestion(id!),
    enabled: isEditing && !!id,
  });

  const { data: controls = [], isLoading: isLoadingControls } = useQuery({
    queryKey: ['admin-controls-all'],
    queryFn: fetchControls,
  });

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audit-questions'] });
      toast.success('Pergunta criada com sucesso!');
      navigate('/admin/audit/questions');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar pergunta');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IAuditQuestion> }) =>
      updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audit-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-question', id] });
      toast.success('Pergunta atualizada com sucesso!');
      navigate('/admin/audit/questions');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar pergunta');
    },
  });

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        clause: question.clause,
        category: question.category,
        controlId: question.controlId || '',
        isActive: question.isActive,
        answerType: question.answerType,
        order: question.order,
        section: question.section,
      });
    }
  }, [question]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (field: keyof IAuditQuestion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text?.trim()) {
      newErrors.text = 'O texto da pergunta é obrigatório';
    }
    if (!formData.clause?.trim()) {
      newErrors.clause = 'A cláusula é obrigatória';
    }
    if (!formData.section?.trim()) {
      newErrors.section = 'A seção é obrigatória';
    }
    if (formData.category === 'control' && !formData.controlId) {
      newErrors.controlId = 'Selecione um controle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      ...formData,
      controlId: formData.category === 'control' ? formData.controlId : undefined,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/audit/questions/${id}`);
      queryClient.invalidateQueries({ queryKey: ['admin-audit-questions'] });
      toast.success('Pergunta excluída com sucesso!');
      navigate('/admin/audit/questions');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir pergunta');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoadingQuestion && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Carregando pergunta...</span>
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/audit/questions')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isEditing
                ? 'Atualize as informações da pergunta'
                : 'Crie uma nova pergunta para o checklist de auditoria'}
            </p>
          </div>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Texto da Pergunta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados da Pergunta</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto da Pergunta <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Digite a pergunta que será utilizada no checklist..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.text ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.text && <p className="text-sm text-red-500 mt-1">{errors.text}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category || 'clause'}
                  onChange={(e) => handleChange('category', e.target.value as 'clause' | 'control')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cláusula <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.clause || ''}
                  onChange={(e) => handleChange('clause', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecione uma cláusula...</option>
                  {CLAUSE_OPTIONS.map((clause) => (
                    <option key={clause} value={clause}>
                      {clause}
                    </option>
                  ))}
                </select>
                {errors.clause && <p className="text-sm text-red-500 mt-1">{errors.clause}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seção <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.section || ''}
                  onChange={(e) => handleChange('section', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecione uma seção...</option>
                  {SECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.section && <p className="text-sm text-red-500 mt-1">{errors.section}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Ordem de exibição no checklist</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Resposta <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.answerType || 'C_NC_OB_OM_NA'}
                onChange={(e) => handleChange('answerType', e.target.value as 'C_NC_NA' | 'C_NC_OB_OM_NA')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {ANSWER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.category === 'control' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Controle <span className="text-red-500">*</span>
                </label>
                {isLoadingControls ? (
                  <div className="text-sm text-gray-500">Carregando controles...</div>
                ) : (
                  <select
                    value={formData.controlId || ''}
                    onChange={(e) => handleChange('controlId', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.controlId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um controle...</option>
                    {controls.map((control) => (
                      <option key={control._id} value={control._id}>
                        {control.id} - {control.nome}
                      </option>
                    ))}
                  </select>
                )}
                {errors.controlId && <p className="text-sm text-red-500 mt-1">{errors.controlId}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={formData.isActive === true}
                onChange={() => handleChange('isActive', true)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Ativa
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={formData.isActive === false}
                onChange={() => handleChange('isActive', false)}
                className="w-4 h-4 text-gray-600 focus:ring-gray-500"
              />
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-gray-400" />
                Inativa
              </span>
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Perguntas inativas não aparecem nos checklists.
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/audit/questions')}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}