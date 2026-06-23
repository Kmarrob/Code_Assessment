import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class RepController {
    /**
     * Listar usuários do preposto
     */
    static listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Criar usuário pelo preposto
     */
    static createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atribuir controles a um usuário
     */
    static assignControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter progresso de um usuário
     */
    static getUserProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter progresso geral do preposto
     */
    static getOverallProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter estatísticas do preposto
     */
    static getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter controles da empresa do preposto
     */
    static getCompanyControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=RepController.d.ts.map