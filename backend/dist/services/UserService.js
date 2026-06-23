"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// backend/src/services/UserService.ts
const Assignment_js_1 = require("../models/Assignment.js");
const Response_js_1 = require("../models/Response.js");
const User_js_1 = require("../models/User.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../types/index.js");
class UserService {
    /**
     * Obter controles atribuídos ao usuário
     */
    static async getUserControls(userId) {
        // Verificar se o usuário existe
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        // Buscar todas as atribuições do usuário
        const assignments = await Assignment_js_1.Assignment.find({ userId })
            .populate({
            path: 'controlId',
            select: '_id id nome dominioDeSI tipoDeControle nota',
        })
            .populate({
            path: 'assignedBy',
            select: 'name email',
        })
            .sort({ assignedAt: -1 })
            .lean();
        // Buscar respostas do usuário
        const responses = await Response_js_1.Response.find({ userId })
            .populate('controlId', 'id nome')
            .lean();
        // Mapear respostas por assignmentId
        const responseMap = new Map();
        responses.forEach((r) => {
            responseMap.set(r.assignmentId.toString(), r);
        });
        // Montar resultado
        const controls = assignments.map((assignment) => ({
            assignmentId: assignment._id,
            control: assignment.controlId,
            assignedBy: assignment.assignedBy,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
            response: responseMap.get(assignment._id.toString()) || null,
        }));
        return controls;
    }
    /**
     * Obter estatísticas do usuário
     */
    static async getUserStats(userId) {
        // Verificar se o usuário existe
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        // Buscar todas as atribuições do usuário
        const assignments = await Assignment_js_1.Assignment.find({ userId });
        const total = assignments.length;
        // Buscar respostas do usuário
        const responses = await Response_js_1.Response.find({ userId });
        const completed = responses.length;
        // Calcular estatísticas por status
        const pending = assignments.filter((a) => a.status === index_js_1.ResponseStatus.PENDING).length;
        const inProgress = assignments.filter((a) => a.status === index_js_1.ResponseStatus.IN_PROGRESS).length;
        return {
            total,
            completed,
            pending,
            inProgress,
        };
    }
    /**
     * Salvar resposta de um controle
     */
    static async saveResponse(userId, data) {
        const { assignmentId, maturityLevel, scenarioDescription, evidence, notes } = data;
        // Verificar se a atribuição existe e pertence ao usuário
        const assignment = await Assignment_js_1.Assignment.findOne({
            _id: assignmentId,
            userId,
        });
        if (!assignment) {
            throw new errorHandler_js_1.AppError('Atribuição não encontrada ou não pertence ao usuário', 404);
        }
        // Converter evidence para string se for array
        let evidenceString = '';
        if (evidence) {
            if (Array.isArray(evidence)) {
                evidenceString = evidence.join(', ');
            }
            else {
                evidenceString = evidence;
            }
        }
        // Verificar se já existe uma resposta
        let response = await Response_js_1.Response.findOne({ assignmentId });
        if (response) {
            // Atualizar resposta existente
            response.maturityLevel = maturityLevel;
            response.scenarioDescription = scenarioDescription || '';
            response.evidence = evidenceString ? [evidenceString] : [];
            response.observations = notes || '';
            await response.save();
        }
        else {
            // Criar nova resposta
            response = new Response_js_1.Response({
                assignmentId,
                userId,
                controlId: assignment.controlId,
                maturityLevel,
                scenarioDescription: scenarioDescription || '',
                evidence: evidenceString,
                observations: notes || '',
                submittedAt: new Date(),
            });
            await response.save();
            // Atualizar status da atribuição
            assignment.status = index_js_1.ResponseStatus.COMPLETED;
            await assignment.save();
        }
        logger_js_1.logger.info(`Resposta salva para o usuário ${userId} - Controle: ${assignment.controlId}`);
        return response;
    }
    /**
     * Obter progresso do usuário
     */
    static async getUserProgress(userId) {
        const controls = await this.getUserControls(userId);
        const stats = await this.getUserStats(userId);
        return {
            stats,
            controls,
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map