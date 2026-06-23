"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
// backend/src/services/QuestionService.ts
const Question_js_1 = require("../models/Question.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
class QuestionService {
    /**
     * Listar todas as perguntas
     */
    static async listQuestions(filters = {}) {
        const filter = {};
        if (filters.controlId) {
            filter.controlId = filters.controlId;
        }
        if (filters.category && filters.category !== 'Todas') {
            filter.controlCategory = filters.category;
        }
        if (filters.active !== undefined) {
            filter.active = filters.active;
        }
        if (filters.search) {
            filter.$or = [
                { controlId: { $regex: filters.search, $options: 'i' } },
                { text: { $regex: filters.search, $options: 'i' } },
                { controlName: { $regex: filters.search, $options: 'i' } },
            ];
        }
        const questions = await Question_js_1.Question.find(filter)
            .sort({ controlId: 1, order: 1 })
            .lean();
        return questions;
    }
    /**
     * Buscar perguntas por controle
     */
    static async getQuestionsByControl(controlId) {
        const questions = await Question_js_1.Question.find({
            controlId,
            active: true,
        })
            .sort({ order: 1 })
            .lean();
        return questions;
    }
    /**
     * Buscar pergunta por ID
     */
    static async getQuestionById(id) {
        const question = await Question_js_1.Question.findById(id).lean();
        if (!question) {
            throw new errorHandler_js_1.NotFoundError('Pergunta não encontrada');
        }
        return question;
    }
    /**
     * Criar pergunta
     */
    static async createQuestion(data) {
        // Verificar se já existe pergunta com mesmo controlId e ordem
        if (data.controlId && data.order) {
            const existing = await Question_js_1.Question.findOne({
                controlId: data.controlId,
                order: data.order,
            });
            if (existing) {
                throw new errorHandler_js_1.ValidationError({
                    order: [`Já existe uma pergunta com a ordem ${data.order} para este controle`],
                });
            }
        }
        const question = new Question_js_1.Question(data);
        await question.save();
        logger_js_1.logger.info(`Pergunta criada para o controle ${question.controlId}`);
        return question;
    }
    /**
     * Atualizar pergunta
     */
    static async updateQuestion(id, data) {
        const question = await Question_js_1.Question.findById(id);
        if (!question) {
            throw new errorHandler_js_1.NotFoundError('Pergunta não encontrada');
        }
        // Verificar conflito de ordem
        if (data.controlId && data.order) {
            const existing = await Question_js_1.Question.findOne({
                controlId: data.controlId,
                order: data.order,
                _id: { $ne: id },
            });
            if (existing) {
                throw new errorHandler_js_1.ValidationError({
                    order: [`Já existe uma pergunta com a ordem ${data.order} para este controle`],
                });
            }
        }
        Object.assign(question, data);
        await question.save();
        logger_js_1.logger.info(`Pergunta ${question._id} atualizada`);
        return question;
    }
    /**
     * Deletar pergunta
     */
    static async deleteQuestion(id) {
        const question = await Question_js_1.Question.findByIdAndDelete(id);
        if (!question) {
            throw new errorHandler_js_1.NotFoundError('Pergunta não encontrada');
        }
        logger_js_1.logger.info(`Pergunta ${question._id} deletada`);
        return question;
    }
    /**
     * Ativar/Desativar pergunta
     */
    static async toggleActive(id) {
        const question = await Question_js_1.Question.findById(id);
        if (!question) {
            throw new errorHandler_js_1.NotFoundError('Pergunta não encontrada');
        }
        question.active = !question.active;
        await question.save();
        logger_js_1.logger.info(`Pergunta ${question._id} ${question.active ? 'ativada' : 'desativada'}`);
        return question;
    }
}
exports.QuestionService = QuestionService;
//# sourceMappingURL=QuestionService.js.map