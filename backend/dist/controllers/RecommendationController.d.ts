import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class RecommendationController {
    /**
     * Criar uma recomendação para um controle (ADMIN)
     * POST /api/admin/recommendations
     */
    static createRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar recomendação por ID do controle
     * GET /api/admin/recommendations/:controlId
     */
    static getByControlId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Listar todas as recomendações (ADMIN)
     * GET /api/admin/recommendations
     */
    static listRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar uma recomendação (ADMIN)
     * PUT /api/admin/recommendations/:controlId
     */
    static updateRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Deletar uma recomendação (ADMIN)
     * DELETE /api/admin/recommendations/:controlId
     */
    static deleteRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter recomendações com respostas para o relatório (REP)
     * GET /api/recommendations/report/:companyId
     */
    static getRecommendationsForReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter domínios disponíveis (ADMIN)
     * GET /api/admin/recommendations/dominios
     */
    static getDominios(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar controles para autocomplete (ADMIN)
     * GET /api/recommendations/controls/search?q=5.2
     */
    static searchControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export default RecommendationController;
//# sourceMappingURL=RecommendationController.d.ts.map