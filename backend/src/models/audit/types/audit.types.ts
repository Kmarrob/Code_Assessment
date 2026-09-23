// ============================================================
// TIPOS DO MÓDULO DE AUDITORIA INTERNA
// ============================================================

// ============================================================
// TIPOS BASE
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

export type AuditScopeMode = 'all' | 'custom';

// ============================================================
// TIPOS — PROGRAMA DE AUDITORIAS
// ============================================================

export type AuditProgramStatus =
  | 'draft'
  | 'approved'
  | 'active'
  | 'archived';

export type SectorImportance = 'critical' | 'standard';

export type SectorFrequency = 'annual' | 'semiannual' | 'quarterly';

export type ExternalAuditStatus =
  | 'not_planned'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface IAuditProgramSector {
  name: string;
  processes: string[];
  importance: SectorImportance;
  scoreA: number;
  scoreB: number;
  frequency: SectorFrequency;
  nextAuditDate?: Date;
}

export interface IAuditProgramSupplierAudit {
  supplierName: string;
  supplierId?: string;
  auditDate: Date;
  scope: string;
}

export interface IAuditProgramExternalAudit {
  plannedDate?: Date;
  certificationBody?: string;
  scope?: string;
  status: ExternalAuditStatus;
}

export interface IAuditProgramActivity {
  name: string;
  description?: string;
  scheduledDate: Date;
}

export interface IAuditProgram {
  _id: string;
  id: string;

  companyId: string;
  year: number;

  sectors: IAuditProgramSector[];
  supplierAudits: IAuditProgramSupplierAudit[];
  externalAudit: IAuditProgramExternalAudit;
  otherActivities: IAuditProgramActivity[];

  observations?: string;

  status: AuditProgramStatus;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================

export interface IAuditSoAMotivators {
  business: boolean;
  risk: boolean;
  legal: boolean;
  contract: boolean;
}

export interface IAuditSoAControl {
  clause: string;
  title: string;
  objective: string;
  motivators: IAuditSoAMotivators;
  applicable: boolean;
  justification?: string;
  lastAssessmentDate?: Date;
  implemented: boolean;
  implementationDate?: Date;
  responsible?: string;
  evidence?: string;
}

export interface IAuditSoAStatistics {
  total: number;
  applicable: number;
  notApplicable: number;
  implemented: number;
  notImplemented: number;
}

export interface IAuditSoA {
  _id: string;
  id: string;

  companyId: string;
  version: string;

  controls: IAuditSoAControl[];

  statistics: IAuditSoAStatistics;

  observations?: string;

  status: 'draft' | 'approved' | 'archived';

  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — GESTÃO DE RISCOS
// ============================================================

export type RiskTreatment = 'accept' | 'mitigate' | 'transfer' | 'avoid';

export type RiskStatus =
  | 'identified'
  | 'analyzed'
  | 'treated'
  | 'monitored'
  | 'closed';

export interface IAuditRisk {
  _id: string;
  id: string;

  companyId: string;
  auditPlanId?: string;

  riskId: string;

  description: string;
  eventOrAsset: string;
  owner: string;

  threat: string;
  vulnerability: string;
  existingControl: string;

  probability: number;
  impact: number;
  riskLevel: number;
  riskClassification: string;

  treatment: RiskTreatment;
  treatmentPlan?: string;
  probabilityAfter?: number;
  impactAfter?: number;
  residualRisk?: number;
  treatmentDeadline?: Date;

  status: RiskStatus;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — REVISÃO DE DOCUMENTAÇÃO
// ============================================================

export type DocumentReviewStatus =
  | 'OK'
  | 'NC_A'
  | 'NC_B'
  | 'PI'
  | 'GP'
  | 'CM'
  | '--';

export interface IAuditDocumentReviewItem {
  clause: string;
  requirement: string;
  status: DocumentReviewStatus;
  observations?: string;
  reviewer: string;
  reviewDate: Date;
  documentId?: string;
  documentName?: string;
}

export interface IAuditDocumentReviewSummary {
  total: number;
  ok: number;
  ncA: number;
  ncB: number;
  pi: number;
  gp: number;
  cm: number;
  pending: number;
}

export interface IAuditDocumentReview {
  _id: string;
  id: string;

  companyId: string;
  auditPlanId: string;

  documents: IAuditDocumentReviewItem[];

  summary: IAuditDocumentReviewSummary;

  observations?: string;

  status: 'pending' | 'in_progress' | 'completed';

