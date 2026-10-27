import { Request, Response } from 'express';
export declare class AuditQuestionController {
    /**
     * POST /api/internal-audit/questions
     * Cria uma nova pergunta de auditoria.
     */
    create(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/internal-audit/questions
     * Lista todas as perguntas com filtros.
     */
    findAll(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/internal-audit/questions/:id
     * Busca uma pergunta por ID.
     */
    findById(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/internal-audit/questions/:id
     * Atualiza uma pergunta.
     */
    update(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/internal-audit/questions/:id
     * Soft delete de uma pergunta.
     */
    delete(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/internal-audit/questions/stats
     * Estatísticas das perguntas.
     */
    getStats(req: Request, res: Response): Promise<void>;
}
export declare const auditQuestionController: AuditQuestionController;
//# sourceMappingURL=AuditQuestionController.d.ts.map