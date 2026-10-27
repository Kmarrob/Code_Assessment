import { IAuditPlan, CreateAuditPlanDTO, UpdateAuditPlanDTO, AuditFilters } from '../types/audit.types';
export declare class AuditPlanService {
    private checklistService;
    constructor();
    /**
     * Busca os controles atribuídos à empresa.
     *
     * Fonte: Company.assignedControls (ObjectId[] referenciando Control).
     * Quando a empresa é criada, os 93 controles ISO 27001 são
     * atribuídos automaticamente. Este método retorna os IDs
     * desses controles no formato string.
     */
    getAllCompanyControls(companyId: string): Promise<string[]>;
    /**
     * Conta o total de controles atribuídos à empresa.
     */
    getTotalAvailableControls(companyId: string): Promise<number>;
    /**
     * Executa a geração de checklists e o populate em background.
     *
     * Este método é chamado de forma "fire-and-forget" pelo create.
     * Ele NÃO bloqueia a resposta ao frontend.
     *
     * Fluxo:
     *   1. Gera os checklists (um por controle)
     *   2. Popula cada checklist com as respostas dos usuários
     *
     * Todos os erros são logados, mas NÃO propagados — o plano
     * já foi salvo com sucesso antes desta fase começar.
     *
     * @param planId - ID do plano recém-criado
     * @param controlIds - IDs dos controles efetivos
     * @param createdBy - ID do usuário criador
     */
    private generateChecklistInBackground;
    create(data: CreateAuditPlanDTO, createdBy: string, companyId: string): Promise<IAuditPlan>;
    private generateChecklist;
    findAll(filters?: AuditFilters): Promise<IAuditPlan[]>;
    findByTeamMember(userId: string, role: 'lead' | 'auditor' | 'observer', companyId: string, options?: {
        statuses?: Array<'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'>;
        excludeStatuses?: Array<'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'>;
        limit?: number;
    }): Promise<IAuditPlan[]>;
    findById(id: string, companyId?: string): Promise<IAuditPlan | null>;
    update(id: string, data: UpdateAuditPlanDTO, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    excludeControl(planId: string, controlId: string, reason: string, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    approveExclusion(planId: string, controlId: string, approverId: string, companyId?: string): Promise<IAuditPlan | null>;
    rejectExclusion(planId: string, controlId: string, approverId: string, companyId?: string): Promise<IAuditPlan | null>;
    removeExclusion(planId: string, controlId: string, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    submitForApproval(id: string, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    approve(id: string, approverId: string, companyId?: string): Promise<IAuditPlan | null>;
    reject(id: string, approverId: string, reason: string, companyId?: string): Promise<IAuditPlan | null>;
    cancel(id: string, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    startAudit(id: string, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    completeAudit(id: string, userId: string, companyId?: string): Promise<IAuditPlan | null>;
    validateEnterpriseAccess(companyId: string): Promise<boolean>;
    getStats(companyId: string): Promise<any>;
}
//# sourceMappingURL=AuditPlanService.d.ts.map