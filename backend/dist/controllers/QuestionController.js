"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionController = void 0;
const QuestionService_js_1 = require("../services/QuestionService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const zod_1 = require("zod");
const questionSchema = zod_1.z.object({
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
    controlName: zod_1.z.string().optional(),
    controlCategory: zod_1.z.string().optional(),
    text: zod_1.z.string().min(1, 'Pergunta é obrigatória'),
    objective: zod_1.z.string().optional(),
    answerImplemented: zod_1.z.string().optional(),
    answerPartial: zod_1.z.string().optional(),
    answerNotImplemented: zod_1.z.string().optional(),
    guidance: zod_1.z.string().optional(),
    attachmentUrl: zod_1.z.string().optional(),
    attachmentName: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
    active: zod_1.z.boolean().optional(),
});
class QuestionController {
    /**
     * Listar perguntas
     */
    static async listQuestions(req, res, next) {
        try {
            const { search, category, active, controlId } = req.query;
            const questions = await QuestionService_js_1.QuestionService.listQuestions({
                search: search,
                category: category,
                active: active ? active === 'true' : undefined,
                controlId: controlId,
            });
            res.json({
                success: true,
                data: questions,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Buscar perguntas por controle
     */
    static async getQuestionsByControl(req, res, next) {
        try {
            const { controlId } = req.params;
            if (!controlId) {
                throw new errorHandler_js_1.AppError('ID do controle é obrigatório', 400);
            }
            const questions = await QuestionService_js_1.QuestionService.getQuestionsByControl(controlId);
            res.json({
                success: true,
                data: questions,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Buscar pergunta por ID
     */
    static async getQuestionById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da pergunta é obrigatório', 400);
            }
            const question = await QuestionService_js_1.QuestionService.getQuestionById(id);
            res.json({
                success: true,
                data: question,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Criar pergunta
     */
    static async createQuestion(req, res, next) {
        try {
            const validatedData = questionSchema.parse(req.body);
            const question = await QuestionService_js_1.QuestionService.createQuestion(validatedData);
            logger_js_1.logger.info(`Pergunta criada por ${req.user?.email}`);
            res.status(201).json({
                success: true,
                message: 'Pergunta criada com sucesso',
                data: question,
                statusCode: 201,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    errors: error.errors,
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            next(error);
        }
    }
    /**
     * Atualizar pergunta
     */
    static async updateQuestion(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da pergunta é obrigatório', 400);
            }
            const validatedData = questionSchema.partial().parse(req.body);
            const question = await QuestionService_js_1.QuestionService.updateQuestion(id, validatedData);
            logger_js_1.logger.info(`Pergunta ${id} atualizada por ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Pergunta atualizada com sucesso',
                data: question,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    errors: error.errors,
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            next(error);
        }
    }
    /**
     * Deletar pergunta
     */
    static async deleteQuestion(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da pergunta é obrigatório', 400);
            }
            await QuestionService_js_1.QuestionService.deleteQuestion(id);
            logger_js_1.logger.info(`Pergunta ${id} deletada por ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Pergunta deletada com sucesso',
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Ativar/Desativar pergunta
     */
    static async toggleActive(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da pergunta é obrigatório', 400);
            }
            const question = await QuestionService_js_1.QuestionService.toggleActive(id);
            logger_js_1.logger.info(`Pergunta ${id} ${question.active ? 'ativada' : 'desativada'} por ${req.user?.email}`);
            res.json({
                success: true,
                message: `Pergunta ${question.active ? 'ativada' : 'desativada'} com sucesso`,
                data: question,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.QuestionController = QuestionController;
//# sourceMappingURL=QuestionController.js.map