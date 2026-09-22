// ============================================================
// TIPOS DO MÓDULO DE AUDITORIA INTERNA (FRONTEND)
// ============================================================

export type AuditStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/**
 * Tipo de constatação de auditoria.
 *
 * Valores alinhados com:
 *   - Modelo AuditFinding.ts (enum MongoDB)
 *   - Schema Zod (createAuditFindingSchema)
 *   - Documento "Exemplo - RELATÓRIO DE AUDITORIA.docx"
 *   - ISO 19011:2018
 *
 * Siglas:
 *   NC_A = Não Conformidade Maior
 *   NC_B = Não Conformidade Menor
 *   CM   = Comentário
 *   OM   = Oportunidade de Melhoria
 *   AP   = Boas Práticas / Aspecto Positivo
 */
export type AuditFindingType =
  | 'NC_A'
  | 'NC_B'
  | 'CM'
  | 'OM'
  | 'AP';

export type AuditFindingStatus =
  | 'open'
  | 'in_progress'
  | 'pending_validation'
  | 'closed'
  | 'reopened';

export type AuditActionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export type AuditReportStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected';

export type AuditChecklistStatus =
  | 'pending'
  | 'in_progress'
  | 'completed';

// ============================================================
// TIPOS DE ESCOPO E EXCLUSÃO (Opção C)
// ============================================================

/**
 * Modo de definição do escopo do plano de auditoria.
 *
 * - 'all'    → Todos os controles da empresa entram no escopo.
 *              Exclusões são feitas via excludedControls.
 *
 * - 'custom' → Apenas os controles informados em scope.controls
 *              entram no escopo. Não permite excludedControls.
 */
export type AuditScopeMode = 'all' | 'custom';

/**
 * Registro de exclusão de controle do escopo.
 *
 * Mantido no plano para rastreabilidade (ISO 19011:2018).
 * Toda exclusão exige justificativa e aprovação do Auditor Líder.
 */
export interface IAuditExcludedControl {
  controlId: string;
  reason: string;
  excludedBy: string;
  excludedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================================
// PLANO DE AUDITORIA
// ============================================================

export interface AuditPlan {
  _id: string;
  id: string;

  // Empresa
  companyId: string;

  // Identificação
  title: string;
  description: string;
  code?: string;

  // Programa de auditoria
  programId?: string;

  // Escopo
  scope: {
    mode: AuditScopeMode;
    controls: string[];
    excludedControls: IAuditExcludedControl[];
    processes: string[];
    areas: string[];
    totalAvailableControls: number;
  };

  // Período
  period: {
    startDate: string;
    endDate: string;
    estimatedDays?: number;
  };

  // Equipe
  team: {
    leadAuditor: string;
    auditors: string[];
    observers: string[];
    specialists?: string[];
  };

  // Critérios
  criteria: string[];

  // Status
  status: AuditStatus;

  // Criação
  createdBy: string;
  createdAt: string;

  // Aprovação
  approvedBy?: string;
  approvedAt?: string;

  // Rejeição
  rejectionReason?: string;

  // Execução
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;

  // Observações
  observations?: string;

  // Atualização
  updatedAt: string;

  // Soft delete
  deletedAt?: string;
}

// ============================================================
// CHECKLIST DE AUDITORIA
// ============================================================

/**
 * Interface legada/compatibilidade.
 *
 * Mantida para evitar quebra de componentes ou serviços
 * que ainda utilizem a nomenclatura descritiva dos resultados.
 */
export interface IAuditChecklistItem {
  question: string;

  answer:
    | 'conforme'
    | 'nao_conforme'
    | 'nao_aplicavel';

  observations: string;

  evidenceIds: string[];

  responsible?: string;

  answeredAt?: string;

  answeredBy?: string;
}

/**
 * Interface principal utilizada pelo modelo AuditChecklist.
 */
export interface AuditChecklistQuestion {
  question: string;

  /**
   * C  = Conforme
   * NC = Não Conforme
   * OB = Observação
   * OM = Oportunidade
   * NA = Não Aplicável
   * -- = Não Respondido
   */
  answer: 'C' | 'NC' | 'NA' | 'OB' | 'OM' | '--';

  observations: string;

  evidenceIds: string[];

  responsible: string;

  answeredAt?: string;

  answeredBy?: string;
}

export interface AuditChecklist {
  _id: string;

  id: string;

  auditPlanId: string;

  controlId: string;

  questions: AuditChecklistQuestion[];

