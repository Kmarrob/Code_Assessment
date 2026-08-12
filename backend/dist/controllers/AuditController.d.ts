import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class AuditController {
    /**
     * Listar logs de auditoria com filtros
     * GET /api/admin/audit/logs
     */
    static listLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter estatísticas de logs
     * GET /api/admin/audit/stats
     */
    static getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar log por ID
     * GET /api/admin/audit/logs/:id
     */
    static getLogById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Exportar logs (CSV/JSON)
     * GET /api/admin/audit/export
     */
    static exportLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=AuditController.d.ts.map