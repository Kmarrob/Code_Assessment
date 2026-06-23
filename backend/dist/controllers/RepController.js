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
                throw new errorHandler_js_1.ValidationError({ userId: ['ID do usuário é obrigatório'] });
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
            const company = await Company_js_1.Company.findById(rep.companyId)
                .populate({
                path: 'assignedControls',
                select: '_id id nome dominioDeSI tipoDeControle nota',
            })
                .lean();
            if (!company) {
                throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
            }
            // Pegar os controles da empresa
            const controls = company.assignedControls || [];
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
}
exports.RepController = RepController;
//# sourceMappingURL=RepController.js.map