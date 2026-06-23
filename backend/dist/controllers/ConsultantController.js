"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantController = void 0;
const ConsultantService_js_1 = require("../services/ConsultantService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const errorLogger_js_1 = require("../utils/errorLogger.js");
class ConsultantController {
    /**
     * Listar empresas do consultor
     */
    static async listCompanies(req, res, next) {
        try {
            const consultantId = req.userId;
            if (!consultantId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { page, limit, search, status } = req.query;
            const result = await ConsultantService_js_1.ConsultantService.listCompanies(consultantId, {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search,
                status: status,
            });
            res.json({
                success: true,
                data: result.companies,
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
     * Obter estatísticas do consultor
     */
    static async getStats(req, res, next) {
        try {
            const consultantId = req.userId;
            if (!consultantId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const stats = await ConsultantService_js_1.ConsultantService.getStats(consultantId);
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
     * Obter detalhes de uma empresa
     */
    static async getCompanyDetails(req, res, next) {
        try {
            const consultantId = req.userId;
            if (!consultantId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.ValidationError({ companyId: ['ID da empresa é obrigatório'] });
            }
            const details = await ConsultantService_js_1.ConsultantService.getCompanyDetails(consultantId, companyId);
            res.json({
                success: true,
                data: details,
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
exports.ConsultantController = ConsultantController;
//# sourceMappingURL=ConsultantController.js.map