import { IAuditSoA, IAuditSoAControl } from '../models/AuditSoA';
export declare class AuditSoAService {
    /**
     * Criar nova Declaração de Aplicabilidade
     */
    create(data: Partial<IAuditSoA>): Promise<IAuditSoA>;
    /**
     * Buscar SoA por ID
     */
    findById(id: string): Promise<IAuditSoA | null>;
    /**
     * Buscar SoA por empresa
     */
    findByCompany(companyId: string, options?: {
        status?: string;
    }): Promise<IAuditSoA[]>;
    /**
     * Buscar SoA ativa por empresa
     */
    findActiveByCompany(companyId: string): Promise<IAuditSoA | null>;
    /**
     * Atualizar SoA
     */
    update(id: string, data: Partial<IAuditSoA>): Promise<IAuditSoA | null>;
    /**
     * Atualizar um controle específico da SoA
     */
    updateControl(id: string, clause: string, data: Partial<IAuditSoAControl>): Promise<IAuditSoA | null>;
    /**
     * Aprovar SoA
     */
    approve(id: string, approvedBy: string): Promise<IAuditSoA | null>;
    /**
     * Arquivar SoA
     */
    archive(id: string): Promise<IAuditSoA | null>;
    /**
     * Excluir SoA (soft delete)
     */
    delete(id: string): Promise<IAuditSoA | null>;
    /**
     * Obter estatísticas da SoA
     */
    getStatistics(id: string): Promise<any>;
    /**
     * Exportar SoA para formato de planilha
     */
    exportToSpreadsheet(id: string): Promise<any>;
    /**
     * Obter título do controle (auxiliar)
     */
    private getControlTitle;
    /**
     * Obter objetivo do controle (auxiliar)
     */
    private getControlObjective;
}
export declare const auditSoAService: AuditSoAService;
//# sourceMappingURL=AuditSoAService.d.ts.map