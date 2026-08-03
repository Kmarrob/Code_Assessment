import mongoose from 'mongoose';
import { IGovernanceDocument } from './GovernanceDocument';
export interface IRecord extends IGovernanceDocument {
    level: 5;
    procedureId: string;
    recordType: 'form' | 'evidence' | 'report' | 'log';
    retentionPeriod: number;
    retentionPolicy: string;
}
export declare const Record: mongoose.Model<IRecord, {}, {}, {}, mongoose.Document<unknown, {}, IRecord, {}, {}> & IRecord & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Record.d.ts.map