"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_js_1 = require("../services/UserService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const errorLogger_js_1 = require("../utils/errorLogger.js");
const validation_js_1 = require("../utils/validation.js");
const zod_1 = require("zod");
const saveResponseSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().min(1, 'ID da atribuição é obrigatório'),
    maturityLevel: zod_1.z.enum(['N/A', '0', '1', '2']),
    scenarioDescription: zod_1.z.string().optional(),
    evidence: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
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
            res.json({
                success: true,
                message: 'Resposta salva com sucesso',
                data: response,
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
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map