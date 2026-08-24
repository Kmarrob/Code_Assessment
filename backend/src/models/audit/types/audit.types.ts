// ============================================================
// TIPOS DO MÓDULO DE AUDITORIA INTERNA
// ============================================================

export type AuditStatus =
  | 'draft'
  |  'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type AuditFindingType =
  | 'nc_a'
  | 'nc_b'
  | 'comment'
  | 'opportunity'
  | 'positive';

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
// PLANO DE AUDITORIA
// ============================================================

export interface IAuditPlan {
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
    controls: string[];        // IDs dos controles ISO 27001
    processes: string[];       // Processos a serem auditados
    areas: string[];           // Áreas/departamentos
  };

  // Período
  period: {
    startDate: Date;
    endDate: Date;
    estimatedDays?: number;
  };

  // Equipe
  team: {
    leadAuditor: string;       // ID do usuário (AUDITOR LÍDER)
    auditors: string[];        // IDs dos auditores
    observers: string[];       // IDs dos observadores (CONSULTANT)
    specialists?: string[];    // Especialistas convidados
  };

  // Critérios
  criteria: string[];

  // Status
  status: AuditStatus;

  // Criação
  createdBy: string;           // ID do REP que criou
  createdAt: Date;

  // Aprovação
  approvedBy?: string;         // ID do AUDITOR LÍDER que aprovou
  approvedAt?: Date;

  // Rejeição
  rejectionReason?: string;

  // Execução
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;

  // Observações
  observations?: string;

  // Atualização
  updatedAt: Date;

  // Soft delete
  deletedAt?: Date;
}

// ============================================================
// CHECKLIST DE AUDITORIA
// ============================================================

/**
 * Interface legada/compatibilidade.
 *
 * Mantida para evitar quebra de componentes ou serviços
 * que ainda utilizem a nomenclatura descritiva dos resultados.
 *
 * O modelo atual AuditChecklist utiliza
 * IAuditChecklistQuestion, com os códigos:
 *
 * C  = Conforme
 * NC = Não Conforme
 * OB = Observação
 * OM = Oportunidade
 * NA = Não Aplicável
 * -- = Não Respondido
 */
export interface IAuditChecklistItem {
  question: string;

  answer:
    | 'conforme'
    | 'nao_conforme'
    | 'nao_aplicavel';

  observations: string;

  evidenceIds: string[];

  // Rastreamento do responsável
  responsible?: string;

  // Data da resposta
  answeredAt?: Date;

  // Usuário que respondeu
  answeredBy?: string;
}

/**
 * Interface principal utilizada pelo modelo AuditChecklist.
 *
 * Os códigos de resposta precisam permanecer sincronizados
 * com o enum definido em AuditChecklist.ts.
 */
export interface IAuditChecklistQuestion {
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

  // ID do responsável pela pergunta
  responsible: string;

  // Data em que a pergunta foi respondida
  answeredAt?: Date;

  // ID do usuário que respondeu
  answeredBy?: string;
}

export interface IAuditChecklist {
  _id: string;

  id: string;

  // Plano de auditoria ao qual o checklist pertence
  auditPlanId: string;

  // Controle ISO 27001
  controlId: string;

  // Perguntas do checklist
  questions: IAuditChecklistQuestion[];

  // Estatísticas do checklist
  statistics: {
    total: number;
    conforme: number;
    nonConforme: number;
    observacao: number;
    oportunidade: number;
    naoAplicavel: number;
  };

  // Status
  status: AuditChecklistStatus;

  // Conclusão
  completedBy?: string;
  completedAt?: Date;

  // Metadados
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  // Soft delete
  deletedAt?: Date;
}

// ============================================================
// NÃO CONFORMIDADE (FINDING)
// ============================================================

export interface IAuditFinding {
  _id: string;
  id: string;

  // Relacionamentos
  auditPlanId: string;
  checklistId?: string;

  // Identificação
  number: string;

  // Classificação
  type: AuditFindingType;

  // Descrição
  title: string;
  description: string;

