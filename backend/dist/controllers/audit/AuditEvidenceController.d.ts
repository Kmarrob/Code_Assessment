import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditEvidenceController {
    upload(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findByPlanId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findByFindingId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=AuditEvidenceController.d.ts.map