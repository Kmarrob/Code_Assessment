import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, X, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { useUsers } from '../../../../hooks/useAdmin.js';
import { CreateAuditPlanDTO, UpdateAuditPlanDTO, AuditPlan } from '../../types/audit.types';

interface AuditPlanFormProps {
  initialData?: AuditPlan;
  isEditing?: boolean;
  onSubmit: (data: CreateAuditPlanDTO) => Promise<void>;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'pending_approval', label: 'Aguardando Aprovação' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
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

const PROCESS_OPTIONS = [
  'Gestão de Acessos',
  'Gestão de Incidentes',
  'Gestão de Riscos',
  'Continuidade de Negócios',
  'Gestão de Ativos',
  'Classificação de Informações',
  'Controles de Segurança',
  'Treinamento e Conscientização',
  'Auditoria Interna',
  'Outros',
];

const CONTROL_OPTIONS = [
  '5.1 - Políticas de segurança da informação',
  '5.2 - Papéis e responsabilidades',
  '5.3 - Segregação de funções',
  '5.4 - Responsabilidades da direção',
  '5.9 - Inventário de ativos',
  '5.10 - Uso aceitável de ativos',
  '5.12 - Classificação das informações',
  '5.15 - Controle de acesso',
  '5.16 - Gestão de identidade',
  '5.18 - Direitos de acesso',
  '5.24 - Gestão de incidentes',
  '5.29 - Segurança durante disrupção',
  '6.3 - Conscientização e treinamento',
  '7.1 - Perímetros de segurança física',
  '7.2 - Entrada física',
  '8.1 - Dispositivos endpoint',
  '8.2 - Direitos de acesso privilegiado',
  '8.3 - Restrição de acesso à informação',
  '8.5 - Autenticação segura',
  '8.7 - Proteção contra malware',
  '8.8 - Gestão de vulnerabilidades',
  '8.13 - Backup',
  '8.15 - Logs',
  '8.20 - Segurança de redes',
  '8.22 - Segregação de redes',
  '8.24 - Uso de criptografia',
];

export function AuditPlanForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: AuditPlanFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: users = [] } = useUsers();

  const [formData, setFormData] = useState<Partial<CreateAuditPlanDTO>>({
    title: '',
    description: '',
    scope: {
      controls: [],
      processes: [],
      areas: [],
    },
    period: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    },
    team: {
      leadAuditor: '',
      auditors: [],
      observers: [],
    },
    criteria: [],
  });

  const [newCriteria, setNewCriteria] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Carregar dados iniciais para edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        scope: initialData.scope || { controls: [], processes: [], areas: [] },
        period: {
          startDate: initialData.period.startDate.split('T')[0],
          endDate: initialData.period.endDate.split('T')[0],
        },
        team: initialData.team || { leadAuditor: '', auditors: [], observers: [] },
        criteria: initialData.criteria || [],
      });
      setSelectedControls(initialData.scope?.controls || []);
      setSelectedProcesses(initialData.scope?.processes || []);
      setSelectedAreas(initialData.scope?.areas || []);
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScopeChange = (type: 'controls' | 'processes' | 'areas', value: string) => {
    const setter = type === 'controls' ? setSelectedControls : type === 'processes' ? setSelectedProcesses : setSelectedAreas;
    const current = type === 'controls' ? selectedControls : type === 'processes' ? selectedProcesses : selectedAreas;

    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleTeamChange = (field: 'leadAuditor' | 'auditors' | 'observers', value: any) => {
    setFormData((prev) => ({
      ...prev,
      team: {
        ...prev.team!,
        [field]: value,
      },
    }));
  };

  const handleAddCriteria = () => {
    if (newCriteria.trim() && !formData.criteria?.includes(newCriteria.trim())) {
      setFormData((prev) => ({
        ...prev,
        criteria: [...(prev.criteria || []), newCriteria.trim()],
      }));
      setNewCriteria('');
    }
  };

  const handleRemoveCriteria = (criteria: string) => {
    setFormData((prev) => ({
      ...prev,
      criteria: (prev.criteria || []).filter((c) => c !== criteria),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.team?.leadAuditor) {
      newErrors.leadAuditor = 'Auditor líder é obrigatório';
    }
    if (!formData.period?.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }
    if (!formData.period?.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }
    if (selectedControls.length === 0) {
      newErrors.controls = 'Selecione pelo menos um controle';
    }
    if (selectedProcesses.length === 0) {
      newErrors.processes = 'Selecione pelo menos um processo';
    }
    if (selectedAreas.length === 0) {
      newErrors.areas = 'Selecione pelo menos uma área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateAuditPlanDTO = {
      title: formData.title!,
      description: formData.description!,
      scope: {
        controls: selectedControls,
        processes: selectedProcesses,
        areas: selectedAreas,
      },
      period: {
        startDate: new Date(formData.period!.startDate!),
        endDate: new Date(formData.period!.endDate!),
      },
      team: {
        leadAuditor: formData.team!.leadAuditor!,
        auditors: formData.team?.auditors || [],
        observers: formData.team?.observers || [],
      },
      criteria: formData.criteria || [],
    };

    await onSubmit(data);
  };

  // Filtrar usuários para auditores (REP e ADMIN podem ser auditores)
  const auditorUsers = users.filter((u: any) => u.role === 'rep' || u.role === 'admin');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título e Descrição */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Auditoria de Segurança da Informação - 2026"
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
              placeholder="Descreva os objetivos e o escopo da auditoria..."
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Escopo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escopo da Auditoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Controles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Controles ISO 27001 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedControls.map((control) => (
                <span
                  key={control}
                  className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                >
                  {control}
                  <button
                    type="button"
                    onClick={() => handleScopeChange('controls', control)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => handleScopeChange('controls', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecione um controle...</option>
              {CONTROL_OPTIONS.filter((c) => !selectedControls.includes(c)).map((control) => (
                <option key={control} value={control}>
                  {control}
                </option>
              ))}
            </select>
            {errors.controls && <p className="text-sm text-red-500 mt-1">{errors.controls}</p>}
          </div>

          {/* Processos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processos <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedProcesses.map((process) => (
                <span
                  key={process}
                  className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {process}
                  <button
                    type="button"
                    onClick={() => handleScopeChange('processes', process)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => handleScopeChange('processes', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecione um processo...</option>
              {PROCESS_OPTIONS.filter((p) => !selectedProcesses.includes(p)).map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
            {errors.processes && <p className="text-sm text-red-500 mt-1">{errors.processes}</p>}
          </div>

          {/* Áreas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Áreas <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedAreas.map((area) => (
                <span
                  key={area}
                  className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleScopeChange('areas', area)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => handleScopeChange('areas', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecione uma área...</option>
              {AREA_OPTIONS.filter((a) => !selectedAreas.includes(a)).map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {errors.areas && <p className="text-sm text-red-500 mt-1">{errors.areas}</p>}
          </div>
        </div>
      </div>

      {/* Equipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          Equipe de Auditoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auditor Líder <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.team?.leadAuditor || ''}
              onChange={(e) => handleTeamChange('leadAuditor', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.leadAuditor ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione...</option>
              {auditorUsers.map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {errors.leadAuditor && <p className="text-sm text-red-500 mt-1">{errors.leadAuditor}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditores</label>
            <select
              multiple
              value={formData.team?.auditors || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                handleTeamChange('auditors', values);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              size={3}
            >
              {auditorUsers.map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Segure Ctrl para selecionar múltiplos</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observadores</label>
            <select
              multiple
              value={formData.team?.observers || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                handleTeamChange('observers', values);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              size={3}
            >
              {users.map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Segure Ctrl para selecionar múltiplos</p>
          </div>
        </div>
      </div>

      {/* Período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          Período
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.period?.startDate || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  period: { ...prev.period!, startDate: e.target.value },
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Fim <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.period?.endDate || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  period: { ...prev.period!, endDate: e.target.value },
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Critérios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Critérios de Auditoria
        </h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {(formData.criteria || []).map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {c}
              <button type="button" onClick={() => handleRemoveCriteria(c)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
            placeholder="Ex: ISO 27001:2022, Política de SI, Requisitos Legais"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCriteria();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddCriteria}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
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
          onClick={() => navigate('/rep/audit/plans')}
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
            <>{isEditing ? 'Atualizar Plano' : 'Criar Plano'}</>
          )}
        </button>
      </div>
    </form>
  );
}