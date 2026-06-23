import { ResponseStatus, MaturityLevel } from '../types/index.js';
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
     * Salvar resposta de um controle
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
}
//# sourceMappingURL=UserService.d.ts.map