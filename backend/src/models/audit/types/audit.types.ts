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
  // ✅ ADICIONADO: Campos para rastreamento de responsável
  responsible?: string;        // ID do responsável pela pergunta
  answeredAt?: Date;           // Data da resposta
  answeredBy?: string;         // ID de quem respondeu
}

// 🆕 NOVO: Interface para perguntas do checklist (compatível com o service)
export interface IAuditChecklistQuestion {
  question: string;
  answer: 'C' | 'NC' | 'NA' | 'OB' | 'OM' | '--';
  observations: string;
  evidenceIds: string[];
  responsible: string;
  answeredAt?: Date;
  answeredBy?: string;
}

export interface IAuditChecklist {
  _id: string;
  id: string;
  auditPlanId: string;
  controlId: string;           // Controle ISO 27001
  questions: IAuditChecklistQuestion[];  // ✅ USAR A NOVA INTERFACE
  status: AuditChecklistStatus;
  completedBy: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============================================================
// NÃO CONFORMIDADE (FINDING)
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
  area: string;                // Área/processo responsável
  process: string;             // Processo específico
  clause: string;              // Cláusula ISO 27001 (ex: "A.5.1")
  controlId?: string;
  evidenceIds: string[];
  // ✅ ADICIONADO: IDs dos planos de ação relacionados
  actionPlanIds: string[];
  deadline?: Date;
  status: AuditFindingStatus;
  createdBy: string;           // ID do AUDITOR que criou
  createdAt: Date;
  validatedBy: string;         // ID do REP ou AUDITOR LÍDER que validou (diferente de createdBy)
  validatedAt: Date;
  validationComment?: string;
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
  deletedAt?: Date;
}

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export interface IAuditActionPlan {
  _id: string;
  id: string;
  findingId: string;
  auditPlanId: string;
  companyId: string;
  action: string;
  description?: string;
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
  updatedBy?: string;
  deletedAt?: Date;
}

// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================

// 🆕 NOVO: Interface para itens do relatório (findings com detalhes)
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
  // ✅ CORRIGIDO: usar IAuditReportFinding[] em vez de string[]
  findings: IAuditReportFinding[];
  // ✅ ADICIONADO: recommendations já existe na interface
  recommendations: string[];
  status: AuditReportStatus;
  createdBy: string;           // ID do AUDITOR que criou
  createdAt: Date;
  approvedBy: string;          // ID do REP que aprovou (diferente de createdBy)
  approvedAt: Date;
  rejectionReason?: string;
  updatedAt: Date;
  deletedAt?: Date;
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
  process: string;
  clause: string;
  controlId?: string;
  evidenceIds?: string[];
  deadline?: Date;
}

export interface UpdateAuditFindingDTO {
  title?: string;
  description?: string;
  area?: string;
  process?: string;
  clause?: string;
  evidenceIds?: string[];
  status?: AuditFindingStatus;
  deadline?: Date;
}

export interface CreateAuditActionPlanDTO {
  findingId: string;
  action: string;
  description?: string;
  responsible: string;
  deadline: Date;
}

export interface UpdateAuditActionPlanDTO {
  action?: string;
  description?: string;
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