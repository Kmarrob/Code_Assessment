import mongoose from 'mongoose';
import { IGovernanceDocument } from './GovernanceDocument';
export interface IPolicy extends IGovernanceDocument {
    level: 1;
    scope: 'all' | 'it' | 'security' | 'privacy';
    strategicObjective: string;
    responsible: string;
}
export declare const Policy: mongoose.Model<IPolicy, {}, {}, {}, mongoose.Document<unknown, {}, IPolicy, {}, {}> & IPolicy & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Policy.d.ts.map