import { Model, Document } from 'mongoose';
import { IUser } from '../types/index.js';
export interface IUserDocument extends IUser, Document {
    password: string;
    refreshToken?: string;
    passwordHistory?: string[];
    passwordExpiresAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    needsPasswordChange(): boolean;
}
export declare const User: Model<IUserDocument>;
//# sourceMappingURL=User.d.ts.map