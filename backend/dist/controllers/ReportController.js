"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const ReportService_js_1 = require("../services/ReportService.js");
const ReportResultService_js_1 = require("../services/ReportResultService.js"); // 🔴 NOVO
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const index_js_1 = require("../types/index.js");
const User_js_1 = require("../models/User.js");
const Response_js_1 = require("../models/Response.js");
const Assignment_js_1 = require("../models/Assignment.js");
class ReportController {
    /**
     * Obter ou criar relatório de uma empresa
     * GET /api/reports/company/:companyId
     * Acesso: REP (da empresa) ou ADMIN
     */
    static async getReportByCompany(req, res, next) {
        try {
            const { companyId } = req.params;
            const user = req.user;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar permissões
            if (user?.role !== index_js_1.UserRole.ADMIN && user?.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar este relatório', 403);
            }
            let report = await ReportService_js_1.ReportService.getOrCreateReport(companyId);
            // Se for a primeira vez, gerar dados automáticos
            if (report.clientTeam.length === 0) {
                report = await ReportService_js_1.ReportService.generateReportData(companyId);
            }
            // 🔴 POPULAR companyId para obter o nome da empresa
            await report.populate('companyId', 'name cnpj');
            res.json({
                success: true,
                data: { report },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Gerar dados automáticos do relatório
     * POST /api/reports/company/:companyId/generate
     * Acesso: REP (da empresa) ou ADMIN
     */
    static async generateReport(req, res, next) {
        try {
            const { companyId } = req.params;
            const user = req.user;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar permissões
            if (user?.role !== index_js_1.UserRole.ADMIN && user?.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar este relatório', 403);
            }
            const report = await ReportService_js_1.ReportService.generateReportData(companyId);
            // 🔴 POPULAR companyId para obter o nome da empresa
            await report.populate('companyId', 'name cnpj');
            res.json({
                success: true,
                message: 'Relatório gerado com sucesso',
                data: { report },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Atualizar relatório (campos editáveis)
     * PUT /api/reports/company/:companyId
     * Acesso: ADMIN (também REP com permissão)
     */
    static async updateReport(req, res, next) {
        try {
            const { companyId } = req.params;
            const userId = req.userId;
            const user = req.user;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar permissões
            if (user?.role !== index_js_1.UserRole.ADMIN && user?.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para editar este relatório', 403);
            }
            const { projectNumber, scope, status } = req.body;
            const report = await ReportService_js_1.ReportService.updateReport(companyId, { projectNumber, scope, status }, userId);
            // 🔴 POPULAR companyId para obter o nome da empresa
            await report.populate('companyId', 'name cnpj');
            res.json({
                success: true,
                message: 'Relatório atualizado com sucesso',
                data: { report },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Listar todos os relatórios (apenas ADMIN)
     * GET /api/reports
     * Acesso: ADMIN
     */
    static async listReports(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { page = 1, limit = 20, status, search } = req.query;
            const result = await ReportService_js_1.ReportService.listReports({
                status: status,
                search: search,
            }, {
                page: Number(page),
                limit: Number(limit),
            });
            res.json({
                success: true,
                data: { reports: result.reports },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: result.total,
                    totalPages: Math.ceil(result.total / Number(limit)),
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Obter dashboard do relatório com resumo (para preposto)
     * GET /api/reports/dashboard
     * Acesso: REP
     */
    static async getReportDashboard(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user.role !== index_js_1.UserRole.REP && user.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a prepostos e administradores', 403);
            }
            const companyId = user.companyId?.toString();
            if (!companyId) {
                throw new errorHandler_js_1.AppError('Preposto sem empresa associada', 400);
            }
            const report = await ReportService_js_1.ReportService.getOrCreateReport(companyId);
            // Gerar dados se estiver vazio
            let reportData = report;
            if (report.clientTeam.length === 0) {
                reportData = await ReportService_js_1.ReportService.generateReportData(companyId);
            }
            // 🔴 POPULAR companyId para obter o nome da empresa
            await reportData.populate('companyId', 'name cnpj');
            // 🔴 NOVO: Buscar dados de resultados (categorização e capacidades)
            const resultados = await ReportResultService_js_1.ReportResultService.getResultadosData(companyId);
            // Buscar estatísticas para o dashboard
            const totalUsers = await User_js_1.User.countDocuments({
                companyId: companyId,
                isActive: true,
                role: index_js_1.UserRole.USER,
            });
            const totalResponses = await Response_js_1.Response.countDocuments({ companyId: companyId });
            // Buscar usuários da empresa
            const users = await User_js_1.User.find({ companyId: companyId, isActive: true }).select('_id');
            const userIds = users.map(u => u._id);
            const totalControls = await Assignment_js_1.Assignment.countDocuments({
                userId: { $in: userIds }
            });
            res.json({
                success: true,
                data: {
                    report: reportData,
                    stats: {
                        totalUsers,
                        totalResponses,
                        totalControls,
                        completionRate: totalControls > 0 ? Math.round((totalResponses / totalControls) * 100) : 0,
                    },
                    resultados: resultados, // 🔴 NOVO
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=ReportController.js.map