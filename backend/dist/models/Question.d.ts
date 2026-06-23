import mongoose, { Model } from 'mongoose';
export interface IQuestion {
    _id: mongoose.Types.ObjectId;
    controlId: string;
    controlName: string;
    controlCategory: string;
    text: string;
    objective: string;
    answerImplemented: string;
    answerPartial: string;
    answerNotImplemented: string;
    guidance: string;
    attachmentUrl: string;
    attachmentName: string;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Question: Model<IQuestion>;
//# sourceMappingURL=Question.d.ts.map