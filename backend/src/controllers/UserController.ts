// backend/src/controllers/UserController.ts
import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { AuthenticatedRequest, MaturityLevel } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
import { validate } from '../utils/validation.js';
import { z } from 'zod';

const saveResponseSchema = z.object({
  assignmentId: z.string().min(1, 'ID da atribuição é obrigatório'),
  maturityLevel: z.enum(['N/A', '0', '1', '2']),
  scenarioDescription: z.string().optional(),
  evidence: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export class UserController {
  /**
   * Obter controles do usuário
   */
  static async getControls(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const controls = await UserService.getUserControls(userId);

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

  /**
   * Obter estatísticas do usuário
   */
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const stats = await UserService.getUserStats(userId);

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
   * Salvar resposta de um controle
   */
  static async saveResponse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(saveResponseSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      // Garantir que maturityLevel seja do tipo MaturityLevel
      const data = {
        ...validation.data,
        maturityLevel: validation.data.maturityLevel as MaturityLevel,
      };

      const response = await UserService.saveResponse(userId, data);

      res.json({
        success: true,
        message: 'Resposta salva com sucesso',
        data: response,
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
   * Obter progresso completo do usuário
   */
  static async getProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const progress = await UserService.getUserProgress(userId);

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
   * Obter perguntas por controle (para usuários)
   */
  static async getQuestionsByControl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { controlId } = req.params;

      if (!controlId) {
        throw new AppError('ID do controle é obrigatório', 400);
      }

      // Importar o QuestionService
      const { QuestionService } = await import('../services/QuestionService.js');
      const questions = await QuestionService.getQuestionsByControl(controlId);

      res.json({
        success: true,
        data: questions,
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