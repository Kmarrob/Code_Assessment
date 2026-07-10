"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const RecommendationService_js_1 = require("../services/RecommendationService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const index_js_1 = require("../types/index.js");
const Control_js_1 = require("../models/Control.js");
class RecommendationController {
    /**
     * Criar uma recomendação para um controle (ADMIN)
     * POST /api/admin/recommendations
     */
    static async createRecommendation(req, res, next) {
        try {
            const userId = req.userId;
            const user = req.user;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { controlId, titulo, dominio, recomendacoes, solucoesTecnicas } = req.body;
            if (!controlId) {
                throw new errorHandler_js_1.ValidationError({ controlId: ['ID do controle é obrigatório'] });
            }
            if (!titulo) {
                throw new errorHandler_js_1.ValidationError({ titulo: ['Título é obrigatório'] });
            }
            if (!dominio) {
                throw new errorHandler_js_1.ValidationError({ dominio: ['Domínio é obrigatório'] });
            }
            if (!recomendacoes || !Array.isArray(recomendacoes) || recomendacoes.length === 0) {
                throw new errorHandler_js_1.ValidationError({ recomendacoes: ['Pelo menos uma recomendação é obrigatória'] });
            }
            const recommendation = await RecommendationService_js_1.RecommendationService.createRecommendation({
                controlId,
                titulo,
                dominio,
                recomendacoes,
                solucoesTecnicas: solucoesTecnicas || [],
            }, userId);
            res.status(201).json({
                success: true,
                message: 'Recomendação criada com sucesso',
                data: { recommendation },
                statusCode: 201,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Buscar recomendação por ID do controle
     * GET /api/admin/recommendations/:controlId
     */
    static async getByControlId(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { controlId } = req.params;
            if (!controlId) {
                throw new errorHandler_js_1.ValidationError({ controlId: ['ID do controle é obrigatório'] });
            }
            const recommendation = await RecommendationService_js_1.RecommendationService.getByControlId(controlId);
            res.json({
                success: true,
                data: { recommendation: recommendation || null },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Listar todas as recomendações (ADMIN)
     * GET /api/admin/recommendations
     */
    static async listRecommendations(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { page = 1, limit = 20, dominio, search } = req.query;
            const result = await RecommendationService_js_1.RecommendationService.listRecommendations({
                dominio: dominio,
                search: search,
            }, {
                page: Number(page),
                limit: Number(limit),
            });
            // 🔴 CORREÇÃO: Usar result.pagination.total e result.pagination.totalPages
            res.json({
                success: true,
                data: { recommendations: result.recommendations },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Atualizar uma recomendação (ADMIN)
     * PUT /api/admin/recommendations/:controlId
     */
    static async updateRecommendation(req, res, next) {
        try {
            const userId = req.userId;
            const user = req.user;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { controlId } = req.params;
            if (!controlId) {
                throw new errorHandler_js_1.ValidationError({ controlId: ['ID do controle é obrigatório'] });
            }
            const { titulo, dominio, recomendacoes, solucoesTecnicas } = req.body;
            const recommendation = await RecommendationService_js_1.RecommendationService.updateRecommendation(controlId, {
                titulo,
                dominio,
                recomendacoes,
                solucoesTecnicas,
            }, userId);
            res.json({
                success: true,
                message: 'Recomendação atualizada com sucesso',
                data: { recommendation },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Deletar uma recomendação (ADMIN)
     * DELETE /api/admin/recommendations/:controlId
     */
    static async deleteRecommendation(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { controlId } = req.params;
            if (!controlId) {
                throw new errorHandler_js_1.ValidationError({ controlId: ['ID do controle é obrigatório'] });
            }
            await RecommendationService_js_1.RecommendationService.deleteRecommendation(controlId);
            res.json({
                success: true,
                message: 'Recomendação removida com sucesso',
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Obter recomendações com respostas para o relatório (REP)
     * GET /api/recommendations/report/:companyId
     */
    static async getRecommendationsForReport(req, res, next) {
        try {
            const user = req.user;
            const { companyId } = req.params;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user.role !== index_js_1.UserRole.REP && user.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a prepostos e administradores', 403);
            }
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            if (user.role === index_js_1.UserRole.REP && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar dados desta empresa', 403);
            }
            const data = await RecommendationService_js_1.RecommendationService.getRecommendationsWithResponses(companyId);
            res.json({
                success: true,
                data,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Obter domínios disponíveis (ADMIN)
     * GET /api/admin/recommendations/dominios
     */
    static async getDominios(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const dominios = await RecommendationService_js_1.RecommendationService.getDominios();
            res.json({
                success: true,
                data: { dominios },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Buscar controles para autocomplete (ADMIN)
     * GET /api/recommendations/controls/search?q=5.2
     */
    static async searchControls(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { q } = req.query;
            if (!q || typeof q !== 'string' || q.trim().length === 0) {
                res.json({
                    success: true,
                    data: [],
                    statusCode: 200,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const controls = await Control_js_1.Control.find({
                $or: [
                    { id: { $regex: q, $options: 'i' } },
                    { nome: { $regex: q, $options: 'i' } },
                ],
            })
                .select('id nome tiposDeControles')
                .limit(10)
                .lean();
            res.json({
                success: true,
                data: controls,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RecommendationController = RecommendationController;
exports.default = RecommendationController;
//# sourceMappingURL=RecommendationController.js.map