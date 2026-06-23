import mongoose from 'mongoose';
import { ResponseStatus } from '../types/index.js';
interface ListUsersResult {
    users: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
export declare class RepService {
    /**
     * Listar usuários de um preposto (usuários que ele cadastrou)
     */
    static listUsers(repId: string, filters?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'all' | 'active' | 'inactive';
    }): Promise<ListUsersResult>;
    /**
     * Criar usuário pelo preposto
     */
    static createUser(repId: string, userData: {
        name: string;
        email: string;
        password: string;
        department?: string;
    }): Promise<mongoose.FlattenMaps<import("../models/User.js").IUserDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Atribuir controles a um usuário (sem repetição)
     * Se um controle já estiver atribuído a outro usuário, pode ser movido com force=true
     */
    static assignControls(repId: string, data: {
        userId: string;
        controlIds: string[];
        force?: boolean;
    }): Promise<{
        assigned: number;
        skipped: number;
        conflicts: string[];
        conflictMessage: string;
        removed?: undefined;
        assignments?: undefined;
    } | {
        assigned: number;
        removed: number;
        skipped: number;
        conflicts: string[];
        assignments: {
            userId: string;
            controlId: string;
            assignedBy: string;
            assignedAt: Date;
            status: ResponseStatus;
        }[];
        conflictMessage?: undefined;
    }>;
    /**
     * Obter progresso de um usuário
     */
    static getUserProgress(repId: string, userId: string): Promise<{
        userId: mongoose.Types.ObjectId;
        userName: string;
        userEmail: string;
        total: number;
        completed: number;
        pending: number;
        percentage: number;
        maturityDistribution: {
            'N/A': number;
            '0': number;
            '1': number;
            '2': number;
        };
        details: {
            assignmentId: mongoose.Types.ObjectId;
            controlId: any;
            controlName: any;
            status: ResponseStatus;
            response: any;
        }[];
    }>;
    /**
     * Obter progresso geral do preposto
     */
    static getOverallProgress(repId: string): Promise<{
        totalUsers: number;
        totalAssignments: number;
        totalResponses: number;
        overallPercentage: number;
        userProgress: {
            userId: mongoose.Types.ObjectId;
            userName: string;
            userEmail: string;
            total: number;
            completed: number;
            percentage: number;
        }[];
    }>;
    /**
     * Obter estatísticas do preposto
     */
    static getStats(repId: string): Promise<{
        totalUsers: number;
        totalAssignments: number;
        totalResponses: any;
        statusDistribution: Record<string, number>;
        averageMaturity: any;
        completionRate: number;
    }>;
}
export {};
//# sourceMappingURL=RepService.d.ts.map