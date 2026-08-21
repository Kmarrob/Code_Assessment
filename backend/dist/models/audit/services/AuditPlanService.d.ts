import { IAuditPlan, CreateAuditPlanDTO, UpdateAuditPlanDTO, AuditFilters } from '../types/audit.types';
export declare class AuditPlanService {
    private checklistService;
    constructor();
    create(data: CreateAuditPlanDTO, createdBy: string, companyId: string): Promise<IAuditPlan>;
    private generateChecklist;
    findAll(filters: AuditFilters): Promise<IAuditPlan[]>;
    findById(id: string): Promise<IAuditPlan | null>;
    update(id: string, data: UpdateAuditPlanDTO, userId: string): Promise<IAuditPlan | null>;
    submitForApproval(id: string, userId: string): Promise<IAuditPlan | null>;
    approve(id: string, approverId: string): Promise<IAuditPlan | null>;
    reject(id: string, approverId: string, reason: string): Promise<IAuditPlan | null>;
    cancel(id: string, userId: string): Promise<IAuditPlan | null>;
    startAudit(id: string, userId: string): Promise<IAuditPlan | null>;
    completeAudit(id: string, userId: string): Promise<IAuditPlan | null>;
    validateEnterpriseAccess(companyId: string): Promise<boolean>;
    getStats(companyId: string): Promise<any>;
}
//# sourceMappingURL=AuditPlanService.d.ts.map