import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/ReportService.js';
import { ReportResultService } from '../services/ReportResultService.js';
import { RecommendationService } from '../services/RecommendationService.js';
import { AppError, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { User } from '../models/User.js';
import { Response as ResponseModel } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';
import { Company } from '../models/Company.js';
import { PDFService } from '../services/PDFService.js';

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

      // POPULAR companyId para obter o nome da empresa
      await report.populate('companyId', 'name cnpj');

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

      // POPULAR companyId para obter o nome da empresa
      await report.populate('companyId', 'name cnpj');

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

      // POPULAR companyId para obter o nome da empresa
      await report.populate('companyId', 'name cnpj');

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

      // POPULAR companyId para obter o nome da empresa
      await reportData.populate('companyId', 'name cnpj');

      // Buscar dados de resultados (categorização e capacidades)
      const resultados = await ReportResultService.getResultadosData(companyId);

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
          resultados: resultados,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔴 NOVO: Obter dashboard do relatório por nome da empresa
   * GET /api/reports/dashboard/company/:companyName
   * Acesso: REP ou ADMIN
   */
  static async getReportDashboardByCompanyName(
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

      const { companyName } = req.params;
      if (!companyName) {
        throw new AppError('Nome da empresa é obrigatório', 400);
      }

      // Buscar empresa pelo nome (case insensitive)
      const company = await Company.findOne({ 
        name: { $regex: new RegExp('^' + companyName + '$', 'i') } 
      });

      if (!company) {
        throw new NotFoundError(`Empresa "${companyName}" não encontrada`);
      }

      const companyId = company._id.toString();

      // Verificar permissões (REP só pode acessar sua própria empresa)
      if (user.role === UserRole.REP && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar o dashboard desta empresa', 403);
      }

      // Usar o companyId para buscar o dashboard
      const report = await ReportService.getOrCreateReport(companyId);
      
      let reportData = report;
      if (report.clientTeam.length === 0) {
        reportData = await ReportService.generateReportData(companyId);
      }

      await reportData.populate('companyId', 'name cnpj');

      const resultados = await ReportResultService.getResultadosData(companyId);

      const totalUsers = await User.countDocuments({
        companyId: companyId,
        isActive: true,
        role: UserRole.USER,
      });

      const totalResponses = await ResponseModel.countDocuments({ companyId: companyId });

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
          resultados: resultados,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔴 NOVO: Obter dashboard completo do relatório para ADMIN (com companyId)
   * GET /api/reports/admin/dashboard/:companyId
   * Acesso: ADMIN
   */
  static async getAdminDashboardByCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (user.role !== UserRole.ADMIN) {
        throw new AppError('Acesso restrito a administradores', 403);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Buscar ou criar relatório
      const report = await ReportService.getOrCreateReport(companyId);
      
      // Gerar dados se estiver vazio
      let reportData = report;
      if (report.clientTeam.length === 0) {
        reportData = await ReportService.generateReportData(companyId);
      }

      // POPULAR companyId para obter o nome da empresa
      await reportData.populate('companyId', 'name cnpj');

      // Buscar dados de resultados (categorização e capacidades)
      const resultados = await ReportResultService.getResultadosData(companyId);

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
          resultados: resultados,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔴 NOVO: Obter dados para a Matriz de Priorização
   * GET /api/reports/priorization/:companyId
   * Acesso: ADMIN ou REP (da empresa)
   */
  static async getPriorizationMatrix(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar permissões
      if (user.role !== UserRole.ADMIN && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar esta matriz', 403);
      }

      const matrixData = await ReportService.getPriorizationMatrix(companyId);

      res.json({
        success: true,
        data: {
          matrix: matrixData,
          total: matrixData.length,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔴 NOVO: Obter Roadmap de Implementação
   * GET /api/reports/roadmap/:companyId
   * Acesso: ADMIN ou REP (da empresa)
   */
  static async getRoadmap(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar permissões
      if (user.role !== UserRole.ADMIN && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para acessar este roadmap', 403);
      }

      const roadmapData = await ReportService.getRoadmap(companyId);

      res.json({
        success: true,
        data: roadmapData,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔴 NOVO: Gerar PDF do relatório
   * GET /api/reports/:companyId/pdf
   * Acesso: ADMIN ou REP (da empresa)
   */
  static async generatePDF(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar permissões
      if (user.role !== UserRole.ADMIN && user.companyId?.toString() !== companyId) {
        throw new AppError('Você não tem permissão para gerar o PDF deste relatório', 403);
      }

      // Buscar dados do relatório
      const report = await ReportService.getOrCreateReport(companyId);
      
      let reportData = report;
      if (report.clientTeam.length === 0) {
        reportData = await ReportService.generateReportData(companyId);
      }

      await reportData.populate('companyId', 'name cnpj');

      // Buscar dados complementares
      const resultados = await ReportResultService.getResultadosData(companyId);
      const matrixData = await ReportService.getPriorizationMatrix(companyId);
      const roadmapData = await ReportService.getRoadmap(companyId);

      // 🔴 CORRIGIDO: Usar RecommendationService em vez de ReportService
      const recomendacoes = await RecommendationService.getRecommendationsForReport(companyId);

      // Buscar branding da empresa
      const company = await Company.findById(companyId).select('branding');
      const branding = company?.branding || null;

      // 🔴 CORRIGIDO: Acessar name corretamente com type assertion
      const companyName = (reportData.companyId as any)?.name || 'NOME DO CLIENTE';

      // Preparar dados para o PDF
      const pdfData = {
        report: reportData,
        resultados: resultados,
        matrix: matrixData,
        roadmap: roadmapData,
        recomendacoes: recomendacoes,
        branding: branding,
        user: {
          name: user.name,
          email: user.email,
        },
        companyName: companyName,
        generatedAt: new Date().toISOString(),
      };

      // Gerar PDF
      const pdfBuffer = await PDFService.generateReportPDF(pdfData);

      // 🔴 CORRIGIDO: Usar a variável companyName já definida
      const fileName = `relatorio_${companyName}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      next(error);
    }
  }
}