// backend/src/controllers/SubscriptionController.ts
import { Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService.js';
import { PlanService } from '../services/PlanService.js';
import { PaymentService } from '../services/PaymentService.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
import { logger } from '../utils/logger.js';

export class SubscriptionController {
  /**
   * Criar nova assinatura (self-service)
   * POST /api/subscriptions
   * Acesso: REP (da empresa) ou ADMIN
   */
  static async createSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      const userId = req.userId;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { planId, billingCycle, autoRenew, paymentMethod, paymentProvider, paymentId, subscriptionId, notes } = req.body;

      // Validar campos obrigatórios
      if (!planId) {
        throw new ValidationError({ planId: ['ID do plano é obrigatório'] });
      }

      if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
        throw new ValidationError({ billingCycle: ['Ciclo de faturamento inválido. Use "monthly" ou "annual"'] });
      }

      // Determinar companyId
      let companyId = req.params.companyId || user?.companyId?.toString();

      // Se for ADMIN, pode especificar companyId
      if (user?.role === UserRole.ADMIN && req.params.companyId) {
        companyId = req.params.companyId;
      }

      // Se for REP, usa companyId do próprio usuário
      if (user?.role === UserRole.REP) {
        companyId = user.companyId?.toString();
      }

      if (!companyId) {
        throw new AppError('ID da empresa não informado', 400);
      }

      // Verificar permissões
      if (user?.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para criar assinatura para esta empresa', 403);
      }

      // Criar assinatura
      const subscription = await SubscriptionService.createSubscription({
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
        await PaymentService.generateInvoice(subscription._id.toString(), userId);
      } catch (invoiceError) {
        logger.warn(`Erro ao gerar fatura inicial: ${invoiceError}`);
      }

      res.status(201).json({
        success: true,
        message: 'Assinatura criada com sucesso',
        data: { subscription },
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
  static async getActiveSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      let companyId = req.params.companyId || user.companyId?.toString();

      // Se for ADMIN, pode especificar companyId
      if (user.role === UserRole.ADMIN && req.params.companyId) {
        companyId = req.params.companyId;
      }

      // Se for REP, usa companyId do próprio usuário
      if (user.role === UserRole.REP) {
        companyId = user.companyId?.toString();
      }

      if (!companyId) {
        throw new AppError('ID da empresa não informado', 400);
      }

      // Verificar permissões
      if (user.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar esta assinatura', 403);
      }

      const subscription = await SubscriptionService.getActiveSubscription(companyId);
      const status = await SubscriptionService.checkSubscriptionStatus(companyId);

      res.json({
        success: true,
        data: {
          subscription,
          status,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
  static async getSubscriptionHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      let companyId = req.params.companyId || user.companyId?.toString();

      // Se for ADMIN, pode especificar companyId
      if (user.role === UserRole.ADMIN && req.params.companyId) {
        companyId = req.params.companyId;
      }

      // Se for REP, usa companyId do próprio usuário
      if (user.role === UserRole.REP) {
        companyId = user.companyId?.toString();
      }

      if (!companyId) {
        throw new AppError('ID da empresa não informado', 400);
      }

      // Verificar permissões
      if (user.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar este histórico', 403);
      }

      const history = await SubscriptionService.getSubscriptionHistory(companyId);

      res.json({
        success: true,
        data: { history },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
  static async checkStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      let companyId = req.params.companyId || user.companyId?.toString();

      // Se for ADMIN, pode especificar companyId
      if (user.role === UserRole.ADMIN && req.params.companyId) {
        companyId = req.params.companyId;
      }

      // Se for REP, usa companyId do próprio usuário
      if (user.role === UserRole.REP) {
        companyId = user.companyId?.toString();
      }

      if (!companyId) {
        throw new AppError('ID da empresa não informado', 400);
      }

      // Verificar permissões
      if (user.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar este status', 403);
      }

      const status = await SubscriptionService.checkSubscriptionStatus(companyId);

      res.json({
        success: true,
        data: status,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
  static async updateSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      const userId = req.userId;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Apenas administradores podem atualizar assinaturas', 403);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID da assinatura é obrigatório'] });
      }

      const { status, planId, autoRenew, maxUsers, currentUsers, consultingHoursUsed, notes } = req.body;

      const subscription = await SubscriptionService.updateSubscription(
        id,
        {
          status,
          planId,
          autoRenew,
          maxUsers,
          currentUsers,
          consultingHoursUsed,
          notes,
        },
        userId
      );

      res.json({
        success: true,
        message: 'Assinatura atualizada com sucesso',
        data: { subscription },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
  static async cancelSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      const userId = req.userId;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID da assinatura é obrigatório'] });
      }

      const { reason } = req.body;

      // 🔴 CORREÇÃO: Usar SubscriptionService.getSubscriptionById
      const subscription = await SubscriptionService.getSubscriptionById(id);
      if (!subscription) {
        throw new AppError('Assinatura não encontrada', 404);
      }

      if (user?.role === UserRole.REP) {
        const companyId = user.companyId?.toString();
        if (subscription.companyId.toString() !== companyId) {
          throw new AppError('Você não tem permissão para cancelar esta assinatura', 403);
        }
      } else if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores e prepostos', 403);
      }

      const result = await SubscriptionService.cancelSubscription(id, userId, reason);

      res.json({
        success: true,
        message: 'Assinatura cancelada com sucesso',
        data: { subscription: result },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
  static async getMetrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const metrics = await SubscriptionService.getSubscriptionMetrics();

      res.json({
        success: true,
        data: metrics,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
   * 🔴 NOVO: Obter assinatura ativa de uma empresa específica (admin)
   * GET /api/subscriptions/admin/:companyId
   * Acesso: ADMIN
   */
  static async getActiveSubscriptionByCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      const subscription = await SubscriptionService.getActiveSubscription(companyId);
      const status = await SubscriptionService.checkSubscriptionStatus(companyId);

      res.json({
        success: true,
        data: { subscription, status },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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