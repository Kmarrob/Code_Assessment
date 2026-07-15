"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
// backend/src/services/PlanService.ts
const mongoose_1 = require("mongoose");
const Plan_1 = require("../models/Plan");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const retry_1 = require("../utils/retry");
const circuitBreaker_1 = require("../utils/circuitBreaker");
const timeout_1 = require("../middleware/timeout");
class PlanService {
    /**
     * Criar um novo plano
     */
    static async createPlan(data, userId) {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        // Verificar se já existe um plano com este nome
                        const existingPlan = await Plan_1.Plan.findOne({ name: data.name });
                        if (existingPlan) {
                            throw new errorHandler_1.AppError(`Plano ${data.name} já existe`, 400);
                        }
                        // Validar features
                        if (data.features.maxUsers < 1) {
                            throw new errorHandler_1.AppError('Número máximo de usuários deve ser maior que 0', 400);
                        }
                        if (data.features.maxControls < 1) {
                            throw new errorHandler_1.AppError('Número máximo de controles deve ser maior que 0', 400);
                        }
                        const plan = new Plan_1.Plan({
                            ...data,
                            createdBy: new mongoose_1.Types.ObjectId(userId),
                            updatedBy: new mongoose_1.Types.ObjectId(userId),
                        });
                        await plan.save();
                        logger_1.logger.info(`Plano criado: ${plan.displayName} (${plan.name}) por ${userId}`);
                        return plan;
                    }, 'PlanService.createPlan');
                }, 'PlanService.createPlan');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Erro ao criar plano:', error);
            throw new errorHandler_1.AppError('Erro ao criar plano. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Listar todos os planos (admin)
     */
    static async listPlans(filters = {}, pagination = {}) {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        const { page = 1, limit = 20 } = pagination;
                        const { isActive, isPublic } = filters;
                        const match = {};
                        if (isActive !== undefined)
                            match.isActive = isActive;
                        if (isPublic !== undefined)
                            match.isPublic = isPublic;
                        const skip = (page - 1) * limit;
                        const [plans, total] = await Promise.all([
                            Plan_1.Plan.find(match)
                                .sort({ sortOrder: 1 })
                                .skip(skip)
                                .limit(limit)
                                .lean(),
                            Plan_1.Plan.countDocuments(match),
                        ]);
                        const totalPages = Math.ceil(total / limit);
                        return {
                            plans: plans,
                            total,
                            totalPages,
                        };
                    }, 'PlanService.listPlans');
                }, 'PlanService.listPlans');
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao listar planos:', error);
            throw new errorHandler_1.AppError('Erro ao listar planos. Tente novamente mais tarde.', 500);
        }
    }
    /**
   * Obter planos públicos (para página de planos)
   */
    static async getPublicPlans() {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        // ==========================================================
                        // LOGS DE DIAGNÓSTICO (REMOVER APÓS IDENTIFICAR O PROBLEMA)
                        // ==========================================================
                        console.log('\n===================================================');
                        console.log('DIAGNÓSTICO - PlanService.getPublicPlans()');
                        console.log('===================================================');
                        console.log('Mongo URI:', process.env.MONGODB_URI);
                        const total = await Plan_1.Plan.countDocuments({});
                        console.log('Total de planos:', total);
                        const ativos = await Plan_1.Plan.countDocuments({
                            isActive: true,
                        });
                        console.log('Planos ativos:', ativos);
                        const publicos = await Plan_1.Plan.countDocuments({
                            isPublic: true,
                        });
                        console.log('Planos públicos:', publicos);
                        const ativosPublicos = await Plan_1.Plan.countDocuments({
                            isActive: true,
                            isPublic: true,
                        });
                        console.log('Planos ativos e públicos:', ativosPublicos);
                        const todos = await Plan_1.Plan.find().lean();
                        console.log('\nTodos os documentos encontrados:\n');
                        console.log(JSON.stringify(todos, null, 2));
                        console.log('===================================================\n');
                        // ==========================================================
                        // CONSULTA ORIGINAL
                        // ==========================================================
                        const plans = await Plan_1.Plan.find({
                            isActive: true,
                            isPublic: true,
                        })
                            .sort({ sortOrder: 1 })
                            .lean();
                        console.log(`Retornando ${plans.length} plano(s) para a API /api/plans/public`);
                        return plans;
                    }, 'PlanService.getPublicPlans');
                }, 'PlanService.getPublicPlans');
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar planos públicos:', error);
            throw new errorHandler_1.AppError('Erro ao buscar planos públicos. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter plano por ID
     */
    static async getPlanById(planId) {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(planId)) {
                            throw new errorHandler_1.AppError('ID do plano inválido', 400);
                        }
                        const plan = await Plan_1.Plan.findById(planId);
                        if (!plan) {
                            throw new errorHandler_1.NotFoundError('Plano', planId);
                        }
                        return plan;
                    }, 'PlanService.getPlanById');
                }, 'PlanService.getPlanById');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Erro ao buscar plano:', error);
            throw new errorHandler_1.AppError('Erro ao buscar plano. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter plano por nome
     */
    static async getPlanByName(name) {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        return Plan_1.Plan.findOne({ name, isActive: true });
                    }, 'PlanService.getPlanByName');
                }, 'PlanService.getPlanByName');
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar plano por nome:', error);
            throw new errorHandler_1.AppError('Erro ao buscar plano. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Atualizar plano
     */
    static async updatePlan(planId, data, userId) {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(planId)) {
                            throw new errorHandler_1.AppError('ID do plano inválido', 400);
                        }
                        const plan = await Plan_1.Plan.findById(planId);
                        if (!plan) {
                            throw new errorHandler_1.NotFoundError('Plano', planId);
                        }
                        // Atualizar campos
                        if (data.displayName !== undefined)
                            plan.displayName = data.displayName;
                        if (data.description !== undefined)
                            plan.description = data.description;
                        if (data.priceMonthly !== undefined)
                            plan.priceMonthly = data.priceMonthly;
                        if (data.priceAnnual !== undefined)
                            plan.priceAnnual = data.priceAnnual;
                        if (data.pricePerUser !== undefined)
                            plan.pricePerUser = data.pricePerUser;
                        if (data.sortOrder !== undefined)
                            plan.sortOrder = data.sortOrder;
                        if (data.badge !== undefined)
                            plan.badge = data.badge;
                        if (data.isActive !== undefined)
                            plan.isActive = data.isActive;
                        if (data.isPublic !== undefined)
                            plan.isPublic = data.isPublic;
                        if (data.allowCustomPricing !== undefined)
                            plan.allowCustomPricing = data.allowCustomPricing;
                        if (data.customPriceMonthly !== undefined)
                            plan.customPriceMonthly = data.customPriceMonthly;
                        if (data.customPriceAnnual !== undefined)
                            plan.customPriceAnnual = data.customPriceAnnual;
                        if (data.trialDays !== undefined)
                            plan.trialDays = data.trialDays;
                        // Atualizar features
                        if (data.features) {
                            if (data.features.maxUsers !== undefined)
                                plan.features.maxUsers = data.features.maxUsers;
                            if (data.features.maxControls !== undefined)
                                plan.features.maxControls = data.features.maxControls;
                            if (data.features.canViewReport !== undefined)
                                plan.features.canViewReport = data.features.canViewReport;
                            if (data.features.canPrintReport !== undefined)
                                plan.features.canPrintReport = data.features.canPrintReport;
                            if (data.features.canDownloadReport !== undefined)
                                plan.features.canDownloadReport = data.features.canDownloadReport;
                            if (data.features.canViewRoadmap !== undefined)
                                plan.features.canViewRoadmap = data.features.canViewRoadmap;
                            if (data.features.canViewComparative !== undefined)
                                plan.features.canViewComparative = data.features.canViewComparative;
                            if (data.features.canExportData !== undefined)
                                plan.features.canExportData = data.features.canExportData;
                            if (data.features.hasConsultingHours !== undefined)
                                plan.features.hasConsultingHours = data.features.hasConsultingHours;
                            if (data.features.consultingHours !== undefined)
                                plan.features.consultingHours = data.features.consultingHours;
                            if (data.features.supportPriority !== undefined)
                                plan.features.supportPriority = data.features.supportPriority;
                            if (data.features.supportHours !== undefined)
                                plan.features.supportHours = data.features.supportHours;
                            if (data.features.canCustomizeBranding !== undefined)
                                plan.features.canCustomizeBranding = data.features.canCustomizeBranding;
                            if (data.features.canAddCustomControls !== undefined)
                                plan.features.canAddCustomControls = data.features.canAddCustomControls;
                            if (data.features.canIntegrateAPI !== undefined)
                                plan.features.canIntegrateAPI = data.features.canIntegrateAPI;
                            if (data.features.canIntegrateSSO !== undefined)
                                plan.features.canIntegrateSSO = data.features.canIntegrateSSO;
                        }
                        plan.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        await plan.save();
                        logger_1.logger.info(`Plano atualizado: ${plan.displayName} (${plan.name}) por ${userId}`);
                        return plan;
                    }, 'PlanService.updatePlan');
                }, 'PlanService.updatePlan');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Erro ao atualizar plano:', error);
            throw new errorHandler_1.AppError('Erro ao atualizar plano. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Deletar plano (soft delete - apenas desativa)
     */
    static async deletePlan(planId, userId) {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(planId)) {
                            throw new errorHandler_1.AppError('ID do plano inválido', 400);
                        }
                        const plan = await Plan_1.Plan.findById(planId);
                        if (!plan) {
                            throw new errorHandler_1.NotFoundError('Plano', planId);
                        }
                        // Verificar se é um plano padrão (não pode deletar)
                        const defaultPlans = ['basic', 'pro', 'enterprise', 'trial'];
                        if (defaultPlans.includes(plan.name)) {
                            throw new errorHandler_1.AppError(`Plano ${plan.name} é um plano padrão e não pode ser deletado`, 400);
                        }
                        plan.isActive = false;
                        plan.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        await plan.save();
                        logger_1.logger.info(`Plano desativado: ${plan.displayName} (${plan.name}) por ${userId}`);
                    }, 'PlanService.deletePlan');
                }, 'PlanService.deletePlan');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Erro ao deletar plano:', error);
            throw new errorHandler_1.AppError('Erro ao deletar plano. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter plano padrão (basic)
     */
    static async getDefaultPlan() {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        return Plan_1.Plan.findOne({ name: 'basic', isActive: true });
                    }, 'PlanService.getDefaultPlan');
                }, 'PlanService.getDefaultPlan');
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar plano padrão:', error);
            throw new errorHandler_1.AppError('Erro ao buscar plano padrão. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Calcular preço efetivo com base no número de usuários
     */
    static async calculateEffectivePrice(planId, userCount, isAnnual = false) {
        try {
            const plan = await this.getPlanById(planId);
            const basePrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const extraUsers = Math.max(0, userCount - plan.features.maxUsers);
            const extraPrice = extraUsers * plan.pricePerUser;
            const total = basePrice + extraPrice;
            return {
                basePrice,
                extraUsers,
                extraPrice,
                total,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Erro ao calcular preço efetivo:', error);
            throw new errorHandler_1.AppError('Erro ao calcular preço. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Verificar se um plano tem uma feature específica
     */
    static async hasFeature(planId, feature) {
        try {
            const plan = await this.getPlanById(planId);
            return plan.features[feature];
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Erro ao verificar feature:', error);
            return false;
        }
    }
    /**
     * Obter todos os planos ativos (para cache)
     */
    static async getActivePlans() {
        try {
            return await circuitBreaker_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_1.retryDatabase)(async () => {
                    return await (0, timeout_1.withDbTimeout)(async () => {
                        return Plan_1.Plan.find({ isActive: true }).sort({ sortOrder: 1 });
                    }, 'PlanService.getActivePlans');
                }, 'PlanService.getActivePlans');
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar planos ativos:', error);
            throw new errorHandler_1.AppError('Erro ao buscar planos ativos. Tente novamente mais tarde.', 500);
        }
    }
}
exports.PlanService = PlanService;
//# sourceMappingURL=PlanService.js.map