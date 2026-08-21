import { IAuditReport, CreateAuditReportDTO, UpdateAuditReportDTO, AuditReportFilters } from '../types/audit.types';
export declare class AuditReportService {
    create(data: CreateAuditReportDTO, createdBy: string): Promise<IAuditReport>;
    findAll(filters: AuditReportFilters): Promise<IAuditReport[]>;
    findById(id: string): Promise<IAuditReport | null>;
    findByPlanId(auditPlanId: string): Promise<IAuditReport[]>;
    update(id: string, data: UpdateAuditReportDTO, userId: string): Promise<IAuditReport | null>;
    submitForReview(id: string, userId: string): Promise<IAuditReport | null>;
    approve(id: string, approverId: string): Promise<IAuditReport | null>;
    reject(id: string, approverId: string, reason: string): Promise<IAuditReport | null>;
    generateAutoReport(planId: string): Promise<IAuditReport>;
    private generateConclusion;
    private generateRecommendations;
}
//# sourceMappingURL=AuditReportService.d.ts.map