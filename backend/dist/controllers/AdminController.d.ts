import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class AdminController {
    static listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static reactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload da logo da empresa (apenas ADMIN)
     * POST /api/admin/company/:companyId/branding/logo
     */
    static uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload do favicon da empresa (apenas ADMIN)
     * POST /api/admin/company/:companyId/branding/favicon
     */
    static uploadFavicon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter branding da empresa
     * GET /api/admin/company/:companyId/branding
     * Acesso: ADMIN ou REP (apenas da própria empresa)
     */
    static getBranding(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remover logo da empresa (apenas ADMIN)
     * DELETE /api/admin/company/:companyId/branding/logo
     */
    static removeLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remover favicon da empresa (apenas ADMIN)
     * DELETE /api/admin/company/:companyId/branding/favicon
     */
    static removeFavicon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar configurações de branding (apenas ADMIN)
     * PUT /api/admin/company/:companyId/branding/settings
     */
    static updateBrandingSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter branding público da empresa (para frontend sem autenticação)
     * GET /api/branding/:companyId
     * CORRIGIDO: Retorna valores padrão mesmo se o companyId não existir
     */
    static getPublicBranding(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static listUsersFallback(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AdminController.d.ts.map