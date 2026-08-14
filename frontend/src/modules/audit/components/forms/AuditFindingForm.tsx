import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, Plus } from 'lucide-react';
import { CreateAuditFindingDTO, AuditFinding, AuditFindingType } from '../../types/audit.types';

interface AuditFindingFormProps {
  planId: string;
  initialData?: AuditFinding;
  isEditing?: boolean;
  onSubmit: (data: CreateAuditFindingDTO) => Promise<void>;
  isSubmitting?: boolean;
}

const TYPE_OPTIONS: { value: AuditFindingType; label: string; color: string }[] = [
  { value: 'nc_a', label: 'NC A - Não Conformidade Maior', color: 'text-red-600 border-red-500 bg-red-50' },
  { value: 'nc_b', label: 'NC B - Não Conformidade Menor', color: 'text-orange-600 border-orange-500 bg-orange-50' },
  { value: 'comment', label: 'Comentário / Observação', color: 'text-blue-600 border-blue-500 bg-blue-50' },
  { value: 'opportunity', label: 'Oportunidade de Melhoria', color: 'text-green-600 border-green-500 bg-green-50' },
  { value: 'positive', label: 'Boas Práticas', color: 'text-purple-600 border-purple-500 bg-purple-50' },
];

const AREA_OPTIONS = [
  'TI',
  'RH',
  'Financeiro',
  'Comercial',
  'Marketing',
  'Jurídico',
  'Operações',
  'Governança',
  'Segurança da Informação',
  'Outros',
];

const CLAUSE_OPTIONS = [
  '4.1 - Contexto da organização',
  '4.2 - Partes interessadas',
  '4.3 - Escopo do SGSI',
  '5.1 - Liderança e comprometimento',
  '5.2 - Política de SI',
  '5.3 - Papéis e responsabilidades',
  '6.1 - Ações para riscos e oportunidades',
  '6.2 - Objetivos de SI',
  '7.1 - Recursos',
  '7.2 - Competência',
  '7.3 - Conscientização',
  '7.4 - Comunicação',
  '7.5 - Informação documentada',
  '8.1 - Planejamento operacional',
  '8.2 - Avaliação de riscos',
  '8.3 - Tratamento de riscos',
  '9.1 - Monitoramento e medição',
  '9.2 - Auditoria interna',
  '9.3 - Análise crítica pela direção',
  '10.1 - Melhoria contínua',
  '10.2 - Não conformidade e ação corretiva',
  'A.5.1 - Políticas de segurança da informação',
  'A.5.2 - Papéis e responsabilidades',
  'A.5.3 - Segregação de funções',
  'A.5.15 - Controle de acesso',
  'A.5.24 - Gestão de incidentes',
  'A.6.3 - Conscientização e treinamento',
  'A.7.1 - Perímetros de segurança física',
  'A.8.1 - Dispositivos endpoint',
  'A.8.7 - Proteção contra malware',
  'A.8.8 - Gestão de vulnerabilidades',
  'A.8.13 - Backup',
  'A.8.15 - Logs',
  'A.8.20 - Segurança de redes',
];

export function AuditFindingForm({
  planId,
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: AuditFindingFormProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<CreateAuditFindingDTO>>({
    type: 'nc_a',
    title: '',
    description: '',
    area: '',
    clause: '',
    evidenceIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.area) {
      newErrors.area = 'Área é obrigatória';
    }
    if (!formData.clause) {
      newErrors.clause = 'Cláusula é obrigatória';
    }
    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateAuditFindingDTO = {
      type: formData.type!,
      title: formData.title!,
      description: formData.description!,
      area: formData.area!,
      clause: formData.clause!,
      evidenceIds: formData.evidenceIds || [],
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Registro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange('type', type.value)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                formData.type === type.value
                  ? `${type.color} border-2`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
            </button>
          ))}
        </div>
        {errors.type && <p className="text-sm text-red-500 mt-2">{errors.type}</p>}
      </div>

      {/* Informações Básicas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Não Conformidade</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Ausência de política de senhas"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva detalhadamente a não conformidade encontrada..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.area || ''}
                onChange={(e) => handleChange('area', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione a área...</option>
                {AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {errors.area && <p className="text-sm text-red-500 mt-1">{errors.area}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cláusula ISO 27001 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.clause || ''}
                onChange={(e) => handleChange('clause', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.clause ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione a cláusula...</option>
                {CLAUSE_OPTIONS.map((clause) => (
                  <option key={clause} value={clause}>
                    {clause}
                  </option>
                ))}
              </select>
              {errors.clause && <p className="text-sm text-red-500 mt-1">{errors.clause}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Evidências */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidências</h2>
        <p className="text-sm text-gray-500 mb-4">
          As evidências podem ser anexadas após a criação da não conformidade.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>Você poderá anexar arquivos depois de salvar a NC.</span>
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
          onClick={() => navigate(`/rep/audit/execution/${planId}`)}
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
            <>{isEditing ? 'Atualizar NC' : 'Registrar NC'}</>
          )}
        </button>
      </div>
    </form>
  );
}