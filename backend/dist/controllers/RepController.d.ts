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
     * Editar usuário pelo preposto
     */
    static updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Inativar usuário com justificativa
     */
    static inactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Revogar controle com reatribuição
     */
    static revokeControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
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
     *
     * Os controles continuam existindo normalmente no banco de dados.
     * A lista retornada é apenas filtrada para remover controles que já
     * possuem uma atribuição na coleção Assignment.
     */
    static getCompanyControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Busca todos os usuários do preposto com suas respostas (otimizado)
     *
     * GET /api/rep/users-with-responses
     */
    static getUsersWithResponses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar controles já atribuídos ao preposto
     *
     * GET /api/rep/my-assignments
     */
    static getMyAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atribuir controles para o próprio preposto
     *
     * POST /api/rep/assign-to-self
     */
    static assignToSelf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=RepController.d.ts.map