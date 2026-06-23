import { Model, Document } from 'mongoose';
import { IUser } from '../types/index.js';
export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
    needsPasswordChange(): boolean;
}
export declare const User: Model<IUserDocument>;
//# sourceMappingURL=User.d.ts.map