import mongoose from 'mongoose';
export interface IAuditProgram {
    _id: string;
    year: number;
    companyId: string;
    status: 'draft' | 'approved' | 'active' | 'archived';
    sectors: Array<{
        name: string;
        processes: string[];
        importance: 'critical' | 'standard';
        scoreA: number;
        scoreB: number;
        totalScore: number;
        frequency: 'annual' | 'semiannual' | 'quarterly';
        lastAuditDate?: Date;
        nextAuditDate?: Date;
        status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        auditPlanId?: string;
    }>;
    supplierAudits: Array<{
        supplierName: string;
        supplierId?: string;
        auditDate: Date;
        scope: string;
        status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        auditPlanId?: string;
    }>;
    externalAudit: {
        plannedDate?: Date;
        certificationBody?: string;
        scope?: string;
        status: 'not_planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        auditPlanId?: string;
    };
    otherActivities: Array<{
        name: string;
        description: string;
        scheduledDate: Date;
        status: 'pending' | 'in_progress' | 'completed';
        completedAt?: Date;
    }>;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditProgram: mongoose.Model<IAuditProgram, {}, {}, {}, mongoose.Document<unknown, {}, IAuditProgram, {}, {}> & IAuditProgram & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditProgram.d.ts.map