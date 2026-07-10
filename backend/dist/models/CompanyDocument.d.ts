import mongoose, { Model, Document } from 'mongoose';
export type DocumentCategory = 'policy' | 'procedure' | 'evidence' | 'other';
export type DocumentStatus = 'draft' | 'active' | 'archived';
export interface ICompanyDocument extends Document {
    companyId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    category: DocumentCategory;
    subcategory?: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    version: number;
    status: DocumentStatus;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    tags?: string[];
    controlIds?: mongoose.Types.ObjectId[];
    metadata?: Record<string, any>;
}
export declare const CompanyDocument: Model<ICompanyDocument>;
//# sourceMappingURL=CompanyDocument.d.ts.map