"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// backend/src/services/UserService.ts
const Assignment_js_1 = require("../models/Assignment.js");
const Response_js_1 = require("../models/Response.js");
const User_js_1 = require("../models/User.js");
const Question_js_1 = require("../models/Question.js");
const Control_js_1 = require("../models/Control.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../types/index.js");
// 🔴 NOVO: Import do NotificationService
const NotificationService_js_1 = require("./NotificationService.js");
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
     * Salvar resposta de um controle com automação do scenarioDescription
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
        // Buscar o usuário para obter o companyId
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        const companyId = user.companyId;
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
        // Automação: Buscar descrição automática
        let autoScenarioDescription = scenarioDescription || '';
        if (!scenarioDescription || scenarioDescription.trim() === '') {
            try {
                const control = await Control_js_1.Control.findById(assignment.controlId);
                if (!control) {
                    logger_js_1.logger.warn(`⚠️ Controle não encontrado para o assignment ${assignmentId}`);
                }
                else {
                    const question = await Question_js_1.Question.findOne({
                        controlId: control.id,
                        active: true
                    });
                    if (question) {
                        const level = Number(maturityLevel);
                        if (level === 2) {
                            autoScenarioDescription = question.answerImplemented || '';
                        }
                        else if (level === 1) {
                            autoScenarioDescription = question.answerPartial || '';
                        }
                        else if (level === 0) {
                            autoScenarioDescription = question.answerNotImplemented || '';
                        }
                        logger_js_1.logger.info(`🔍 Descrição automática preenchida para controle ${control.id} - Nível: ${level}`);
                    }
                    else {
                        logger_js_1.logger.warn(`⚠️ Pergunta não encontrada para o controle ${control.id}`);
                    }
                }
            }
            catch (error) {
                logger_js_1.logger.error(`❌ Erro ao buscar pergunta para o controle ${assignment.controlId}:`, error);
                autoScenarioDescription = scenarioDescription || '';
            }
        }
        // Verificar se já existe uma resposta
        let response = await Response_js_1.Response.findOne({ assignmentId });
        if (response) {
            // Atualizar resposta existente
            response.maturityLevel = maturityLevel;
            response.scenarioDescription = autoScenarioDescription;
            response.evidence = evidenceString ? [evidenceString] : [];
            response.observations = notes || '';
            response.progressStatus = index_js_1.ProgressStatus.COMPLETED;
            response.lastActivityAt = new Date();
            response.isInterrupted = false;
            await response.save();
        }
        else {
            // Criar nova resposta com companyId
            response = new Response_js_1.Response({
                assignmentId,
                userId,
                controlId: assignment.controlId,
                companyId: companyId,
                maturityLevel,
                scenarioDescription: autoScenarioDescription,
                evidence: evidenceString ? [evidenceString] : [],
                observations: notes || '',
                submittedAt: new Date(),
                progressStatus: index_js_1.ProgressStatus.COMPLETED,
                lastActivityAt: new Date(),
                isInterrupted: false,
                partialData: {},
            });
            await response.save();
            // Atualizar status da atribuição
            assignment.status = index_js_1.ResponseStatus.COMPLETED;
            await assignment.save();
        }
        // 🔴 CORREÇÃO: Atualizar status da atribuição SEMPRE (dentro ou fora do if/else)
        // Isso garante que mesmo quando a resposta já existe (atualização), o status seja alterado para COMPLETED
        if (assignment.status !== index_js_1.ResponseStatus.COMPLETED) {
            assignment.status = index_js_1.ResponseStatus.COMPLETED;
            await assignment.save();
            logger_js_1.logger.info(`✅ Assignment ${assignmentId} atualizado para COMPLETED`);
        }
        logger_js_1.logger.info(`Resposta salva para o usuário ${userId} - Controle: ${assignment.controlId}`);
        // 🔴 NOTIFICAÇÃO: Enviar notificação para o preposto
        try {
            const assignmentPopulated = await Assignment_js_1.Assignment.findById(assignmentId)
                .populate('assignedBy', 'name email');
            if (assignmentPopulated && assignmentPopulated.assignedBy) {
                const preposto = assignmentPopulated.assignedBy;
                // Buscar o controle para obter o nome
                const control = await Control_js_1.Control.findById(assignment.controlId);
                // Mapear nível para texto
                const levelMap = {
                    '2': 'Implementado',
                    '1': 'Parcialmente implementado',
                    '0': 'Não implementado',
                    '-1': 'Não se aplica'
                };
                const statusText = levelMap[maturityLevel] || maturityLevel;
                await NotificationService_js_1.NotificationService.notifyResponse(preposto._id.toString(), user.companyId?.toString() || '', user.name || 'Usuário', control?.nome || 'Controle', control?.id || assignment.controlId, response._id.toString());
                logger_js_1.logger.info(`📬 Notificação enviada para o preposto ${preposto.email} sobre a resposta do usuário ${user.email}`);
            }
        }
        catch (notifyError) {
            logger_js_1.logger.error('❌ Erro ao enviar notificação de resposta:', notifyError);
        }
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
    // ============================================
    // 🆕 NOVOS MÉTODOS PARA PROGRESSO (ADICIONADOS - NADA FOI EXCLUÍDO)
    // ============================================
    /**
     * Salvar progresso parcial de um controle (em andamento)
     */
    static async saveProgress(userId, assignmentId, partialData, progressStatus = index_js_1.ProgressStatus.IN_PROGRESS) {
        // Verificar se a atribuição existe e pertence ao usuário
        const assignment = await Assignment_js_1.Assignment.findOne({
            _id: assignmentId,
            userId,
        });
        if (!assignment) {
            throw new errorHandler_js_1.AppError('Atribuição não encontrada ou não pertence ao usuário', 404);
        }
        // Buscar o usuário para obter o companyId
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        const companyId = user.companyId;
        // Verificar se já existe uma resposta
        let response = await Response_js_1.Response.findOne({ assignmentId });
        if (response) {
            // Atualizar resposta existente com progresso
            response.partialData = partialData;
            response.progressStatus = progressStatus;
            response.lastActivityAt = new Date();
            response.isInterrupted = progressStatus === index_js_1.ProgressStatus.INTERRUPTED;
            // Se ainda não tem maturityLevel no partialData, manter o existente
            if (partialData.maturityLevel && partialData.maturityLevel !== '') {
                response.maturityLevel = partialData.maturityLevel;
            }
            await response.save();
        }
        else {
            // Criar nova resposta parcial
            response = new Response_js_1.Response({
                assignmentId,
                userId,
                controlId: assignment.controlId,
                companyId: companyId,
                maturityLevel: partialData.maturityLevel || 'N/A',
                scenarioDescription: partialData.scenarioDescription || '',
                observations: partialData.notes || '',
                submittedAt: new Date(),
                progressStatus: progressStatus,
                lastActivityAt: new Date(),
                isInterrupted: progressStatus === index_js_1.ProgressStatus.INTERRUPTED,
                partialData: partialData,
            });
            await response.save();
        }
        // Atualizar status da atribuição para IN_PROGRESS (se ainda não estiver)
        if (assignment.status !== index_js_1.ResponseStatus.IN_PROGRESS) {
            assignment.status = index_js_1.ResponseStatus.IN_PROGRESS;
            await assignment.save();
        }
        logger_js_1.logger.info(`📝 Progresso salvo para o usuário ${userId} - Controle: ${assignment.controlId} - Status: ${progressStatus}`);
        return response;
    }
    /**
     * Buscar atividades em andamento/interrompidas do usuário
     */
    static async getInProgressActivities(userId) {
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        const activities = await Response_js_1.Response.getInProgressActivities(userId);
        // Formatar resposta com informações adicionais
        const formattedActivities = activities.map((activity) => {
            const assignment = activity.assignmentId || {};
            const control = activity.controlId || {};
            return {
                assignmentId: activity.assignmentId?._id || activity.assignmentId,
                controlId: control._id || activity.controlId,
                controlCode: control.id || 'N/A',
                controlName: control.nome || 'Controle não identificado',
                progressStatus: activity.progressStatus,
                lastActivityAt: activity.lastActivityAt,
                partialData: activity.partialData || {},
                isInterrupted: activity.isInterrupted || false,
                domain: control.dominioDeSI || [],
            };
        });
        return formattedActivities;
    }
    /**
     * Verificar se o usuário tem atividades pendentes
     */
    static async hasPendingActivity(userId) {
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        return Response_js_1.Response.hasPendingActivities(userId);
    }
    /**
     * Buscar progresso de uma atribuição específica
     */
    static async getProgressByAssignment(userId, assignmentId) {
        // Verificar se a atribuição existe e pertence ao usuário
        const assignment = await Assignment_js_1.Assignment.findOne({
            _id: assignmentId,
            userId,
        });
        if (!assignment) {
            throw new errorHandler_js_1.AppError('Atribuição não encontrada ou não pertence ao usuário', 404);
        }
        const response = await Response_js_1.Response.getProgressByAssignment(assignmentId);
        if (!response) {
            return null;
        }
        // Buscar informações do controle
        const control = await Control_js_1.Control.findById(assignment.controlId).select('id nome dominioDeSI');
        return {
            assignmentId: assignmentId,
            controlId: assignment.controlId,
            controlCode: control?.id || 'N/A',
            controlName: control?.nome || 'Controle não identificado',
            progressStatus: response.progressStatus,
            lastActivityAt: response.lastActivityAt,
            partialData: response.partialData || {},
            isInterrupted: response.isInterrupted || false,
            existingResponse: {
                maturityLevel: response.maturityLevel || '',
                scenarioDescription: response.scenarioDescription || '',
                observations: response.observations || '',
            },
        };
    }
    /**
     * Limpar progresso de uma atividade (quando o usuário conclui ou descarta)
     */
    static async clearProgress(userId, assignmentId) {
        const assignment = await Assignment_js_1.Assignment.findOne({
            _id: assignmentId,
            userId,
        });
        if (!assignment) {
            throw new errorHandler_js_1.AppError('Atribuição não encontrada ou não pertence ao usuário', 404);
        }
        const response = await Response_js_1.Response.findOne({ assignmentId });
        if (response) {
            response.progressStatus = index_js_1.ProgressStatus.NOT_STARTED;
            response.isInterrupted = false;
            response.partialData = {};
            response.lastActivityAt = new Date();
            await response.save();
        }
        // Atualizar status da atribuição para PENDING (se não estiver concluída)
        if (assignment.status === index_js_1.ResponseStatus.IN_PROGRESS) {
            assignment.status = index_js_1.ResponseStatus.PENDING;
            await assignment.save();
        }
        logger_js_1.logger.info(`🧹 Progresso limpo para o usuário ${userId} - Controle: ${assignment.controlId}`);
        return { success: true };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map