import { IAuditActionPlan, CreateAuditActionPlanDTO, UpdateAuditActionPlanDTO } from '../types/audit.types';
export declare class AuditActionPlanService {
    create(data: CreateAuditActionPlanDTO, createdBy: string): Promise<IAuditActionPlan>;
    findByFindingId(findingId: string): Promise<IAuditActionPlan[]>;
    findByResponsible(responsible: string): Promise<IAuditActionPlan[]>;
    findById(id: string): Promise<IAuditActionPlan | null>;
    update(id: string, data: UpdateAuditActionPlanDTO, userId: string): Promise<IAuditActionPlan | null>;
    startProgress(id: string, userId: string): Promise<IAuditActionPlan | null>;
    complete(id: string, userId: string, evidenceIds?: string[]): Promise<IAuditActionPlan | null>;
    validate(id: string, validatorId: string, status: 'completed' | 'rejected', comment?: string): Promise<IAuditActionPlan | null>;
}
//# sourceMappingURL=AuditActionPlanService.d.ts.map