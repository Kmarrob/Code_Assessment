import mongoose, { Model } from 'mongoose';
export interface IAuditQuestion {
    _id: mongoose.Types.ObjectId;
    clauseId: string;
    clauseTitle: string;
    clauseGroup: string;
    text: string;
    objective: string;
    guidance: string;
    evidenceExpected: string;
    conformityCriteria: string;
    nonconformityCriteria: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    relatedControls: string[];
    relatedDocuments: string[];
    order: number;
    active: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditQuestion: Model<IAuditQuestion>;
//# sourceMappingURL=AuditQuestion.d.ts.map