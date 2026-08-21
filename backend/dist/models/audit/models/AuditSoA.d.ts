import mongoose, { Document } from 'mongoose';
export interface IAuditSoAControl {
    clause: string;
    title: string;
    objective: string;
    motivators: {
        business: boolean;
        risk: boolean;
        legal: boolean;
        contract: boolean;
    };
    applicable: boolean;
    justification?: string;
    lastAssessmentDate?: Date;
    implemented: boolean;
    implementationDate?: Date;
    responsible?: string;
    evidence?: string;
}
export interface IAuditSoA extends Document {
    companyId: string;
    version: string;
    status: 'draft' | 'review' | 'approved' | 'archived';
    controls: IAuditSoAControl[];
    statistics: {
        total: number;
        applicable: number;
        notApplicable: number;
        implemented: number;
        notImplemented: number;
        byCategory: {
            organizational: number;
            people: number;
            physical: number;
            technological: number;
        };
    };
    createdBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    reviewedAt?: Date;
    nextReviewDate?: Date;
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    updateStatistics(): void;
}
export declare const AuditSoA: mongoose.Model<IAuditSoA, {}, {}, {}, mongoose.Document<unknown, {}, IAuditSoA, {}, {}> & IAuditSoA & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditSoA.d.ts.map