import mongoose from 'mongoose';
import { IGovernanceDocument } from './GovernanceDocument';
export interface IStandard extends IGovernanceDocument {
    level: 2;
    policyId: string;
    mandatory: boolean;
    nonCompliancePenalty?: string;
}
export declare const Standard: mongoose.Model<IStandard, {}, {}, {}, mongoose.Document<unknown, {}, IStandard, {}, {}> & IStandard & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Standard.d.ts.map