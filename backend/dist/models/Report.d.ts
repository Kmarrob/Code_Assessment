import mongoose, { Model, Document } from 'mongoose';
export interface IReport extends Document {
    companyId: mongoose.Types.ObjectId;
    projectNumber?: string;
    scope?: string;
    assessmentStartDate?: Date;
    assessmentEndDate?: Date;
    clientTeam: Array<{
        name: string;
        role: string;
        email: string;
    }>;
    consultantTeam: Array<{
        name: string;
        role: string;
        email: string;
    }>;
    status: 'draft' | 'in_review' | 'finalized' | 'archived';
    generatedBy?: mongoose.Types.ObjectId;
    generatedAt?: Date;
    updatedBy?: mongoose.Types.ObjectId;
    updatedAt?: Date;
    changeHistory?: Array<{
        changedBy: mongoose.Types.ObjectId;
        changes: string;
        changedAt: Date;
    }>;
}
export declare const Report: Model<IReport>;
//# sourceMappingURL=Report.d.ts.map