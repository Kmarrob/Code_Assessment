import mongoose from 'mongoose';
export interface IAuditReportOrganization {
    legalName: string;
    corporateGroup?: string;
    address: string;
    country: string;
    contact: string;
    email: string;
    phone: string;
    language: string;
    scope: string;
    industry: string;
}
export interface IAuditReportProfile {
    standards: string[];
    auditType: 'internal' | 'external' | 'supplier';
    documentation: string;
    frequency: string;
    leadAuditor: string;
    auditTeam: string[];
    specialists: string[];
    trainees: string[];
    multiSite: boolean;
    sites: string[];
    operationalShifts: string;
}
export interface IAuditReportDetails {
    auditedLocations: string[];
    auditDate: Date;
    auditEndDate: Date;
    workDays: number;
}
export interface IAuditReportFinding {
    type: 'NC_A' | 'NC_B' | 'CM' | 'OM' | 'AP';
    number: string;
    description: string;
    area: string;
    process: string;
    clause: string;
    deadline: Date;
    status: 'open' | 'in_progress' | 'closed';
    actionPlan?: string;
}
export interface IAuditReportAttachment {
    name: string;
    type: 'checklist' | 'questionnaire' | 'evidence' | 'other';
    url: string;
}
export interface IAuditReportFollowUp {
    required: 'none' | 'reaudit' | 'next_audit';
    details: string;
}
export interface IAuditReportResults {
    conforme: number;
    nonconformitiesA: number;
    nonconformitiesB: number;
    comments: number;
    opportunities: number;
    goodPractices: number;
}
export interface IAuditReport {
    _id: string;
    auditPlanId: string;
    companyId: string;
    version: string;
    organization: IAuditReportOrganization;
    profile: IAuditReportProfile;
    details: IAuditReportDetails;
    results: IAuditReportResults;
    findings: IAuditReportFinding[];
    summary: string;
    conclusion: string;
    followUp: IAuditReportFollowUp;
    attachments: IAuditReportAttachment[];
    status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditReport: mongoose.Model<IAuditReport, {}, {}, {}, mongoose.Document<unknown, {}, IAuditReport, {}, {}> & IAuditReport & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditReport.d.ts.map