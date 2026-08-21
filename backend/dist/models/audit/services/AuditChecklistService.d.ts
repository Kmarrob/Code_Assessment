import { IAuditChecklist, IAuditChecklistItem } from '../types/audit.types';
export declare class AuditChecklistService {
    findByPlanAndControl(auditPlanId: string, controlId: string): Promise<IAuditChecklist | null>;
    findByPlanId(auditPlanId: string): Promise<IAuditChecklist[]>;
    populateWithUserResponses(auditPlanId: string, controlId: string, userId: string): Promise<IAuditChecklist | null>;
    populateAllChecklists(auditPlanId: string, userId: string): Promise<number>;
    updateChecklist(id: string, questions: IAuditChecklistItem[], userId: string): Promise<IAuditChecklist | null>;
    complete(id: string, userId: string): Promise<IAuditChecklist | null>;
    getStats(auditPlanId: string): Promise<any>;
}
//# sourceMappingURL=AuditChecklistService.d.ts.map