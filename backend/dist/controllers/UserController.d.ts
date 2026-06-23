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
}
//# sourceMappingURL=UserController.d.ts.map