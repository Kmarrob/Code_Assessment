import mongoose, { Document } from 'mongoose';
export interface IGovernanceDocument extends Document {
    code: string;
    title: string;
    version: string;
    status: 'draft' | 'review' | 'approved' | 'archived';
    level: 1 | 2 | 3 | 4 | 5;
    category: string;
    parentId?: string;
    content: string;
    summary: string;
    keywords: string[];
    createdBy: string;
    updatedBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    effectiveDate: Date;
    reviewDate: Date;
    frameworks: {
        iso27001?: string[];
        nist?: string[];
        cobit?: string[];
        pciDss?: string[];
        lgpd?: string[];
        bacen?: string[];
    };
    companyId: string | null;
    isGlobal: boolean;
    versionHistory: Array<{
        version: string;
        date: Date;
        user: string;
        changes: string;
    }>;
    attachments: Array<{
        filename: string;
        path: string;
        size: number;
        mimetype: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const GovernanceDocument: mongoose.Model<IGovernanceDocument, {}, {}, {}, mongoose.Document<unknown, {}, IGovernanceDocument, {}, {}> & IGovernanceDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GovernanceDocument.d.ts.map