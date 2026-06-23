import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class CompanyController {
    /**
     * Listar empresas (Admin)
     */
    static listCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar empresa por ID
     */
    static getCompanyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Criar empresa
     */
    static createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar empresa
     */
    static updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Desativar empresa
     */
    static deactivateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reativar empresa
     */
    static reactivateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atribuir todos os controles à empresa
     */
    static assignAllControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter estatísticas das empresas
     */
    static getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=CompanyController.d.ts.map