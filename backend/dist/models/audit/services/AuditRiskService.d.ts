import { IAuditRisk } from '../models/AuditRisk';
export declare class AuditRiskService {
    /**
     * ============================================================
     * GERAR PRÓXIMO IDENTIFICADOR DO RISCO
     * ============================================================
     *
     * O identificador é sequencial dentro da empresa.
     *
     * Exemplo:
     *
     * Empresa A:
     * R-001
     * R-002
     *
     * Empresa B:
     * R-001
     * R-002
     */
    private generateNextRiskId;
    /**
     * ============================================================
     * CRIAR NOVO RISCO
     * ============================================================
     */
    create(data: Partial<IAuditRisk>): Promise<IAuditRisk>;
    /**
     * ============================================================
     * BUSCAR RISCO POR OBJECT ID
     * ============================================================
     *
     * IMPORTANTE:
     *
     * Nunca buscar somente pelo _id.
     *
     * A empresa também precisa fazer parte do filtro.
     */
    findById(companyId: string, id: string): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * BUSCAR RISCO PELO IDENTIFICADOR FUNCIONAL
     * ============================================================
     */
    findByRiskId(companyId: string, riskId: string): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * LISTAR RISCOS DE UMA EMPRESA
     * ============================================================
     */
    findAllByCompany(companyId: string, options?: {
        status?: string;
        riskLevel?: string;
        auditPlanId?: string;
        limit?: number;
        skip?: number;
    }): Promise<IAuditRisk[]>;
    /**
     * ============================================================
     * ATUALIZAR RISCO
     * ============================================================
     *
     * O risco somente pode ser atualizado se pertencer à empresa.
     */
    update(companyId: string, id: string, data: Partial<IAuditRisk>): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * ATUALIZAR AVALIAÇÃO DO RISCO
     * ============================================================
     */
    updateAssessment(companyId: string, id: string, data: {
        probability: 1 | 2 | 3 | 4 | 5;
        impact: 1 | 2 | 3 | 4 | 5;
        updatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * TRATAR RISCO
     * ============================================================
     */
    treatRisk(companyId: string, id: string, data: {
        treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
        treatmentPlan: string;
        probabilityAfter: 1 | 2 | 3 | 4 | 5;
        impactAfter: 1 | 2 | 3 | 4 | 5;
        treatmentDeadline?: Date;
        treatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * MONITORAR RISCO
     * ============================================================
     */
    monitorRisk(companyId: string, id: string, data: {
        status: 'monitored' | 'closed';
        updatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * REABRIR RISCO
     * ============================================================
     */
    reopenRisk(companyId: string, id: string, data: {
        reason: string;
        updatedBy: string;
    }): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * SOFT DELETE
     * ============================================================
     */
    delete(companyId: string, id: string): Promise<IAuditRisk | null>;
    /**
     * ============================================================
     * ESTATÍSTICAS
     * ============================================================
     */
    getStatistics(companyId: string): Promise<any>;
    /**
     * ============================================================
     * RISCOS CRÍTICOS
     * ============================================================
     */
    getCriticalRisks(companyId: string): Promise<IAuditRisk[]>;
    /**
     * ============================================================
     * EXPORTAÇÃO
     * ============================================================
     */
    exportToSpreadsheet(companyId: string): Promise<any>;
}
export declare const auditRiskService: AuditRiskService;
//# sourceMappingURL=AuditRiskService.d.ts.map