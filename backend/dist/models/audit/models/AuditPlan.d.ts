import mongoose from 'mongoose';
export interface IAuditPlanScope {
    controls: string[];
    processes: string[];
    areas: string[];
}
export interface IAuditPlanTeam {
    leadAuditor: string;
    auditors: string[];
    observers: string[];
    specialists?: string[];
}
export interface IAuditPlanPeriod {
    startDate: Date;
    endDate: Date;
    estimatedDays: number;
}
export interface IAuditPlan {
    _id: string;
    title: string;
    description: string;
    code: string;
    companyId: string;
    programId?: string;
    scope: IAuditPlanScope;
    team: IAuditPlanTeam;
    period: IAuditPlanPeriod;
    criteria: string[];
    status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
    createdBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    startedAt?: Date;
    completedAt?: Date;
    completedBy?: string;
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditPlan: mongoose.Model<IAuditPlan, {}, {}, {}, mongoose.Document<unknown, {}, IAuditPlan, {}, {}> & IAuditPlan & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditPlan.d.ts.map