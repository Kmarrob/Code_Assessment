import mongoose, { Model } from 'mongoose';
export interface ICompany {
    _id: mongoose.Types.ObjectId;
    name: string;
    cnpj?: string;
    plan: 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
    maxUsers: number;
    maxControls: number;
    assignedControls: mongoose.Types.ObjectId[];
    consultantId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    branding?: {
        logo: {
            url: string;
            filename: string;
            size: number;
            mimeType: string;
            dimensions: {
                width: number;
                height: number;
            };
            uploadedAt: Date | null;
            uploadedBy: mongoose.Types.ObjectId | null;
        };
        favicon: {
            url: string;
            filename: string;
            size: number;
            mimeType: string;
            uploadedAt: Date | null;
            uploadedBy: mongoose.Types.ObjectId | null;
        };
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            extractedFrom: Date | null;
        };
        settings: {
            showLogoInHeader: boolean;
            showLogoInReport: boolean;
            useCustomColors: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    };
}
export declare const Company: Model<ICompany>;
//# sourceMappingURL=Company.d.ts.map