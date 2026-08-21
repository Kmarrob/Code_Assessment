import { IAuditQuestion } from '../models/AuditQuestion';
export interface IQuestionFilters {
    search?: string;
    category?: 'clause' | 'control';
    isActive?: boolean;
    clause?: string;
    section?: string;
}
export declare class AuditQuestionService {
    /**
     * Criar uma nova pergunta
     */
    create(data: Partial<IAuditQuestion>, userId: string): Promise<IAuditQuestion>;
    /**
     * Listar perguntas com filtros
     */
    findAll(filters?: IQuestionFilters): Promise<IAuditQuestion[]>;
    /**
     * Buscar pergunta por ID
     */
    findById(id: string): Promise<IAuditQuestion | null>;
    /**
     * Atualizar pergunta
     */
    update(id: string, data: Partial<IAuditQuestion>, userId: string): Promise<IAuditQuestion | null>;
    /**
     * Ativar/Desativar pergunta
     */
    toggleStatus(id: string, isActive: boolean, userId: string): Promise<IAuditQuestion | null>;
    /**
     * Excluir pergunta (soft delete)
     */
    delete(id: string, userId: string): Promise<IAuditQuestion | null>;
    /**
     * Buscar perguntas por cláusula
     */
    findByClause(clause: string, onlyActive?: boolean): Promise<IAuditQuestion[]>;
    /**
     * Buscar perguntas por seção
     */
    findBySection(section: string, onlyActive?: boolean): Promise<IAuditQuestion[]>;
    /**
     * Buscar perguntas por controle
     */
    findByControlId(controlId: string, onlyActive?: boolean): Promise<IAuditQuestion[]>;
    /**
     * Obter estatísticas das perguntas
     */
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byCategory: {
            clause: number;
            control: number;
        };
        bySection: Record<string, number>;
    }>;
}
export declare const auditQuestionService: AuditQuestionService;
//# sourceMappingURL=AuditQuestionService.d.ts.map