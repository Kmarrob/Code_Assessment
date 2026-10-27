import mongoose from 'mongoose';
import { UserRole, ResponseStatus } from '../types/index.js';
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
     * Criar usuário pelo preposto (com senha automática)
     *
     * ============================================================
     * 🆕 v52.0 — SUPORTE A ROLES DE AUDITORIA
     * ============================================================
     *
     * MOTIVO:
     *   O REP agora pode cadastrar usuários com 4 roles diferentes:
     *     - user (usuário comum — responde assessment)
     *     - auditor_lead (auditor líder — aprova e executa)
     *     - auditor (auditor — executa em parceria)
     *     - observer (observador — somente leitura)
     *
     * COMPATIBILIDADE:
     *   - Se `role` não for passado, usa `user` (comportamento antigo).
     *   - Se `role` for inválido (admin/rep/consultant), rejeita.
     *
     * SEGURANÇA:
     *   - Lista de roles permitidos é explícita (whitelist).
     *   - Role `admin`, `rep`, `consultant` NUNCA pode ser criado aqui.
     *
     * ============================================================
     */
    static createUser(repId: string, userData: {
        name: string;
        email: string;
        password?: string;
        department?: string;
        role?: UserRole;
    }): Promise<mongoose.FlattenMaps<import("../models/User.js").IUserDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Editar usuário pelo preposto
     *
     * ============================================================
     * 🆕 v52.0 — SUPORTE A EDIÇÃO DE ROLE
     * ============================================================
     *
     * MOTIVO:
     *   O REP precisa poder alterar o role de um usuário depois de
     *   criado (ex.: promover user → auditor, ou rebaixar auditor
     *   → observer).
     *
     * REGRAS:
     *   - Só aceita roles da lista permitida (whitelist).
     *   - Não permite alterar para rep/admin/consultant.
     *
     * ============================================================
     */
    static updateUser(repId: string, userId: string, data: {
        name?: string;
        email?: string;
        department?: string;
        role?: UserRole;
    }): Promise<(mongoose.Document<unknown, {}, import("../models/User.js").IUserDocument, {}, {}> & import("../models/User.js").IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Inativar usuário com justificativa
     */
    static inactivateUser(repId: string, userId: string, data: {
        reason: 'Desligado' | 'Mudou de setor' | 'Outros';
        description: string;
    }): Promise<(mongoose.Document<unknown, {}, import("../models/User.js").IUserDocument, {}, {}> & import("../models/User.js").IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Revogar controle com reatribuição
     */
    static revokeControl(repId: string, assignmentId: string, newUserId: string | null): Promise<{
        revoked: boolean;
        oldUserId: mongoose.Types.ObjectId;
        oldUserEmail: string;
        controlId: mongoose.Types.ObjectId;
        controlName: any;
        newUserId: string | null;
        newAssignment: (mongoose.Document<unknown, {}, import("../types/index.js").IAssignment, {}, {}> & import("../types/index.js").IAssignment & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    /**
     * Atribuir controles a um usuário
     *
     * CORREÇÃO PRINCIPAL:
     * A validação da empresa não depende exclusivamente
     * do companyId existente no documento do preposto.
     *
     * Quando o companyId do preposto está ausente,
     * incorreto ou desatualizado, a empresa é resolvida
     * pelo nome cadastrado no usuário.
     *
     * Quando o usuário possui a mesma empresa lógica,
     * seu companyId é corrigido para o companyId oficial.
     */
    static assignControls(repId: string, data: {
        userId: string;
        controlIds: string[];
        force?: boolean;
    }): Promise<{
        assigned: number;
        skipped: number;
        conflicts: any[];
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
    * 🔴 CORRIGIDO: Agora inclui o próprio preposto na contagem
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