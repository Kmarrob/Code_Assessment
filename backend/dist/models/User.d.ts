import mongoose, { Model, Document } from 'mongoose';
import { IUser } from '../types/index.js';
export interface IUserDocument extends IUser, Document {
    password?: string;
    refreshToken?: string;
    passwordHistory?: string[];
    passwordExpiresAt?: Date;
    inactivationReason?: 'Desligado' | 'Mudou de setor' | 'Outros';
    inactivationDescription?: string;
    inactivatedAt?: Date;
    inactivatedBy?: mongoose.Types.ObjectId;
    mustChangePassword?: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
    needsPasswordChange(): boolean;
}
export declare const User: Model<IUserDocument>;
//# sourceMappingURL=User.d.ts.map