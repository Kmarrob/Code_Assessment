import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  FileText,
  X,
  Plus,
  AlertCircle,
  UserPlus,
  UserCheck,
  User,
  Mail,
  Info,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { useRepUsers } from '../../../../hooks/useRep.js';
import { CreateAuditPlanDTO, UpdateAuditPlanDTO, AuditPlan } from '../../types/audit.types';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api.js';
import { CustomSelect } from '../../../../components/ui/CustomSelect';

// ============================================================
// TIPOS AUXILIARES
// ============================================================

type ScopeMode = 'all' | 'custom';
type TeamRole = 'leadAuditor' | 'auditors' | 'observers';

interface ExcludedControlDraft {
  controlId: string;
  reason: string;
}

/**
 * 🆕 v49.1 — Estrutura unificada de um membro da equipe.
 */
interface TeamMember {
  id: string;
  name: string;
  email: string;
  isManual: boolean;
}

interface AuditPlanFormProps {
  initialData?: AuditPlan;
  isEditing?: boolean;
  onSubmit: (data: CreateAuditPlanDTO) => Promise<void>;
  isSubmitting?: boolean;
}

// ============================================================
// CONSTANTES
// ============================================================

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

const MIN_EXCLUSION_REASON_LENGTH = 20;
const MANUAL_AUDITORS_STORAGE_KEY = 'manualAuditors';

// ============================================================
// SUB-COMPONENTE INTERNO — TeamMemberPicker
// ============================================================

interface TeamMemberPickerProps {
  label: string;
  role: TeamRole;
  required?: boolean;
  multiple?: boolean;
  value: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  options: TeamMember[];
  onAddManual: (payload: { name: string; email: string }) => TeamMember | null;
  onRemoveManual?: (id: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

function TeamMemberPicker({
  label,
  role,
  required = false,
  multiple = false,
  value,
  onChange,
  options,
  onAddManual,
  onRemoveManual,
  error,
  hint,
  disabled = false,
}: TeamMemberPickerProps) {
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const availableOptions = useMemo(() => {
    const selectedIds = new Set(value.map((m) => m.id));
    return options.filter((opt) => !selectedIds.has(opt.id));
  }, [options, value]);

  const selectOptions = useMemo(
    () =>
      availableOptions.map((opt) => ({
        value: opt.id,
        label: `${opt.name} (${opt.email})${opt.isManual ? ' 📝' : ''}`,
      })),
    [availableOptions]
  );

  const handleAddFromDropdown = (memberId: string) => {
    if (!memberId) return;

    const option = options.find((o) => o.id === memberId);
    if (!option) return;

    if (!multiple) {
      onChange([option]);
      return;
    }

    if (value.some((v) => v.id === memberId)) {
      toast.error('Este membro já está selecionado');
      return;
    }

    onChange([...value, option]);
  };

  const handleRemoveMember = (memberId: string) => {
    onChange(value.filter((m) => m.id !== memberId));
  };

  const handleAddManual = () => {
    const trimmedName = manualName.trim();
    const trimmedEmail = manualEmail.trim();

    if (!trimmedName) {
      toast.error('Nome do auditor é obrigatório');
      return;
    }

    const created = onAddManual({
      name: trimmedName,
      email: trimmedEmail || '',
    });

    if (!created) {
      return;
    }

    if (!multiple) {
      onChange([created]);
    } else {
      onChange([...value, created]);
    }

    setManualName('');
    setManualEmail('');
    setShowManualInput(false);

    toast.success(`Auditor "${created.name}" adicionado`);
  };

  const handleRemoveManualAndDeselect = (member: TeamMember) => {
    handleRemoveMember(member.id);

    if (member.isManual && onRemoveManual) {
      onRemoveManual(member.id);
    }
  };

  const roleLabel =
    role === 'leadAuditor' ? 'Líder' : role === 'auditors' ? 'Auditor' : 'Observador';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {/* Chips de membros selecionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((member) => (
            <span
              key={member.id}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
              title={member.email}
            >
              <User className="w-3 h-3" />
              {member.name}
              {member.isManual && <span title="Auditor manual">📝</span>}
              <button
                type="button"
                onClick={() => handleRemoveManualAndDeselect(member)}
                className="hover:text-red-500 ml-1"
                aria-label={`Remover ${member.name}`}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown para adicionar */}
      {availableOptions.length > 0 && !disabled && (
        <CustomSelect
          value=""
          onChange={handleAddFromDropdown}
          options={selectOptions}
          placeholder={
            multiple
              ? 'Adicione um membro...'
              : value.length > 0
                ? 'Trocar auditor líder...'
                : 'Selecione...'
          }
          className="w-full"
        />
      )}

      {availableOptions.length === 0 && value.length === 0 && !disabled && (
        <div className="text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg">
          Nenhum membro cadastrado. Adicione um manualmente abaixo.
        </div>
      )}

      {/* Botão / input de auditor manual */}
      <div className="mt-2">
        {!showManualInput ? (
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            disabled={disabled}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            Adicionar manualmente
          </button>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Novo auditor manual ({roleLabel})
            </p>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Nome completo *"
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                  autoFocus
                  disabled={disabled}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="Email (opcional)"
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                  disabled={disabled}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualInput(false);
                    setManualName('');
                    setManualEmail('');
                  }}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  disabled={disabled}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddManual}
                  disabled={disabled || !manualName.trim()}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <UserPlus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function AuditPlanForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: AuditPlanFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: usersData, isLoading: isLoadingUsers } = useRepUsers();