  createdBy: string;
  completedBy?: string;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — ESCOPO E EXCLUSÃO (Opção C)
// ============================================================

export interface IAuditExcludedControl {
  controlId: string;
  reason: string;
  excludedBy: string;
  excludedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================================
// TIPOS — PLANO DE AUDITORIA
// ============================================================

export interface IAuditPlanScope {
  mode: AuditScopeMode;
  controls: string[];
  excludedControls: IAuditExcludedControl[];
  processes: string[];
  areas: string[];
  totalAvailableControls: number;
}

// ============================================================
// 🆕 v49.1 — IAuditPlanTeam EXPANDIDO
// ============================================================
//
// MOTIVO DA ALTERAÇÃO:
//   A versão anterior salvava apenas os IDs dos auditores
//   (ex.: 'manual_1790110055011' ou ObjectId do User). Ao exibir
//   o card do plano, o frontend só conseguia mostrar o ID bruto,
//   pois não tinha o nome.
//
//   Agora, salvamos TAMBÉM o nome e o email de cada membro,
//   mantendo os IDs como fonte de verdade para autorização
//   e segregação de funções.
//
// COMPATIBILIDADE:
//   Todos os campos novos são OPCIONAIS (?). Planos antigos,
//   sem esses campos, continuam válidos — o frontend faz
//   fallback para o ID quando o nome não está disponível.
//
// DECISÃO DE ARQUITETURA (confirmada pelo stakeholder):
//   Opção A — 1 líder + N auditores + N observadores.
//   Mantém conformidade com ISO 19011:2018 §5.5.3.
//
// ============================================================

export interface IAuditPlanTeam {
  // ---- Campos originais (INALTERADOS) ----
  leadAuditor: string;         // User ID OU 'manual_xxx'
  auditors: string[];          // User IDs OU 'manual_xxx'
  observers: string[];         // User IDs OU 'manual_xxx'
  specialists?: string[];      // (opcional, já existia)

  // ---- 🆕 v49.1 — Nomes e emails resolvidos ----
  // Justificativa: permitir renderizar o card do plano
  // sem consultar localStorage nem User collection em loop.
  leadAuditorName?: string;
  leadAuditorEmail?: string;
  auditorNames?: string[];     // Alinhado por índice com `auditors`
  auditorEmails?: string[];    // Alinhado por índice com `auditors`
  observerNames?: string[];    // Alinhado por índice com `observers`
  observerEmails?: string[];   // Alinhado por índice com `observers`
}

export interface IAuditPlanPeriod {
  startDate: Date;
  endDate: Date;
  estimatedDays: number;
}

export interface IAuditPlan {
  _id: string;
  id: string;

  companyId: string;

  title: string;
  description: string;
  code?: string;

  programId?: string;

  scope: IAuditPlanScope;
  period: IAuditPlanPeriod;
  team: IAuditPlanTeam;

  criteria: string[];

  status: AuditStatus;

  createdBy: string;
  createdAt: Date;

  approvedBy?: string;
  approvedAt?: Date;

  rejectionReason?: string;

  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;

  observations?: string;

  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — CHECKLIST DE AUDITORIA
// ============================================================

export interface IAuditChecklistItem {
  question: string;
  answer:
    | 'conforme'
    | 'nao_conforme'
    | 'nao_aplicavel';
  observations: string;
  evidenceIds: string[];
  responsible?: string;
  answeredAt?: Date;
  answeredBy?: string;
}

export interface IAuditChecklistQuestion {
  question: string;
  answer: 'C' | 'NC' | 'NA' | 'OB' | 'OM' | '--';
  observations: string;
  evidenceIds: string[];
  responsible: string;
  answeredAt?: Date;
  answeredBy?: string;
}

export interface IAuditChecklistStatistics {
  total: number;
  conforme: number;
  nonConforme: number;
  observacao: number;
  oportunidade: number;
  naoAplicavel: number;
}

export interface IAuditChecklist {
  _id: string;
  id: string;

  auditPlanId: string;
  controlId: string;

  questions: IAuditChecklistQuestion[];

  statistics: IAuditChecklistStatistics;

  status: AuditChecklistStatus;

  completedBy?: string;
  completedAt?: Date;

  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — NÃO CONFORMIDADE (FINDING)
// ============================================================

export interface IAuditFinding {
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

  deadline?: Date;

  status: AuditFindingStatus;

  createdBy: string;
  createdAt: Date;

  validatedBy?: string;
  validatedAt?: Date;
  validationComment?: string;

  reopenedAt?: Date;
  reopenedBy?: string;
  reopenReason?: string;

  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — EVIDÊNCIA DE AUDITORIA
// ============================================================

export interface IAuditEvidence {
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
  uploadedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — PLANO DE AÇÃO
// ============================================================

export interface IAuditActionPlan {
  _id: string;
  id: string;

  findingId: string;
  auditPlanId: string;
  companyId: string;

  action: string;
  description?: string;

  responsible: string;

  deadline: Date;

  evidenceIds: string[];

  status: AuditActionStatus;

  createdBy: string;
  createdAt: Date;

  validatedBy?: string;
  validatedAt?: Date;
  validationComment?: string;

  updatedAt: Date;
  updatedBy?: string;

  deletedAt?: Date;
}

// ============================================================
// TIPOS — RELATÓRIO DE AUDITORIA
// ============================================================

export interface IAuditReportFinding {
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
  createdAt: Date;

  updatedAt: Date;
}

export interface IAuditReport {
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

  findings: IAuditReportFinding[];

