import { IAuditEvidence, IAuditEvidenceQuestionRef } from '../types/audit.types';
export declare class AuditEvidenceService {
    create(data: {
        auditPlanId: string;
        findingId?: string;
        filename: string;
        filepath: string;
        mimeType: string;
        size: number;
        description?: string;
        questionRef?: IAuditEvidenceQuestionRef;
    }, uploadedBy: string): Promise<IAuditEvidence>;
    findByPlanId(auditPlanId: string): Promise<IAuditEvidence[]>;
    findByFindingId(findingId: string): Promise<IAuditEvidence[]>;
    findById(id: string): Promise<IAuditEvidence | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=AuditEvidenceService.d.ts.map