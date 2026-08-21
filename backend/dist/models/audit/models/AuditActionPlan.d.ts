import mongoose from 'mongoose';
export interface IAuditActionPlan {
    _id: string;
    findingId: string;
    auditPlanId: string;
    companyId: string;
    action: string;
    description?: string;
    responsible: string;
    createdBy: string;
    deadline: Date;
    startedAt?: Date;
    completedAt?: Date;
    evidenceIds: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
    validatedBy?: string;
    validatedAt?: Date;
    validationComment?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditActionPlan: mongoose.Model<IAuditActionPlan, {}, {}, {}, mongoose.Document<unknown, {}, IAuditActionPlan, {}, {}> & IAuditActionPlan & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditActionPlan.d.ts.map