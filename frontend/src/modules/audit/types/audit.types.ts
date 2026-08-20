// ============================================================
// TIPOS DO MÓDULO DE AUDITORIA INTERNA (SGSI)
// ============================================================

export type AuditStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type AuditFindingType = 'nc_a' | 'nc_b' | 'comment' | 'opportunity' | 'positive';
export type AuditFindingStatus = 'open' | 'in_progress' | 'pending_validation' | 'closed' | 'reopened';
export type AuditActionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type AuditReportStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type AuditChecklistStatus = 'pending' | 'in_progress' | 'completed';
export type AuditChecklistAnswer = 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';

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
// DTOs
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
