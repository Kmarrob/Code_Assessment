import mongoose from 'mongoose';
export type FindingType = 'NC_A' | 'NC_B' | 'CM' | 'OM' | 'AP';
export type FindingStatus = 'open' | 'in_progress' | 'pending_validation' | 'closed' | 'reopened';
export interface IAuditFinding {
    _id: string;
    auditPlanId: string;
    checklistId?: string;
    number: string;
    type: FindingType;
    title: string;
    description: string;
    area: string;
    process: string;
    clause: string;
    controlId?: string;
    evidenceIds: string[];
    deadline: Date;
    status: FindingStatus;
    createdBy: string;
    validatedBy?: string;
    validatedAt?: Date;
    validationComment?: string;
    reopenedAt?: Date;
    reopenedBy?: string;
    reopenReason?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditFinding: mongoose.Model<IAuditFinding, {}, {}, {}, mongoose.Document<unknown, {}, IAuditFinding, {}, {}> & IAuditFinding & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditFinding.d.ts.map