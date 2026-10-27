"use strict";
// ============================================================
// AuditQuestionController.ts
// ============================================================
//
// CONTROLLER: Gerenciamento de perguntas de auditoria
//
// ACESSO:
//   Todas as rotas têm middleware `authorize(UserRole.ADMIN)`
//   no arquivo de rotas (defesa em profundidade).
//
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditQuestionController = exports.AuditQuestionController = void 0;
// 🔧 CORREÇÃO v49.2.1 — Caminho correto do service
// ANTES:  '../services/AuditQuestionService'                    → controllers/services/ (inexistente)
// DEPOIS: '../../models/audit/services/AuditQuestionService'    → correto
const AuditQuestionService_1 = require("../../models/audit/services/AuditQuestionService");
class AuditQuestionController {
    /**
     * POST /api/internal-audit/questions
     * Cria uma nova pergunta de auditoria.
     */
    async create(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.create(req.body, user._id.toString());
            res.status(201).json({
                success: true,
                data: question,
                message: 'Pergunta criada com sucesso',
            });
        }
        catch (error) {
            console.error('❌ [AuditQuestionController.create]', error);
            res.status(400).json({
                success: false,
                message: error?.message || 'Erro ao criar pergunta',
            });
        }
    }
    /**
     * GET /api/internal-audit/questions
     * Lista todas as perguntas com filtros.
     */
    async findAll(req, res) {
        try {
            const { clauseId, clauseGroup, criticality, active, search } = req.query;
            const filters = {};
            if (clauseId)
                filters.clauseId = String(clauseId);
            if (clauseGroup)
                filters.clauseGroup = String(clauseGroup);
            if (criticality)
                filters.criticality = String(criticality);
            if (active !== undefined)
                filters.active = active === 'true';
            if (search)
                filters.search = String(search);
            const questions = await AuditQuestionService_1.auditQuestionService.findAll(filters);
            res.status(200).json({
                success: true,
                data: questions,
                total: questions.length,
            });
        }
        catch (error) {
            console.error('❌ [AuditQuestionController.findAll]', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao listar perguntas',
            });
        }
    }
    /**
     * GET /api/internal-audit/questions/:id
     * Busca uma pergunta por ID.
     */
    async findById(req, res) {
        try {
            // 🔧 v49.2.2 — Guard para TypeScript: garante que id é string
            const id = String(req.params.id || '').trim();
            if (!id) {
                res.status(400).json({ success: false, message: 'ID é obrigatório' });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.findById(id);
            if (!question) {
                res.status(404).json({ success: false, message: 'Pergunta não encontrada' });
                return;
            }
            res.status(200).json({ success: true, data: question });
        }
        catch (error) {
            console.error('❌ [AuditQuestionController.findById]', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar pergunta',
            });
        }
    }
    /**
     * PUT /api/internal-audit/questions/:id
     * Atualiza uma pergunta.
     */
    async update(req, res) {
        try {
            // 🔧 v49.2.2 — Guard para TypeScript: garante que id é string
            const id = String(req.params.id || '').trim();
            if (!id) {
                res.status(400).json({ success: false, message: 'ID é obrigatório' });
                return;
            }
            const question = await AuditQuestionService_1.auditQuestionService.update(id, req.body);
            res.status(200).json({
                success: true,
                data: question,
                message: 'Pergunta atualizada com sucesso',
            });
        }
        catch (error) {
            console.error('❌ [AuditQuestionController.update]', error);
            res.status(400).json({
                success: false,
                message: error?.message || 'Erro ao atualizar pergunta',
            });
        }
    }
    /**
     * DELETE /api/internal-audit/questions/:id
     * Soft delete de uma pergunta.
     */
    async delete(req, res) {
        try {
            // 🔧 v49.2.2 — Guard para TypeScript: garante que id é string
            const id = String(req.params.id || '').trim();
            if (!id) {
                res.status(400).json({ success: false, message: 'ID é obrigatório' });
                return;
            }
            await AuditQuestionService_1.auditQuestionService.delete(id);
            res.status(200).json({
                success: true,
                message: 'Pergunta excluída com sucesso',
            });
        }
        catch (error) {
            console.error('❌ [AuditQuestionController.delete]', error);
            res.status(400).json({
                success: false,
                message: error?.message || 'Erro ao excluir pergunta',
            });
        }
    }
    /**
     * GET /api/internal-audit/questions/stats
     * Estatísticas das perguntas.
     */
    async getStats(req, res) {
        try {
            const stats = await AuditQuestionService_1.auditQuestionService.getStats();
            res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            console.error('❌ [AuditQuestionController.getStats]', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar estatísticas',
            });
        }
    }
}
exports.AuditQuestionController = AuditQuestionController;
// ============================================================
// INSTÂNCIA SINGLETON
// ============================================================
exports.auditQuestionController = new AuditQuestionController();
//# sourceMappingURL=AuditQuestionController.js.map