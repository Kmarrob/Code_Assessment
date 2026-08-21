import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditActionPlanController {
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findByFindingId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findByResponsible(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    startProgress(req: AuthenticatedRequest, res: Response): Promise<Response>;
    complete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    validate(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=AuditActionPlanController.d.ts.map