  statistics: {
    total: number;
    conforme: number;
    nonConforme: number;
    observacao: number;
    oportunidade: number;
    naoAplicavel: number;
  };

  status: AuditChecklistStatus;

  completedBy?: string;
  completedAt?: string;

  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  deletedAt?: string;
}

// ============================================================
// NÃO CONFORMIDADE (FINDING)
// ============================================================

export interface AuditFinding {
  _id: string;
  id: string;

  auditPlanId: string;
  checklistId?: string;

  number: string;

  type: AuditFindingType;

  title: string;
  description: string;

  area: string;
  process: string;

  clause: string;

  controlId?: string;

  evidenceIds: string[];

  actionPlanIds: string[];

  deadline?: string;

  status: AuditFindingStatus;

  createdBy: string;
  createdAt: string;

  validatedBy?: string;
  validatedAt?: string;

  validationComment?: string;

  updatedAt: string;

  deletedAt?: string;
}

// ============================================================
// EVIDÊNCIA DE AUDITORIA
// ============================================================

export interface AuditEvidence {
  _id: string;
  id: string;

  auditPlanId: string;
  findingId?: string;

  filename: string;
  filepath: string;
  mimeType: string;
  size: number;

  description: string;

  uploadedBy: string;
  uploadedAt: string;

  deletedAt?: string;
}

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export interface AuditActionPlan {
  _id: string;
  id: string;

  findingId: string;
  auditPlanId: string;
  companyId: string;

  action: string;
  description?: string;

  responsible: string;

  deadline: string;

  evidenceIds: string[];

  status: AuditActionStatus;

  createdBy: string;
  createdAt: string;

  validatedBy?: string;
  validatedAt?: string;
  validationComment?: string;

  updatedAt: string;
  updatedBy?: string;

  deletedAt?: string;
}

// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================

export interface AuditReportFinding {
  id: string;
  number: string;

  type: AuditFindingType;

  title: string;
  description: string;

  area: string;
  process: string;

  clause: string;

  status: AuditFindingStatus;

  evidenceIds: string[];

  actionPlanIds: string[];

  createdBy: string;
  createdAt: string;

  updatedAt: string;
}

export interface AuditReport {
  _id: string;
  id: string;

  auditPlanId: string;
  companyId: string;

  version: string;

  organization: {
    legalName: string;
    corporateGroup?: string;
    address: string;
    country: string;
    contact: string;
    website?: string;
    industry: string;
  };

  summary: string;
  conclusion: string;

  findings: AuditReportFinding[];

  recommendations: string[];

  status: AuditReportStatus;

  createdBy: string;
  createdAt: string;

  approvedBy?: string;
  approvedAt?: string;

  rejectionReason?: string;

  updatedAt: string;

  deletedAt?: string;
}

// ============================================================
// DTOs - PLANO DE AUDITORIA
// ============================================================

export interface CreateAuditPlanDTO {
  code?: string;
  title: string;

  description: string;

  /**
   * Escopo do plano.
   *
   * - mode 'all' (padrão): todos os controles da empresa.
   *   Neste caso, scope.controls é ignorado no create
   *   (o service popula automaticamente).
   *
   * - mode 'custom': apenas os controles informados em controls.
   */
  scope: {
    mode?: AuditScopeMode;
    controls?: string[];
    excludedControls?: Array<{ controlId: string; reason: string }>;
    processes: string[];
    areas: string[];
  };

  period: {
    startDate: Date | string;
    endDate: Date | string;
    estimatedDays?: number;
  };

  team: {
    leadAuditor: string;
    auditors: string[];
    observers?: string[];
    specialists?: string[];
  };

  criteria: string[];
}

export interface UpdateAuditPlanDTO {
  title?: string;

  description?: string;

  scope?: {
    controls?: string[];
    processes?: string[];
    areas?: string[];
  };

  period?: {
    startDate?: Date | string;
    endDate?: Date | string;
  };

  team?: {
    leadAuditor?: string;
    auditors?: string[];
    observers?: string[];
    specialists?: string[];
  };

  criteria?: string[];

  status?: AuditStatus;

  observations?: string;
}

// ============================================================
// DTOs - EXCLUSÃO DE CONTROLE
// ============================================================

export interface ExcludeControlDTO {
  controlId: string;
  reason: string;
}

export interface ApproveExclusionDTO {
  controlId: string;
}

export interface RejectExclusionDTO {
  controlId: string;
}

export interface RemoveExclusionDTO {
  controlId: string;
}

// ============================================================
// DTOs - NÃO CONFORMIDADE
// ============================================================

export interface CreateAuditFindingDTO {
  type: AuditFindingType;