  recommendations: string[];

  status: AuditReportStatus;

  createdBy: string;
  createdAt: Date;

  approvedBy?: string;
  approvedAt?: Date;

  rejectionReason?: string;

  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// DTOs — PLANO DE AUDITORIA
// ============================================================

// ============================================================
// 🆕 v49.1 — CreateAuditPlanDTO.team EXPANDIDO
// ============================================================
//
// MOTIVO: O frontend (AuditPlanForm.tsx) agora envia, além dos
// IDs, os nomes e emails resolvidos dos auditores. Isso permite
// que o backend persista essas informações sem precisar fazer
// lookup no User em cada exibição.
//
// COMPATIBILIDADE: Todos os campos novos são opcionais.
// Chamadas antigas (só com IDs) continuam funcionando.
//
// ============================================================

export interface CreateAuditPlanDTO {
  code?: string;
  title: string;
  description: string;

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
    // ---- Campos originais (INALTERADOS) ----
    leadAuditor: string;
    auditors: string[];
    observers?: string[];
    specialists?: string[];

    // ---- 🆕 v49.1 — Nomes e emails ----
    leadAuditorName?: string;
    leadAuditorEmail?: string;
    auditorNames?: string[];
    auditorEmails?: string[];
    observerNames?: string[];
    observerEmails?: string[];
  };

  criteria: string[];
}

// ============================================================
// 🆕 v49.1 — UpdateAuditPlanDTO.team EXPANDIDO
// ============================================================
//
// MOTIVO: A edição de planos deve preservar os nomes e emails
// dos auditores. Sem isso, ao editar um plano, o card voltaria
// a mostrar apenas os IDs brutos.
//
// COMPATIBILIDADE: Todos os campos novos são opcionais.
//
// ============================================================

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
    // ---- Campos originais (INALTERADOS) ----
    leadAuditor?: string;
    auditors?: string[];
    observers?: string[];
    specialists?: string[];

    // ---- 🆕 v49.1 — Nomes e emails ----
    leadAuditorName?: string;
    leadAuditorEmail?: string;
    auditorNames?: string[];
    auditorEmails?: string[];
    observerNames?: string[];
    observerEmails?: string[];
  };

  criteria?: string[];

  status?: AuditStatus;

  observations?: string;
}

// ============================================================
// DTOs — EXCLUSÃO DE CONTROLE
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
// DTOs — NÃO CONFORMIDADE
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
// DTOs — PLANO DE AÇÃO
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
// DTOs — RELATÓRIO DE AUDITORIA
// ============================================================

export interface CreateAuditReportDTO {
  auditPlanId: string;
  summary: string;
  conclusion: string;
  recommendations: string[];
  findings: IAuditReportFinding[];
}

export interface UpdateAuditReportDTO {
  summary?: string;
  conclusion?: string;
  recommendations?: string[];
  findings?: IAuditReportFinding[];
  status?: AuditReportStatus;
}

// ============================================================
// DTOs — RISCO (frontend + backend)
// ============================================================

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
  treatment?: RiskTreatment;
  treatmentPlan?: string;
  probabilityAfter?: number;
  impactAfter?: number;
  treatmentDeadline?: Date | string;
  status?: RiskStatus;
}

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
  treatment?: RiskTreatment;
  treatmentPlan?: string;
  probabilityAfter?: number;
  impactAfter?: number;
  treatmentDeadline?: Date | string;
  status?: RiskStatus;
}

// ============================================================
// DTOs — PROGRAMA DE AUDITORIAS
// ============================================================

export interface CreateAuditProgramDTO {
  companyId: string;
  year: number;
  sectors?: IAuditProgramSector[];
  supplierAudits?: IAuditProgramSupplierAudit[];
  externalAudit?: IAuditProgramExternalAudit;
  otherActivities?: IAuditProgramActivity[];
  observations?: string;
}

export interface UpdateAuditProgramDTO {
  year?: number;
  sectors?: IAuditProgramSector[];
  supplierAudits?: IAuditProgramSupplierAudit[];
  externalAudit?: IAuditProgramExternalAudit;
  otherActivities?: IAuditProgramActivity[];
  observations?: string;
}

// ============================================================
// DTOs — DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================

export interface CreateAuditSoADTO {
  companyId: string;
  version?: string;
  controls?: IAuditSoAControl[];
  observations?: string;
}

export interface UpdateAuditSoADTO {
  version?: string;
  controls?: IAuditSoAControl[];
  observations?: string;
}

// ============================================================
// DTOs — REVISÃO DE DOCUMENTAÇÃO
// ============================================================

export interface CreateAuditDocumentReviewDTO {
  companyId: string;
  auditPlanId: string;
  documents?: IAuditDocumentReviewItem[];
  observations?: string;
}

export interface UpdateAuditDocumentReviewDTO {
  documents?: IAuditDocumentReviewItem[];
  observations?: string;
}

// ============================================================
// FILTROS
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
// ESTATÍSTICAS
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
// PERGUNTAS
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