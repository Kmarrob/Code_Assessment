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
import { Response as ResponseModel } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';
import {
  repCreateUserSchema,
  repAssignControlsSchema,
  repListUsersSchema,
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

  /**
   * Busca todos os usuários do preposto com suas respostas (otimizado)
   * GET /api/rep/users-with-responses
   */
  static async getUsersWithResponses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Buscar o preposto para obter a empresa
      const rep = await User.findById(repId);
      if (!rep) {
        throw new NotFoundError('Preposto não encontrado');
      }

      const companyId = rep.companyId;
      if (!companyId) {
        throw new AppError('Preposto não possui empresa associada', 400);
      }

      console.log('🔵 [getUsersWithResponses] companyId:', companyId);

      // Buscar todos os usuários do preposto
      const users = await User.find({
        createdBy: repId,
        role: 'user',
        isActive: true,
      }).select('_id name email department');

      console.log('🔵 [getUsersWithResponses] Usuários encontrados:', users.length);
      console.log('🔵 [getUsersWithResponses] IDs dos usuários:', users.map(u => u._id));

      // Buscar respostas por userId
      const userIds = users.map(u => u._id);
      
      // 🔴 CORREÇÃO: Incluir 'nome' no populate
      const responses = await ResponseModel.find({
        userId: { $in: userIds },
      })
        .populate('controlId', 'nome name id')
        .lean();

      console.log('🔵 [getUsersWithResponses] Respostas encontradas:', responses.length);
      console.log('🔵 [getUsersWithResponses] Primeira resposta:', responses[0] || 'Nenhuma resposta');

      // Mapear respostas por usuário
      const responsesByUser: Record<string, any[]> = {};
      responses.forEach((r: any) => {
        const userId = r.userId?.toString() || r.userId;
        if (userId) {
          if (!responsesByUser[userId]) {
            responsesByUser[userId] = [];
          }
          responsesByUser[userId].push({
            _id: r._id,
            controlId: r.controlId?._id || r.controlId,
            controlName: r.controlId?.nome || r.controlId?.name || 'Controle não identificado',
            maturityLevel: r.maturityLevel !== undefined && r.maturityLevel !== null 
              ? Number(r.maturityLevel) 
              : -1,
            scenario: r.scenarioDescription || r.scenario || '',
            observations: r.observations || '',
            updatedAt: r.updatedAt || r.lastUpdatedAt || r.createdAt,
          });
        }
      });

      console.log('🔵 [getUsersWithResponses] Respostas mapeadas por usuário:', Object.keys(responsesByUser));

      // Montar resultado
      const result = users.map((user: any) => {
        const userResponses = responsesByUser[user._id.toString()] || [];
        const totalResponses = userResponses.length;
        const completedResponses = userResponses.filter(
          (r) => r.maturityLevel !== undefined && r.maturityLevel !== null && r.maturityLevel !== -1
        ).length;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          department: user.department || '-',
          responses: userResponses,
          totalResponses,
          completedResponses,
          progress: totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0,
        };
      });

      console.log('🔵 [getUsersWithResponses] Resultado final:', JSON.stringify(result, null, 2).substring(0, 500));

      res.status(200).json({
        success: true,
        data: result,
        pagination: {
          page: 1,
          limit: result.length,
          total: result.length,
          totalPages: 1,
        },
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