import mongoose from 'mongoose';
import { IGovernanceDocument } from './GovernanceDocument';
export interface IWorkInstruction extends IGovernanceDocument {
    level: 4;
    procedureId: string;
    detailedSteps: string;
    tools: string[];
    prerequisites: string[];
    verificationPoints: string[];
}
export declare const WorkInstruction: mongoose.Model<IWorkInstruction, {}, {}, {}, mongoose.Document<unknown, {}, IWorkInstruction, {}, {}> & IWorkInstruction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WorkInstruction.d.ts.map