import mongoose from 'mongoose';
import { IGovernanceDocument } from './GovernanceDocument';
export interface IProcedure extends IGovernanceDocument {
    level: 3;
    standardId: string;
    steps: Array<{
        order: number;
        description: string;
        responsible: string;
        expectedTime: string;
    }>;
    inputs: string[];
    outputs: string[];
}
export declare const Procedure: mongoose.Model<IProcedure, {}, {}, {}, mongoose.Document<unknown, {}, IProcedure, {}, {}> & IProcedure & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Procedure.d.ts.map