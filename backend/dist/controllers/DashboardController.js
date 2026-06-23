"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardService_js_1 = require("../services/DashboardService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const Company_js_1 = require("../models/Company.js");
const User_js_1 = require("../models/User.js");
class DashboardController {
    /**
     * Obter dados de maturidade da empresa do preposto
     */
    static async getRepDashboard(req, res, next) {
        try {
            const repId = req.userId;
            if (!repId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Verificar se o preposto pertence à empresa
            const user = await User_js_1.User.findById(repId);
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            // Se for rep, verificar se pertence à empresa
            if (user.role === 'rep' && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Acesso negado', 403);
            }
            const maturityData = await DashboardService_js_1.DashboardService.getCompanyMaturity(companyId);
            const stats = DashboardService_js_1.DashboardService.calculateMaturityStats(maturityData);
            const byDomain = DashboardService_js_1.DashboardService.groupByDomain(maturityData.controls);
            const byCategory = DashboardService_js_1.DashboardService.groupByCategory(maturityData.controls);
            const byType = DashboardService_js_1.DashboardService.groupByType(maturityData.controls);
            const byCyberConcept = DashboardService_js_1.DashboardService.groupByCyberConcept(maturityData.controls);
            const byCapability = DashboardService_js_1.DashboardService.groupByCapability(maturityData.controls);
            res.json({
                success: true,
                data: {
                    company: maturityData.company,
                    summary: {
                        totalControls: maturityData.totalControls,
                        totalUsers: maturityData.users,
                        ...stats,
                    },
                    byDomain,
                    byCategory,
                    byType,
                    byCyberConcept,
                    byCapability,
                    controls: maturityData.controls,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao obter dashboard do rep:', error);
            next(error);
        }
    }
    /**
     * Obter dados de maturidade de uma empresa (Admin)
     */
    static async getAdminCompanyDashboard(req, res, next) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            const maturityData = await DashboardService_js_1.DashboardService.getCompanyMaturity(companyId);
            const stats = DashboardService_js_1.DashboardService.calculateMaturityStats(maturityData);
            const byDomain = DashboardService_js_1.DashboardService.groupByDomain(maturityData.controls);
            const byCategory = DashboardService_js_1.DashboardService.groupByCategory(maturityData.controls);
            const byType = DashboardService_js_1.DashboardService.groupByType(maturityData.controls);
            const byCyberConcept = DashboardService_js_1.DashboardService.groupByCyberConcept(maturityData.controls);
            const byCapability = DashboardService_js_1.DashboardService.groupByCapability(maturityData.controls);
            res.json({
                success: true,
                data: {
                    company: maturityData.company,
                    summary: {
                        totalControls: maturityData.totalControls,
                        totalUsers: maturityData.users,
                        ...stats,
                    },
                    byDomain,
                    byCategory,
                    byType,
                    byCyberConcept,
                    byCapability,
                    controls: maturityData.controls,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao obter dashboard da empresa:', error);
            next(error);
        }
    }
    /**
     * Listar todas as empresas com resumo (Admin)
     */
    static async listCompaniesSummary(_req, res, next) {
        try {
            const companies = await Company_js_1.Company.find({ status: 'active' })
                .select('_id name consultantId')
                .lean();
            const summaries = await Promise.all(companies.map(async (company) => {
                const data = await DashboardService_js_1.DashboardService.getCompanyMaturity(company._id.toString());
                const stats = DashboardService_js_1.DashboardService.calculateMaturityStats(data);
                return {
                    id: company._id,
                    name: company.name,
                    consultantId: company.consultantId,
                    totalControls: data.totalControls,
                    totalUsers: data.users,
                    implemented: stats.statusCounts.Implementado || 0,
                    partial: stats.statusCounts['Parcialmente implementado'] || 0,
                    notImpl: stats.statusCounts['Não implementado'] || 0,
                    completionRate: stats.percentages.Implementado || 0,
                };
            }));
            res.json({
                success: true,
                data: summaries,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao listar resumo das empresas:', error);
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=DashboardController.js.map