import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class ConsultantController {
    /**
     * Listar empresas do consultor
     */
    static listCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter estatísticas do consultor
     */
    static getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter detalhes de uma empresa
     */
    static getCompanyDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ConsultantController.d.ts.map