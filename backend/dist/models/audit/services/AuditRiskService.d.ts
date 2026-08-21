import { IAuditRisk } from '../models/AuditRisk';
export declare class AuditRiskService {
    /**
     * Criar novo risco
     */
    create(data: Partial<IAuditRisk>): Promise<IAuditRisk>;
    /**
     * Buscar risco por ID
     */
    findById(id: string): Promise<IAuditRisk | null>;
    /**
     * Buscar risco por ID (identificador único)
     */
    findByRiskId(companyId: string, riskId: string): Promise<IAuditRisk | null>;
    /**
     * Listar riscos de uma empresa
     */
    findAllByCompany(companyId: string, options?: {
        status?: string;
        riskLevel?: string;
        auditPlanId?: string;
        limit?: number;
        skip?: number;
    }): Promise<IAuditRisk[]>;
    /**
     * Atualizar risco
     */
    update(id: string, data: Partial<IAuditRisk>): Promise<IAuditRisk | null>;
    /**
     * Atualizar avaliação do risco (probabilidade e impacto)
     */
    updateAssessment(id: string, data: {
        probability: 1 | 2 | 3 | 4 | 5;
        impact: 1 | 2 | 3 | 4 | 5;
        updatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * Tratar risco (aplicar tratamento)
     */
    treatRisk(id: string, data: {
        treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
        treatmentPlan: string;
        probabilityAfter: 1 | 2 | 3 | 4 | 5;
        impactAfter: 1 | 2 | 3 | 4 | 5;
        treatmentDeadline?: Date;
        treatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * Monitorar risco (após tratamento)
     */
    monitorRisk(id: string, data: {
        status: 'monitored' | 'closed';
        updatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * Reabrir risco
     */
    reopenRisk(id: string, data: {
        reason: string;
        updatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * Excluir risco (soft delete)
     */
    delete(id: string): Promise<IAuditRisk | null>;
    /**
     * Obter estatísticas de riscos
     */
    getStatistics(companyId: string): Promise<any>;
    /**
     * Obter riscos críticos (high e critical)
     */
    getCriticalRisks(companyId: string): Promise<IAuditRisk[]>;
    /**
     * Exportar riscos para formato de planilha
     */
    exportToSpreadsheet(companyId: string): Promise<any>;
}
export declare const auditRiskService: AuditRiskService;
//# sourceMappingURL=AuditRiskService.d.ts.map