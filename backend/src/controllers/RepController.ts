// backend/src/controllers/RepController.ts
import { Response, NextFunction } from 'express';
import { RepService } from '../services/RepService.js';
import { validate } from '../utils/validation.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
import { AuditService } from '../services/AuditService.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import {
  repCreateUserSchema,
  repAssignControlsSchema,
  repListUsersSchema,
  repUpdateUserSchema,
  repResponseSchema,
} from '../utils/repValidation.js';

export class RepController {
  /**
   * Listar usuários do preposto
   */
  static async listUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(repListUsersSchema, req.query);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const result = await RepService.listUsers(repId, validation.data);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
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
   * Criar usuário pelo preposto
   */
  static async createUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(repCreateUserSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const user = await RepService.createUser(repId, validation.data);

      if (req.userId) {
        AuditService.logUserCreation(
          req.userId,
          req.user?.email || '',
          user._id.toString(),
          user.email,
          user.role,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user },
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
   * Atribuir controles a um usuário
   */
  static async assignControls(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(repAssignControlsSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const result = await RepService.assignControls(repId, validation.data);

      res.json({
        success: true,
        message: `${result.assigned} controles atribuídos com sucesso`,
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
        body: req.body,
      });
      next(error);
    }
  }

  /**
   * Obter progresso de um usuário
   */
  static async getUserProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { userId } = req.params;
      if (!userId) {
        throw new ValidationError({ userId: ['ID do usuário é obrigatório'] });
      }

      const progress = await RepService.getUserProgress(repId, userId);

      res.json({
        success: true,
        data: progress,
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
   * Obter progresso geral do preposto
   */
  static async getOverallProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const progress = await RepService.getOverallProgress(repId);

      res.json({
        success: true,
        data: progress,
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
   * Obter estatísticas do preposto
   */
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const stats = await RepService.getStats(repId);

      res.json({
        success: true,
        data: stats,
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
   * Obter controles da empresa do preposto
   */
  static async getCompanyControls(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const rep = await User.findById(repId);
      if (!rep) {
        throw new NotFoundError('Preposto não encontrado');
      }

      if (!rep.companyId) {
        throw new AppError('Preposto não possui empresa associada', 400);
      }

      // Buscar a empresa com os controles atribuídos
      const company = await Company.findById(rep.companyId)
        .populate({
          path: 'assignedControls',
          select: '_id id nome dominioDeSI tipoDeControle nota',
        })
        .lean();

      if (!company) {
        throw new NotFoundError('Empresa não encontrada');
      }

      // Pegar os controles da empresa
      const controls = company.assignedControls || [];

      res.json({
        success: true,
        data: controls,
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
}