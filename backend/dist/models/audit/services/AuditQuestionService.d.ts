import { IAuditQuestion } from '../models/AuditQuestion';
export interface CreateAuditQuestionDTO {
    clauseId: string;
    clauseTitle?: string;
    clauseGroup?: string;
    text: string;
    objective?: string;
    guidance?: string;
    evidenceExpected?: string;
    conformityCriteria?: string;
    nonconformityCriteria?: string;
    criticality?: 'low' | 'medium' | 'high' | 'critical';
    relatedControls?: string[];
    relatedDocuments?: string[];
    order?: number;
    active?: boolean;
}
export interface UpdateAuditQuestionDTO {
    clauseId?: string;
    clauseTitle?: string;
    clauseGroup?: string;
    text?: string;
    objective?: string;
    guidance?: string;
    evidenceExpected?: string;
    conformityCriteria?: string;
    nonconformityCriteria?: string;
    criticality?: 'low' | 'medium' | 'high' | 'critical';
    relatedControls?: string[];
    relatedDocuments?: string[];
    order?: number;
    active?: boolean;
}
export interface AuditQuestionFilters {
    clauseId?: string;
    clauseGroup?: string;
    criticality?: 'low' | 'medium' | 'high' | 'critical';
    active?: boolean;
    search?: string;
}
export declare class AuditQuestionService {
    /**
     * Cria uma nova pergunta de auditoria.
     */
    create(data: CreateAuditQuestionDTO, createdBy: string): Promise<IAuditQuestion>;
    /**
     * Lista todas as perguntas com filtros opcionais.
     */
    findAll(filters?: AuditQuestionFilters): Promise<IAuditQuestion[]>;
    /**
     * Busca uma pergunta por ID.
     */
    findById(id: string): Promise<IAuditQuestion | null>;
    /**
     * Atualiza uma pergunta.
     */
    update(id: string, data: UpdateAuditQuestionDTO): Promise<IAuditQuestion | null>;
    /**
     * Soft delete — marca como deletada, não remove fisicamente.
     */
    delete(id: string): Promise<boolean>;
    /**
     * Estatísticas das perguntas.
     */
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byCriticality: Record<string, number>;
        byClauseGroup: Record<string, number>;
    }>;
}
export declare const auditQuestionService: AuditQuestionService;
//# sourceMappingURL=AuditQuestionService.d.ts.map