// backend/src/controllers/ConsultantController.ts
import { Response, NextFunction } from 'express';
import { ConsultantService } from '../services/ConsultantService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';

export class ConsultantController {
  /**
   * Listar empresas do consultor
   */
  static async listCompanies(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const consultantId = req.userId;
      if (!consultantId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { page, limit, search, status } = req.query;

      const result = await ConsultantService.listCompanies(consultantId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: result.companies,
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
   * Obter estatísticas do consultor
   */
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const consultantId = req.userId;
      if (!consultantId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const stats = await ConsultantService.getStats(consultantId);

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
   * Obter detalhes de uma empresa
   */
  static async getCompanyDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const consultantId = req.userId;
      if (!consultantId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      const details = await ConsultantService.getCompanyDetails(consultantId, companyId);

      res.json({
        success: true,
        data: details,
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