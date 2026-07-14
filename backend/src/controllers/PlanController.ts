// backend/src/controllers/PlanController.ts
import { Response, NextFunction } from 'express';
import { PlanService } from '../services/PlanService.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
import { logger } from '../utils/logger.js';

export class PlanController {
  /**
   * Listar todos os planos (admin)
   * GET /api/admin/plans
   */
  static async listPlans(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const { page = 1, limit = 20, isActive, isPublic } = req.query;

      const result = await PlanService.listPlans(
        {
          isActive: isActive !== undefined ? isActive === 'true' : undefined,
          isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
        },
        {
          page: Number(page),
          limit: Number(limit),
        }
      );

      res.json({
        success: true,
        data: { plans: result.plans },
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
   * Obter planos públicos (para página de planos)
   * GET /api/plans
   */
  static async getPublicPlans(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const plans = await PlanService.getPublicPlans();

      res.json({
        success: true,
        data: { plans },
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
   * Obter plano por ID
   * GET /api/admin/plans/:id
   */
  static async getPlanById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID do plano é obrigatório'] });
      }

      const plan = await PlanService.getPlanById(id);

      res.json({
        success: true,
        data: { plan },
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
   * Criar novo plano (admin)
   * POST /api/admin/plans
   */
  static async createPlan(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { name, displayName, description, priceMonthly, priceAnnual, pricePerUser, features, sortOrder, badge, trialDays, isActive, isPublic, allowCustomPricing } = req.body;

      // Validações básicas
      if (!name) throw new ValidationError({ name: ['Nome do plano é obrigatório'] });
      if (!displayName) throw new ValidationError({ displayName: ['Nome de exibição é obrigatório'] });
      if (!description) throw new ValidationError({ description: ['Descrição é obrigatória'] });
      if (priceMonthly === undefined) throw new ValidationError({ priceMonthly: ['Preço mensal é obrigatório'] });
      if (priceAnnual === undefined) throw new ValidationError({ priceAnnual: ['Preço anual é obrigatório'] });
      if (pricePerUser === undefined) throw new ValidationError({ pricePerUser: ['Preço por usuário é obrigatório'] });
      if (!features) throw new ValidationError({ features: ['Features são obrigatórias'] });

      const plan = await PlanService.createPlan(
        {
          name,
          displayName,
          description,
          priceMonthly,
          priceAnnual,
          pricePerUser,
          features,
          sortOrder,
          badge,
          trialDays,
          isActive,
          isPublic,
          allowCustomPricing,
          createdBy: userId,
        },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Plano criado com sucesso',
        data: { plan },
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
   * Atualizar plano (admin)
   * PUT /api/admin/plans/:id
   */
  static async updatePlan(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID do plano é obrigatório'] });
      }

      const { displayName, description, priceMonthly, priceAnnual, pricePerUser, features, sortOrder, badge, isActive, isPublic, allowCustomPricing, customPriceMonthly, customPriceAnnual, trialDays } = req.body;

      const plan = await PlanService.updatePlan(
        id,
        {
          displayName,
          description,
          priceMonthly,
          priceAnnual,
          pricePerUser,
          features,
          sortOrder,
          badge,
          isActive,
          isPublic,
          allowCustomPricing,
          customPriceMonthly,
          customPriceAnnual,
          trialDays,
        },
        userId
      );

      res.json({
        success: true,
        message: 'Plano atualizado com sucesso',
        data: { plan },
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
   * Deletar plano (admin) - apenas desativa
   * DELETE /api/admin/plans/:id
   */
  static async deletePlan(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ id: ['ID do plano é obrigatório'] });
      }

      await PlanService.deletePlan(id, userId);

      res.json({
        success: true,
        message: 'Plano desativado com sucesso',
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
   * Calcular preço efetivo de um plano
   * GET /api/plans/:id/calculate?users=5&annual=true
   */
  static async calculatePrice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { users = 1, annual = false } = req.query;

      if (!id) {
        throw new ValidationError({ id: ['ID do plano é obrigatório'] });
      }

      const userCount = Number(users);
      const isAnnual = annual === 'true';

      if (isNaN(userCount) || userCount < 1) {
        throw new ValidationError({ users: ['Número de usuários inválido'] });
      }

      const result = await PlanService.calculateEffectivePrice(id, userCount, isAnnual);

      res.json({
        success: true,
        data: result,
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
}