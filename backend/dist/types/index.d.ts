import { Request } from 'express';
import { Types, Document } from 'mongoose';
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
    SKIPPED = "skipped",
    EXPIRED = "expired",
    REVOKED = "revoked"
}
export declare enum MaturityLevel {
    N_A = "N/A",
    LEVEL_0 = "0",
    LEVEL_1 = "1",
    LEVEL_2 = "2",
    LEVEL_3 = "3",
    LEVEL_4 = "4",
    LEVEL_5 = "5"
}
export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    company?: string;
    companyId?: Types.ObjectId;
    createdBy?: Types.ObjectId;
    consultantId?: Types.ObjectId;
    department?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    passwordChangedAt?: Date;
    inactivationReason?: 'Desligado' | 'Mudou de setor' | 'Outros';
    inactivationDescription?: string;
    inactivatedAt?: Date;
    inactivatedBy?: Types.ObjectId;
}
export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
    isPasswordExpired(): boolean;
}
export interface ICompany {
    _id: Types.ObjectId;
    name: string;
    cnpj?: string;
    plan: 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
    maxUsers: number;
    maxControls: number;
    assignedControls: Types.ObjectId[];
    consultantId?: Types.ObjectId;
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IControl {
    _id: Types.ObjectId;
    id: string;
    nome: string;
    tiposDeControles: string[];
    nota: string;
    controles: string;
    cenarioIdentificado?: string;
    tipoDeControle: string[];
    propriedadeDeSI: string[];
    conceitoDeSegurancaCibernetica: string[];
    capacidadesOperacionais: string[];
    dominioDeSI: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IAssignment {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    controlId: Types.ObjectId;
    assignedBy: Types.ObjectId;
    assignedAt: Date;
    dueDate?: Date;
    status: ResponseStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface IResponse {
    _id: Types.ObjectId;
    assignmentId: Types.ObjectId;
    userId: Types.ObjectId;
    controlId: Types.ObjectId;
    companyId: Types.ObjectId;
    maturityLevel: MaturityLevel;
    scenarioDescription?: string;
    evidence?: string[];
    observations?: string;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IJWTPayload {
    id: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface IRefreshTokenPayload {
    id: string;
    tokenVersion: number;
}
export interface ITokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}
export interface IRefreshToken {
    token: string;
    userId: Types.ObjectId;
    expiresAt: Date;
    revoked: boolean;
    createdAt: Date;
}
export interface AuthenticatedRequest extends Request {
    userId?: string;
    user?: IUser;
    token?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
    statusCode: number;
    timestamp: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
export interface IRepUser extends IUser {
    assignmentsCount: number;
    responsesCount: number;
}
export interface IAssignmentResult {
    assigned: number;
    skipped: number;
    assignments: IAssignment[];
}
export interface IUserProgress {
    userId: string;
    userName: string;
    userEmail: string;
    total: number;
    completed: number;
    pending: number;
    percentage: number;
    maturityDistribution: Record<string, number>;
    details: Array<{
        assignmentId: string;
        controlId: string;
        controlName: string;
        status: ResponseStatus;
        response: any | null;
    }>;
}
export interface IOverallProgress {
    totalUsers: number;
    totalAssignments: number;
    totalResponses: number;
    overallPercentage: number;
    userProgress: Array<{
        userId: string;
        userName: string;
        userEmail: string;
        total: number;
        completed: number;
        percentage: number;
    }>;
}
export interface IRepStats {
    totalUsers: number;
    totalAssignments: number;
    totalResponses: number;
    statusDistribution: Record<string, number>;
    averageMaturity: number;
    completionRate: number;
}
export interface IConsultantCompany {
    _id: Types.ObjectId;
    name: string;
    status: string;
    userCount: number;
    assignedControlsCount: number;
    completionRate: number;
}
export interface IConsultantStats {
    totalCompanies: number;
    totalUsers: number;
    totalAssignments: number;
    totalResponses: number;
    overallCompletionRate: number;
    companies: IConsultantCompany[];
}
//# sourceMappingURL=index.d.ts.map