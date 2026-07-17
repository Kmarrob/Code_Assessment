"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const ReportService_js_1 = require("../services/ReportService.js");
const ReportResultService_js_1 = require("../services/ReportResultService.js");
const RecommendationService_js_1 = require("../services/RecommendationService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../types/index.js");
const User_js_1 = require("../models/User.js");
const Response_js_1 = require("../models/Response.js");
const Assignment_js_1 = require("../models/Assignment.js");
const Company_js_1 = require("../models/Company.js");
const PDFService_js_1 = require("../services/PDFService.js");
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
            // POPULAR companyId para obter o nome da empresa
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
            // POPULAR companyId para obter o nome da empresa
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
            // POPULAR companyId para obter o nome da empresa
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
            // POPULAR companyId para obter o nome da empresa
            await reportData.populate('companyId', 'name cnpj');
            // Buscar dados de resultados (categorização e capacidades)
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
                    resultados: resultados,
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
     * 🔴 NOVO: Obter dashboard do relatório por nome da empresa
     * GET /api/reports/dashboard/company/:companyName
     * Acesso: REP ou ADMIN
     */
    static async getReportDashboardByCompanyName(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user.role !== index_js_1.UserRole.REP && user.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a prepostos e administradores', 403);
            }
            const { companyName } = req.params;
            if (!companyName) {
                throw new errorHandler_js_1.AppError('Nome da empresa é obrigatório', 400);
            }
            // Buscar empresa pelo nome (case insensitive)
            const company = await Company_js_1.Company.findOne({
                name: { $regex: new RegExp('^' + companyName + '$', 'i') }
            });
            if (!company) {
                throw new errorHandler_js_1.NotFoundError(`Empresa "${companyName}" não encontrada`);
            }
            const companyId = company._id.toString();
            // Verificar permissões (REP só pode acessar sua própria empresa)
            if (user.role === index_js_1.UserRole.REP && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar o dashboard desta empresa', 403);
            }
            // Usar o companyId para buscar o dashboard
            const report = await ReportService_js_1.ReportService.getOrCreateReport(companyId);
            let reportData = report;
            if (report.clientTeam.length === 0) {
                reportData = await ReportService_js_1.ReportService.generateReportData(companyId);
            }
            await reportData.populate('companyId', 'name cnpj');
            const resultados = await ReportResultService_js_1.ReportResultService.getResultadosData(companyId);
            const totalUsers = await User_js_1.User.countDocuments({
                companyId: companyId,
                isActive: true,
                role: index_js_1.UserRole.USER,
            });
            const totalResponses = await Response_js_1.Response.countDocuments({ companyId: companyId });
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
                    resultados: resultados,
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
     * 🔴 NOVO: Obter dashboard completo do relatório para ADMIN (com companyId)
     * GET /api/reports/admin/dashboard/:companyId
     * Acesso: ADMIN
     */
    static async getAdminDashboardByCompany(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Buscar ou criar relatório
            const report = await ReportService_js_1.ReportService.getOrCreateReport(companyId);
            // Gerar dados se estiver vazio
            let reportData = report;
            if (report.clientTeam.length === 0) {
                reportData = await ReportService_js_1.ReportService.generateReportData(companyId);
            }
            // POPULAR companyId para obter o nome da empresa
            await reportData.populate('companyId', 'name cnpj');
            // Buscar dados de resultados (categorização e capacidades)
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
                    resultados: resultados,
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
     * 🔴 NOVO: Obter dados para a Matriz de Priorização
     * GET /api/reports/priorization/:companyId
     * Acesso: ADMIN ou REP (da empresa)
     */
    static async getPriorizationMatrix(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar permissões
            if (user.role !== index_js_1.UserRole.ADMIN && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar esta matriz', 403);
            }
            const matrixData = await ReportService_js_1.ReportService.getPriorizationMatrix(companyId);
            res.json({
                success: true,
                data: {
                    matrix: matrixData,
                    total: matrixData.length,
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
     * 🔴 NOVO: Obter Roadmap de Implementação
     * GET /api/reports/roadmap/:companyId
     * Acesso: ADMIN ou REP (da empresa)
     */
    static async getRoadmap(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar permissões
            if (user.role !== index_js_1.UserRole.ADMIN && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar este roadmap', 403);
            }
            const roadmapData = await ReportService_js_1.ReportService.getRoadmap(companyId);
            res.json({
                success: true,
                data: roadmapData,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 🔴 NOVO: Gerar PDF do relatório
     * GET /api/reports/:companyId/pdf
     * Acesso: ADMIN ou REP (da empresa)
     */
    static async generatePDF(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar permissões
            if (user.role !== index_js_1.UserRole.ADMIN && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para gerar o PDF deste relatório', 403);
            }
            // Buscar dados do relatório
            const report = await ReportService_js_1.ReportService.getOrCreateReport(companyId);
            let reportData = report;
            if (report.clientTeam.length === 0) {
                reportData = await ReportService_js_1.ReportService.generateReportData(companyId);
            }
            await reportData.populate('companyId', 'name cnpj');
            // Buscar dados complementares
            const resultados = await ReportResultService_js_1.ReportResultService.getResultadosData(companyId);
            const matrixData = await ReportService_js_1.ReportService.getPriorizationMatrix(companyId);
            const roadmapData = await ReportService_js_1.ReportService.getRoadmap(companyId);
            // 🔴 CORRIGIDO: Usar RecommendationService em vez de ReportService
            const recomendacoes = await RecommendationService_js_1.RecommendationService.getRecommendationsForReport(companyId);
            // Buscar branding da empresa
            const company = await Company_js_1.Company.findById(companyId).select('branding');
            const branding = company?.branding || null;
            // 🔴 CORRIGIDO: Acessar name corretamente com type assertion
            const companyName = reportData.companyId?.name || 'NOME DO CLIENTE';
            // Preparar dados para o PDF
            const pdfData = {
                report: reportData,
                resultados: resultados,
                matrix: matrixData,
                roadmap: roadmapData,
                recomendacoes: recomendacoes,
                branding: branding,
                user: {
                    name: user.name,
                    email: user.email,
                },
                companyName: companyName,
                generatedAt: new Date().toISOString(),
            };
            // Gerar PDF
            const pdfBuffer = await PDFService_js_1.PDFService.generateReportPDF(pdfData);
            // 🔴 CORRIGIDO: Usar a variável companyName já definida
            const fileName = `relatorio_${companyName}_${new Date().toISOString().split('T')[0]}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao gerar PDF:', error);
            next(error);
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=ReportController.js.map