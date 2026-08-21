import { IAuditDocumentReview } from '../models/AuditDocumentReview';
export declare class AuditDocumentReviewService {
    create(data: Partial<IAuditDocumentReview>): Promise<IAuditDocumentReview>;
    findById(id: string): Promise<IAuditDocumentReview | null>;
    findByAuditPlanId(auditPlanId: string): Promise<IAuditDocumentReview | null>;
    findAllByCompany(companyId: string): Promise<IAuditDocumentReview[]>;
    update(id: string, data: Partial<IAuditDocumentReview>): Promise<IAuditDocumentReview | null>;
    updateDocument(id: string, clause: string, data: any): Promise<IAuditDocumentReview | null>;
    updateDocumentStatus(id: string, clause: string, status: string, observations?: string): Promise<IAuditDocumentReview | null>;
    addDocument(id: string, document: any): Promise<IAuditDocumentReview | null>;
    removeDocument(id: string, clause: string): Promise<IAuditDocumentReview | null>;
    completeReview(id: string, reviewedBy: string, observations?: string): Promise<IAuditDocumentReview | null>;
    delete(id: string): Promise<IAuditDocumentReview | null>;
    getSummary(id: string): Promise<any>;
    getNonconformities(id: string): Promise<any[]>;
    getRecommendations(id: string): Promise<any[]>;
}
export declare const auditDocumentReviewService: AuditDocumentReviewService;
//# sourceMappingURL=AuditDocumentReviewService.d.ts.map