  title: string;

  description: string;

  area: string;

  process: string;

  clause: string;

  controlId?: string;

  evidenceIds?: string[];

  deadline?: Date | string;
}

export interface UpdateAuditFindingDTO {
  title?: string;

  description?: string;

  area?: string;

  process?: string;

  clause?: string;

  evidenceIds?: string[];

  status?: AuditFindingStatus;

  deadline?: Date | string;
}

// ============================================================
// DTOs - PLANO DE AÇÃO
// ============================================================

export interface CreateAuditActionPlanDTO {
  findingId: string;

  action: string;

  description?: string;

  responsible: string;

  deadline: Date | string;
}

export interface UpdateAuditActionPlanDTO {
  action?: string;

  description?: string;

  responsible?: string;

  deadline?: Date | string;

  evidenceIds?: string[];

  status?: AuditActionStatus;
}

// ============================================================
// DTOs - RELATÓRIO DE AUDITORIA
// ============================================================

export interface CreateAuditReportDTO {
  auditPlanId: string;

  summary: string;

  conclusion: string;

  recommendations: string[];

  findings: AuditReportFinding[];
}

export interface UpdateAuditReportDTO {
  summary?: string;

  conclusion?: string;

  recommendations?: string[];

  findings?: AuditReportFinding[];

  status?: AuditReportStatus;
}

// ============================================================
// DTOs - RISCO (frontend)
// ============================================================

/**
 * DTO para criação de risco (frontend).
 *
 * Mantido em paridade com o schema Zod do backend
 * (createAuditRiskSchema).
 */
export interface CreateAuditRiskDTO {
  companyId?: string;
  auditPlanId?: string;
  description: string;
  eventOrAsset: string;
  owner: string;
  threat: string;
  vulnerability: string;
  existingControl: string;
  probability: number;
  impact: number;
  riskClassification: string;
  treatment?: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  treatmentPlan?: string;
  probabilityAfter?: number;
  impactAfter?: number;
  treatmentDeadline?: Date | string;
  status?: 'identified' | 'analyzed' | 'treated' | 'monitored' | 'closed';
}

/**
 * DTO para atualização de risco (frontend).
 */
export interface UpdateAuditRiskDTO {
  description?: string;
  eventOrAsset?: string;
  owner?: string;
  threat?: string;
  vulnerability?: string;
  existingControl?: string;
  probability?: number;
  impact?: number;
  riskClassification?: string;
  treatment?: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  treatmentPlan?: string;
  probabilityAfter?: number;
  impactAfter?: number;
  treatmentDeadline?: Date | string;
  status?: 'identified' | 'analyzed' | 'treated' | 'monitored' | 'closed';
}

// ============================================================
// FILTROS E CONSULTAS
// ============================================================

export interface AuditFilters {
  companyId?: string;

  status?: AuditStatus;

  startDate?: Date;

  endDate?: Date;

  leadAuditor?: string;

  auditor?: string;

  search?: string;
}

export interface AuditFindingFilters {
  auditPlanId?: string;

  type?: AuditFindingType;

  status?: AuditFindingStatus;

  area?: string;

  createdBy?: string;
}

export interface AuditReportFilters {
  auditPlanId?: string;

  status?: AuditReportStatus;

  createdBy?: string;
}

// ============================================================
// ESTATÍSTICAS DE AUDITORIA
// ============================================================

export interface AuditStats {
  totalPlans: number;

  totalAudits: number;

  totalFindings: number;

  totalNcA: number;

  totalNcB: number;

  openFindings: number;

  closedFindings: number;

  pendingActions: number;

  completedActions: number;
}

export interface AuditFindingStats {
  total: number;

  ncA: number;
  ncB: number;
  comment: number;
  opportunity: number;
  positive: number;

  open: number;
  inProgress: number;
  pendingValidation: number;
  closed: number;
  reopened: number;
}

export interface AuditChecklistStats {
  total: number;

  conforme: number;
  nonConforme: number;
  observacao: number;
  oportunidade: number;
  naoAplicavel: number;

  pending: number;
  inProgress: number;
  completed: number;
}

// ============================================================
// PERGUNTAS PRÉ-DEFINIDAS PARA CHECKLIST
// ============================================================

export interface IAuditQuestion {
  controlId: string;

  question: string;

  category:
    | 'organizational'
    | 'people'
    | 'physical'
    | 'technological';
}