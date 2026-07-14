"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const SubscriptionService_js_1 = require("../services/SubscriptionService.js");
const PaymentService_js_1 = require("../services/PaymentService.js");
const index_js_1 = require("../types/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const errorLogger_js_1 = require("../utils/errorLogger.js");
const logger_js_1 = require("../utils/logger.js");
class SubscriptionController {
    /**
     * Criar nova assinatura (self-service)
     * POST /api/subscriptions
     * Acesso: REP (da empresa) ou ADMIN
     */
    static async createSubscription(req, res, next) {
        try {
            const user = req.user;
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { planId, billingCycle, autoRenew, paymentMethod, paymentProvider, paymentId, subscriptionId, notes } = req.body;
            // Validar campos obrigatórios
            if (!planId) {
                throw new errorHandler_js_1.ValidationError({ planId: ['ID do plano é obrigatório'] });
            }
            if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
                throw new errorHandler_js_1.ValidationError({ billingCycle: ['Ciclo de faturamento inválido. Use "monthly" ou "annual"'] });
            }
            // Determinar companyId
            let companyId = req.params.companyId || user?.companyId?.toString();
            // Se for ADMIN, pode especificar companyId
            if (user?.role === index_js_1.UserRole.ADMIN && req.params.companyId) {
                companyId = req.params.companyId;
            }
            // Se for REP, usa companyId do próprio usuário
            if (user?.role === index_js_1.UserRole.REP) {
                companyId = user.companyId?.toString();
            }
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa não informado', 400);
            }
            // Verificar permissões
            if (user?.role === index_js_1.UserRole.REP && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para criar assinatura para esta empresa', 403);
            }
            // Criar assinatura
            const subscription = await SubscriptionService_js_1.SubscriptionService.createSubscription({
                companyId,
                planId,
                userId,
                billingCycle,
                autoRenew,
                paymentMethod,
                paymentProvider,
                paymentId,
                subscriptionId,
                notes,
            });
            // Gerar fatura inicial
            try {
                await PaymentService_js_1.PaymentService.generateInvoice(subscription._id.toString(), userId);
            }
            catch (invoiceError) {
                logger_js_1.logger.warn(`Erro ao gerar fatura inicial: ${invoiceError}`);
            }
            res.status(201).json({
                success: true,
                message: 'Assinatura criada com sucesso',
                data: { subscription },
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
     * Obter assinatura ativa da empresa
     * GET /api/subscriptions/active
     * Acesso: REP (da empresa) ou ADMIN
     */
    static async getActiveSubscription(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            let companyId = req.params.companyId || user.companyId?.toString();
            // Se for ADMIN, pode especificar companyId
            if (user.role === index_js_1.UserRole.ADMIN && req.params.companyId) {
                companyId = req.params.companyId;
            }
            // Se for REP, usa companyId do próprio usuário
            if (user.role === index_js_1.UserRole.REP) {
                companyId = user.companyId?.toString();
            }
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa não informado', 400);
            }
            // Verificar permissões
            if (user.role === index_js_1.UserRole.REP && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar esta assinatura', 403);
            }
            const subscription = await SubscriptionService_js_1.SubscriptionService.getActiveSubscription(companyId);
            const status = await SubscriptionService_js_1.SubscriptionService.checkSubscriptionStatus(companyId);
            res.json({
                success: true,
                data: {
                    subscription,
                    status,
                },
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
     * Obter histórico de assinaturas da empresa
     * GET /api/subscriptions/history
     * Acesso: REP (da empresa) ou ADMIN
     */
    static async getSubscriptionHistory(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            let companyId = req.params.companyId || user.companyId?.toString();
            // Se for ADMIN, pode especificar companyId
            if (user.role === index_js_1.UserRole.ADMIN && req.params.companyId) {
                companyId = req.params.companyId;
            }
            // Se for REP, usa companyId do próprio usuário
            if (user.role === index_js_1.UserRole.REP) {
                companyId = user.companyId?.toString();
            }
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa não informado', 400);
            }
            // Verificar permissões
            if (user.role === index_js_1.UserRole.REP && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar este histórico', 403);
            }
            const history = await SubscriptionService_js_1.SubscriptionService.getSubscriptionHistory(companyId);
            res.json({
                success: true,
                data: { history },
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
     * Verificar status da assinatura
     * GET /api/subscriptions/status
     * Acesso: REP (da empresa) ou ADMIN
     */
    static async checkStatus(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            let companyId = req.params.companyId || user.companyId?.toString();
            // Se for ADMIN, pode especificar companyId
            if (user.role === index_js_1.UserRole.ADMIN && req.params.companyId) {
                companyId = req.params.companyId;
            }
            // Se for REP, usa companyId do próprio usuário
            if (user.role === index_js_1.UserRole.REP) {
                companyId = user.companyId?.toString();
            }
            if (!companyId) {
                throw new errorHandler_js_1.AppError('ID da empresa não informado', 400);
            }
            // Verificar permissões
            if (user.role === index_js_1.UserRole.REP && user.companyId?.toString() !== companyId) {
                throw new errorHandler_js_1.AppError('Você não tem permissão para acessar este status', 403);
            }
            const status = await SubscriptionService_js_1.SubscriptionService.checkSubscriptionStatus(companyId);
            res.json({
                success: true,
                data: status,
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
     * Atualizar assinatura
     * PUT /api/subscriptions/:id
     * Acesso: ADMIN
     */
    static async updateSubscription(req, res, next) {
        try {
            const user = req.user;
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Apenas administradores podem atualizar assinaturas', 403);
            }
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.ValidationError({ id: ['ID da assinatura é obrigatório'] });
            }
            const { status, planId, autoRenew, maxUsers, currentUsers, consultingHoursUsed, notes } = req.body;
            const subscription = await SubscriptionService_js_1.SubscriptionService.updateSubscription(id, {
                status,
                planId,
                autoRenew,
                maxUsers,
                currentUsers,
                consultingHoursUsed,
                notes,
            }, userId);
            res.json({
                success: true,
                message: 'Assinatura atualizada com sucesso',
                data: { subscription },
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
     * Cancelar assinatura
     * POST /api/subscriptions/:id/cancel
     * Acesso: ADMIN ou REP da empresa
     */
    static async cancelSubscription(req, res, next) {
        try {
            const user = req.user;
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const { id } = req.params;
            if (!id) {
                throw new errorHandler_js_1.ValidationError({ id: ['ID da assinatura é obrigatório'] });
            }
            const { reason } = req.body;
            // 🔴 CORREÇÃO: Usar SubscriptionService.getSubscriptionById
            const subscription = await SubscriptionService_js_1.SubscriptionService.getSubscriptionById(id);
            if (!subscription) {
                throw new errorHandler_js_1.AppError('Assinatura não encontrada', 404);
            }
            if (user?.role === index_js_1.UserRole.REP) {
                const companyId = user.companyId?.toString();
                if (subscription.companyId.toString() !== companyId) {
                    throw new errorHandler_js_1.AppError('Você não tem permissão para cancelar esta assinatura', 403);
                }
            }
            else if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores e prepostos', 403);
            }
            const result = await SubscriptionService_js_1.SubscriptionService.cancelSubscription(id, userId, reason);
            res.json({
                success: true,
                message: 'Assinatura cancelada com sucesso',
                data: { subscription: result },
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
     * Obter métricas de assinaturas (admin)
     * GET /api/admin/subscriptions/metrics
     * Acesso: ADMIN
     */
    static async getMetrics(req, res, next) {
        try {
            const user = req.user;
            if (user?.role !== index_js_1.UserRole.ADMIN) {
                throw new errorHandler_js_1.AppError('Acesso restrito a administradores', 403);
            }
            const metrics = await SubscriptionService_js_1.SubscriptionService.getSubscriptionMetrics();
            res.json({
                success: true,
                data: metrics,
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
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=SubscriptionController.js.map