// ============================================================
// TIPOS DO MÓDULO DE AUDITORIA INTERNA
// ============================================================

export type AuditStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type AuditFindingType = 'nc_a' | 'nc_b' | 'comment' | 'opportunity' | 'positive';
export type AuditFindingStatus = 'open' | 'in_progress' | 'pending_validation' | 'closed' | 'reopened';
export type AuditActionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type AuditReportStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type AuditChecklistStatus = 'pending' | 'in_progress' | 'completed';

// ============================================================
// PLANO DE AUDITORIA
// ============================================================

export interface IAuditPlan {
  _id: string;
  id: string;
  companyId: string;
  title: string;
  description: string;
  scope: {
    controls: string[];        // IDs dos controles ISO 27001
    processes: string[];       // Processos a serem auditados
    areas: string[];           // Áreas/departamentos
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  team: {
    leadAuditor: string;       // ID do usuário (AUDITOR LÍDER)
    auditors: string[];        // IDs dos auditores
    observers: string[];       // IDs dos observadores (CONSULTANT)
  };
  criteria: string[];          // Critérios de auditoria
  status: AuditStatus;
  createdBy: string;           // ID do REP que criou
  createdAt: Date;
  approvedBy: string;          // ID do AUDITOR LÍDER que aprovou (diferente de createdBy)
  approvedAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============================================================
// CHECKLIST DE AUDITORIA
// ============================================================

export interface IAuditChecklistItem {
  question: string;
  answer: 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  observations: string;
  evidenceIds: string[];
}

export interface IAuditChecklist {
  _id: string;
  id: string;
  auditPlanId: string;
  controlId: string;           // Controle ISO 27001
  questions: IAuditChecklistItem[];
  status: AuditChecklistStatus;
  completedBy: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// NÃO CONFORMIDADE (FINDING)
// ============================================================

export interface IAuditFinding {
  _id: string;
  id: string;
  auditPlanId: string;
  type: AuditFindingType;
  title: string;
  description: string;
  area: string;                // Área/processo responsável
  clause: string;              // Cláusula ISO 27001 (ex: "A.5.1")
  evidenceIds: string[];
  status: AuditFindingStatus;
  createdBy: string;           // ID do AUDITOR que criou
  createdAt: Date;
  validatedBy: string;         // ID do REP ou AUDITOR LÍDER que validou (diferente de createdBy)
  validatedAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============================================================
// EVIDÊNCIA DE AUDITORIA
// ============================================================

export interface IAuditEvidence {
  _id: string;
  id: string;
  auditPlanId: string;
  findingId?: string;          // Opcional - se vinculado a uma NC
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  description: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export interface IAuditActionPlan {
  _id: string;
  id: string;
  findingId: string;
  action: string;
  responsible: string;         // ID do USER responsável
  deadline: Date;
  evidenceIds: string[];
  status: AuditActionStatus;
  createdBy: string;
  createdAt: Date;
  validatedBy: string;         // ID do AUDITOR que validou
  validatedAt: Date;
  validationComment: string;
  updatedAt: Date;
}

// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================

export interface IAuditReport {
  _id: string;
  id: string;
  auditPlanId: string;
  summary: string;
  conclusion: string;
  findings: string[];          // IDs das NCs
  recommendations: string[];
  status: AuditReportStatus;
  createdBy: string;           // ID do AUDITOR que criou
  createdAt: Date;
  approvedBy: string;          // ID do REP que aprovou (diferente de createdBy)
  approvedAt: Date;
  rejectionReason?: string;
  updatedAt: Date;
}

// ============================================================
// DTOs (Data Transfer Objects)
// ============================================================

export interface CreateAuditPlanDTO {
  title: string;
  description: string;
  scope: {
    controls: string[];
    processes: string[];
    areas: string[];
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  team: {
    leadAuditor: string;
    auditors: string[];
    observers?: string[];
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
    startDate?: Date;
    endDate?: Date;
  };
  team?: {
    leadAuditor?: string;
    auditors?: string[];
    observers?: string[];
  };
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
  deadline: Date;
}

export interface UpdateAuditActionPlanDTO {
  action?: string;
  responsible?: string;
  deadline?: Date;
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

// ============================================================
// PERGUNTAS PRÉ-DEFINIDAS PARA CHECKLIST
// ============================================================

export interface IAuditQuestion {
  controlId: string;
  question: string;
  category: 'organizational' | 'people' | 'physical' | 'technological';
}