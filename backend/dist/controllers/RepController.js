"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepController = void 0;
const RepService_js_1 = require("../services/RepService.js");
const validation_js_1 = require("../utils/validation.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const errorLogger_js_1 = require("../utils/errorLogger.js");
const AuditService_js_1 = require("../services/AuditService.js");
const User_js_1 = require("../models/User.js");
const Company_js_1 = require("../models/Company.js");
const Response_js_1 = require("../models/Response.js");
const Assignment_js_1 = require("../models/Assignment.js");
const Question_js_1 = require("../models/Question.js");
const repValidation_js_1 = require("../utils/repValidation.js");
class RepController {
    /**
    
    * Listar usuários do preposto
      */
    static async listUsers(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const validation = (0, validation_js_1.validate)(repValidation_js_1.repListUsersSchema, req.query);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            const result = await RepService_js_1.RepService.listUsers(repId, validation.data);
            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
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
                query: req.query,
            });
            next(error);
        }
    }
    /**
    
    * Criar usuário pelo preposto
      */
    static async createUser(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const validation = (0, validation_js_1.validate)(repValidation_js_1.repCreateUserSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            const user = await RepService_js_1.RepService.createUser(repId, validation.data);
            if (req.userId) {
                AuditService_js_1.AuditService.logUserCreation(req.userId, req.user?.email || '', user._id.toString(), user.email, user.role, req.ip || '', req.headers['user-agent'] || '', true);
            }
            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: { user },
                statusCode: 201,
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
    
    * 🔴 NOVO: Editar usuário pelo preposto
      */
    static async updateUser(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { userId } = req.params;
            if (!userId) {
                throw new errorHandler_js_1.ValidationError({ userId: ['ID do usuário é obrigatório'] });
            }
            const { name, email, department } = req.body;
            // Validar se pelo menos um campo foi enviado
            if (!name && !email && !department) {
                throw new errorHandler_js_1.ValidationError({
                    fields: ['Pelo menos um campo (name, email, department) deve ser fornecido'],
                });
            }
            const updatedUser = await RepService_js_1.RepService.updateUser(repId, userId, {
                name,
                email,
                department,
            });
            res.json({
                success: true,
                message: 'Usuário atualizado com sucesso',
                data: { user: updatedUser },
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
                body: req.body,
            });
            next(error);
        }
    }
    /**
    
    * 🔴 NOVO: Inativar usuário com justificativa
      */
    static async inactivateUser(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { userId } = req.params;
            if (!userId) {
                throw new errorHandler_js_1.ValidationError({ userId: ['ID do usuário é obrigatório'] });
            }
            const { reason, description } = req.body;
            // Validar motivo
            const validReasons = ['Desligado', 'Mudou de setor', 'Outros'];
            if (!reason || !validReasons.includes(reason)) {
                throw new errorHandler_js_1.ValidationError({
                    reason: [`Motivo inválido. Use: ${validReasons.join(', ')}`],
                });
            }
            // Se motivo for "Outros", descrição é obrigatória
            if (reason === 'Outros' && (!description || description.trim().length < 5)) {
                throw new errorHandler_js_1.ValidationError({
                    description: [
                        'Descrição é obrigatória e deve ter no mínimo 5 caracteres quando motivo for "Outros"',
                    ],
                });
            }
            const result = await RepService_js_1.RepService.inactivateUser(repId, userId, {
                reason,
                description: description || '',
            });
            res.json({
                success: true,
                message: 'Usuário inativado com sucesso',
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
                body: req.body,
            });
            next(error);
        }
    }
    /**
    
    * 🔴 NOVO: Revogar controle com reatribuição
      */
    static async revokeControl(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { assignmentId } = req.params;
            if (!assignmentId) {
                throw new errorHandler_js_1.ValidationError({
                    assignmentId: ['ID da atribuição é obrigatório'],
                });
            }
            const { newUserId, confirmRevoke } = req.body;
            // Validar confirmação
            if (confirmRevoke !== true) {
                throw new errorHandler_js_1.ValidationError({
                    confirmRevoke: ['Você deve confirmar a revogação do controle'],
                });
            }
            // Se newUserId for fornecido, validar
            if (newUserId) {
                const userExists = await User_js_1.User.findOne({
                    _id: newUserId,
                    createdBy: repId,
                    role: 'user',
                    isActive: true,
                });
                if (!userExists) {
                    throw new errorHandler_js_1.NotFoundError('Usuário destino não encontrado ou inativo');
                }
            }
            const result = await RepService_js_1.RepService.revokeControl(repId, assignmentId, newUserId || null);
            res.json({
                success: true,
                message: result.newUserId
                    ? 'Controle revogado e reatribuído com sucesso'
                    : 'Controle revogado com sucesso',
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
                body: req.body,
            });
            next(error);
        }
    }
    /**
    
    * Atribuir controles a um usuário
      */
    static async assignControls(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const validation = (0, validation_js_1.validate)(repValidation_js_1.repAssignControlsSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            const result = await RepService_js_1.RepService.assignControls(repId, validation.data);
            res.json({
                success: true,
                message: `${result.assigned} controles atribuídos com sucesso`,
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
    
    * Obter progresso de um usuário
      */
    static async getUserProgress(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { userId } = req.params;
            if (!userId) {
                throw new errorHandler_js_1.ValidationError({
                    userId: ['ID do usuário é obrigatório'],
                });
            }
            const progress = await RepService_js_1.RepService.getUserProgress(repId, userId);
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
    
    * Obter progresso geral do preposto
      */
    static async getOverallProgress(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const progress = await RepService_js_1.RepService.getOverallProgress(repId);
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
    
    * Obter estatísticas do preposto
      */
    static async getStats(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const stats = await RepService_js_1.RepService.getStats(repId);
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
    
    * Obter controles da empresa do preposto
    * 🔴 CORRIGIDO: Controles agora são ordenados por ID
      */
    static async getCompanyControls(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const rep = await User_js_1.User.findById(repId);
            if (!rep) {
                throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
            }
            if (!rep.companyId) {
                throw new errorHandler_js_1.AppError('Preposto não possui empresa associada', 400);
            }
            // Buscar a empresa com os controles atribuídos
            const company = await Company_js_1.Company.findById(rep.companyId);
            if (!company) {
                throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
            }
            await company.populate({
                path: 'assignedControls',
                select: '_id id nome dominioDeSI tipoDeControle nota',
            });
            // Não utilizar .lean() aqui.
            // O documento já foi materializado com await Company.findById().
            // O uso de .lean() deve ocorrer na query, antes do await.
            /*
          
            * IMPORTANTE:
            * Os controles da empresa NÃO são excluídos nem alterados.
            *
            * Esta consulta apenas identifica quais controles já possuem
            * uma atribuição na coleção Assignment para que eles não sejam
            * exibidos novamente como disponíveis para o preposto.
            *
            * O controle continua existindo normalmente em:
            * * Control
            * * Company.assignedControls
            * * Assignment
            *
            * Apenas a lista retornada pela API é filtrada.
              */
            const assignedControls = await Assignment_js_1.Assignment.find({
                controlId: {
                    $in: (company.assignedControls || []).map((control) => control._id),
                },
            })
                .select('controlId')
                .lean();
            // IDs dos controles que já foram atribuídos a qualquer usuário
            const assignedControlIds = new Set(assignedControls.map((assignment) => assignment.controlId.toString()));
            // Retornar somente controles ainda não atribuídos
            const controls = (company.assignedControls || [])
                .filter((control) => !assignedControlIds.has(control._id.toString()))
                .sort((a, b) => {
                // Extrair o número do controle
                // Exemplo: "A.5.1" → 5.1
                // Exemplo: "5.8" → 5.8
                const aMatch = a.id?.match(/(\d+\.\d+)/);
                const bMatch = b.id?.match(/(\d+\.\d+)/);
                const aNum = aMatch ? parseFloat(aMatch[1]) : 0;
                const bNum = bMatch ? parseFloat(bMatch[1]) : 0;
                // Se os números principais forem iguais,
                // ordenar pelo ID completo
                if (aNum === bNum) {
                    return (a.id || '').localeCompare(b.id || '');
                }
                return aNum - bNum;
            });
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
    
    * Busca todos os usuários do preposto com suas respostas (otimizado)
    * GET /api/rep/users-with-responses
      */
    static async getUsersWithResponses(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            // Buscar o preposto para obter a empresa
            const rep = await User_js_1.User.findById(repId);
            if (!rep) {
                throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
            }
            const companyId = rep.companyId;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('Preposto não possui empresa associada', 400);
            }
            console.log('🔵 [getUsersWithResponses] companyId:', companyId);
            // Buscar todos os usuários do preposto
            const users = await User_js_1.User.find({
                createdBy: repId,
                role: 'user',
                isActive: true,
            }).select('_id name email department');
            console.log('🔵 [getUsersWithResponses] Usuários encontrados:', users.length);
            console.log('🔵 [getUsersWithResponses] IDs dos usuários:', users.map((u) => u._id));
            // Buscar respostas por userId
            const userIds = users.map((u) => u._id);
            // Buscar respostas com controle populado
            const responses = await Response_js_1.Response.find({
                userId: { $in: userIds },
            })
                .populate({
                path: 'controlId',
                select: 'id _id controlId nome name',
            })
                .lean();
            console.log('🔵 [getUsersWithResponses] Respostas encontradas:', responses.length);
            // 🔴 NOVO: Buscar todas as perguntas relacionadas aos controles
            const controlIds = responses
                .map((r) => r.controlId?.id || '')
                .filter((id) => id);
            let questionsMap = {};
            if (controlIds.length > 0) {
                const questions = await Question_js_1.Question.find({
                    controlId: { $in: controlIds },
                    active: true,
                }).lean();
                questionsMap = questions.reduce((acc, q) => {
                    acc[q.controlId] = q;
                    return acc;
                }, {});
                console.log('🔵 [getUsersWithResponses] Perguntas encontradas:', questions.length);
            }
            // Mapear respostas por usuário
            const responsesByUser = {};
            responses.forEach((r) => {
                const userId = r.userId?.toString() || r.userId;
                if (userId) {
                    if (!responsesByUser[userId]) {
                        responsesByUser[userId] = [];
                    }
                    // 🔴 CORREÇÃO: Apenas r.controlId?.id
                    const controlIdString = r.controlId?.id || '';
                    const question = questionsMap[controlIdString];
                    responsesByUser[userId].push({
                        _id: r._id,
                        controlId: r.controlId?._id || r.controlId,
                        controlIdString: controlIdString || r.controlId?._id || 'N/A',
                        controlName: r.controlId?.nome ||
                            r.controlId?.name ||
                            'Controle não identificado',
                        questionText: question?.text || '',
                        questionObjective: question?.objective || '',
                        maturityLevel: r.maturityLevel !== undefined &&
                            r.maturityLevel !== null
                            ? Number(r.maturityLevel)
                            : -1,
                        scenarioDescription: r.scenarioDescription || r.scenario || '',
                        observations: r.observations || '',
                        updatedAt: r.updatedAt ||
                            r.lastUpdatedAt ||
                            r.createdAt,
                    });
                }
            });
            console.log('🔵 [getUsersWithResponses] Respostas mapeadas por usuário:', Object.keys(responsesByUser));
            // Montar resultado
            const result = users.map((user) => {
                const userResponses = responsesByUser[user._id.toString()] || [];
                const totalResponses = userResponses.length;
                const completedResponses = userResponses.filter((r) => r.maturityLevel !== undefined &&
                    r.maturityLevel !== null &&
                    r.maturityLevel !== -1).length;
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    department: user.department || '-',
                    responses: userResponses,
                    totalResponses,
                    completedResponses,
                    progress: totalResponses > 0
                        ? Math.round((completedResponses / totalResponses) * 100)
                        : 0,
                };
            });
            console.log('🔵 [getUsersWithResponses] Resultado final:', JSON.stringify(result, null, 2).substring(0, 500));
            res.status(200).json({
                success: true,
                data: result,
                pagination: {
                    page: 1,
                    limit: result.length,
                    total: result.length,
                    totalPages: 1,
                },
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
    // ============================================
    // 🔴 NOVOS MÉTODOS PARA ATRIBUIÇÃO PARA SI MESMO
    // ============================================
    /**
    
    * 🔴 NOVO: Buscar controles já atribuídos ao preposto
    * GET /api/rep/my-assignments
      */
    static async getMyAssignments(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            // Buscar o preposto para obter a empresa
            const rep = await User_js_1.User.findById(repId);
            if (!rep) {
                throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
            }
            // Buscar atribuições do preposto (onde ele é o usuário)
            const assignments = await Assignment_js_1.Assignment.find({
                userId: repId,
            })
                .populate({
                path: 'controlId',
                select: '_id id nome dominioDeSI tipoDeControle nota',
            })
                .lean();
            // Formatar resposta
            const result = assignments.map((a) => ({
                _id: a._id,
                userId: a.userId,
                controlId: a.controlId?._id || a.controlId,
                controlName: a.controlId?.nome || 'Controle não encontrado',
                status: a.status,
                assignedAt: a.assignedAt,
            }));
            res.json({
                success: true,
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
            });
            next(error);
        }
    }
    /**
    
    * 🔴 NOVO: Atribuir controles para o próprio preposto
    * POST /api/rep/assign-to-self
      */
    static async assignToSelf(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { controlIds } = req.body;
            if (!controlIds ||
                !Array.isArray(controlIds) ||
                controlIds.length === 0) {
                throw new errorHandler_js_1.ValidationError({
                    controlIds: [
                        'Lista de controles é obrigatória e deve conter pelo menos um ID',
                    ],
                });
            }
            // Buscar o preposto
            const rep = await User_js_1.User.findById(repId);
            if (!rep) {
                throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
            }
            // Usar o método assignControls do RepService com o próprio ID
            const result = await RepService_js_1.RepService.assignControls(repId, {
                userId: repId,
                controlIds: controlIds,
                force: false,
            });
            // 🔴 NOTIFICAÇÃO: Atribuição para si mesmo
            if (result.assigned > 0) {
                const controlNames = controlIds
                    .map((id) => id)
                    .join(', ');
                // Mantido para preservar a lógica existente.
                // A variável controlNames continua sendo construída conforme o comportamento original.
                void controlNames;
                await AuditService_js_1.AuditService.logUserCreation(repId, req.user?.email || '', repId, rep.email, 'rep', req.ip || '', req.headers['user-agent'] || '', true);
            }
            res.json({
                success: true,
                message: `${result.assigned} controle(s) atribuído(s) para você com sucesso`,
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
}
exports.RepController = RepController;
//# sourceMappingURL=RepController.js.map