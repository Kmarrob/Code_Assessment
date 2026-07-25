"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardService_js_1 = require("../services/DashboardService.js");
const DashboardPDFService_js_1 = require("../services/DashboardPDFService.js");
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
            // CORREÇÃO: Usar o summary completo do maturityData
            const summary = maturityData.summary || {
                totalControls: maturityData.totalControls,
                Implementado: stats.statusCounts.Implementado || 0,
                Parcialmente: stats.statusCounts['Parcialmente implementado'] || 0,
                NaoImplementado: stats.statusCounts['Não implementado'] || 0,
                NaoSeAplica: stats.statusCounts['Não se aplica'] || 0,
                percentages: stats.percentages,
                maturityLevels: stats.maturityLevels,
            };
            res.json({
                success: true,
                data: {
                    company: maturityData.company,
                    summary: summary,
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
            // CORREÇÃO: Usar o summary completo do maturityData
            const summary = maturityData.summary || {
                totalControls: maturityData.totalControls,
                Implementado: stats.statusCounts.Implementado || 0,
                Parcialmente: stats.statusCounts['Parcialmente implementado'] || 0,
                NaoImplementado: stats.statusCounts['Não implementado'] || 0,
                NaoSeAplica: stats.statusCounts['Não se aplica'] || 0,
                percentages: stats.percentages,
                maturityLevels: stats.maturityLevels,
            };
            res.json({
                success: true,
                data: {
                    company: maturityData.company,
                    summary: summary,
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
    // ============================================
    // 🔴 NOVO: GERAR PDF DO DASHBOARD
    // ============================================
    /**
     * 🔴 NOVO: Gerar PDF do Dashboard de Maturidade
     * GET /api/rep/dashboard/:companyId/pdf
     * Acesso: REP ou ADMIN
     */
    static async generateDashboardPDF(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { companyId } = req.params;
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            // Buscar usuário para verificar permissões
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            // Verificar permissões: ADMIN pode acessar qualquer empresa, REP apenas a sua
            if (user.role === 'rep' && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Acesso negado', 403);
            }
            // Buscar dados do dashboard
            const maturityData = await DashboardService_js_1.DashboardService.getCompanyMaturity(companyId);
            const stats = DashboardService_js_1.DashboardService.calculateMaturityStats(maturityData);
            const byDomain = DashboardService_js_1.DashboardService.groupByDomain(maturityData.controls);
            const byCategory = DashboardService_js_1.DashboardService.groupByCategory(maturityData.controls);
            const byType = DashboardService_js_1.DashboardService.groupByType(maturityData.controls);
            const byCyberConcept = DashboardService_js_1.DashboardService.groupByCyberConcept(maturityData.controls);
            const byCapability = DashboardService_js_1.DashboardService.groupByCapability(maturityData.controls);
            // Montar summary
            const summary = maturityData.summary || {
                totalControls: maturityData.totalControls,
                Implementado: stats.statusCounts.Implementado || 0,
                Parcialmente: stats.statusCounts['Parcialmente implementado'] || 0,
                NaoImplementado: stats.statusCounts['Não implementado'] || 0,
                NaoSeAplica: stats.statusCounts['Não se aplica'] || 0,
                percentages: stats.percentages,
                maturityLevels: stats.maturityLevels,
            };
            // Preparar dados para o PDF
            const pdfData = {
                company: {
                    // 🔴 CORREÇÃO: usar 'id' em vez de '_id'
                    id: maturityData.company?.id?.toString() || companyId,
                    name: maturityData.company?.name || 'Empresa não identificada',
                },
                summary: summary,
                byDomain: byDomain || {},
                byCategory: byCategory || {},
                byType: byType || {},
                byCyberConcept: byCyberConcept || {},
                byCapability: byCapability || {},
                user: {
                    name: user.name || 'Usuário não identificado',
                    email: user.email || 'email@nao.informado',
                },
                generatedAt: new Date().toISOString(),
            };
            // Gerar PDF
            const pdfBuffer = await DashboardPDFService_js_1.DashboardPDFService.generateDashboardPDF(pdfData);
            // Verificar buffer
            if (!pdfBuffer || pdfBuffer.length === 0) {
                throw new errorHandler_js_1.AppError('Falha ao gerar o PDF do dashboard', 500);
            }
            const companyName = maturityData.company?.name || 'empresa';
            const sanitizedCompanyName = companyName
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9_\-]/g, '_')
                .replace(/_+/g, '_');
            const fileName = `dashboard_${sanitizedCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
            res.send(pdfBuffer);
            logger_js_1.logger.info(`✅ Dashboard PDF gerado para ${companyName} por ${user.email}`);
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao gerar Dashboard PDF:', error);
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=DashboardController.js.map