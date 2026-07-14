// backend/src/controllers/PaymentController.ts
import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService.js';
import { SubscriptionService } from '../services/SubscriptionService.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
import { logger } from '../utils/logger.js';

export class PaymentController {
  /**
   * Criar novo pagamento
   * POST /api/payments
   * Acesso: REP (da empresa) ou ADMIN
   */
  static async createPayment(
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

      const {
        subscriptionId,
        amount,
        currency,
        transactionType,
        paymentMethod,
        paymentProvider,
        providerPaymentId,
        providerSubscriptionId,
        dueDate,
        billingPeriod,
        items,
        discounts,
        fees,
        boletoUrl,
        boletoBarcode,
        pixQrCode,
        pixCopiaCola,
        cardLastDigits,
        cardBrand,
        notes,
        metadata,
      } = req.body;

      // Validar campos obrigatórios
      if (!amount || amount <= 0) {
        throw new ValidationError({ amount: ['Valor do pagamento é obrigatório e deve ser maior que 0'] });
      }

      if (!paymentMethod) {
        throw new ValidationError({ paymentMethod: ['Método de pagamento é obrigatório'] });
      }

      if (!paymentProvider) {
        throw new ValidationError({ paymentProvider: ['Provedor de pagamento é obrigatório'] });
      }

      if (!dueDate) {
        throw new ValidationError({ dueDate: ['Data de vencimento é obrigatória'] });
      }

      if (!billingPeriod || !billingPeriod.start || !billingPeriod.end) {
        throw new ValidationError({ billingPeriod: ['Período de faturamento é obrigatório'] });
      }

      if (!items || items.length === 0) {
        throw new ValidationError({ items: ['Itens do pagamento são obrigatórios'] });
      }

      // Determinar companyId
      let companyId = req.params.companyId || user?.companyId?.toString();

      if (user?.role === UserRole.ADMIN && req.params.companyId) {
        companyId = req.params.companyId;
      }

      if (user?.role === UserRole.REP) {
        companyId = user.companyId?.toString();
      }

      if (!companyId) {
        throw new AppError('ID da empresa não informado', 400);
      }

      // Verificar permissões
      if (user?.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para criar pagamento para esta empresa', 403);
      }

      const payment = await PaymentService.createPayment({
        companyId,
        subscriptionId,
        userId,
        amount,
        currency,
        transactionType: transactionType || 'one_time',
        paymentMethod,
        paymentProvider,
        providerPaymentId,
        providerSubscriptionId,
        dueDate: new Date(dueDate),
        billingPeriod: {
          start: new Date(billingPeriod.start),
          end: new Date(billingPeriod.end),
        },
        items,
        discounts,
        fees,
        boletoUrl,
        boletoBarcode,
        pixQrCode,
        pixCopiaCola,
        cardLastDigits,
        cardBrand,
        notes,
        metadata,
      });

      res.status(201).json({
        success: true,
        message: 'Pagamento criado com sucesso',
        data: { payment },
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
   * Webhook para confirmar pagamento
   * POST /api/payments/webhook
   * Acesso: Público (provedor de pagamento)
   */
  static async webhook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { provider, paymentId, subscriptionId, amount, status, paidAt, metadata } = req.body;

      // Validar campos obrigatórios
      if (!provider) {
        throw new ValidationError({ provider: ['Provedor de pagamento é obrigatório'] });
      }

      if (!paymentId) {
        throw new ValidationError({ paymentId: ['ID do pagamento é obrigatório'] });
      }

      if (!amount || amount <= 0) {
        throw new ValidationError({ amount: ['Valor do pagamento é obrigatório e deve ser maior que 0'] });
      }

      // Processar webhook baseado no status
      let result;

      if (status === 'paid' || status === 'approved' || status === 'confirmed') {
        result = await PaymentService.confirmPayment(
          paymentId,
          provider,
          amount,
          paidAt ? new Date(paidAt) : new Date(),
          { subscriptionId, ...metadata }
        );
      } else if (status === 'failed' || status === 'denied' || status === 'refused') {
        result = await PaymentService.failPayment(paymentId, status);
      } else {
        logger.warn(`Status de pagamento não tratado: ${status}`);
        result = { message: 'Status recebido, mas não processado' };
      }

      res.json({
        success: true,
        message: 'Webhook processado com sucesso',
        data: result,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
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
   * Confirmar pagamento manualmente (admin)
   * POST /api/admin/payments/:id/confirm
   * Acesso: ADMIN
   */
  static async confirmPaymentManually(
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
        throw new AppError('Apenas administradores podem confirmar pagamentos manualmente', 403);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID do pagamento é obrigatório'] });
      }

      const { amountPaid, paidAt, notes } = req.body;

      if (!amountPaid || amountPaid <= 0) {
        throw new ValidationError({ amountPaid: ['Valor pago é obrigatório e deve ser maior que 0'] });
      }

      // Buscar pagamento
      const payment = await PaymentService.getPaymentById(id);
      if (!payment) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      // Confirmar pagamento manualmente
      const result = await PaymentService.confirmPayment(
        payment.providerPaymentId || payment._id.toString(),
        payment.paymentProvider,
        amountPaid,
        paidAt ? new Date(paidAt) : new Date(),
        { manualConfirmation: true, confirmedBy: userId, notes }
      );

      res.json({
        success: true,
        message: 'Pagamento confirmado manualmente com sucesso',
        data: { payment: result },
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
   * Estornar pagamento (admin)
   * POST /api/admin/payments/:id/refund
   * Acesso: ADMIN
   */
  static async refundPayment(
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
        throw new AppError('Apenas administradores podem estornar pagamentos', 403);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID do pagamento é obrigatório'] });
      }

      const { reason } = req.body;

      const payment = await PaymentService.refundPayment(id, userId, reason);

      res.json({
        success: true,
        message: 'Pagamento estornado com sucesso',
        data: { payment },
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
   * Obter pagamento por ID
   * GET /api/payments/:id
   * Acesso: ADMIN ou REP da empresa
   */
  static async getPaymentById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID do pagamento é obrigatório'] });
      }

      const payment = await PaymentService.getPaymentById(id);

      // Verificar permissões
      if (user.role === UserRole.REP) {
        const companyId = user.companyId?.toString();
        if (payment.companyId.toString() !== companyId) {
          throw new AppError('Você não tem permissão para acessar este pagamento', 403);
        }
      } else if (user.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores e prepostos', 403);
      }

      res.json({
        success: true,
        data: { payment },
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
   * Listar pagamentos da empresa
   * GET /api/payments
   * Acesso: REP da empresa ou ADMIN
   */
  static async listPayments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { page = 1, limit = 20 } = req.query;

      let companyId = req.params.companyId || user.companyId?.toString();

      if (user.role === UserRole.ADMIN && req.params.companyId) {
        companyId = req.params.companyId;
      }

      if (user.role === UserRole.REP) {
        companyId = user.companyId?.toString();
      }

      if (!companyId) {
        throw new AppError('ID da empresa não informado', 400);
      }

      // Verificar permissões
      if (user.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar estes pagamentos', 403);
      }

      const result = await PaymentService.getPaymentsByCompany(companyId, {
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: { payments: result.payments },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: result.totalPages,
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
        query: req.query,
      });
      next(error);
    }
  }

  /**
   * Listar todos os pagamentos (admin)
   * GET /api/admin/payments
   * Acesso: ADMIN
   */
  static async listAllPayments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;

      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const { page = 1, limit = 20, status, companyId, startDate, endDate } = req.query;

      const result = await PaymentService.getAllPayments(
        {
          status: status as any,
          companyId: companyId as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        },
        {
          page: Number(page),
          limit: Number(limit),
        }
      );

      res.json({
        success: true,
        data: { payments: result.payments },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: result.totalPages,
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
        query: req.query,
      });
      next(error);
    }
  }

  /**
   * Obter métricas de pagamento (admin)
   * GET /api/admin/payments/metrics
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

      const metrics = await PaymentService.getPaymentMetrics();

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
   * Gerar fatura para assinatura
   * POST /api/subscriptions/:subscriptionId/invoice
   * Acesso: ADMIN ou REP da empresa
   */
  static async generateInvoice(
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

      const { subscriptionId } = req.params;
      if (!subscriptionId) {
        throw new ValidationError({ subscriptionId: ['ID da assinatura é obrigatório'] });
      }

      // Verificar permissões
      const subscription = await SubscriptionService['getSubscriptionById'](subscriptionId);
      if (!subscription) {
        throw new AppError('Assinatura não encontrada', 404);
      }

      if (user?.role === UserRole.REP) {
        const companyId = user.companyId?.toString();
        if (subscription.companyId.toString() !== companyId) {
          throw new AppError('Você não tem permissão para gerar fatura para esta assinatura', 403);
        }
      } else if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores e prepostos', 403);
      }

      const payment = await PaymentService.generateInvoice(subscriptionId, userId);

      res.status(201).json({
        success: true,
        message: 'Fatura gerada com sucesso',
        data: { payment },
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
        params: req.params,
      });
      next(error);
    }
  }
}