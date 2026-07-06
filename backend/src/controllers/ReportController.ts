// backend/src/controllers/ReportController.ts
import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/ReportService.js';
import { AppError, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { User } from '../models/User.js';
import { Response as ResponseModel } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';

export class ReportController {
  /**
   * Obter ou criar relatório de uma empresa
   * GET /api/reports/company/:companyId
   * Acesso: REP (da empresa) ou ADMIN
   */
  static async getReportByCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;
      const user = req.user;

      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar permissões
      if (user?.role !== UserRole.ADMIN && user?.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar este relatório', 403);
      }

      let report = await ReportService.getOrCreateReport(companyId);
      
      // Se for a primeira vez, gerar dados automáticos
      if (report.clientTeam.length === 0) {
        report = await ReportService.generateReportData(companyId);
      }

      res.json({
        success: true,
        data: { report },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gerar dados automáticos do relatório
   * POST /api/reports/company/:companyId/generate
   * Acesso: REP (da empresa) ou ADMIN
   */
  static async generateReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;
      const user = req.user;

      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar permissões
      if (user?.role !== UserRole.ADMIN && user?.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar este relatório', 403);
      }

      const report = await ReportService.generateReportData(companyId);

      res.json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: { report },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar relatório (campos editáveis)
   * PUT /api/reports/company/:companyId
   * Acesso: ADMIN (também REP com permissão)
   */
  static async updateReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;
      const userId = req.userId;
      const user = req.user;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar permissões
      if (user?.role !== UserRole.ADMIN && user?.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para editar este relatório', 403);
      }

      const { projectNumber, scope, status } = req.body;

      const report = await ReportService.updateReport(
        companyId,
        { projectNumber, scope, status },
        userId
      );

      res.json({
        success: true,
        message: 'Relatório atualizado com sucesso',
        data: { report },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos os relatórios (apenas ADMIN)
   * GET /api/reports
   * Acesso: ADMIN
   */
  static async listReports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;

      if (user?.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const { page = 1, limit = 20, status, search } = req.query;

      const result = await ReportService.listReports(
        {
          status: status as string | undefined,
          search: search as string | undefined,
        },
        {
          page: Number(page),
          limit: Number(limit),
        }
      );

      res.json({
        success: true,
        data: { reports: result.reports },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / Number(limit)),
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter dashboard do relatório com resumo (para preposto)
   * GET /api/reports/dashboard
   * Acesso: REP
   */
  static async getReportDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (user.role !== UserRole.REP && user.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a prepostos e administradores', 403);
      }

      const companyId = user.companyId?.toString();
      if (!companyId) {
        throw new AppError('Preposto sem empresa associada', 400);
      }

      const report = await ReportService.getOrCreateReport(companyId);
      
      // Gerar dados se estiver vazio
      let reportData = report;
      if (report.clientTeam.length === 0) {
        reportData = await ReportService.generateReportData(companyId);
      }

      // Buscar estatísticas para o dashboard
      const totalUsers = await User.countDocuments({
        companyId: companyId,
        isActive: true,
        role: UserRole.USER,
      });

      const totalResponses = await ResponseModel.countDocuments({ companyId: companyId });

      // Buscar usuários da empresa
      const users = await User.find({ companyId: companyId, isActive: true }).select('_id');
      const userIds = users.map(u => u._id);

      const totalControls = await Assignment.countDocuments({ 
        userId: { $in: userIds }
      });

      res.json({
        success: true,
        data: {
          report: reportData,
          stats: {
            totalUsers,
            totalResponses,
            totalControls,
            completionRate: totalControls > 0 ? Math.round((totalResponses / totalControls) * 100) : 0,
          },
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}