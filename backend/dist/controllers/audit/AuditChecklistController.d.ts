import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditChecklistController {
    findByPlanAndControl(req: AuthenticatedRequest, res: Response): Promise<void>;
    findByPlanId(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateChecklist(req: AuthenticatedRequest, res: Response): Promise<void>;
    complete(req: AuthenticatedRequest, res: Response): Promise<void>;
    populateWithUserResponses(req: AuthenticatedRequest, res: Response): Promise<void>;
    getStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuditChecklistController.d.ts.map