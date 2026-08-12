// backend/src/controllers/UserController.ts
import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { AuthenticatedRequest, MaturityLevel } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
import { validate } from '../utils/validation.js';
import { z } from 'zod';
import { AuditService } from '../services/AuditService.js';

const saveResponseSchema = z.object({
  assignmentId: z.string().min(1, 'ID da atribuição é obrigatório'),
  maturityLevel: z.enum(['N/A', '0', '1', '2']),
  scenarioDescription: z.string().optional(),
  evidence: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// 🆕 NOVO SCHEMA PARA PROGRESSO
const saveProgressSchema = z.object({
  assignmentId: z.string().min(1, 'ID da atribuição é obrigatório'),
  partialData: z.any(),
  progressStatus: z.enum(['in_progress', 'interrupted']).default('in_progress'),
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

      // 🔐 AUDITORIA: Registro da resposta do controle ISO 27001
      if (req.userId) {
        await AuditService.logControlResponse(
          req.userId,
          req.user?.email || '',
          data.assignmentId,
          (response as any)?.controlId || data.assignmentId,
          data.maturityLevel,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

      res.json({
        success: true,
        message: 'Resposta salva com sucesso',
        data: response,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // 🔐 AUDITORIA: Registro de falha no envio da resposta
      if (req.userId && req.body?.assignmentId) {
        await AuditService.logControlResponse(
          req.userId,
          req.user?.email || '',
          req.body.assignmentId,
          req.body.assignmentId,
          req.body.maturityLevel || '0',
          req.ip || '',
          req.headers['user-agent'] || '',
          false,
          error instanceof Error ? error.message : 'Erro ao salvar resposta'
        );
      }

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

  // ============================================
  // 🆕 NOVOS ENDPOINTS PARA PROGRESSO (ADICIONADOS - NADA FOI EXCLUÍDO)
  // ============================================

  /**
   * Salvar progresso parcial de um controle (em andamento)
   * POST /api/user/progress
   */
  static async saveProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(saveProgressSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const result = await UserService.saveProgress(
        userId,
        validation.data.assignmentId,
        validation.data.partialData,
        validation.data.progressStatus
      );

      res.json({
        success: true,
        message: 'Progresso salvo com sucesso',
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
   * Buscar atividades em andamento/interrompidas do usuário
   * GET /api/user/progress/in-progress
   */
  static async getInProgressActivities(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const activities = await UserService.getInProgressActivities(userId);

      res.json({
        success: true,
        data: activities,
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
   * Verificar se o usuário tem atividades pendentes
   * GET /api/user/progress/has-pending
   */
  static async hasPendingActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const hasPending = await UserService.hasPendingActivity(userId);

      res.json({
        success: true,
        data: { hasPending },
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
   * Buscar progresso de uma atribuição específica
   * GET /api/user/progress/assignment/:assignmentId
   */
  static async getProgressByAssignment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { assignmentId } = req.params;
      if (!assignmentId) {
        throw new AppError('ID da atribuição é obrigatório', 400);
      }

      const progress = await UserService.getProgressByAssignment(userId, assignmentId);

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
   * Limpar progresso de uma atividade
   * DELETE /api/user/progress/assignment/:assignmentId
   */
  static async clearProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { assignmentId } = req.params;
      if (!assignmentId) {
        throw new AppError('ID da atribuição é obrigatório', 400);
      }

      const result = await UserService.clearProgress(userId, assignmentId);

      res.json({
        success: true,
        message: 'Progresso limpo com sucesso',
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
      });
      next(error);
    }
  }
}