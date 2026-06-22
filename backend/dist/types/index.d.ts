import { Document, Types } from 'mongoose';
import { Request } from 'express';
export declare enum UserRole {
    ADMIN = "admin",
    REP = "rep",
    CONSULTANT = "consultant",
    USER = "user"
}
export declare enum ResponseStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    REJECTED = "rejected"
}
export declare enum MaturityLevel {
    NOT_APPLICABLE = "N/A",
    NOT_IMPLEMENTED = 0,
    PARTIALLY_IMPLEMENTED = 1,
    IMPLEMENTED = 2
}
export interface BaseDocument extends Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUser extends BaseDocument {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    company?: string;
    department?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    refreshToken?: string;
    passwordChangedAt?: Date;
    passwordHistory?: string[];
    passwordExpiresAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    needsPasswordChange(): boolean;
}
export interface IControl extends BaseDocument {
    id: string;
    nome: string;
    tiposDeControles: string[];
    nota: string;
    controles: string;
    cenarioIdentificado: string;
    tipoDeControle: string[];
    propriedadeDeSI: string[];
    conceitoDeSegurancaCibernetica: string[];
    capacidadesOperacionais: string[];
    dominioDeSI: string[];
}
export interface IAssignment extends BaseDocument {
    userId: Types.ObjectId;
    controlId: Types.ObjectId;
    assignedBy: Types.ObjectId;
    assignedAt: Date;
    dueDate?: Date;
    status: ResponseStatus;
}
export interface IResponse extends BaseDocument {
    assignmentId: Types.ObjectId;
    userId: Types.ObjectId;
    controlId: Types.ObjectId;
    maturityLevel: MaturityLevel;
    scenarioDescription: string;
    evidence?: string;
    observations?: string;
    respondedAt: Date;
    lastUpdatedAt: Date;
}
export interface IJWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}
export interface AuthenticatedRequest extends Request {
    user?: IUser;
    userId?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
    statusCode: number;
    timestamp: string;
    path?: string;
}
export interface PaginationOptions {
    page: number;
    limit: number;
    sort?: Record<string, 1 | -1>;
    filter?: Record<string, any>;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
//# sourceMappingURL=index.d.ts.map