  // Localização organizacional
  area: string;                // Área/processo responsável
  process: string;             // Processo específico

  // Critério
  clause: string;              // Cláusula ISO 27001 (ex: "A.5.1")

  // Controle relacionado
  controlId?: string;

  // Evidências
  evidenceIds: string[];

  // Planos de ação relacionados
  actionPlanIds: string[];

  // Prazo
  deadline?: Date;

  // Status
  status: AuditFindingStatus;

  // Criação
  createdBy: string;           // ID do AUDITOR que criou
  createdAt: Date;

  // Validação
  validatedBy?: string;        // ID do REP ou AUDITOR LÍDER que validou
  validatedAt?: Date;

  // Comentário da validação
  validationComment?: string;

  // Atualização
  updatedAt: Date;

  // Soft delete
  deletedAt?: Date;
}

// ============================================================
// EVIDÊNCIA DE AUDITORIA
// ============================================================

export interface IAuditEvidence {
  _id: string;
  id: string;

  // Relacionamento
  auditPlanId: string;
  findingId?: string;

  // Arquivo
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;

  // Descrição
  description: string;

  // Upload
  uploadedBy: string;
  uploadedAt: Date;

  // Soft delete
  deletedAt?: Date;
}

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export interface IAuditActionPlan {
  _id: string;
  id: string;

  // Relacionamentos
  findingId: string;
  auditPlanId: string;
  companyId: string;

  // Ação
  action: string;
  description?: string;

  // Responsável
  responsible: string;         // ID do USER responsável

  // Prazo
  deadline: Date;

  // Evidências
  evidenceIds: string[];

  // Status
  status: AuditActionStatus;

  // Criação
  createdBy: string;
  createdAt: Date;

  // Validação
  validatedBy?: string;        // ID do AUDITOR que validou
  validatedAt?: Date;
  validationComment?: string;

  // Atualização
  updatedAt: Date;
  updatedBy?: string;

  // Soft delete
  deletedAt?: Date;
}

// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================

/**
 * Item de finding utilizado dentro do relatório.
 *
 * O relatório mantém uma representação dos findings
 * relacionados à auditoria.
 */
export interface IAuditReportFinding {
  id: string;
  number: string;

  // Classificação
  type: AuditFindingType;

  // Descrição
  title: string;
  description: string;

  // Localização
  area: string;
  process: string;

  // Critério
  clause: string;

  // Status
  status: AuditFindingStatus;

  // Evidências
  evidenceIds: string[];

  // Planos de ação
  actionPlanIds: string[];

  // Auditor responsável pela criação
  createdBy: string;
  createdAt: Date;

  // Atualização
  updatedAt: Date;
}

export interface IAuditReport {
  _id: string;
  id: string;

  // Relacionamento
  auditPlanId: string;
  companyId: string;

  // Controle de versão
  version: string;

  // Organização
  organization: {
    legalName: string;
    corporateGroup?: string;
    address: string;
    country: string;
    contact: string;
    website?: string;
    industry: string;
  };

  // Conteúdo
  summary: string;
  conclusion: string;

  // Findings
  findings: IAuditReportFinding[];

  // Recomendações
  recommendations: string[];

  // Status
  status: AuditReportStatus;

  // Criação
  createdBy: string;           // ID do AUDITOR que criou
  createdAt: Date;

  // Aprovação
  approvedBy?: string;         // ID do REP que aprovou
  approvedAt?: Date;

  // Rejeição
  rejectionReason?: string;

  // Atualização
  updatedAt: Date;

  // Soft delete
  deletedAt?: Date;
}

// ============================================================
// DTOs - PLANO DE AUDITORIA
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
    startDate?: Date;
    endDate?: Date;
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

// ============================================================
// DTOs - PLANO DE AÇÃO
// ============================================================

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

// ============================================================
// DTOs - RELATÓRIO DE AUDITORIA
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

  category:
    | 'organizational'
    | 'people'
    | 'physical'
    | 'technological';
}