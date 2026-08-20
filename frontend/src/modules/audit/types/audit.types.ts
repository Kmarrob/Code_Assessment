// ============================================================
// TIPOS DO MÓDULO DE AUDITORIA INTERNA (SGSI)
// ============================================================

// ============================================================
// ENUMS
// ============================================================

export type AuditStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type AuditFindingType = 'nc_a' | 'nc_b' | 'comment' | 'opportunity' | 'positive';
export type AuditFindingStatus = 'open' | 'in_progress' | 'pending_validation' | 'closed' | 'reopened';
export type AuditActionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type AuditReportStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type AuditChecklistStatus = 'pending' | 'in_progress' | 'completed';
export type AuditChecklistAnswer = 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';

// ============================================================
// 🆕 NOVO (v46.0) - ENUMS PARA FUNCIONALIDADES ADICIONAIS
// ============================================================

export type AuditRiskLevel = 'baixo' | 'medio' | 'alto' | 'critico';
export type AuditRiskStatus = 'identified' | 'assessed' | 'treated' | 'monitored' | 'closed' | 'reopened';
export type AuditSoAStatus = 'draft' | 'approved' | 'archived';
export type AuditProgramStatus = 'draft' | 'approved' | 'active' | 'archived';
export type AuditDocumentReviewStatus = 'in_progress' | 'completed';
export type AuditDocumentStatus = 'pendente' | 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';

// ============================================================
// PLANO DE AUDITORIA
// ============================================================

export interface AuditPlan {
  _id: string;
  id: string;
  companyId: string;
  title: string;
  description: string;
  scope: { controls: string[]; processes: string[]; areas: string[] };
  period: { startDate: string; endDate: string };
  team: { leadAuditor: string; auditors: string[]; observers: string[] };
  criteria: string[];
  status: AuditStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  updatedAt: string;
}

// ============================================================
// CHECKLIST
// ============================================================

export interface AuditChecklistItem {
  question: string;
  answer: AuditChecklistAnswer;
  observations: string;
  evidenceIds: string[];
  responsible?: string;
  answeredAt?: string;
  answeredBy?: string;
}

export interface AuditChecklist {
  _id: string;
  id: string;
  auditPlanId: string;
  controlId: string;
  questions: AuditChecklistItem[];
  status: AuditChecklistStatus;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// NÃO CONFORMIDADE
// ============================================================

export interface AuditFinding {
  _id: string;
  id: string;
  auditPlanId: string;
  type: AuditFindingType;
  title: string;
  description: string;
  area: string;
  clause: string;
  evidenceIds: string[];
  status: AuditFindingStatus;
  createdBy: string;
  createdAt: string;
  validatedBy?: string;
  validatedAt?: string;
  updatedAt: string;
}

// ============================================================
// EVIDÊNCIA
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
}

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export interface AuditActionPlan {
  _id: string;
  id: string;
  findingId: string;
  action: string;
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
}

// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================

export interface AuditReport {
  _id: string;
  id: string;
  auditPlanId: string;
  summary: string;
  conclusion: string;
  findings: string[];
  recommendations: string[];
  status: AuditReportStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  updatedAt: string;
}

// ============================================================
// 🆕 NOVO (v46.0) - RISCOS
// ============================================================

export interface AuditRisk {
  _id: string;
  id: string;
  companyId: string;
  auditPlanId: string;
  riskId: string;
  description: string;
  owner: string;
  threat: string;
  vulnerability: string;
  probability: 'baixa' | 'media' | 'alta' | 'critica';
  impact: 'baixo' | 'medio' | 'alto' | 'critico';
  riskLevel: AuditRiskLevel;
  treatment: string;
  residualRisk: string;
  status: AuditRiskStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRiskStats {
  total: number;
  critico: number;
  alto: number;
  medio: number;
  baixo: number;
  tratados: number;
  abertos: number;
}

// ============================================================
// 🆕 NOVO (v46.0) - SoA (Statement of Applicability)
// ============================================================

export interface AuditSoAControl {
  clause: string;
  title: string;
  objective: string;
  motivators: string[];
  applicable: boolean;
  justification: string;
  status: AuditDocumentStatus;
  evidenceIds: string[];
}

export interface AuditSoA {
  _id: string;
  id: string;
  companyId: string;
  version: string;
  controls: AuditSoAControl[];
  status: AuditSoAStatus;
  statistics: {
    total: number;
    applicable: number;
    notApplicable: number;
    conforme: number;
    naoConforme: number;
    parcial: number;
    pendente: number;
  };
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  updatedAt: string;
}

// ============================================================
// 🆕 NOVO (v46.0) - PROGRAMA DE AUDITORIA
// ============================================================

export interface AuditProgramActivity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  responsible: string;
  location: string;
}

