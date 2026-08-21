import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, X, Plus, AlertCircle, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { useUsers } from '../../../../hooks/useAdmin.js';
import { CreateAuditPlanDTO, UpdateAuditPlanDTO, AuditPlan } from '../../types/audit.types';
import { toast } from 'react-hot-toast';
// 🔴 CORRIGIDO: Importar api diretamente
import { api } from '../../../../services/api.js';

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

export function AuditPlanForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: AuditPlanFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  // Estado para auditores manuais
  const [manualAuditorName, setManualAuditorName] = useState('');
  const [manualAuditorEmail, setManualAuditorEmail] = useState('');
  const [manualAuditors, setManualAuditors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [showManualAuditorInput, setShowManualAuditorInput] = useState(false);

  // Estado para controles do backend
  const [controls, setControls] = useState<Array<{ id: string; name: string; controlId: string }>>([]);
  const [isLoadingControls, setIsLoadingControls] = useState(true);

  const [formData, setFormData] = useState<Partial<CreateAuditPlanDTO>>({
    code: '',
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
      estimatedDays: 30,
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

  // 🔴 CORRIGIDO: Buscar controles da empresa via rota /rep/controls
  useEffect(() => {
    const fetchControls = async () => {
      setIsLoadingControls(true);
      try {
        console.log('🔍 Buscando controles da empresa (REP)...');
        const response = await api.get('/rep/controls');
        const controlList = response.data.data || [];
        console.log('📦 Controles carregados:', controlList.length);
        setControls(controlList);
      } catch (err) {
        console.error('❌ Erro ao carregar controles:', err);
        toast.error('Erro ao carregar lista de controles');
      } finally {
        setIsLoadingControls(false);
      }
    };
    fetchControls();
  }, []);

  // Carregar dados iniciais para edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        title: initialData.title,
        description: initialData.description,
        scope: initialData.scope || { controls: [], processes: [], areas: [] },
        period: {
          startDate: initialData.period.startDate.split('T')[0],
          endDate: initialData.period.endDate.split('T')[0],
          estimatedDays: initialData.period.estimatedDays || 30,
        },
        team: initialData.team || { leadAuditor: '', auditors: [], observers: [] },
        criteria: initialData.criteria || [],
      });
      setSelectedControls(initialData.scope?.controls || []);
      setSelectedProcesses(initialData.scope?.processes || []);
      setSelectedAreas(initialData.scope?.areas || []);
    }
  }, [initialData]);

  // Carregar auditores manuais do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('manualAuditors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setManualAuditors(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar auditores manuais:', e);
    }
  }, []);

  // Salvar auditores manuais no localStorage
  const saveManualAuditors = (auditors: Array<{ id: string; name: string; email: string }>) => {
    try {
      localStorage.setItem('manualAuditors', JSON.stringify(auditors));
    } catch (e) {
      console.warn('Erro ao salvar auditores manuais:', e);
    }
  };

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

  // Handler para adicionar auditor manual
  const handleAddManualAuditor = () => {
    if (!manualAuditorName.trim()) {
      toast.error('Nome do auditor é obrigatório');
      return;
    }

    const exists = manualAuditors.some(
      (a) => a.name.toLowerCase() === manualAuditorName.trim().toLowerCase()
    );
    if (exists) {
      toast.error('Este auditor já foi adicionado');
      return;
    }

    const newAuditor = {
      id: `manual_${Date.now()}`,
      name: manualAuditorName.trim(),
      email: manualAuditorEmail.trim() || `${manualAuditorName.trim().toLowerCase().replace(/\s/g, '.')}@auditor.local`,
    };

    const updatedAuditors = [...manualAuditors, newAuditor];
    setManualAuditors(updatedAuditors);
    saveManualAuditors(updatedAuditors);

    handleTeamChange('auditors', [...(formData.team?.auditors || []), newAuditor.id]);

    setManualAuditorName('');
    setManualAuditorEmail('');
    setShowManualAuditorInput(false);

    toast.success(`Auditor "${newAuditor.name}" adicionado com sucesso!`);
  };

  // Remover auditor manual
  const handleRemoveManualAuditor = (id: string) => {
    const updatedAuditors = manualAuditors.filter((a) => a.id !== id);
    setManualAuditors(updatedAuditors);
    saveManualAuditors(updatedAuditors);

    handleTeamChange(
      'auditors',
      (formData.team?.auditors || []).filter((a) => a !== id)
    );

    toast.success('Auditor removido');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Código do plano é obrigatório';
    }
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
      code: formData.code || `AUD-${Date.now().toString().slice(-6)}`,
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
        estimatedDays: formData.period?.estimatedDays || 30,
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

  // Combinar usuários do sistema + auditores manuais
  const allAuditorOptions = [
    ...(users || [])
      .filter((u: any) => u.role === 'rep' || u.role === 'admin')
      .map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        isManual: false,
      })),
    ...manualAuditors.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      isManual: true,
    })),
  ];

  const hasOptions = allAuditorOptions.length > 0;

  // Opções de controles dinâmicos
  const controlOptions = controls.map((c) => ({
    value: c.controlId || c.id,
    label: c.name || c.controlId,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título e Descrição */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código do Plano <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="Ex: AUD-2026-001"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Deixe em branco para gerar automaticamente (ex: AUD-123456)
            </p>
          </div>

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
          {/* Controles - Buscados do backend via rota REP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Controles ISO 27001 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedControls.map((control) => {
                const controlLabel = controls.find((c) => (c.controlId || c.id) === control)?.name || control;
                return (
                  <span
                    key={control}
                    className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                  >
                    {controlLabel}
                    <button
                      type="button"
                      onClick={() => handleScopeChange('controls', control)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            {isLoadingControls ? (
              <div className="text-sm text-gray-500 py-2">Carregando controles...</div>
            ) : (
              <select
                value=""
                onChange={(e) => handleScopeChange('controls', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione um controle...</option>
                {controlOptions
                  .filter((c) => !selectedControls.includes(c.value))
                  .map((control) => (
                    <option key={control.value} value={control.value}>
                      {control.label}
                    </option>
                  ))}
              </select>
            )}
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

        {manualAuditors.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Auditores cadastrados manualmente:
            </p>
            <div className="flex flex-wrap gap-2">
              {manualAuditors.map((auditor) => (
                <span
                  key={auditor.id}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {auditor.name} ({auditor.email})
                  <button
                    type="button"
                    onClick={() => handleRemoveManualAuditor(auditor.id)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auditor Líder <span className="text-red-500">*</span>
            </label>
            {hasOptions ? (
              <select
                value={formData.team?.leadAuditor || ''}
                onChange={(e) => handleTeamChange('leadAuditor', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.leadAuditor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione...</option>
                {allAuditorOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) {u.isManual ? '📝' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg">
                Nenhum auditor disponível. Adicione um manualmente abaixo.
              </div>
            )}
            {errors.leadAuditor && <p className="text-sm text-red-500 mt-1">{errors.leadAuditor}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditores</label>
            {hasOptions ? (
              <select
                multiple
                value={formData.team?.auditors || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, (option) => option.value);
                  handleTeamChange('auditors', values);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                size={4}
              >
                {allAuditorOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) {u.isManual ? '📝' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg">
                Nenhum auditor disponível. Adicione um manualmente abaixo.
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Segure Ctrl para selecionar múltiplos</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observadores</label>
            {hasOptions ? (
              <select
                multiple
                value={formData.team?.observers || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, (option) => option.value);
                  handleTeamChange('observers', values);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                size={4}
              >
                {allAuditorOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) {u.isManual ? '📝' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg">
                Nenhum observador disponível. Adicione um manualmente abaixo.
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Segure Ctrl para selecionar múltiplos</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          {showManualAuditorInput ? (
            <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Adicionar Auditor Manual</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={manualAuditorName}
                  onChange={(e) => setManualAuditorName(e.target.value)}
                  placeholder="Nome completo do auditor..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="email"
                  value={manualAuditorEmail}
                  onChange={(e) => setManualAuditorEmail(e.target.value)}
                  placeholder="Email (opcional)..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowManualAuditorInput(false)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddManualAuditor}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar Auditor
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowManualAuditorInput(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar auditor manualmente
            </button>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Use esta opção se o auditor não estiver cadastrado no sistema.
          </p>
        </div>
      </div>

      {/* Período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          Período
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dias Estimados
            </label>
            <input
              type="number"
              value={formData.period?.estimatedDays || 30}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  period: { ...prev.period!, estimatedDays: parseInt(e.target.value) || 30 },
                }))
              }
              min={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Número estimado de dias para a auditoria
            </p>
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