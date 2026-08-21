import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditFindingController {
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findByPlanId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findAll(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    submitForValidation(req: AuthenticatedRequest, res: Response): Promise<Response>;
    validate(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getStats(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=AuditFindingController.d.ts.map