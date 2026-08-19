import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class UserController {
    /**
     * Obter controles do usuário
     */
    static getControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter estatísticas do usuário
     */
    static getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Salvar resposta de um controle
     */
    static saveResponse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter progresso completo do usuário
     */
    static getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter perguntas por controle (para usuários)
     */
    static getQuestionsByControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Salvar progresso parcial de um controle (em andamento)
     * POST /api/user/progress
     */
    static saveProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar atividades em andamento/interrompidas do usuário
     * GET /api/user/progress/in-progress
     */
    static getInProgressActivities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verificar se o usuário tem atividades pendentes
     * GET /api/user/progress/has-pending
     */
    static hasPendingActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar progresso de uma atribuição específica
     * GET /api/user/progress/assignment/:assignmentId
     */
    static getProgressByAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Limpar progresso de uma atividade
     * DELETE /api/user/progress/assignment/:assignmentId
     */
    static clearProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map