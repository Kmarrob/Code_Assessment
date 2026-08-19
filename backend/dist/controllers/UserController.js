"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_js_1 = require("../services/UserService.js");
const index_js_1 = require("../types/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const errorLogger_js_1 = require("../utils/errorLogger.js");
const validation_js_1 = require("../utils/validation.js");
const zod_1 = require("zod");
const AuditService_js_1 = require("../services/AuditService.js");
const saveResponseSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().min(1, 'ID da atribuição é obrigatório'),
    maturityLevel: zod_1.z.enum(['N/A', '0', '1', '2']),
    scenarioDescription: zod_1.z.string().optional(),
    evidence: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
// 🆕 NOVO SCHEMA PARA PROGRESSO
const saveProgressSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().min(1, 'ID da atribuição é obrigatório'),
    partialData: zod_1.z.any(),
    progressStatus: zod_1.z.enum(['in_progress', 'interrupted']).default('in_progress'),
});
class UserController {
    /**
     * Obter controles do usuário
     */
    static async getControls(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const controls = await UserService_js_1.UserService.getUserControls(userId);
            res.json({
                success: true,
                data: controls,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
            });
            next(error);
        }
    }
    /**
     * Obter estatísticas do usuário
     */
    static async getStats(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const stats = await UserService_js_1.UserService.getUserStats(userId);
            res.json({
                success: true,
                data: stats,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
            });
            next(error);
        }
    }
    /**
     * Salvar resposta de um controle
     */
    static async saveResponse(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const validation = (0, validation_js_1.validate)(saveResponseSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            // Garantir que maturityLevel seja do tipo MaturityLevel
            const data = {
                ...validation.data,
                maturityLevel: validation.data.maturityLevel,
            };
            const response = await UserService_js_1.UserService.saveResponse(userId, data);
            // 🔐 AUDITORIA: Registro da resposta do controle ISO 27001
            if (req.userId) {
                await AuditService_js_1.AuditService.logControlResponse(req.userId, req.user?.email || '', data.assignmentId, response?.controlId || data.assignmentId, data.maturityLevel, req.ip || '', req.headers['user-agent'] || '', true);
            }
            res.json({
                success: true,
                message: 'Resposta salva com sucesso',
                data: response,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            // 🔐 AUDITORIA: Registro de falha no envio da resposta
            if (req.userId && req.body?.assignmentId) {
                await AuditService_js_1.AuditService.logControlResponse(req.userId, req.user?.email || '', req.body.assignmentId, req.body.assignmentId, req.body.maturityLevel || '0', req.ip || '', req.headers['user-agent'] || '', false, error instanceof Error ? error.message : 'Erro ao salvar resposta');
            }
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
                body: req.body,
            });
            next(error);
        }
    }
    /**
     * Obter progresso completo do usuário
     */
    static async getProgress(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const progress = await UserService_js_1.UserService.getUserProgress(userId);
            res.json({
                success: true,
                data: progress,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
            });
            next(error);
        }
    }
    /**
     * Obter perguntas por controle (para usuários)
     */
    static async getQuestionsByControl(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { controlId } = req.params;
            if (!controlId) {
                throw new errorHandler_js_1.AppError('ID do controle é obrigatório', 400);
            }
            // Importar o QuestionService
            const { QuestionService } = await import('../services/QuestionService.js');
            const questions = await QuestionService.getQuestionsByControl(controlId);
            res.json({
                success: true,
                data: questions,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
                params: req.params,
            });
            next(error);
        }
    }
    // ============================================
    // 🆕 NOVOS ENDPOINTS PARA PROGRESSO (ADICIONADOS - NADA FOI EXCLUÍDO)
    // ============================================
    /**
     * Salvar progresso parcial de um controle (em andamento)
     * POST /api/user/progress
     */
    static async saveProgress(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const validation = (0, validation_js_1.validate)(saveProgressSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            // 🆕 Converter progressStatus para o enum ProgressStatus
            const progressStatusEnum = validation.data.progressStatus === 'in_progress'
                ? index_js_1.ProgressStatus.IN_PROGRESS
                : index_js_1.ProgressStatus.INTERRUPTED;
            const result = await UserService_js_1.UserService.saveProgress(userId, validation.data.assignmentId, validation.data.partialData, progressStatusEnum);
            res.json({
                success: true,
                message: 'Progresso salvo com sucesso',
                data: result,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
                body: req.body,
            });
            next(error);
        }
    }
    /**
     * Buscar atividades em andamento/interrompidas do usuário
     * GET /api/user/progress/in-progress
     */
    static async getInProgressActivities(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const activities = await UserService_js_1.UserService.getInProgressActivities(userId);
            res.json({
                success: true,
                data: activities,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
            });
            next(error);
        }
    }
    /**
     * Verificar se o usuário tem atividades pendentes
     * GET /api/user/progress/has-pending
     */
    static async hasPendingActivity(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const hasPending = await UserService_js_1.UserService.hasPendingActivity(userId);
            res.json({
                success: true,
                data: { hasPending },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
            });
            next(error);
        }
    }
    /**
     * Buscar progresso de uma atribuição específica
     * GET /api/user/progress/assignment/:assignmentId
     */
    static async getProgressByAssignment(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { assignmentId } = req.params;
            if (!assignmentId) {
                throw new errorHandler_js_1.AppError('ID da atribuição é obrigatório', 400);
            }
            const progress = await UserService_js_1.UserService.getProgressByAssignment(userId, assignmentId);
            res.json({
                success: true,
                data: progress,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
                params: req.params,
            });
            next(error);
        }
    }
    /**
     * Limpar progresso de uma atividade
     * DELETE /api/user/progress/assignment/:assignmentId
     */
    static async clearProgress(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { assignmentId } = req.params;
            if (!assignmentId) {
                throw new errorHandler_js_1.AppError('ID da atribuição é obrigatório', 400);
            }
            const result = await UserService_js_1.UserService.clearProgress(userId, assignmentId);
            res.json({
                success: true,
                message: 'Progresso limpo com sucesso',
                data: result,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            errorLogger_js_1.ErrorLogger.logError(error, {
                userId: req.userId,
                email: req.user?.email,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                method: req.method,
                params: req.params,
            });
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map