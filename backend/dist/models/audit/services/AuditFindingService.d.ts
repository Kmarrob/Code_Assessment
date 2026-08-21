import { IAuditFinding, CreateAuditFindingDTO, UpdateAuditFindingDTO, AuditFindingFilters } from '../types/audit.types';
export declare class AuditFindingService {
    create(data: CreateAuditFindingDTO, auditPlanId: string, createdBy: string): Promise<IAuditFinding>;
    findByPlanId(auditPlanId: string): Promise<IAuditFinding[]>;
    findAll(filters: AuditFindingFilters): Promise<IAuditFinding[]>;
    findById(id: string): Promise<IAuditFinding | null>;
    update(id: string, data: UpdateAuditFindingDTO, userId: string): Promise<IAuditFinding | null>;
    validate(id: string, validatorId: string, status: 'closed' | 'reopened', comment?: string): Promise<IAuditFinding | null>;
    submitForValidation(id: string, userId: string): Promise<IAuditFinding | null>;
    getStats(auditPlanId: string): Promise<any>;
    private validateAuditorNotAuditingOwnArea;
}
//# sourceMappingURL=AuditFindingService.d.ts.map