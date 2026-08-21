import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditQuestionController {
    /**
     * Criar uma nova pergunta
     * POST /api/internal-audit/questions
     */
    create(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Listar perguntas com filtros
     * GET /api/internal-audit/questions
     */
    findAll(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Buscar pergunta por ID
     * GET /api/internal-audit/questions/:id
     */
    findById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Atualizar pergunta
     * PUT /api/internal-audit/questions/:id
     */
    update(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Ativar/Desativar pergunta
     * PATCH /api/internal-audit/questions/:id/toggle
     */
    toggleStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Excluir pergunta (soft delete)
     * DELETE /api/internal-audit/questions/:id
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Buscar perguntas por cláusula
     * GET /api/internal-audit/questions/clause/:clause
     */
    findByClause(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Buscar perguntas por seção
     * GET /api/internal-audit/questions/section/:section
     */
    findBySection(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Obter estatísticas das perguntas
     * GET /api/internal-audit/questions/stats
     */
    getStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const auditQuestionController: AuditQuestionController;
//# sourceMappingURL=AuditQuestionController.d.ts.map