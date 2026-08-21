"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditQuestionController = exports.AuditQuestionController = void 0;
const AuditQuestionService_1 = require("../../models/audit/services/AuditQuestionService");
class AuditQuestionController {
    /**
     * Criar uma nova pergunta
     * POST /api/internal-audit/questions
     */
    async create(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { text, clause, category, controlId, isActive, answerType, order, section } = req.body;
            if (!text || !clause || !category || !section) {
                res.status(400).json({
                    success: false,
                    message: 'Campos obrigatórios: text, clause, category, section',
                });
                return;
            }
            if (category === 'control' && !controlId) {
                res.status(400).json({
                    success: false,
                    message: 'Para perguntas de controle, controlId é obrigatório',
                });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.create({
                text,
                clause,
                category,
                controlId,
                isActive: isActive !== undefined ? isActive : true,
                answerType: answerType || 'C_NC_OB_OM_NA',
                order: order || 0,
                section,
            }, userId);
            res.status(201).json({
                success: true,
                data: question,
                message: 'Pergunta criada com sucesso',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao criar pergunta',
            });
        }
    }
    /**
     * Listar perguntas com filtros
     * GET /api/internal-audit/questions
     */
    async findAll(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { search, category, isActive, clause, section } = req.query;
            const filters = {
                search: search,
                category: category,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
                clause: clause,
                section: section,
            };
            const questions = await AuditQuestionService_1.auditQuestionService.findAll(filters);
            res.status(200).json({
                success: true,
                data: questions,
                total: questions.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao listar perguntas',
            });
        }
    }
    /**
     * Buscar pergunta por ID
     * GET /api/internal-audit/questions/:id
     */
    async findById(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID da pergunta é obrigatório',
                });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.findById(id);
            if (!question) {
                res.status(404).json({
                    success: false,
                    message: 'Pergunta não encontrada',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: question,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar pergunta',
            });
        }
    }
    /**
     * Atualizar pergunta
     * PUT /api/internal-audit/questions/:id
     */
    async update(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID da pergunta é obrigatório',
                });
                return;
            }
            const { text, clause, category, controlId, isActive, answerType, order, section } = req.body;
            const question = await AuditQuestionService_1.auditQuestionService.update(id, {
                text,
                clause,
                category,
                controlId,
                isActive,
                answerType,
                order,
                section,
            }, userId);
            if (!question) {
                res.status(404).json({
                    success: false,
                    message: 'Pergunta não encontrada',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: question,
                message: 'Pergunta atualizada com sucesso',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao atualizar pergunta',
            });
        }
    }
    /**
     * Ativar/Desativar pergunta
     * PATCH /api/internal-audit/questions/:id/toggle
     */
    async toggleStatus(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID da pergunta é obrigatório',
                });
                return;
            }
            const { isActive } = req.body;
            if (isActive === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'O campo isActive é obrigatório',
                });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.toggleStatus(id, isActive, userId);
            if (!question) {
                res.status(404).json({
                    success: false,
                    message: 'Pergunta não encontrada',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: question,
                message: `Pergunta ${isActive ? 'ativada' : 'desativada'} com sucesso`,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao alterar status',
            });
        }
    }
    /**
     * Excluir pergunta (soft delete)
     * DELETE /api/internal-audit/questions/:id
     */
    async delete(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID da pergunta é obrigatório',
                });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.delete(id, userId);
            if (!question) {
                res.status(404).json({
                    success: false,
                    message: 'Pergunta não encontrada',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Pergunta excluída com sucesso',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao excluir pergunta',
            });
        }
    }
    /**
     * Buscar perguntas por cláusula
     * GET /api/internal-audit/questions/clause/:clause
     */
    async findByClause(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { clause } = req.params;
            if (!clause) {
                res.status(400).json({
                    success: false,
                    message: 'Cláusula é obrigatória',
                });
                return;
            }
            const { onlyActive } = req.query;
            const questions = await AuditQuestionService_1.auditQuestionService.findByClause(clause, onlyActive !== 'false');
            res.status(200).json({
                success: true,
                data: questions,
                total: questions.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar perguntas por cláusula',
            });
        }
    }
    /**
     * Buscar perguntas por seção
     * GET /api/internal-audit/questions/section/:section
     */
    async findBySection(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const { section } = req.params;
            if (!section) {
                res.status(400).json({
                    success: false,
                    message: 'Seção é obrigatória',
                });
                return;
            }
            const { onlyActive } = req.query;
            const questions = await AuditQuestionService_1.auditQuestionService.findBySection(section, onlyActive !== 'false');
            res.status(200).json({
                success: true,
                data: questions,
                total: questions.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar perguntas por seção',
            });
        }
    }
    /**
     * Obter estatísticas das perguntas
     * GET /api/internal-audit/questions/stats
     */
    async getStats(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuário não autenticado' });
                return;
            }
            const stats = await AuditQuestionService_1.auditQuestionService.getStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao obter estatísticas',
            });
        }
    }
}
exports.AuditQuestionController = AuditQuestionController;
exports.auditQuestionController = new AuditQuestionController();
//# sourceMappingURL=AuditQuestionController.js.map