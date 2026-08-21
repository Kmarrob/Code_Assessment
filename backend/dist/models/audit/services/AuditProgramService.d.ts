import { IAuditProgram } from '../models/AuditProgram';
export declare class AuditProgramService {
    /**
     * Criar um novo programa de auditorias
     */
    create(data: Partial<IAuditProgram>): Promise<IAuditProgram>;
    /**
     * Buscar programa por ID
     */
    findById(id: string): Promise<IAuditProgram | null>;
    /**
     * Buscar programa por empresa e ano
     */
    findByCompanyAndYear(companyId: string, year: number): Promise<IAuditProgram | null>;
    /**
     * Listar programas de uma empresa
     */
    findAllByCompany(companyId: string, options?: {
        status?: string;
        limit?: number;
        skip?: number;
    }): Promise<IAuditProgram[]>;
    /**
     * Atualizar programa
     */
    update(id: string, data: Partial<IAuditProgram>): Promise<IAuditProgram | null>;
    /**
     * Aprovar programa
     */
    approve(id: string, approvedBy: string): Promise<IAuditProgram | null>;
    /**
     * Ativar programa (iniciar execução)
     */
    activate(id: string): Promise<IAuditProgram | null>;
    /**
     * Arquivar programa
     */
    archive(id: string): Promise<IAuditProgram | null>;
    /**
     * Adicionar setor ao programa
     */
    addSector(id: string, sector: {
        name: string;
        processes: string[];
        importance: 'critical' | 'standard';
        scoreA: number;
        scoreB: number;
        frequency: 'annual' | 'semiannual' | 'quarterly';
        nextAuditDate?: Date;
    }): Promise<IAuditProgram | null>;
    /**
     * Atualizar setor do programa
     */
    updateSector(id: string, sectorIndex: number, data: Partial<{
        name: string;
        processes: string[];
        importance: 'critical' | 'standard';
        scoreA: number;
        scoreB: number;
        frequency: 'annual' | 'semiannual' | 'quarterly';
        lastAuditDate: Date;
        nextAuditDate: Date;
        status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        auditPlanId: string;
    }>): Promise<IAuditProgram | null>;
    /**
     * Adicionar auditoria de fornecedor
     */
    addSupplierAudit(id: string, supplierAudit: {
        supplierName: string;
        supplierId?: string;
        auditDate: Date;
        scope: string;
    }): Promise<IAuditProgram | null>;
    /**
     * Atualizar auditoria de fornecedor
     */
    updateSupplierAudit(id: string, supplierIndex: number, data: Partial<{
        supplierName: string;
        supplierId: string;
        auditDate: Date;
        scope: string;
        status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        auditPlanId: string;
    }>): Promise<IAuditProgram | null>;
    /**
     * Atualizar auditoria externa
     */
    updateExternalAudit(id: string, data: Partial<{
        plannedDate: Date;
        certificationBody: string;
        scope: string;
        status: 'not_planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        auditPlanId: string;
    }>): Promise<IAuditProgram | null>;
    /**
     * Adicionar atividade ao programa
     */
    addActivity(id: string, activity: {
        name: string;
        description: string;
        scheduledDate: Date;
    }): Promise<IAuditProgram | null>;
    /**
     * Atualizar atividade
     */
    updateActivity(id: string, activityIndex: number, data: Partial<{
        name: string;
        description: string;
        scheduledDate: Date;
        status: 'pending' | 'in_progress' | 'completed';
        completedAt: Date;
    }>): Promise<IAuditProgram | null>;
    /**
     * Excluir programa (soft delete)
     */
    delete(id: string): Promise<IAuditProgram | null>;
    /**
     * Obter estatísticas do programa
     */
    getStatistics(id: string): Promise<any>;
    /**
     * Gerar próximas auditorias baseado no programa
     */
    generateNextAudits(id: string): Promise<any>;
}
export declare const auditProgramService: AuditProgramService;
//# sourceMappingURL=AuditProgramService.d.ts.map