import mongoose, { Document } from 'mongoose';
export interface IAuditQuestion extends Document {
    text: string;
    clause: string;
    category: 'clause' | 'control';
    controlId?: string;
    isActive: boolean;
    answerType: 'C_NC_NA' | 'C_NC_OB_OM_NA';
    order: number;
    section: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditQuestion: mongoose.Model<IAuditQuestion, {}, {}, {}, mongoose.Document<unknown, {}, IAuditQuestion, {}, {}> & IAuditQuestion & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditQuestion.d.ts.map