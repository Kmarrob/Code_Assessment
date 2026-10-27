import { IAuditChecklist, IAuditChecklistItem } from '../types/audit.types';
export interface UpdateChecklistPayload {
    questions?: IAuditChecklistItem[];
    auditQuestions?: Array<{
        sourceQuestionId?: string;
        text: string;
        objective?: string;
        guidance?: string;
        evidenceExpected?: string;
        order: number;
        answer: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';
        observations: string;
        evidenceIds: string[];
        answeredAt?: Date | string;
        answeredBy?: string;
    }>;
    finalConclusion?: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';
    finalObservation?: string;
    finalEvidenceIds?: string[];
    finalJustification?: string;
}
/**
 * ============================================================
 * SERVIÇO DE CHECKLIST
 * ============================================================
 */
export declare class AuditChecklistService {
    findByPlanAndControl(auditPlanId: string, controlId: string): Promise<IAuditChecklist | null>;
    findByPlanId(auditPlanId: string): Promise<IAuditChecklist[]>;
    populateWithUserResponses(auditPlanId: string, controlId: string, userId: string): Promise<IAuditChecklist | null>;
    populateAllChecklists(auditPlanId: string, userId: string): Promise<number>;
    updateChecklist(id: string, payloadOrQuestions: UpdateChecklistPayload | IAuditChecklistItem[], userId: string): Promise<IAuditChecklist | null>;
    complete(id: string, userId: string): Promise<IAuditChecklist | null>;
    getStats(auditPlanId: string): Promise<any>;
}
//# sourceMappingURL=AuditChecklistService.d.ts.map