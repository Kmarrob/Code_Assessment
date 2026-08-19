import { ResponseStatus, MaturityLevel, ProgressStatus } from '../types/index.js';
export declare class UserService {
    /**
     * Obter controles atribuídos ao usuário
     */
    static getUserControls(userId: string): Promise<{
        assignmentId: import("mongoose").Types.ObjectId;
        control: import("mongoose").Types.ObjectId;
        assignedBy: import("mongoose").Types.ObjectId;
        assignedAt: Date;
        status: ResponseStatus;
        response: any;
    }[]>;
    /**
     * Obter estatísticas do usuário
     */
    static getUserStats(userId: string): Promise<{
        total: number;
        completed: number;
        pending: number;
        inProgress: number;
    }>;
    /**
     * Salvar resposta de um controle com automação do scenarioDescription
     */
    static saveResponse(userId: string, data: {
        assignmentId: string;
        maturityLevel: MaturityLevel;
        scenarioDescription?: string;
        evidence?: string | string[];
        notes?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../types/index.js").IResponse, {}, {}> & import("../types/index.js").IResponse & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Obter progresso do usuário
     */
    static getUserProgress(userId: string): Promise<{
        stats: {
            total: number;
            completed: number;
            pending: number;
            inProgress: number;
        };
        controls: {
            assignmentId: import("mongoose").Types.ObjectId;
            control: import("mongoose").Types.ObjectId;
            assignedBy: import("mongoose").Types.ObjectId;
            assignedAt: Date;
            status: ResponseStatus;
            response: any;
        }[];
    }>;
    /**
     * Salvar progresso parcial de um controle (em andamento)
     */
    static saveProgress(userId: string, assignmentId: string, partialData: any, progressStatus?: ProgressStatus.IN_PROGRESS | ProgressStatus.INTERRUPTED): Promise<import("mongoose").Document<unknown, {}, import("../types/index.js").IResponse, {}, {}> & import("../types/index.js").IResponse & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Buscar atividades em andamento/interrompidas do usuário
     */
    static getInProgressActivities(userId: string): Promise<{
        assignmentId: any;
        controlId: any;
        controlCode: any;
        controlName: any;
        progressStatus: any;
        lastActivityAt: any;
        partialData: any;
        isInterrupted: any;
        domain: any;
    }[]>;
    /**
     * Verificar se o usuário tem atividades pendentes
     */
    static hasPendingActivity(userId: string): Promise<boolean>;
    /**
     * Buscar progresso de uma atribuição específica
     */
    static getProgressByAssignment(userId: string, assignmentId: string): Promise<{
        assignmentId: string;
        controlId: import("mongoose").Types.ObjectId;
        controlCode: any;
        controlName: string;
        progressStatus: any;
        lastActivityAt: any;
        partialData: any;
        isInterrupted: any;
        existingResponse: {
            maturityLevel: any;
            scenarioDescription: any;
            observations: any;
        };
    } | null>;
    /**
     * Limpar progresso de uma atividade (quando o usuário conclui ou descarta)
     */
    static clearProgress(userId: string, assignmentId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=UserService.d.ts.map