  // ============================================================
  // ESTADOS — EQUIPE (v49.1)
  // ============================================================

  const [manualMembers, setManualMembers] = useState<TeamMember[]>([]);

  const [teamMembersByRole, setTeamMembersByRole] = useState<{
    leadAuditor: TeamMember[];
    auditors: TeamMember[];
    observers: TeamMember[];
  }>({
    leadAuditor: [],
    auditors: [],
    observers: [],
  });

  // ============================================================
  // ESTADOS — CONTROLES
  // ============================================================

  const [controls, setControls] = useState<Array<any>>([]);
  const [isLoadingControls, setIsLoadingControls] = useState(true);

  // ============================================================
  // ESTADOS — ESCOPO (Opção C)
  // ============================================================

  const [scopeMode, setScopeMode] = useState<ScopeMode>('all');
  const [totalAvailableControls, setTotalAvailableControls] = useState<number>(0);
  const [excludedControls, setExcludedControls] = useState<ExcludedControlDraft[]>([]);
  const [exclusionDialogControlId, setExclusionDialogControlId] = useState<string | null>(null);
  const [exclusionReason, setExclusionReason] = useState('');

  // ============================================================
  // ESTADOS — FORMULÁRIO
  // ============================================================

  const [formData, setFormData] = useState<Partial<CreateAuditPlanDTO>>({
    code: '',
    title: '',
    description: '',
    scope: {
      mode: 'all',
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

  // ============================================================
  // BUSCAR CONTROLES E RESPOSTAS
  // ============================================================

  useEffect(() => {
    const fetchControlsAndResponses = async () => {
      setIsLoadingControls(true);
      try {
        console.log('🔍 Buscando controles e respostas da empresa (REP)...');

        const controlsRes = await api.get('/rep/controls');
        const controlList = controlsRes.data.data || controlsRes.data || [];

        let responsesList: any[] = [];
        try {
          const responsesRes = await api.get('/rep/users-with-responses');
          const usersWithResponses = responsesRes.data.data || [];

          responsesList = usersWithResponses.flatMap(
            (u: any) => u.responses || []
          );

          console.log('✅ Respostas carregadas:', responsesList.length);
        } catch (e) {
          console.warn('⚠️ Erro ao carregar respostas de /rep/users-with-responses:', e);
        }

        const enrichedControls = controlList.map((c: any) => {
          const ctrlCode = c.id || c.controlId || c.code;
          const ctrlDbId = c._id;

          const savedResp = responsesList.find(
            (r: any) =>
              String(r.controlId) === String(ctrlCode) ||
              String(r.controlId) === String(ctrlDbId) ||
              String(r.controlIdString) === String(ctrlCode)
          );

          return {
            ...c,
            maturityLevel: savedResp ? String(savedResp.maturityLevel) : c.maturityLevel,
            scenarioDescription: savedResp ? savedResp.scenarioDescription : c.scenarioDescription,
          };
        });

        console.log('📦 Controles carregados e enriquecidos:', enrichedControls.length);
        setControls(enrichedControls);
        setTotalAvailableControls(enrichedControls.length);
      } catch (err) {
        console.error('❌ Erro ao carregar controles:', err);
        toast.error('Erro ao carregar lista de controles');
      } finally {
        setIsLoadingControls(false);
      }
    };
    fetchControlsAndResponses();
  }, []);

  // ============================================================
  // CARREGAR AUDITORES MANUAIS DO LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MANUAL_AUDITORS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setManualMembers(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar auditores manuais:', e);
    }
  }, []);

