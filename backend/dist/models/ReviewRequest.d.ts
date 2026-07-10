import mongoose, { Document } from 'mongoose';
export interface IAttachment {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
}
export interface IReviewRequest extends Document {
    companyId: mongoose.Types.ObjectId;
    responseId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    repId: mongoose.Types.ObjectId;
    controlId: mongoose.Types.ObjectId;
    justification: string;
    attachments: IAttachment[];
    status: 'pending' | 'approved' | 'rejected';
    reviewNotes?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ReviewRequest: mongoose.Model<IReviewRequest, {}, {}, {}, mongoose.Document<unknown, {}, IReviewRequest, {}, {}> & IReviewRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ReviewRequest.d.ts.map