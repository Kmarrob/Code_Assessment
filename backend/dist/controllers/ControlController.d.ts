import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class ControlController {
    /**
     * Lista todos os controles com paginação e filtros
     */
    static listControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Busca um controle por ID
     */
    static getControlById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Busca controles por domínio
     */
    static getControlsByDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obtém estatísticas dos controles
     */
    static getControlStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Cria um novo controle
     */
    static createControl(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualiza um controle existente
     */
    static updateControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Deleta um controle
     */
    static deleteControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ControlController.d.ts.map