  const saveManualMembers = (members: TeamMember[]) => {
    try {
      localStorage.setItem(MANUAL_AUDITORS_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.warn('Erro ao salvar auditores manuais:', e);
    }
  };

  // ============================================================
  // CARREGAR DADOS INICIAIS (EDIÇÃO)
  // ============================================================

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        title: initialData.title,
        description: initialData.description,
        scope: initialData.scope || { mode: 'all', controls: [], processes: [], areas: [] },
        period: {
          startDate: initialData.period.startDate.split('T')[0],
          endDate: initialData.period.endDate.split('T')[0],
          estimatedDays: initialData.period.estimatedDays || 30,
        },
        team: initialData.team || { leadAuditor: '', auditors: [], observers: [] },
        criteria: initialData.criteria || [],
      });

      const existingScope: any = initialData.scope || {};
      setScopeMode(existingScope.mode || 'all');

      if (
        existingScope.excludedControls &&
        Array.isArray(existingScope.excludedControls)
      ) {
        setExcludedControls(
          existingScope.excludedControls.map((e: any) => ({
            controlId: e.controlId,
            reason: e.reason,
          }))
        );
      }

      if (existingScope.totalAvailableControls) {
        setTotalAvailableControls(existingScope.totalAvailableControls);
      }

      setSelectedControls(initialData.scope?.controls || []);
      setSelectedProcesses(initialData.scope?.processes || []);
      setSelectedAreas(initialData.scope?.areas || []);

      // Reconstruir teamMembersByRole a partir do initialData
      const team: any = initialData.team || {};

      const leadAuditorArr: TeamMember[] = team.leadAuditor
        ? [{
            id: team.leadAuditor,
            name: team.leadAuditorName || team.leadAuditor,
            email: team.leadAuditorEmail || '',
            isManual: String(team.leadAuditor).startsWith('manual_'),
          }]
        : [];

      const auditorsArr: TeamMember[] = (team.auditors || []).map((id: string, i: number) => ({
        id,
        name: (team.auditorNames && team.auditorNames[i]) || id,
        email: (team.auditorEmails && team.auditorEmails[i]) || '',
        isManual: String(id).startsWith('manual_'),
      }));

      const observersArr: TeamMember[] = (team.observers || []).map((id: string, i: number) => ({
        id,
        name: (team.observerNames && team.observerNames[i]) || id,
        email: (team.observerEmails && team.observerEmails[i]) || '',
        isManual: String(id).startsWith('manual_'),
      }));

      setTeamMembersByRole({
        leadAuditor: leadAuditorArr,
        auditors: auditorsArr,
        observers: observersArr,
      });
    }
  }, [initialData]);

  // ============================================================
  // CONTROLES EFETIVOS (MODO 'all')
  // ============================================================

  const effectiveControls = useMemo(() => {
    if (scopeMode === 'custom') {
      return selectedControls;
    }

    const excludedIds = new Set(excludedControls.map((e) => e.controlId));
    return controls
      .map((c) => String(c.id || c.controlId || c.code || c._id))
      .filter((id) => !excludedIds.has(id));
  }, [scopeMode, controls, selectedControls, excludedControls]);

  // ============================================================
  // OPÇÕES DE MEMBROS (usuários do sistema + manuais)
  // ============================================================

  const rawUsers: any[] = Array.isArray(usersData)
    ? usersData
    : (usersData as any)?.users || [];

  const allMemberOptions: TeamMember[] = useMemo(() => {
    const users: TeamMember[] = (rawUsers || [])
      .filter((u: any) => u.role === 'rep' || u.role === 'admin' || u.role === 'user')
      .map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        isManual: false,
      }));

    return [...users, ...manualMembers];
  }, [rawUsers, manualMembers]);

  // ============================================================
  // HANDLERS — ESCOPO
  // ============================================================

  const handleScopeModeChange = (newMode: ScopeMode) => {
    if (scopeMode === newMode) return;

    if (newMode === 'all') {
      setSelectedControls([]);
    } else {
      setExcludedControls([]);
    }

    setScopeMode(newMode);
  };

  // ============================================================
  // HANDLERS — EXCLUSÃO DE CONTROLES
  // ============================================================

  const openExclusionDialog = (controlId: string) => {
    setExclusionDialogControlId(controlId);
    setExclusionReason('');
  };

  const closeExclusionDialog = () => {
    setExclusionDialogControlId(null);
    setExclusionReason('');
  };

  const confirmExclusion = () => {
    if (!exclusionDialogControlId) return;

    const trimmedReason = exclusionReason.trim();

    if (trimmedReason.length < MIN_EXCLUSION_REASON_LENGTH) {
      toast.error(
        `A justificativa deve ter no mínimo ${MIN_EXCLUSION_REASON_LENGTH} caracteres`
      );
      return;
    }

    const alreadyExcluded = excludedControls.some(
      (e) => e.controlId === exclusionDialogControlId
    );

    if (alreadyExcluded) {
      toast.error('Este controle já está excluído');
      return;
    }

    const willRemain =
      controls.length - (excludedControls.length + 1);

    if (willRemain <= 0) {
      toast.error(
        'Não é permitido excluir todos os controles. A auditoria deve ter pelo menos 1 controle em escopo'
      );
      return;
    }

    setExcludedControls([
      ...excludedControls,
      {
        controlId: exclusionDialogControlId,
        reason: trimmedReason,
      },
    ]);

    closeExclusionDialog();
    toast.success('Controle excluído. A exclusão ficará pendente de aprovação do Auditor Líder.');
  };

  const cancelExclusion = (controlId: string) => {
    setExcludedControls(excludedControls.filter((e) => e.controlId !== controlId));
    toast.success('Exclusão removida. O controle voltou ao escopo.');
  };

  // ============================================================
  // HANDLERS — FORMULÁRIO
  // ============================================================

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

  // ============================================================
  // 🆕 v49.1.1 — HANDLERS DE CRITÉRIOS (MELHORADOS)
  // ============================================================
  //
  // MOTIVO:
  //   Garantir que NENHUM critério digitado seja perdido.
  //   Adiciona suporte a auto-flush no submit.
  //
  // ============================================================

  const handleAddCriteria = () => {
    const trimmed = newCriteria.trim();
    if (!trimmed) return;

    const current = formData.criteria || [];
    if (current.includes(trimmed)) {
      setNewCriteria('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      criteria: [...(prev.criteria || []), trimmed],
    }));
    setNewCriteria('');
  };

  /**
   * 🆕 v49.1.1 — Auto-flush de critério pendente
   *
   * Se o usuário digitou algo no input e não apertou Enter nem
   * clicou no +, este método garante que o valor seja adicionado
   * antes do submit.
   *
   * @returns {string[]} Array de critérios atualizado (para uso imediato no submit)
   */
  const flushPendingCriteria = (): string[] => {
    const trimmed = newCriteria.trim();
    const current = formData.criteria || [];

    if (!trimmed) return current;
    if (current.includes(trimmed)) return current;

    const updated = [...current, trimmed];
    setFormData((prev) => ({ ...prev, criteria: updated }));
    setNewCriteria('');
    return updated;
  };

  const handleRemoveCriteria = (criteria: string) => {
    setFormData((prev) => ({
      ...prev,
      criteria: (prev.criteria || []).filter((c) => c !== criteria),
    }));
  };

  // ============================================================
  // HANDLERS — EQUIPE (POR PAPEL)
  // ============================================================

  const handleTeamRoleChange = (role: TeamRole, members: TeamMember[]) => {
    setTeamMembersByRole((prev) => ({
      ...prev,
      [role]: members,
    }));

    const errorKey = role === 'leadAuditor' ? 'leadAuditor' : role;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleAddManualMember = (payload: { name: string; email: string }): TeamMember | null => {
    const trimmedName = payload.name.trim();
    const trimmedEmail = payload.email.trim();

    if (!trimmedName) {
      toast.error('Nome do auditor é obrigatório');
      return null;
    }

    const exists = allMemberOptions.some(
      (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      toast.error('Este auditor já existe');
      return null;
    }

    const newMember: TeamMember = {
      id: `manual_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@auditor.local`,
      isManual: true,
    };

    const updated = [...manualMembers, newMember];
    setManualMembers(updated);
    saveManualMembers(updated);

    return newMember;
  };

  const handleRemoveManualMember = (id: string) => {
    const updated = manualMembers.filter((m) => m.id !== id);
    setManualMembers(updated);
    saveManualMembers(updated);
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================

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
    if (teamMembersByRole.leadAuditor.length === 0) {
      newErrors.leadAuditor = 'Auditor líder é obrigatório';
    }
    if (!formData.period?.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }
    if (!formData.period?.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (scopeMode === 'all') {
      if (effectiveControls.length === 0) {
        newErrors.controls = 'O plano precisa ter pelo menos 1 controle no escopo';
      }

      const invalidExclusions = excludedControls.filter(
        (e) => e.reason.trim().length < MIN_EXCLUSION_REASON_LENGTH
      );
      if (invalidExclusions.length > 0) {
        newErrors.controls = `Toda exclusão precisa ter justificativa com no mínimo ${MIN_EXCLUSION_REASON_LENGTH} caracteres`;
      }
    }

    if (scopeMode === 'custom') {
      if (selectedControls.length === 0) {
        newErrors.controls = 'Selecione pelo menos um controle';
      }
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

  // ============================================================
  // SUBMIT — 🆕 v49.1.1 CORRIGIDO
  // ============================================================
  //
  // CORREÇÕES APLICADAS (v49.1.1):
  //   1. `controls` só é enviado em modo 'custom' (corrige erro 400)
  //   2. `excludedControls` só é enviado se houver exclusões
  //   3. `flushPendingCriteria()` garante que critério digitado
  //      no input e não confirmado NÃO seja perdido
  //
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🆕 v49.1.1 — Auto-flush de critério pendente ANTES de validar
    const flushedCriteria = flushPendingCriteria();

    if (!validate()) return;

    const leadAuditorMember = teamMembersByRole.leadAuditor[0];
    const auditorsMembers = teamMembersByRole.auditors;
    const observersMembers = teamMembersByRole.observers;

    // 🆕 v49.1.1 — Montar scope respeitando o modo
    const scopePayload: any = {
      mode: scopeMode,
      processes: selectedProcesses,
      areas: selectedAreas,
    };

    // Só envia `controls` em modo 'custom'.
    // Em modo 'all', o backend popula automaticamente com TODOS
    // os controles da empresa e rejeita a presença deste campo
    // (proteção de integridade ISO 19011:2018 §5.5).
    if (scopeMode === 'custom') {
      scopePayload.controls = effectiveControls;
    }

    // Só envia `excludedControls` se houver exclusões efetivas
    if (scopeMode === 'all' && excludedControls.length > 0) {
      scopePayload.excludedControls = excludedControls;
    }

    const data: CreateAuditPlanDTO = {
      code: formData.code || `AUD-${Date.now().toString().slice(-6)}`,
      title: formData.title!,
      description: formData.description!,

      scope: scopePayload,

      period: {
        startDate: new Date(formData.period!.startDate!),
        endDate: new Date(formData.period!.endDate!),
        estimatedDays: formData.period?.estimatedDays || 30,
      },

      team: {
        leadAuditor: leadAuditorMember.id,
        leadAuditorName: leadAuditorMember.name,
        leadAuditorEmail: leadAuditorMember.email,

        auditors: auditorsMembers.map((m) => m.id),
        auditorNames: auditorsMembers.map((m) => m.name),
        auditorEmails: auditorsMembers.map((m) => m.email),

        observers: observersMembers.map((m) => m.id),
        observerNames: observersMembers.map((m) => m.name),
        observerEmails: observersMembers.map((m) => m.email),
      },

      // 🆕 v49.1.1 — Usa critérios com flush aplicado
      criteria: flushedCriteria,
    };

    await onSubmit(data);
  };

  // ============================================================
  // OPÇÕES DE CONTROLES
  // ============================================================

  const controlOptions = controls.map((c) => {
    const code = c.id || c.controlId || c.code || '';
    const name = c.nome || c.name || c.title || '';
    const val = code || c._id;
    const label = code && name ? `${code} - ${name}` : code || name || String(val);

    const level = String(c.maturityLevel ?? '');
    let badge = undefined;

    if (level === '0') {
      badge = { label: 'Não Implementado', bg: '#ef4444', color: '#ffffff' };
    } else if (level === '1') {
      badge = { label: 'Parcialmente Implementado', bg: '#eab308', color: '#1f2937' };
    } else if (parseInt(level) >= 2) {
      badge = { label: 'Implementado', bg: '#22c55e', color: '#ffffff' };
    }

    return {
      value: String(val),
      label: String(label),
      badge,
    };
  });

  const getControlLabelById = (controlId: string) => {
    const opt = controlOptions.find((o) => o.value === controlId);
    return opt ? opt.label : controlId;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ======================================================== */}
      {/* INFORMAÇÕES BÁSICAS */}
      {/* ======================================================== */}
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
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ESCOPO DA AUDITORIA (OPÇÃO C) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Escopo da Auditoria</h2>
        <p className="text-sm text-gray-500 mb-4">
          Defina como os controles ISO 27001 serão selecionados para esta auditoria.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de seleção de controles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleScopeModeChange('all')}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                scopeMode === 'all'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  scopeMode === 'all'
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {scopeMode === 'all' && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-900">
                    Todos os controles (padrão)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cobertura total. Todos os {totalAvailableControls || '93'} controles
                  da empresa entram no escopo. Exclusões exigem justificativa e
                  aprovação do Auditor Líder.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleScopeModeChange('custom')}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                scopeMode === 'custom'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  scopeMode === 'custom'
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {scopeMode === 'custom' && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    Seleção personalizada
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Você escolhe quais controles auditar. Recomendado apenas para
                  auditorias de escopo reduzido.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            {scopeMode === 'all' ? (
              <>
                <strong>Modo "Todos":</strong> {effectiveControls.length} controle(s)
                em escopo · {excludedControls.length} excluído(s) ·{' '}
                {totalAvailableControls} disponíveis.
              </>
            ) : (
              <>
                <strong>Modo "Personalizado":</strong> {effectiveControls.length}{' '}
                controle(s) selecionado(s) manualmente de {totalAvailableControls}{' '}
                disponíveis.
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Controles ISO 27001 <span className="text-red-500">*</span>
            </label>

            {scopeMode === 'all' && (
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto bg-white">
                {isLoadingControls ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Carregando controles...
                  </div>
                ) : controlOptions.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Nenhum controle disponível
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {controlOptions.map((opt) => {
                      const isExcluded = excludedControls.some(
                        (e) => e.controlId === opt.value
                      );
                      const exclusion = excludedControls.find(
                        (e) => e.controlId === opt.value
                      );

                      return (
                        <li
                          key={opt.value}
                          className={`px-3 py-2 flex items-start gap-2 ${
                            isExcluded ? 'bg-red-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-medium truncate ${
                                  isExcluded
                                    ? 'text-red-700 line-through'
                                    : 'text-gray-900'
                                }`}
                              >
                                {opt.label}
                              </span>
                              {opt.badge && !isExcluded && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: opt.badge.bg,
                                    color: opt.badge.color,
                                  }}
                                >
                                  {opt.badge.label}
                                </span>
                              )}
                              {isExcluded && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-600 text-white">
                                  Excluído
                                </span>
                              )}
                            </div>
                            {isExcluded && exclusion && (
                              <p className="text-[10px] text-red-600 mt-1 italic">
                                Motivo: {exclusion.reason}
                              </p>
                            )}
                          </div>
                          {isExcluded ? (
                            <button
                              type="button"
                              onClick={() => cancelExclusion(opt.value)}
                              className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Remover exclusão (devolver ao escopo)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openExclusionDialog(opt.value)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Excluir este controle do escopo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {scopeMode === 'custom' && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedControls.map((controlVal) => {
                    const option = controlOptions.find((opt) => opt.value === controlVal);
                    const controlLabel = option ? option.label : controlVal;
                    return (
                      <span
                        key={controlVal}
                        className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                      >
                        {controlLabel}
                        <button
                          type="button"
                          onClick={() => handleScopeChange('controls', controlVal)}
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
                  <CustomSelect
                    value=""
                    onChange={(val) => handleScopeChange('controls', val)}
                    options={controlOptions.filter(
                      (c) => !selectedControls.includes(c.value)
                    )}
                    placeholder="Selecione um controle..."
                    className="w-full"
                  />
                )}
              </>
            )}

            {errors.controls && (
              <p className="text-sm text-red-500 mt-1">{errors.controls}</p>
            )}
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">Selecione um processo...</option>
              {PROCESS_OPTIONS.filter((p) => !selectedProcesses.includes(p)).map((process) => (
                <option key={process} value={process} className="text-gray-900">
                  {process}
                </option>
              ))}
            </select>
            {errors.processes && (
              <p className="text-sm text-red-500 mt-1">{errors.processes}</p>
            )}
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">Selecione uma área...</option>
              {AREA_OPTIONS.filter((a) => !selectedAreas.includes(a)).map((area) => (
                <option key={area} value={area} className="text-gray-900">
                  {area}
                </option>
              ))}
            </select>
            {errors.areas && (
              <p className="text-sm text-red-500 mt-1">{errors.areas}</p>
            )}
          </div>
        </div>

        {exclusionDialogControlId && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  Justificar exclusão do controle
                </h3>
                <p className="text-xs text-red-700 mb-3">
                  <strong>{getControlLabelById(exclusionDialogControlId)}</strong>
                  <br />
                  A justificativa é obrigatória (mínimo {MIN_EXCLUSION_REASON_LENGTH}{' '}
                  caracteres) e ficará registrada para auditoria (ISO 19011:2018).
                </p>

                <textarea
                  value={exclusionReason}
                  onChange={(e) => setExclusionReason(e.target.value)}
                  placeholder="Ex: Controle não aplicável ao escopo desta auditoria porque..."
                  rows={3}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                  autoFocus
                />

                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs ${
                      exclusionReason.trim().length >= MIN_EXCLUSION_REASON_LENGTH
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {exclusionReason.trim().length}/{MIN_EXCLUSION_REASON_LENGTH}{' '}
                    caracteres
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeExclusionDialog}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmExclusion}
                      disabled={
                        exclusionReason.trim().length < MIN_EXCLUSION_REASON_LENGTH
                      }
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirmar exclusão
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* EQUIPE (v49.1) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          Equipe de Auditoria
        </h2>

        {manualMembers.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Auditores manuais disponíveis:
            </p>
            <div className="flex flex-wrap gap-2">
              {manualMembers.map((member) => (
                <span
                  key={member.id}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {member.name} ({member.email})
                  <button
                    type="button"
                    onClick={() => handleRemoveManualMember(member.id)}
                    className="hover:text-red-500"
                    aria-label={`Remover ${member.name} da lista de manuais`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TeamMemberPicker
            label="Auditor Líder"
            role="leadAuditor"
            required
            multiple={false}
            value={teamMembersByRole.leadAuditor}
            onChange={(members) => handleTeamRoleChange('leadAuditor', members)}
            options={allMemberOptions}
            onAddManual={handleAddManualMember}
            onRemoveManual={handleRemoveManualMember}
            error={errors.leadAuditor}
            hint="1 auditor líder (ISO 19011:2018 §5.5.3)"
          />

          <TeamMemberPicker
            label="Auditores"
            role="auditors"
            multiple
            value={teamMembersByRole.auditors}
            onChange={(members) => handleTeamRoleChange('auditors', members)}
            options={allMemberOptions}
            onAddManual={handleAddManualMember}
            onRemoveManual={handleRemoveManualMember}
            hint="Adicione quantos forem necessários"
          />

          <TeamMemberPicker
            label="Observadores"
            role="observers"
            multiple
            value={teamMembersByRole.observers}
            onChange={(members) => handleTeamRoleChange('observers', members)}
            options={allMemberOptions}
            onAddManual={handleAddManualMember}
            onRemoveManual={handleRemoveManualMember}
            hint="Adicione quantos forem necessários"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* PERÍODO */}
      {/* ======================================================== */}
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
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
            )}
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
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
            )}
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
                  period: {
                    ...prev.period!,
                    estimatedDays: parseInt(e.target.value) || 30,
                  },
                }))
              }
              min={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
            <p className="text-xs text-gray-400 mt-1">
              Número estimado de dias para a auditoria
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CRITÉRIOS (v49.1.1 — com onBlur) */}
      {/* ======================================================== */}
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
              <button
                type="button"
                onClick={() => handleRemoveCriteria(c)}
                className="hover:text-red-500"
              >
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
            onBlur={handleAddCriteria}
            placeholder="Ex: ISO 27001:2022, Política de SI, Requisitos Legais"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

      {/* ======================================================== */}
      {/* ERRO GERAL */}
      {/* ======================================================== */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* AÇÕES */}
      {/* ======================================================== */}
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