export interface AuditProgram {
  _id: string;
  id: string;
  companyId: string;
  year: number;
  activities: AuditProgramActivity[];
  sectors: string[];
  supplierAudits: Array<{
    supplierName: string;
    date: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  }>;
  externalAudit: {
    date: string;
    auditor: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  };
  status: AuditProgramStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 🆕 NOVO (v46.0) - REVISÃO DOCUMENTAL
// ============================================================

export interface AuditDocumentReviewItem {
  clause: string;
  requirement: string;
  status: AuditDocumentStatus;
  observations: string;
  evidenceIds: string[];
}

export interface AuditDocumentReview {
  _id: string;
  id: string;
  companyId: string;
  auditPlanId: string;
  documents: AuditDocumentReviewItem[];
  summary: {
    total: number;
    conforme: number;
    naoConforme: number;
    parcial: number;
    naoAplicavel: number;
    pendente: number;
  };
  status: AuditDocumentReviewStatus;
  createdBy: string;
  createdAt: string;
  completedBy?: string;
  completedAt?: string;
  updatedAt: string;
}

// ============================================================
// DTOs (Data Transfer Objects)
// ============================================================

export interface CreateAuditPlanDTO {
  title: string;
  description: string;
  scope: { controls: string[]; processes: string[]; areas: string[] };
  period: { startDate: string; endDate: string };
  team: { leadAuditor: string; auditors: string[]; observers?: string[] };
  criteria: string[];
}

export interface UpdateAuditPlanDTO {
  title?: string;
  description?: string;
  scope?: { controls?: string[]; processes?: string[]; areas?: string[] };
  period?: { startDate?: string; endDate?: string };
  team?: { leadAuditor?: string; auditors?: string[]; observers?: string[] };
  criteria?: string[];
  status?: AuditStatus;
}

export interface CreateAuditFindingDTO {
  type: AuditFindingType;
  title: string;
  description: string;
  area: string;
  clause: string;
  evidenceIds?: string[];
}

export interface UpdateAuditFindingDTO {
  title?: string;
  description?: string;
  area?: string;
  clause?: string;
  evidenceIds?: string[];
  status?: AuditFindingStatus;
}

export interface CreateAuditActionPlanDTO {
  findingId: string;
  action: string;
  responsible: string;
  deadline: string;
}

export interface UpdateAuditActionPlanDTO {
  action?: string;
  responsible?: string;
  deadline?: string;
  evidenceIds?: string[];
  status?: AuditActionStatus;
}

export interface CreateAuditReportDTO {
  auditPlanId: string;
  summary: string;
  conclusion: string;
  recommendations: string[];
  findings: string[];
}

export interface UpdateAuditReportDTO {
  summary?: string;
  conclusion?: string;
  recommendations?: string[];
  findings?: string[];
  status?: AuditReportStatus;
}

// ============================================================
// 🆕 NOVO (v46.0) - DTOs - RISCOS
// ============================================================

export interface CreateAuditRiskDTO {
  description: string;
  owner: string;
  threat: string;
  vulnerability: string;
  probability: 'baixa' | 'media' | 'alta' | 'critica';
  impact: 'baixo' | 'medio' | 'alto' | 'critico';
  treatment?: string;
  residualRisk?: string;
}

export interface UpdateAuditRiskDTO {
  description?: string;
  owner?: string;
  threat?: string;
  vulnerability?: string;
  probability?: 'baixa' | 'media' | 'alta' | 'critica';
  impact?: 'baixo' | 'medio' | 'alto' | 'critico';
  treatment?: string;
  residualRisk?: string;
  status?: AuditRiskStatus;
}

// ============================================================
// 🆕 NOVO (v46.0) - DTOs - SoA
// ============================================================

export interface CreateAuditSoADTO {
  version: string;
  controls: Omit<AuditSoAControl, 'status'>[];
}

export interface UpdateAuditSoADTO {
  version?: string;
  controls?: Partial<AuditSoAControl>[];
  status?: AuditSoAStatus;
}

// ============================================================
// 🆕 NOVO (v46.0) - DTOs - PROGRAMA
// ============================================================

export interface CreateAuditProgramDTO {
  year: number;
  sectors: string[];
}

export interface UpdateAuditProgramDTO {
  sectors?: string[];
  status?: AuditProgramStatus;
}

export interface CreateAuditProgramActivityDTO {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  responsible: string;
  location?: string;
}

export interface UpdateAuditProgramActivityDTO {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  responsible?: string;
  location?: string;
}

// ============================================================
// 🆕 NOVO (v46.0) - DTOs - REVISÃO DOCUMENTAL
// ============================================================

export interface CreateAuditDocumentReviewDTO {
  documents: Omit<AuditDocumentReviewItem, 'status'>[];
}

export interface UpdateAuditDocumentReviewDTO {
  documents?: Partial<AuditDocumentReviewItem>[];
  status?: AuditDocumentReviewStatus;
}

// ============================================================
// FILTROS
// ============================================================

export interface AuditFilters {
  status?: AuditStatus;
  leadAuditor?: string;
  auditor?: string;
  search?: string;
}

export interface AuditFindingFilters {
  type?: AuditFindingType;
  status?: AuditFindingStatus;
  area?: string;
  createdBy?: string;
}

// ============================================================
// ESTATÍSTICAS
// ============================================================

export interface AuditStats {
  totalPlans: number;
  approved: number;
  inProgress: number;
  completed: number;
}

export interface AuditFindingStats {
  total: number;
  open: number;
  closed: number;
  ncA: number;
  ncB: number;
  pendingValidation: number;
}

export interface AuditChecklistStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}