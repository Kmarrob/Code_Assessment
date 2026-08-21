export type AuditStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type AuditFindingType = 'nc_a' | 'nc_b' | 'comment' | 'opportunity' | 'positive';
export type AuditFindingStatus = 'open' | 'in_progress' | 'pending_validation' | 'closed' | 'reopened';
export type AuditActionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type AuditReportStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type AuditChecklistStatus = 'pending' | 'in_progress' | 'completed';
export interface IAuditPlan {
    _id: string;
    id: string;
    companyId: string;
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
        observers: string[];
    };
    criteria: string[];
    status: AuditStatus;
    createdBy: string;
    createdAt: Date;
    approvedBy: string;
    approvedAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export interface IAuditChecklistItem {
    question: string;
    answer: 'conforme' | 'nao_conforme' | 'nao_aplicavel';
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
export interface IAuditChecklist {
    _id: string;
    id: string;
    auditPlanId: string;
    controlId: string;
    questions: IAuditChecklistQuestion[];
    status: AuditChecklistStatus;
    completedBy: string;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
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
    validatedBy: string;
    validatedAt: Date;
    validationComment?: string;
    updatedAt: Date;
    deletedAt?: Date;
}
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
    validatedBy: string;
    validatedAt: Date;
    validationComment: string;
    updatedAt: Date;
    updatedBy?: string;
    deletedAt?: Date;
}
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
    approvedBy: string;
    approvedAt: Date;
    rejectionReason?: string;
    updatedAt: Date;
    deletedAt?: Date;
}
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
export interface IAuditQuestion {
    controlId: string;
    question: string;
    category: 'organizational' | 'people' | 'physical' | 'technological';
}
//# sourceMappingURL=audit.types.d.ts.map