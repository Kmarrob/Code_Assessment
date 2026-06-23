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
}
export declare const Company: Model<ICompany>;
//# sourceMappingURL=Company.d.ts.map