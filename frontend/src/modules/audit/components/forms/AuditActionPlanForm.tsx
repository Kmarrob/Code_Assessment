import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { useUsers } from '../../../../hooks/useAdmin.js';
import { CreateAuditActionPlanDTO, AuditActionPlan } from '../../types/audit.types';

interface AuditActionPlanFormProps {
  findingId: string;
  initialData?: AuditActionPlan;
  isEditing?: boolean;
  onSubmit: (data: CreateAuditActionPlanDTO) => Promise<void>;
  isSubmitting?: boolean;
}

export function AuditActionPlanForm({
  findingId,
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: AuditActionPlanFormProps) {
  const navigate = useNavigate();
  const { data: users = [] } = useUsers();

  const [formData, setFormData] = useState<Partial<CreateAuditActionPlanDTO>>({
    findingId: findingId,
    action: '',
    responsible: '',
    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados iniciais para edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        findingId: initialData.findingId,
        action: initialData.action,
        responsible: initialData.responsible,
        deadline: initialData.deadline.split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    if (!formData.action?.trim()) {
      newErrors.action = 'Descrição da ação é obrigatória';
    }
    if (!formData.responsible) {
      newErrors.responsible = 'Responsável é obrigatório';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Prazo é obrigatório';
    }

    // Validar se o prazo é futuro
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.deadline = 'O prazo deve ser uma data futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateAuditActionPlanDTO = {
      findingId: formData.findingId!,
      action: formData.action!,
      responsible: formData.responsible!,
      deadline: new Date(formData.deadline!),
    };

    await onSubmit(data);
  };

  // Filtrar usuários ativos para responsáveis
  const activeUsers = users.filter((u: any) => u.isActive !== false);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações da Ação */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Plano de Ação
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição da Ação <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.action || ''}
              onChange={(e) => handleChange('action', e.target.value)}
              placeholder="Descreva a ação corretiva a ser implementada..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.action ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.action && <p className="text-sm text-red-500 mt-1">{errors.action}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                Responsável <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.responsible || ''}
                onChange={(e) => handleChange('responsible', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.responsible ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione o responsável...</option>
                {activeUsers.map((u: any) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {errors.responsible && <p className="text-sm text-red-500 mt-1">{errors.responsible}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Responsável pela implementação da ação corretiva
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                Prazo <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.deadline ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.deadline && <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Data limite para implementação da ação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span>
            Após criar o plano de ação, você poderá anexar evidências quando a ação for concluída.
          </span>
        </div>
      </div>

      {/* Ações */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(`/rep/audit/findings/${findingId}`)}
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
            <>{isEditing ? 'Atualizar Plano de Ação' : 'Criar Plano de Ação'}</>
          )}
        </button>
      </div>
    </form>
  );
}