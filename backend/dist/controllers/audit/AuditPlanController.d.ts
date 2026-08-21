import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditPlanController {
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findAll(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    submitForApproval(req: AuthenticatedRequest, res: Response): Promise<Response>;
    approve(req: AuthenticatedRequest, res: Response): Promise<Response>;
    reject(req: AuthenticatedRequest, res: Response): Promise<Response>;
    cancel(req: AuthenticatedRequest, res: Response): Promise<Response>;
    startAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    completeAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getStats(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=AuditPlanController.d.ts.map