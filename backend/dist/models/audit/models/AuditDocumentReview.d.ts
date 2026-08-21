import mongoose, { Document } from 'mongoose';
export interface IDocumentReviewItem {
    clause: string;
    requirement: string;
    status: 'OK' | 'NC_A' | 'NC_B' | 'PI' | 'GP' | 'CM' | '--';
    observations: string;
    reviewer: string;
    reviewDate: Date;
    documentId?: string;
    documentName?: string;
}
export interface IAuditDocumentReview extends Document {
    companyId: string;
    auditPlanId: string;
    documents: IDocumentReviewItem[];
    summary: {
        totalDocuments: number;
        ok: number;
        ncA: number;
        ncB: number;
        pi: number;
        gp: number;
        cm: number;
        notAssessed: number;
    };
    createdBy: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    updateSummary(): void;
}
export declare const AuditDocumentReview: mongoose.Model<IAuditDocumentReview, {}, {}, {}, mongoose.Document<unknown, {}, IAuditDocumentReview, {}, {}> & IAuditDocumentReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditDocumentReview.d.ts.map