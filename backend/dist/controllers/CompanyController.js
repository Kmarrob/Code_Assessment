"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const CompanyService_js_1 = require("../services/CompanyService.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class CompanyController {
    /**
     * Listar empresas (Admin)
     */
    static async listCompanies(req, res, next) {
        try {
            const { page, limit, search, status } = req.query;
            const result = await CompanyService_js_1.CompanyService.listCompanies({
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
            next(error);
        }
    }
    /**
     * Buscar empresa por ID
     */
    static async getCompanyById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            const company = await CompanyService_js_1.CompanyService.getCompanyById(id);
            res.json({
                success: true,
                data: { company },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Criar empresa
     */
    static async createCompany(req, res, next) {
        try {
            const { name, cnpj, plan, maxUsers, maxControls } = req.body;
            const company = await CompanyService_js_1.CompanyService.createCompany({
                name,
                cnpj,
                plan,
                maxUsers,
                maxControls,
                createdBy: req.userId,
            });
            logger_js_1.logger.info(`Empresa criada por ${req.user?.email}: ${company.name}`);
            res.status(201).json({
                success: true,
                message: 'Empresa criada com sucesso',
                data: { company },
                statusCode: 201,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Atualizar empresa
     */
    static async updateCompany(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            const { name, cnpj, plan, maxUsers, maxControls, status, consultantId } = req.body;
            let validatedConsultantId = consultantId;
            if (consultantId === null ||
                consultantId === undefined ||
                consultantId === '' ||
                consultantId === 'null' ||
                consultantId === 'undefined') {
                validatedConsultantId = null;
            }
            const company = await CompanyService_js_1.CompanyService.updateCompany(id, {
                name,
                cnpj,
                plan,
                maxUsers,
                maxControls,
                status,
                consultantId: validatedConsultantId,
            });
            if (!company) {
                throw new errorHandler_js_1.AppError('Empresa não encontrada após atualização', 404);
            }
            logger_js_1.logger.info(`Empresa atualizada por ${req.user?.email}: ${company.name}`);
            res.json({
                success: true,
                message: 'Empresa atualizada com sucesso',
                data: { company },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao atualizar empresa:', error);
            next(error);
        }
    }
    /**
     * Desativar empresa
     */
    static async deactivateCompany(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            const company = await CompanyService_js_1.CompanyService.deactivateCompany(id);
            if (!company) {
                throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
            }
            logger_js_1.logger.info(`Empresa desativada por ${req.user?.email}: ${company.name}`);
            res.json({
                success: true,
                message: 'Empresa desativada com sucesso',
                data: { company },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reativar empresa
     */
    static async reactivateCompany(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            const company = await CompanyService_js_1.CompanyService.reactivateCompany(id);
            if (!company) {
                throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
            }
            logger_js_1.logger.info(`Empresa reativada por ${req.user?.email}: ${company.name}`);
            res.json({
                success: true,
                message: 'Empresa reativada com sucesso',
                data: { company },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Atribuir todos os controles à empresa
     */
    static async assignAllControls(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.AppError('ID da empresa é obrigatório', 400);
            }
            const result = await CompanyService_js_1.CompanyService.assignAllControls(id);
            if (!result || !result.company) {
                throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
            }
            logger_js_1.logger.info(`Todos os controles atribuídos à empresa ${result.company.name} por ${req.user?.email}`);
            res.json({
                success: true,
                message: `${result.assigned} controles atribuídos à empresa ${result.company.name}`,
                data: {
                    company: result.company,
                    assigned: result.assigned,
                    total: result.total,
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
     * Obter estatísticas das empresas
     */
    static async getStats(_req, res, next) {
        try {
            const stats = await CompanyService_js_1.CompanyService.getStats();
            res.json({
                success: true,
                data: stats,
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CompanyController = CompanyController;
//# sourceMappingURL=CompanyController.js.map